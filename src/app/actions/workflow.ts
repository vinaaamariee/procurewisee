"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAuditTrail } from "@/lib/audit";

interface WorkflowStepInput {
  role: string;
  level: number;
  action: string;
  parallel?: boolean;
  escalationDays?: number;
}

export async function saveWorkflowConfigAction(data: {
  moduleName: string;
  steps: WorkflowStepInput[];
  isActive?: boolean;
}) {
  try {
    const stepsJson = JSON.parse(JSON.stringify(data.steps));

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.workflowConfig.findUnique({
        where: { moduleName: data.moduleName }
      });

      if (current) {
        const updated = await tx.workflowConfig.update({
          where: { id: current.id },
          data: {
            steps: stepsJson,
            isActive: data.isActive !== undefined ? data.isActive : current.isActive,
          }
        });
        return { isNew: false, config: updated, old: current };
      } else {
        const created = await tx.workflowConfig.create({
          data: {
            moduleName: data.moduleName,
            steps: stepsJson,
            isActive: data.isActive !== undefined ? data.isActive : true,
          }
        });
        return { isNew: true, config: created, old: null };
      }
    });

    logAuditTrail({
      actionType: result.isNew ? "CREATE_WORKFLOW_CONFIG" : "UPDATE_WORKFLOW_CONFIG",
      tableAffected: "workflow_configs",
      recordId: result.config.id,
      oldState: result.old,
      newState: result.config,
    });

    revalidatePath("/", "layout");
    return { success: true, config: result.config };
  } catch (error: any) {
    console.error("Error saving workflow config:", error);
    return { success: false, error: error.message || "Failed to save workflow config." };
  }
}

export async function getWorkflowConfig(moduleName: string) {
  try {
    return await prisma.workflowConfig.findUnique({
      where: { moduleName }
    });
  } catch (error) {
    console.error("Error fetching workflow config:", error);
    return null;
  }
}
