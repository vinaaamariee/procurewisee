"use server";

import { prisma } from "@/lib/prisma";
import { DeliveryStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { logAuditTrail } from "@/lib/audit";

interface CreateReceiptInput {
  poId: number;
  receivedBy: string;
  deliveryStatus: DeliveryStatus;
  remarks?: string;
  signatures?: string;
}

export async function createReceiptAction(input: CreateReceiptInput) {
  try {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: input.poId }
    });

    if (!po) {
      return { success: false, error: "Purchase Order not found." };
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Generate Receipt Number
      const year = new Date().getFullYear();
      const count = await tx.acknowledgementReceipt.count({
        where: {
          receiptNumber: {
            startsWith: `REC-${year}-`
          }
        }
      });
      const seq = String(count + 1).padStart(4, "0");
      const receiptNumber = `REC-${year}-${seq}`;

      // 2. Create Receipt
      const receipt = await tx.acknowledgementReceipt.create({
        data: {
          receiptNumber,
          poId: input.poId,
          supplierId: po.supplierId,
          receivedBy: input.receivedBy,
          dateReceived: new Date(),
          deliveryStatus: input.deliveryStatus,
          remarks: input.remarks || null,
          signatures: input.signatures || null,
        }
      });

      // 3. Update PO status if delivery is complete
      if (input.deliveryStatus === DeliveryStatus.CompleteDelivery) {
        await tx.purchaseOrder.update({
          where: { id: po.id },
          data: { status: "Delivered" }
        });

        // Update supplier delivery performance metrics
        const supplier = await tx.supplier.findUnique({
          where: { id: po.supplierId }
        });

        if (supplier) {
          const totalCount = supplier.totalDeliveriesCount + 1;
          // Assume lead delivery matches historical performance or updates
          await tx.supplier.update({
            where: { id: po.supplierId },
            data: {
              totalDeliveriesCount: totalCount,
            }
          });
        }

        // Generate HistoricalPrice records for each item in the PO
        const poItems = await tx.purchaseOrderItem.findMany({
          where: { poId: po.id }
        });

        const rfq = po.rfqId ? await tx.requestForQuote.findUnique({
          where: { id: po.rfqId },
          include: {
            items: {
              include: {
                unit: true,
                product: true
              }
            }
          }
        }) : null;

        if (rfq) {
          for (const item of poItems) {
            const rfqItem = rfq.items.find(ri => ri.particulars === item.description) || rfq.items[0];
            if (rfqItem) {
              const productId = rfqItem.productId || null;
              const unitId = rfqItem.unitId || null;
              const unitName = rfqItem.unit?.name || "piece";

              const date = new Date();
              const sourceMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
              const sourceMonth = sourceMonths[date.getMonth()];
              const sourceYear = date.getFullYear();

              try {
                await tx.historicalPrice.upsert({
                  where: {
                    procurementNumber_rawProductName: {
                      procurementNumber: po.poNumber,
                      rawProductName: item.description
                    }
                  },
                  update: {
                    productId,
                    supplierId: po.supplierId,
                    supplierName: supplier?.companyName || "Unknown",
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalCost,
                    procurementDate: date,
                    sourceMonth,
                    sourceYear,
                    unit: unitName,
                    unitId
                  },
                  create: {
                    productId,
                    supplierId: po.supplierId,
                    supplierName: supplier?.companyName || "Unknown",
                    procurementNumber: po.poNumber,
                    rawProductName: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalCost,
                    procurementDate: date,
                    sourceMonth,
                    sourceYear,
                    unit: unitName,
                    unitId
                  }
                });
              } catch (e) {
                console.warn("[HISTORICAL PRICE] Failed to record item:", item.description, e);
              }
            }
          }
        }
      }

      return receipt;
    });

    logAuditTrail({
      actionType: "CREATE_RECEIPT",
      tableAffected: "acknowledgement_receipts",
      recordId: result.id,
      newState: result,
    });

    revalidatePath("/", "layout");
    return { success: true, receipt: result };
  } catch (error: any) {
    console.error("Error creating receipt:", error);
    return { success: false, error: error.message || "Failed to create receipt." };
  }
}

export async function getReceipts(filters?: { supplierId?: number }) {
  try {
    const where: any = {};
    if (filters?.supplierId) where.supplierId = filters.supplierId;

    return await prisma.acknowledgementReceipt.findMany({
      where,
      include: {
        po: true,
        supplier: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return [];
  }
}
