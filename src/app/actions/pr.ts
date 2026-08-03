"use server";

import { prisma } from "@/lib/prisma";
import { PrStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { logAuditTrail } from "@/lib/audit";
import crypto from "crypto";
import { requireRole, getAuthenticatedUser } from "@/lib/auth/get-user-profile";
import { createNotificationHelper } from "@/app/actions/notifications";

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

    // Retrieve authenticated user info if not explicitly passed
    let reqId = input.requestedById;
    let reqName = input.requesterName;
    let reqEmail = input.requesterEmail;

    if (!reqId) {
      try {
        const auth = await getAuthenticatedUser();
        if (auth && auth.profile) {
          reqId = auth.profile.id;
          reqName = auth.profile.fullName || reqName;
          reqEmail = auth.profile.email || reqEmail;
        }
      } catch (err) {
        console.warn("No authenticated user session found:", err);
      }
    }

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
          requestedById: reqId || null,
          requesterName: reqName || null,
          requesterEmail: reqEmail || null,
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

      // Add status history entry
      await tx.purchaseRequestStatusHistory.create({
        data: {
          purchaseRequestId: pr.id,
          status: PrStatus.Submitted,
          remarks: "Purchase Request created and submitted.",
          changedById: input.requestedById || null
        }
      });

      await logAuditTrail({
        actionType: "CREATE_PR",
        tableAffected: "purchase_requests",
        recordId: pr.id,
        newState: pr,
        tx,
      });

      return pr;
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
    const { profile } = await requireRole("End User");
    const old = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!old) return { success: false, error: "PR not found." };

    const targetStatus = (PrStatus as any).PendingProcurementReview || PrStatus.Submitted;

    const updated = await prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.update({
        where: { id },
        data: { 
          status: targetStatus,
          submittedAt: new Date(),
        },
      });

      await logAuditTrail({
        actionType: "SUBMIT_PR",
        tableAffected: "purchase_requests",
        recordId: id,
        oldState: old,
        newState: pr,
        tx,
      });

      return pr;
    });

    revalidatePath("/", "layout");
    return { success: true, pr: updated };
  } catch (error: any) {
    console.error("Error submitting PR:", error);
    return { success: false, error: error.message || "Failed to submit PR." };
  }
}

export async function approvePrByOfficerAction(id: number) {
  try {
    const { profile } = await getAuthenticatedUser();
    if (profile.role !== "Procurement Officer" && profile.role !== "Administrative Approver") {
      return { success: false, error: "Unauthorized role for this action." };
    }

    const old = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!old) return { success: false, error: "PR not found." };

    const updated = await prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.update({
        where: { id },
        data: { 
          status: PrStatus.Approved,
          approvedAt: new Date(),
          reviewedAt: new Date(),
          assignedOfficerId: profile.id,
          ...({ reviewedById: profile.id } as any),
        },
      });

      await logAuditTrail({
        actionType: "APPROVE_PR",
        tableAffected: "purchase_requests",
        recordId: id,
        oldState: old,
        newState: pr,
        tx,
      });

      return pr;
    });

    revalidatePath("/", "layout");
    return { success: true, pr: updated };
  } catch (error: any) {
    console.error("Error approving PR:", error);
    return { success: false, error: error.message || "Failed to approve Purchase Request." };
  }
}

export async function returnPrByOfficerAction(id: number, remarks: string) {
  try {
    const { profile } = await getAuthenticatedUser();
    if (profile.role !== "Procurement Officer" && profile.role !== "Administrative Approver") {
      return { success: false, error: "Unauthorized role for this action." };
    }

    if (!remarks || !remarks.trim()) {
      return { success: false, error: "A reason comment is required when returning a Purchase Request." };
    }

    const old = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!old) return { success: false, error: "PR not found." };

    const targetStatus = (PrStatus as any).Returned || PrStatus.ReturnedForRevision;

    const updated = await prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.update({
        where: { id },
        data: { 
          status: targetStatus,
          remarks: remarks.trim(),
          reviewedAt: new Date(),
          assignedOfficerId: profile.id,
          ...({ reviewedById: profile.id } as any),
        },
      });

      await logAuditTrail({
        actionType: "RETURN_PR",
        tableAffected: "purchase_requests",
        recordId: id,
        oldState: old,
        newState: pr,
        tx,
      });

      return pr;
    });

    revalidatePath("/", "layout");
    return { success: true, pr: updated };
  } catch (error: any) {
    console.error("Error returning PR:", error);
    return { success: false, error: error.message || "Failed to return Purchase Request." };
  }
}

export async function reviewPrAction(id: number, status: PrStatus, remarks?: string, officerId?: string) {
  if (status === PrStatus.Approved) {
    return approvePrByOfficerAction(id);
  }
  if (status === (PrStatus as any).Returned || status === PrStatus.ReturnedForRevision) {
    return returnPrByOfficerAction(id, remarks || "");
  }
  try {
    const { profile } = await getAuthenticatedUser();
    const old = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!old) return { success: false, error: "PR not found." };

    const updated = await prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.update({
        where: { id },
        data: { 
          status,
          remarks: remarks ? remarks : old.remarks,
          assignedOfficerId: officerId || old.assignedOfficerId,
          reviewedAt: new Date(),
          ...({ reviewedById: profile.id } as any),
        },
      });

      await tx.purchaseRequestStatusHistory.create({
        data: {
          purchaseRequestId: id,
          status,
          remarks: remarks || "Status changed during review.",
          changedById: profile.id
        }
      });

      await logAuditTrail({
        actionType: "REVIEW_PR",
        tableAffected: "purchase_requests",
        recordId: id,
        oldState: old,
        newState: pr,
        tx,
      });

      return pr;
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
    const { profile } = await requireRole("Procurement Officer");
    const old = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!old) return { success: false, error: "PR not found." };
    if (old.status !== "Submitted") {
      return { success: false, error: "Only submitted requests can be marked as received." };
    }

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

    const updated = await prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.update({
        where: { id },
        data: { 
          status: PrStatus.Received,
          trackingNumber
        },
      });

      await tx.purchaseRequestStatusHistory.create({
        data: {
          purchaseRequestId: id,
          status: PrStatus.Received,
          remarks: `Purchase Request received. Official PROC number issued: ${trackingNumber}`,
          changedById: profile.id,
        },
      });

      await logAuditTrail({
        actionType: "RECEIVE_PR",
        tableAffected: "purchase_requests",
        recordId: id,
        oldState: old,
        newState: pr,
        tx,
      });

      return pr;
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
    const { profile } = await getAuthenticatedUser();
    const where: any = {};

    // End Users can ONLY access their own Purchase Requests
    if (profile.role === "End User") {
      where.requestedById = profile.id;
    }

    if (filters?.department) where.department = filters.department;
    if (filters?.status) where.status = filters.status;

    return await prisma.purchaseRequest.findMany({
      where,
      include: {
        items: { include: { product: true, unit: true } },
        ppmp: true,
        requestedBy: true,
        assignedOfficer: true,
        statusHistory: { include: { changedBy: true }, orderBy: { createdAt: "desc" } },
      },
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

      await logAuditTrail({
        actionType: "UPDATE_PR_ITEM",
        tableAffected: "purchase_request_items",
        recordId: itemId,
        newState: { pr: updatedPr, item: updatedItem },
        tx,
      });

      return { pr: updatedPr, item: updatedItem };
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
    await requireRole("Procurement Officer");
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
        unit: item.unit?.abbreviation || item.unitText || "unit",
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

export async function resubmitPrAction(id: number, updatedItems: PrItemInput[]) {
  try {
    const { profile } = await requireRole("End User");

    const old = await prisma.purchaseRequest.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!old) {
      return { success: false, error: "Purchase Request not found." };
    }

    const isReturnedState = old.status === (PrStatus as any).Returned || old.status === PrStatus.ReturnedForRevision;
    if (!isReturnedState) {
      return { success: false, error: `Only requests that are Returned for Revision can be resubmitted.` };
    }

    const targetStatus = (PrStatus as any).PendingProcurementReview || PrStatus.Submitted;
    const newTotalCost = updatedItems.reduce((sum, item) => sum + (item.quantity * item.estimatedUnitCost), 0);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Validate department budget
      const deptBudget = await tx.departmentBudget.findUnique({
        where: { department: old.department }
      });

      if (deptBudget) {
        const remaining = Number(deptBudget.allocatedBudget) - Number(deptBudget.spentBudget);
        if (newTotalCost > remaining) {
          throw new Error(`Resubmission total (₱${newTotalCost.toLocaleString()}) exceeds remaining department budget (₱${remaining.toLocaleString()}).`);
        }
      }

      // 2. Delete existing items
      await tx.purchaseRequestItem.deleteMany({
        where: { prId: id }
      });

      // 3. Create updated items
      for (const item of updatedItems) {
        const cost = item.quantity * item.estimatedUnitCost;
        const unitRecord = await tx.unitOfMeasure.upsert({
          where: { name: item.unit.trim() },
          update: {},
          create: { name: item.unit.trim(), abbreviation: item.unit.trim().slice(0, 15) }
        });

        await tx.purchaseRequestItem.create({
          data: {
            prId: id,
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

      // 4. Update PR Master
      const pr = await tx.purchaseRequest.update({
        where: { id },
        data: {
          status: targetStatus,
          submittedAt: new Date(),
          totalCost: new Prisma.Decimal(newTotalCost),
          estimatedBudget: new Prisma.Decimal(newTotalCost)
        },
        include: {
          items: {
            include: {
              product: true,
              unit: true
            }
          }
        }
      });

      await logAuditTrail({
        actionType: "RESUBMIT_PR",
        tableAffected: "purchase_requests",
        recordId: id,
        oldState: old,
        newState: pr,
        tx,
      });

      return pr;
    });

    revalidatePath("/", "layout");
    return { success: true, pr: result };
  } catch (error: any) {
    console.error("Error resubmitting PR:", error);
    return { success: false, error: error.message || "Failed to resubmit PR." };
  }
}

// Delete a Draft PR (End User permission)
export async function deletePrDraftAction(id: number) {
  try {
    const { profile } = await getAuthenticatedUser();
    const pr = await prisma.purchaseRequest.findUnique({ where: { id } });

    if (!pr) return { success: false, error: "Purchase Request not found." };

    if (profile.role === "End User" && pr.requestedById !== profile.id) {
      return { success: false, error: "You can only delete your own Purchase Requests." };
    }

    if (pr.status !== PrStatus.Draft) {
      return { success: false, error: "Only Draft Purchase Requests can be deleted." };
    }

    await prisma.purchaseRequest.delete({ where: { id } });

    logAuditTrail({
      actionType: "DELETE_PR_DRAFT",
      tableAffected: "purchase_requests",
      recordId: id,
      oldState: pr,
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting PR draft:", error);
    return { success: false, error: error.message || "Failed to delete Purchase Request." };
  }
}

// Convert an Approved PR into a new RFQ (Procurement Officer action)
export async function convertPrToRfqAction(prId: number) {
  try {
    const { profile } = await requireRole("Procurement Officer");

    const pr = await prisma.purchaseRequest.findUnique({
      where: { id: prId },
      include: { items: { include: { unit: true } } },
    });

    if (!pr) return { success: false, error: "Purchase Request not found." };

    if (pr.status !== PrStatus.Approved) {
      return { success: false, error: "Only Approved Purchase Requests can be converted to an RFQ." };
    }

    const year = new Date().getFullYear();
    const count = await prisma.requestForQuote.count({
      where: { rfqNumber: { startsWith: `RFQ-${year}-` } },
    });
    const seq = String(count + 1).padStart(4, "0");
    const rfqNumber = `RFQ-${year}-${seq}`;

    const rfq = await prisma.$transaction(async (tx) => {
      // 1. Create RFQ master
      const newRfq = await tx.requestForQuote.create({
        data: {
          rfqNumber,
          prId: pr.id,
          title: `Procurement for ${pr.purpose || pr.department}`,
          approvedBudgetContract: pr.totalCost,
          deadlineDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days deadline default
          status: "Draft",
          createdById: profile.id,
        },
      });

      // 2. Populate RFQ Items from PR items (no re-encoding needed)
      for (let i = 0; i < pr.items.length; i++) {
        const item = pr.items[i];
        let targetUnitId = item.unitId;
        if (!targetUnitId) {
          const itemUnitName = item.unit?.name || item.unitText || "unit";
          const u = await tx.unitOfMeasure.upsert({
            where: { name: itemUnitName.trim() },
            update: {},
            create: { name: itemUnitName.trim(), abbreviation: itemUnitName.trim().slice(0, 15) }
          });
          targetUnitId = u.id;
        }

        await tx.rfqItem.create({
          data: {
            rfqId: newRfq.id,
            itemNumber: String(i + 1),
            particulars: item.description + (item.specification ? ` (${item.specification})` : ""),
            quantity: item.quantity,
            unitId: targetUnitId,
            productId: item.productId || null,
          },
        });
      }

      // 3. Update PR status to ConvertedToRfq
      await tx.purchaseRequest.update({
        where: { id: prId },
        data: { status: PrStatus.ConvertedToRfq },
      });

      // 4. Record in PR status history
      await tx.purchaseRequestStatusHistory.create({
        data: {
          purchaseRequestId: prId,
          status: PrStatus.ConvertedToRfq,
          remarks: `Converted to RFQ #${rfqNumber} by Procurement Officer`,
          changedById: profile.id,
        },
      });

      await logAuditTrail({
        actionType: "CONVERT_PR_TO_RFQ",
        tableAffected: "requests_for_quote",
        recordId: newRfq.id,
        newState: newRfq,
        tx,
      });

      return newRfq;
    });

    // Notify requesting End User if present
    if (pr.requestedById) {
      await createNotificationHelper({
        title: "RFQ Generated from your PR",
        description: `Official RFQ ${rfq.rfqNumber} has been generated from your approved Purchase Request ${pr.prNumber}.`,
        icon: "📋",
        userId: pr.requestedById,
      });
    }

    revalidatePath("/", "layout");
    return { success: true, rfq };
  } catch (error: any) {
    console.error("Error converting PR to RFQ:", error);
    return { success: false, error: error.message || "Failed to convert PR to RFQ." };
  }
}
