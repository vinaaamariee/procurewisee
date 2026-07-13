"use server";

import { prisma } from "@/lib/prisma";
import { PoStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { logAuditTrail } from "@/lib/audit";
import { requireRole } from "@/lib/auth/get-user-profile";
import { createNotificationHelper } from "./notifications";

export async function createPoFromAwardAction(recommendationId: number) {
  try {
    await requireRole("Procurement Officer");
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch recommendation details
      const rec = await tx.recommendation.findUnique({
        where: { id: recommendationId },
        include: {
          supplier: true,
          supplierQuote: {
            include: {
              quoteDetails: {
                include: {
                  rfqItem: true,
                }
              }
            }
          },
          canvas: {
            include: {
              rfq: true
            }
          }
        }
      });

      if (!rec) {
        throw new Error("Recommendation not found.");
      }

      // Check if PO already exists for this RFQ/supplier
      const existing = await tx.purchaseOrder.findFirst({
        where: {
          rfqId: rec.canvas.rfqId,
          supplierId: rec.supplierId,
        }
      });

      if (existing) {
        return { po: existing, supplierName: rec.supplier.companyName };
      }

      // 2. Generate PO Number
      const year = new Date().getFullYear();
      const count = await tx.purchaseOrder.count({
        where: {
          poNumber: {
            startsWith: `PO-${year}-`
          }
        }
      });
      const seq = String(count + 1).padStart(4, "0");
      const poNumber = `PO-${year}-${seq}`;

      // 3. Create PO Master
      const po = await tx.purchaseOrder.create({
        data: {
          poNumber,
          supplierId: rec.supplierId,
          rfqId: rec.canvas.rfqId,
          totalCost: rec.supplierQuote.totalQuotedAmount,
          deliveryTerms: "FOB Destination, 7 calendar days",
          paymentTerms: "Charge Account, 30 days",
          status: PoStatus.Draft,
        }
      });

      // 4. Create PO Items from QuoteDetails
      for (const detail of rec.supplierQuote.quoteDetails) {
        const itemTotal = Number(detail.unitPrice) * detail.quantityMultiplier;
        await tx.purchaseOrderItem.create({
          data: {
            poId: po.id,
            description: detail.rfqItem.particulars,
            quantity: detail.quantityMultiplier,
            unitPrice: detail.unitPrice,
            totalCost: new Prisma.Decimal(itemTotal),
          }
        });
      }

      return { po, supplierName: rec.supplier.companyName };
    });

    logAuditTrail({
      actionType: "CREATE_PO",
      tableAffected: "purchase_orders",
      recordId: result.po.id,
      newState: result.po,
    });

    // Notify Procurement Officer and Administrative Approver of new draft PO
    await createNotificationHelper({
      title: 'Purchase Order Generated',
      description: `Purchase Order ${result.po.poNumber} has been drafted for supplier "${result.supplierName}" following bidding awards.`,
      icon: '📝',
      role: 'Procurement Officer'
    });
    await createNotificationHelper({
      title: 'Purchase Order Generated',
      description: `Purchase Order ${result.po.poNumber} has been drafted and is ready for signing.`,
      icon: '📝',
      role: 'Administrative Approver'
    });

    revalidatePath("/", "layout");
    return { success: true, po: result.po };
  } catch (error: any) {
    console.error("Error creating PO from award:", error);
    return { success: false, error: error.message || "Failed to create PO." };
  }
}

export async function updatePoAction(
  id: number,
  data: {
    deliveryTerms?: string;
    paymentTerms?: string;
    status?: PoStatus;
  }
) {
  try {
    if (data.status === PoStatus.Approved) {
      await requireRole("Administrative Approver");
    } else {
      await requireRole("Procurement Officer");
    }
    const old = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!old) return { success: false, error: "PO not found." };

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        deliveryTerms: data.deliveryTerms ?? old.deliveryTerms,
        paymentTerms: data.paymentTerms ?? old.paymentTerms,
        status: data.status ?? old.status,
      }
    });

    logAuditTrail({
      actionType: "UPDATE_PO",
      tableAffected: "purchase_orders",
      recordId: id,
      oldState: old,
      newState: updated,
    });

    revalidatePath("/", "layout");
    return { success: true, po: updated };
  } catch (error: any) {
    console.error("Error updating PO:", error);
    return { success: false, error: error.message || "Failed to update PO." };
  }
}

export async function approvePoAction(id: number) {
  return await updatePoAction(id, { status: PoStatus.Approved });
}

export async function getPurchaseOrders(filters?: { supplierId?: number; status?: PoStatus }) {
  try {
    const where: any = {};
    if (filters?.supplierId) where.supplierId = filters.supplierId;
    if (filters?.status) where.status = filters.status;

    return await prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        items: true,
        rfq: true,
        pr: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching POs:", error);
    return [];
  }
}

export async function logPoPrintedAction(poId: number) {
  try {
    const { profile } = await requireRole("Procurement Officer");
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { supplier: true }
    });
    if (!po) return { success: false, error: "PO not found" };

    logAuditTrail({
      actionType: "PRINT_PO",
      tableAffected: "purchase_orders",
      recordId: poId,
      newState: po,
    });

    await createNotificationHelper({
      title: 'Purchase Order Printed',
      description: `Purchase Order ${po.poNumber} for supplier "${po.supplier.companyName}" was printed by ${profile.fullName}.`,
      icon: '🖨️',
      role: 'Procurement Officer'
    });

    return { success: true };
  } catch (err: any) {
    console.error("Error logging PO print:", err);
    return { success: false, error: err.message };
  }
}
