"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAuditTrail } from "@/lib/audit";

interface FormFieldInput {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "currency" | "date" | "dropdown" | "checkbox" | "radio" | "file" | "signature";
  required: boolean;
  options?: string[];
}

export async function saveFormTemplateAction(data: {
  id?: number;
  name: string;
  fields: FormFieldInput[];
  notes?: string;
}) {
  try {
    const fieldsJson = JSON.parse(JSON.stringify(data.fields));

    const result = await prisma.$transaction(async (tx) => {
      if (data.id) {
        // Fetch current template
        const current = await tx.formTemplate.findUnique({
          where: { id: data.id }
        });

        if (!current) {
          throw new Error("Form template not found.");
        }

        // Auto increment version
        const updated = await tx.formTemplate.update({
          where: { id: data.id },
          data: {
            name: data.name,
            fields: fieldsJson,
            version: current.version + 1,
            notes: data.notes || null,
          }
        });

        return { isNew: false, template: updated, old: current };
      } else {
        const created = await tx.formTemplate.create({
          data: {
            name: data.name,
            fields: fieldsJson,
            notes: data.notes || null,
            version: 1,
          }
        });

        return { isNew: true, template: created, old: null };
      }
    });

    logAuditTrail({
      actionType: result.isNew ? "CREATE_FORM_TEMPLATE" : "UPDATE_FORM_TEMPLATE",
      tableAffected: "form_templates",
      recordId: result.template.id,
      oldState: result.old,
      newState: result.template,
    });

    revalidatePath("/", "layout");
    return { success: true, template: result.template };
  } catch (error: any) {
    console.error("Error saving form template:", error);
    return { success: false, error: error.message || "Failed to save form template." };
  }
}

export async function getFormTemplates() {
  try {
    return await prisma.formTemplate.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching form templates:", error);
    return [];
  }
}
