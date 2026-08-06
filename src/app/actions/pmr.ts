"use server";

import { prisma } from "@/lib/prisma";
import { PmrStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { logAuditTrail } from "@/lib/audit";
import { requireRole } from "@/lib/auth/get-user-profile";

export async function getPmrs() {
  try {
    await requireRole("Procurement Officer");
    return await prisma.procurementMonitoringRecord.findMany({
      include: {
        pr: {
          select: {
            id: true,
            prNumber: true,
            department: true,
            purpose: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { dateReceived: "desc" },
    });
  } catch (error) {
    console.error("Error fetching PMR records:", error);
    return [];
  }
}

export interface UpdatePmrInput {
  stage: string;
  status: PmrStatus;
  remarks?: string;
}

export async function updatePmrAction(id: number, input: UpdatePmrInput) {
  try {
    await requireRole("Procurement Officer");

    if (!input.stage || !input.stage.trim()) {
      return { success: false, error: "Stage is required." };
    }

    const old = await prisma.procurementMonitoringRecord.findUnique({ where: { id } });
    if (!old) return { success: false, error: "PMR record not found." };

    const updated = await prisma.$transaction(async (tx) => {
      const pmr = await tx.procurementMonitoringRecord.update({
        where: { id },
        data: {
          stage: input.stage.trim(),
          status: input.status,
          remarks: input.remarks ?? old.remarks,
        },
        include: {
          pr: { select: { prNumber: true } },
          verifiedBy: { select: { fullName: true } },
        },
      });

      await logAuditTrail({
        actionType: "UPDATE_PMR",
        tableAffected: "procurement_monitoring_records",
        recordId: id,
        oldState: old,
        newState: pmr,
        tx,
      });

      return pmr;
    });

    revalidatePath("/", "layout");
    return { success: true, pmr: updated };
  } catch (error: any) {
    console.error("Error updating PMR:", error);
    return { success: false, error: error.message || "Failed to update PMR record." };
  }
}

export async function archivePmrAction(id: number) {
  try {
    await requireRole("Procurement Officer");
    const old = await prisma.procurementMonitoringRecord.findUnique({ where: { id } });
    if (!old) return { success: false, error: "PMR record not found." };

    const updated = await prisma.$transaction(async (tx) => {
      const pmr = await tx.procurementMonitoringRecord.update({
        where: { id },
        data: { status: PmrStatus.Archived },
        include: {
          pr: { select: { prNumber: true } },
          verifiedBy: { select: { fullName: true } },
        },
      });

      await logAuditTrail({
        actionType: "ARCHIVE_PMR",
        tableAffected: "procurement_monitoring_records",
        recordId: id,
        oldState: old,
        newState: pmr,
        tx,
      });

      return pmr;
    });

    revalidatePath("/", "layout");
    return { success: true, pmr: updated };
  } catch (error: any) {
    console.error("Error archiving PMR:", error);
    return { success: false, error: error.message || "Failed to archive PMR record." };
  }
}
