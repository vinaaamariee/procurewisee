"use server";

import { prisma } from "@/lib/prisma";
import { PpmpStatus, Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { logAuditTrail } from "@/lib/audit";

interface PpmpItemInput {
  generalDescription: string;
  quantity: number;
  unit: string;
  estimatedUnitCost: number;
  schedule?: string;
}

interface CreatePpmpInput {
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
      // 1. Verify uniqueness of PPMP Number
      const existing = await tx.ppmp.findUnique({
        where: { ppmpNumber: input.ppmpNumber },
      });

      if (existing) {
        throw new Error(`PPMP Number "${input.ppmpNumber}" already exists.`);
      }

      // 2. Create PPMP Master
      const ppmp = await tx.ppmp.create({
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

      // 3. Create PPMP Items
      for (const item of input.items) {
        const cost = item.quantity * item.estimatedUnitCost;
        const unitRecord = await tx.unitOfMeasure.upsert({
          where: { name: item.unit.trim() },
          update: {},
          create: { name: item.unit.trim(), abbreviation: item.unit.trim().slice(0, 15) }
        });

        await tx.ppmpItem.create({
          data: {
            ppmpId: ppmp.id,
            generalDescription: item.generalDescription,
            quantity: item.quantity,
            unitId: unitRecord.id,
            estimatedUnitCost: new Prisma.Decimal(item.estimatedUnitCost),
            estimatedCost: new Prisma.Decimal(cost),
            schedule: item.schedule || null,
          },
        });
      }

      return ppmp;
    });

    logAuditTrail({
      actionType: "CREATE_PPMP",
      tableAffected: "ppmps",
      recordId: result.id,
      newState: result,
    });

    revalidatePath("/", "layout");
    return { success: true, ppmp: result };
  } catch (error: any) {
    console.error("Error creating PPMP:", error);
    return { success: false, error: error.message || "Failed to create PPMP." };
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
      include: { items: true, preparedBy: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching PPMPs:", error);
    return [];
  }
}
