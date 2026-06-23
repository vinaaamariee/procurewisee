"use server";

import { prisma } from "@/lib/prisma";
import { RequisitionStatus, Prisma } from "@/generated/prisma/client";
import crypto from "crypto";

interface RequisitionItemInput {
  productName: string;
  quantity: number;
  estimatedUnitPrice: number;
}

interface RequisitionSubmissionInput {
  requesterName: string;
  requesterEmail: string;
  department: string;
  items: RequisitionItemInput[];
}

/**
 * Submits a new procurement requisition from an end-department.
 * Validates the request value against the department's remaining budget.
 * Generates secure tracking reference codes.
 */
export async function submitRequisitionAction(input: RequisitionSubmissionInput) {
  try {
    // 1. Fetch department budget to verify allocations
    const budget = await prisma.departmentBudget.findUnique({
      where: { department: input.department }
    });

    const totalEstimate = input.items.reduce(
      (sum, item) => sum + (item.quantity * item.estimatedUnitPrice), 0
    );

    if (budget) {
      const remainingBudget = Number(budget.allocatedBudget) - Number(budget.spentBudget);
      if (totalEstimate > remainingBudget) {
        return {
          success: false,
          message: `Submission Blocked: Request total of ₱${totalEstimate.toLocaleString()} exceeds the department's remaining budget of ₱${remainingBudget.toLocaleString()}.`
        };
      }
    }

    // 2. Generate Tracking codes
    const uniqueId = crypto.randomBytes(4).toString("hex").toUpperCase();
    const trackingCode = `PR-2026-${uniqueId}`; // E.g., PR-2026-F982C9
    const secureToken = `req_${crypto.randomUUID()}`;

    // 3. Save to database using transaction
    const savedRequisition = await prisma.$transaction(async (tx) => {
      // Create Requisition Master
      const req = await tx.requisition.create({
        data: {
          trackingCode,
          secureToken,
          requesterName: input.requesterName,
          requesterEmail: input.requesterEmail,
          department: input.department,
          status: "Pending" as RequisitionStatus,
        }
      });

      // Create Requisition Items
      for (const item of input.items) {
        await tx.requisitionItem.create({
          data: {
            requisitionId: req.id,
            productName: item.productName,
            quantity: item.quantity,
            estimatedUnitPrice: new Prisma.Decimal(item.estimatedUnitPrice)
          }
        });
      }

      // Create Requisition Initial History Entry
      await tx.requisitionStatusHistory.create({
        data: {
          requisitionId: req.id,
          status: "Pending" as RequisitionStatus,
          remarks: "Requisition successfully logged. Queued for Procurement Officer review."
        }
      });

      // Update Department Budget
      if (budget) {
        await tx.departmentBudget.update({
          where: { department: input.department },
          data: {
            spentBudget: {
              increment: new Prisma.Decimal(totalEstimate)
            }
          }
        });
      }

      // Add to audit trail
      await tx.auditTrail.create({
        data: {
          actionType: "CREATE_REQUISITION",
          tableAffected: "requisitions",
          recordId: req.id,
          newState: JSON.stringify({ req, items: input.items }),
          ipAddress: "N/A (Server Action Internal)",
        }
      });

      return req;
    });

    return {
      success: true,
      trackingCode: savedRequisition.trackingCode,
      secureToken: savedRequisition.secureToken,
    };
  } catch (error) {
    console.error("Failed to submit requisition:", error);
    return {
      success: false,
      message: "An internal database error occurred while filing the request."
    };
  }
}
