"use server";

import { prisma } from "@/lib/prisma";
import { PpmpStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { logAuditTrail } from "@/lib/audit";

interface PpmpItemInput {
  productId: number;
  generalDescription: string;
  quantity: number;
  estimatedUnitCost: number;
}

interface CreatePpmpInput {
  id?: number;
  ppmpNumber: string;
  projectTitle: string;
  department: string;
  office: string;
  fundingSource: string;
  fiscalYear: number;
  estimatedBudget: number;
  remarks?: string;
  attachments?: string;
  preparedById?: string;
  items: PpmpItemInput[];
}

export async function createPpmpAction(input: CreatePpmpInput) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Server-side budget validation checking the department's remaining allocation
      const budget = await tx.departmentBudget.findUnique({
        where: { department: input.department }
      });
      if (budget) {
        // Calculate other planned/approved PPMPs for this department (excluding current draft if updating)
        const otherPlans = await tx.ppmp.aggregate({
          where: {
            department: input.department,
            status: { in: [PpmpStatus.Draft, PpmpStatus.Submitted, PpmpStatus.Approved] },
            ...(input.id ? { NOT: { id: input.id } } : {})
          },
          _sum: { estimatedBudget: true }
        });
        const totalOtherPlanned = Number(otherPlans._sum.estimatedBudget || 0);
        const remainingBudget = Number(budget.allocatedBudget) - Number(budget.spentBudget) - totalOtherPlanned;
        if (input.estimatedBudget > remainingBudget) {
          throw new Error(`Insufficient budget. Remaining allocation is ₱${remainingBudget.toLocaleString()}, but this PPMP requires ₱${input.estimatedBudget.toLocaleString()}.`);
        }
      }

      let ppmp;

      if (input.id) {
        // Update existing PPMP
        const oldPpmp = await tx.ppmp.findUnique({ where: { id: input.id } });
        if (!oldPpmp) throw new Error("PPMP not found.");
        if (oldPpmp.status !== PpmpStatus.Draft && oldPpmp.status !== PpmpStatus.Returned) {
          throw new Error("Only Draft or Returned PPMPs can be modified.");
        }

        // 1.1 Verify uniqueness of PPMP Number if changed
        if (oldPpmp.ppmpNumber !== input.ppmpNumber) {
          const existing = await tx.ppmp.findUnique({
            where: { ppmpNumber: input.ppmpNumber },
          });
          if (existing) {
            throw new Error(`PPMP Number "${input.ppmpNumber}" already exists.`);
          }
        }

        ppmp = await tx.ppmp.update({
          where: { id: input.id },
          data: {
            ppmpNumber: input.ppmpNumber,
            projectTitle: input.projectTitle,
            department: input.department,
            office: input.office,
            fundingSource: input.fundingSource,
            fiscalYear: input.fiscalYear,
            estimatedBudget: new Prisma.Decimal(input.estimatedBudget),
            remarks: input.remarks || null,
            attachments: input.attachments || null,
            preparedById: input.preparedById || null,
          },
        });

        // 1.2 Remove old items
        await tx.ppmpItem.deleteMany({
          where: { ppmpId: input.id }
        });
      } else {
        // Create new PPMP
        const existing = await tx.ppmp.findUnique({
          where: { ppmpNumber: input.ppmpNumber },
        });

        if (existing) {
          throw new Error(`PPMP Number "${input.ppmpNumber}" already exists.`);
        }

        ppmp = await tx.ppmp.create({
          data: {
            ppmpNumber: input.ppmpNumber,
            projectTitle: input.projectTitle,
            department: input.department,
            office: input.office,
            fundingSource: input.fundingSource,
            fiscalYear: input.fiscalYear,
            estimatedBudget: new Prisma.Decimal(input.estimatedBudget),
            remarks: input.remarks || null,
            attachments: input.attachments || null,
            status: PpmpStatus.Draft,
            preparedById: input.preparedById || null,
          },
        });
      }

      // 3. Create PPMP Items copy unitId directly from CatalogProduct (No new unit creation, no upsert)
      for (const item of input.items) {
        const cost = item.quantity * item.estimatedUnitCost;
        
        const productRecord = await tx.catalogProduct.findUnique({
          where: { id: item.productId },
          select: { unitId: true }
        });
        if (!productRecord) {
          throw new Error(`Product with ID ${item.productId} not found in catalog.`);
        }

        await tx.ppmpItem.create({
          data: {
            ppmpId: ppmp.id,
            productId: item.productId,
            generalDescription: item.generalDescription,
            quantity: item.quantity,
            unitId: productRecord.unitId,
            estimatedUnitCost: new Prisma.Decimal(item.estimatedUnitCost),
            estimatedCost: new Prisma.Decimal(cost),
          },
        });
      }

      return ppmp;
    });

    logAuditTrail({
      actionType: input.id ? "UPDATE_PPMP" : "CREATE_PPMP",
      tableAffected: "ppmps",
      recordId: result.id,
      newState: result,
    });

    revalidatePath("/", "layout");
    return { success: true, ppmp: result };
  } catch (error: any) {
    console.error("Error saving PPMP:", error);
    return { success: false, error: error.message || "Failed to save PPMP." };
  }
}

export async function submitPpmpAction(id: number) {
  try {
    const old = await prisma.ppmp.findUnique({ where: { id } });
    if (!old) return { success: false, error: "PPMP not found." };

    const updated = await prisma.ppmp.update({
      where: { id },
      data: { status: PpmpStatus.Submitted },
    });

    logAuditTrail({
      actionType: "SUBMIT_PPMP",
      tableAffected: "ppmps",
      recordId: id,
      oldState: old,
      newState: updated,
    });

    revalidatePath("/", "layout");
    return { success: true, ppmp: updated };
  } catch (error: any) {
    console.error("Error submitting PPMP:", error);
    return { success: false, error: error.message || "Failed to submit PPMP." };
  }
}

export async function deletePpmpAction(id: number) {
  try {
    const old = await prisma.ppmp.findUnique({ where: { id } });
    if (!old) return { success: false, error: "PPMP not found." };
    if (old.status !== PpmpStatus.Draft && old.status !== PpmpStatus.Returned) {
      return { success: false, error: "Only Draft or Returned PPMPs can be deleted." };
    }
    await prisma.ppmp.delete({ where: { id } });
    logAuditTrail({
      actionType: "DELETE_PPMP",
      tableAffected: "ppmps",
      recordId: id,
      oldState: old,
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting PPMP:", error);
    return { success: false, error: error.message || "Failed to delete PPMP." };
  }
}

export async function convertPpmpToPrAction(ppmpId: number) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch PPMP and items
      const ppmp = await tx.ppmp.findUnique({
        where: { id: ppmpId },
        include: { items: { include: { product: true } } }
      });
      if (!ppmp) throw new Error("PPMP not found.");
      if (ppmp.status !== PpmpStatus.Approved) {
        throw new Error("Only Approved PPMPs can be converted to Purchase Requests.");
      }

      // Check if already converted
      const existingPr = await tx.purchaseRequest.findFirst({
        where: { ppmpId }
      });
      if (existingPr) {
        return existingPr;
      }

      // Generate tracking code and PR Number
      const randomRef = Math.floor(100000 + Math.random() * 900000);
      const prNumber = `PR-2026-${randomRef}`;

      // Create PR Master
      const pr = await tx.purchaseRequest.create({
        data: {
          prNumber,
          department: ppmp.department,
          office: ppmp.office,
          requestedById: ppmp.preparedById,
          purpose: `Generated from PPMP ${ppmp.ppmpNumber}: ${ppmp.projectTitle}`,
          fundingSource: ppmp.fundingSource,
          ppmpId: ppmp.id,
          estimatedBudget: ppmp.estimatedBudget,
          totalCost: ppmp.estimatedBudget,
          status: "Draft",
        }
      });

      // Create PR Items from PPMP items
      for (const item of ppmp.items) {
        await tx.purchaseRequestItem.create({
          data: {
            prId: pr.id,
            productId: item.productId,
            description: item.generalDescription,
            quantity: item.quantity,
            unitId: item.unitId,
            estimatedUnitCost: item.estimatedUnitCost,
            estimatedCost: item.estimatedCost,
          }
        });
      }

      return pr;
    });

    logAuditTrail({
      actionType: "CONVERT_PPMP_TO_PR",
      tableAffected: "purchase_requests",
      recordId: result.id,
      newState: result,
    });

    revalidatePath("/", "layout");
    return { success: true, pr: result };
  } catch (error: any) {
    console.error("Error converting PPMP to PR:", error);
    return { success: false, error: error.message || "Failed to convert PPMP to PR." };
  }
}

export async function reviewPpmpAction(id: number, status: PpmpStatus, remarks?: string) {
  try {
    const old = await prisma.ppmp.findUnique({ where: { id } });
    if (!old) return { success: false, error: "PPMP not found." };

    const updated = await prisma.ppmp.update({
      where: { id },
      data: { 
        status,
        remarks: remarks ? `${old.remarks || ""}\n[Review]: ${remarks}` : old.remarks,
      },
    });

    logAuditTrail({
      actionType: "REVIEW_PPMP",
      tableAffected: "ppmps",
      recordId: id,
      oldState: old,
      newState: updated,
    });

    revalidatePath("/", "layout");
    return { success: true, ppmp: updated };
  } catch (error: any) {
    console.error("Error reviewing PPMP:", error);
    return { success: false, error: error.message || "Failed to review PPMP." };
  }
}

export async function getPpmpList(filters?: { department?: string; status?: PpmpStatus }) {
  try {
    const where: any = {};
    if (filters?.department) where.department = filters.department;
    if (filters?.status) where.status = filters.status;

    return await prisma.ppmp.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                unit: true
              }
            }
          }
        },
        preparedBy: true,
        purchaseRequests: true
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching PPMPs:", error);
    return [];
  }
}
