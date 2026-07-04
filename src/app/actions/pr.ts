"use server";

import { prisma } from "@/lib/prisma";
import { PrStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { logAuditTrail } from "@/lib/audit";
import crypto from "crypto";

interface PrItemInput {
  productId?: number;
  description: string;
  brand?: string;
  quantity: number;
  unit: string;
  estimatedUnitCost: number;
  specification?: string;
}

interface CreatePrInput {
  department: string;
  office: string;
  purpose: string;
  fundingSource: string;
  ppmpId?: number;
  requestedById?: string;
  requesterName?: string;
  requesterEmail?: string;
  items: PrItemInput[];
}

export async function createPrFromCartAction(input: CreatePrInput) {
  try {
    const totalCost = input.items.reduce((sum, item) => sum + (item.quantity * item.estimatedUnitCost), 0);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify PPMP status and budget allocation if linked
      if (input.ppmpId) {
        const ppmp = await tx.ppmp.findUnique({
          where: { id: input.ppmpId },
          include: { items: true }
        });

        if (!ppmp || ppmp.status !== "Approved") {
          throw new Error("Linked PPMP must be approved before generating a Purchase Request.");
        }

        const remainingBudget = Number(ppmp.estimatedBudget);
        if (totalCost > remainingBudget) {
          throw new Error(`PR total cost (₱${totalCost.toLocaleString()}) exceeds the approved PPMP budget (₱${remainingBudget.toLocaleString()}).`);
        }
      }

      // Check against department budgets if budget monitor exists
      const deptBudget = await tx.departmentBudget.findUnique({
        where: { department: input.department }
      });

      if (deptBudget) {
        const remaining = Number(deptBudget.allocatedBudget) - Number(deptBudget.spentBudget);
        if (totalCost > remaining) {
          throw new Error(`Requisition total (₱${totalCost.toLocaleString()}) exceeds remaining department budget (₱${remaining.toLocaleString()}).`);
        }
      }

      // 2. Generate PR Number reference
      const ref = crypto.randomBytes(4).toString("hex").toUpperCase();
      const prNumber = `PR-2026-${ref}`;

      // 3. Create PR Master record
      const pr = await tx.purchaseRequest.create({
        data: {
          prNumber,
          department: input.department,
          office: input.office,
          purpose: input.purpose,
          fundingSource: input.fundingSource,
          ppmpId: input.ppmpId || null,
          estimatedBudget: new Prisma.Decimal(totalCost),
          totalCost: new Prisma.Decimal(totalCost),
          status: PrStatus.Submitted,
          requestedById: input.requestedById || null,
          requesterName: input.requesterName || null,
          requesterEmail: input.requesterEmail || null,
        }
      });

      // 4. Create PR Items
      for (const item of input.items) {
        const cost = item.quantity * item.estimatedUnitCost;
        const unitRecord = await tx.unitOfMeasure.upsert({
          where: { name: item.unit.trim() },
          update: {},
          create: { name: item.unit.trim(), abbreviation: item.unit.trim().slice(0, 15) }
        });

        await tx.purchaseRequestItem.create({
          data: {
            prId: pr.id,
            productId: item.productId || null,
            description: item.description,
            brand: item.brand || null,
            quantity: item.quantity,
            unitId: unitRecord.id,
            estimatedUnitCost: new Prisma.Decimal(item.estimatedUnitCost),
            estimatedCost: new Prisma.Decimal(cost),
            specification: item.specification || null,
          }
        });
      }

      // Deduct/Spent department budget allocation
      if (deptBudget) {
        await tx.departmentBudget.update({
          where: { department: input.department },
          data: {
            spentBudget: {
              increment: new Prisma.Decimal(totalCost)
            }
          }
        });
      }

      return pr;
    });

    logAuditTrail({
      actionType: "CREATE_PR",
      tableAffected: "purchase_requests",
      recordId: result.id,
      newState: result,
    });

    revalidatePath("/", "layout");
    return { success: true, pr: result };
  } catch (error: any) {
    console.error("Error creating PR:", error);
    return { success: false, error: error.message || "Failed to create Purchase Request." };
  }
}

export async function submitPrAction(id: number) {
  try {
    const old = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!old) return { success: false, error: "PR not found." };

    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: { status: PrStatus.Submitted },
    });

    logAuditTrail({
      actionType: "SUBMIT_PR",
      tableAffected: "purchase_requests",
      recordId: id,
      oldState: old,
      newState: updated,
    });

    revalidatePath("/", "layout");
    return { success: true, pr: updated };
  } catch (error: any) {
    console.error("Error submitting PR:", error);
    return { success: false, error: error.message || "Failed to submit PR." };
  }
}

export async function reviewPrAction(id: number, status: PrStatus, remarks?: string, officerId?: string) {
  try {
    const old = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!old) return { success: false, error: "PR not found." };

    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: { 
        status,
        remarks: remarks ? `${old.remarks || ""}\n[Review]: ${remarks}` : old.remarks,
        assignedOfficerId: officerId || old.assignedOfficerId,
      },
    });

    logAuditTrail({
      actionType: "REVIEW_PR",
      tableAffected: "purchase_requests",
      recordId: id,
      oldState: old,
      newState: updated,
    });

    revalidatePath("/", "layout");
    return { success: true, pr: updated };
  } catch (error: any) {
    console.error("Error reviewing PR:", error);
    return { success: false, error: error.message || "Failed to review PR." };
  }
}

export async function receivePrAction(id: number) {
  try {
    const old = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!old) return { success: false, error: "PR not found." };

    // Generate unique PROC-YYYY-XXXX number
    const year = new Date().getFullYear();
    const count = await prisma.purchaseRequest.count({
      where: {
        trackingNumber: {
          startsWith: `PROC-${year}-`
        }
      }
    });
    const seq = String(count + 1).padStart(4, "0");
    const trackingNumber = `PROC-${year}-${seq}`;

    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: { 
        status: PrStatus.Received,
        trackingNumber
      },
    });

    logAuditTrail({
      actionType: "RECEIVE_PR",
      tableAffected: "purchase_requests",
      recordId: id,
      oldState: old,
      newState: updated,
    });

    revalidatePath("/", "layout");
    return { success: true, pr: updated };
  } catch (error: any) {
    console.error("Error receiving PR:", error);
    return { success: false, error: error.message || "Failed to receive PR." };
  }
}

export async function getPurchaseRequests(filters?: { department?: string; status?: PrStatus }) {
  try {
    const where: any = {};
    if (filters?.department) where.department = filters.department;
    if (filters?.status) where.status = filters.status;

    return await prisma.purchaseRequest.findMany({
      where,
      include: { items: { include: { product: true } }, ppmp: true, requestedBy: true, assignedOfficer: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching PRs:", error);
    return [];
  }
}

export async function updatePrItemAction(
  itemId: number,
  data: {
    description?: string;
    brand?: string;
    quantity?: number;
    unit?: string;
    estimatedUnitCost?: number;
    specification?: string;
  }
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get current item and PR
      const item = await tx.purchaseRequestItem.findUnique({
        where: { id: itemId },
        include: { pr: true }
      });
      if (!item) throw new Error("Item not found");

      // Check if PR is in auditable status
      if (item.pr.status !== "Submitted" && item.pr.status !== "UnderReview" && item.pr.status !== "Draft" && item.pr.status !== "ReturnedForRevision") {
        throw new Error("Purchase Request cannot be edited in its current status.");
      }

      // Calculate new cost
      const newQuantity = data.quantity !== undefined ? data.quantity : item.quantity;
      const newUnitCost = data.estimatedUnitCost !== undefined ? data.estimatedUnitCost : Number(item.estimatedUnitCost);
      const newCost = newQuantity * newUnitCost;
      const costDiff = newCost - Number(item.estimatedCost);

      let unitId: number | undefined;
      if (data.unit) {
        const unitRecord = await tx.unitOfMeasure.upsert({
          where: { name: data.unit.trim() },
          update: {},
          create: { name: data.unit.trim(), abbreviation: data.unit.trim().slice(0, 15) }
        });
        unitId = unitRecord.id;
      }

      // 2. Update the item
      const updatedItem = await tx.purchaseRequestItem.update({
        where: { id: itemId },
        data: {
          description: data.description !== undefined ? data.description : item.description,
          brand: data.brand !== undefined ? data.brand : item.brand,
          quantity: newQuantity,
          unitId: unitId !== undefined ? unitId : item.unitId,
          estimatedUnitCost: new Prisma.Decimal(newUnitCost),
          estimatedCost: new Prisma.Decimal(newCost),
          specification: data.specification !== undefined ? data.specification : item.specification,
        }
      });

      // 3. Update the PR totalCost and estimatedBudget
      const updatedPr = await tx.purchaseRequest.update({
        where: { id: item.prId },
        data: {
          totalCost: { increment: new Prisma.Decimal(costDiff) },
          estimatedBudget: { increment: new Prisma.Decimal(costDiff) }
        }
      });

      // 4. Update the department budgetSpent if applicable
      const deptBudget = await tx.departmentBudget.findUnique({
        where: { department: item.pr.department }
      });
      if (deptBudget) {
        await tx.departmentBudget.update({
          where: { department: item.pr.department },
          data: {
            spentBudget: { increment: new Prisma.Decimal(costDiff) }
          }
        });
      }

      return { pr: updatedPr, item: updatedItem };
    });

    logAuditTrail({
      actionType: "UPDATE_PR_ITEM",
      tableAffected: "purchase_request_items",
      recordId: itemId,
      newState: result,
    });

    revalidatePath("/", "layout");
    return { success: true, pr: result.pr };
  } catch (error: any) {
    console.error("Error updating PR item:", error);
    return { success: false, error: error.message || "Failed to update item." };
  }
}

export async function getPreCanvassingData(prId: number) {
  try {
    const pr = await prisma.purchaseRequest.findUnique({
      where: { id: prId },
      include: {
        items: {
          include: {
            unit: true,
            product: {
              include: {
                supplierPrices: {
                  where: { available: true },
                  include: { supplier: true },
                  orderBy: { unitPrice: "asc" },
                  take: 1
                }
              }
            }
          }
        }
      }
    });

    if (!pr) return { success: false, error: "PR not found." };

    const dataItems = [];

    for (const item of pr.items) {
      // Find historical quote details from other suppliers
      let historicalQuotes: any[] = [];
      let previousOrders: any[] = [];

      if (item.productId) {
        // Query quotes for this product
        const quotes = await prisma.quoteDetail.findMany({
          where: { rfqItem: { productId: item.productId } },
          include: {
            quote: {
              include: {
                supplier: true
              }
            }
          },
          take: 5,
          orderBy: { quote: { submissionDate: "desc" } }
        });

        historicalQuotes = quotes.map(q => ({
          supplier: q.quote.supplier.companyName,
          price: Number(q.unitPrice),
          date: q.quote.submissionDate.toISOString(),
          isAvailable: q.isAvailable
        }));
      }

      // Query PO items for this product/description to get previous procurement records
      const poItems = await prisma.purchaseOrderItem.findMany({
        where: { description: { contains: item.description, mode: 'insensitive' } },
        include: {
          po: {
            include: {
              supplier: true
            }
          }
        },
        take: 3,
        orderBy: { po: { createdAt: "desc" } }
      });

      previousOrders = poItems.map(pi => ({
        supplier: pi.po.supplier.companyName,
        price: Number(pi.unitPrice),
        date: pi.po.createdAt.toISOString(),
        poNumber: pi.po.poNumber
      }));

      // Calculate lowest price, average historical price, etc.
      const catalogPrice = item.product ? Number(item.product.estimatedUnitCost) : Number(item.estimatedUnitCost);
      const allPrices = [
        ...historicalQuotes.map(q => q.price),
        ...previousOrders.map(o => o.price),
        catalogPrice
      ];

      const lowestPrice = allPrices.length > 0 ? Math.min(...allPrices) : catalogPrice;
      const averagePrice = allPrices.length > 0 ? allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length : catalogPrice;
      
      // Supplier trends / references
      const preferredSupplierName = item.product?.supplierPrices?.[0]?.supplier.companyName;
      const supplierRefs = Array.from(new Set([
        ...(preferredSupplierName ? [preferredSupplierName] : []),
        ...historicalQuotes.map(q => q.supplier),
        ...previousOrders.map(o => o.supplier)
      ]));

      dataItems.push({
        itemId: item.id,
        description: item.description,
        specification: item.specification,
        quantity: item.quantity,
        unit: item.unit.abbreviation,
        estimatedUnitCost: Number(item.estimatedUnitCost),
        catalogPrice,
        historicalQuotes,
        previousOrders,
        lowestPrice,
        averagePrice,
        supplierRefs,
      });
    }

    return {
      success: true,
      prId: pr.id,
      prNumber: pr.prNumber,
      totalCost: Number(pr.totalCost),
      department: pr.department,
      items: dataItems
    };
  } catch (error: any) {
    console.error("Error generating pre-canvassing data:", error);
    return { success: false, error: error.message || "Failed to generate pre-canvassing data." };
  }
}
