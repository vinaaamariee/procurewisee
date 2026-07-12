"use server";

import { prisma } from "@/lib/prisma";
import { EvaluationType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { logAuditTrail } from "@/lib/audit";
import { createNotificationHelper } from "./notifications";

interface SubmitEvaluationInput {
  supplierId: number;
  evaluationType: EvaluationType;
  evaluatorName: string;
  
  // End User ratings (1-4)
  productQuality?: number;
  deliveryCompliance?: number;
  accuracy?: number;
  responsiveness?: number;
  communication?: number;
  costEffectiveness?: number;
  overallSatisfaction?: number;

  // Procurement Office ratings (1-4)
  rfqResponsiveness?: number;
  competitivePricing?: number;
  specificationCompliance?: number;
  documentCompliance?: number;
  deliveryPerformance?: number;

  comments?: string;
  recommendation?: string;
  signature?: string;
}

export async function submitSupplierEvaluationAction(input: SubmitEvaluationInput) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Save evaluation
      const evalRow = await tx.supplierEvaluation.create({
        data: {
          supplierId: input.supplierId,
          evaluationType: input.evaluationType,
          evaluatorName: input.evaluatorName,
          evaluationDate: new Date(),
          productQuality: input.productQuality || null,
          deliveryCompliance: input.deliveryCompliance || null,
          accuracy: input.accuracy || null,
          responsiveness: input.responsiveness || null,
          communication: input.communication || null,
          costEffectiveness: input.costEffectiveness || null,
          overallSatisfaction: input.overallSatisfaction || null,
          rfqResponsiveness: input.rfqResponsiveness || null,
          competitivePricing: input.competitivePricing || null,
          specificationCompliance: input.specificationCompliance || null,
          documentCompliance: input.documentCompliance || null,
          deliveryPerformance: input.deliveryPerformance || null,
          comments: input.comments || null,
          recommendation: input.recommendation || null,
          signature: input.signature || null,
        }
      });

      // 2. Query all evaluations for this supplier to recalculate metrics
      const evals = await tx.supplierEvaluation.findMany({
        where: { supplierId: input.supplierId }
      });

      let totalScoreSum = 0;
      let totalFieldsCount = 0;

      let qualitySum = 0;
      let qualityCount = 0;

      let deliverySum = 0;
      let deliveryCount = 0;

      for (const ev of evals) {
        if (ev.evaluationType === EvaluationType.EndUser) {
          const fields = [
            ev.productQuality,
            ev.deliveryCompliance,
            ev.accuracy,
            ev.responsiveness,
            ev.communication,
            ev.costEffectiveness,
            ev.overallSatisfaction
          ];

          fields.forEach(f => {
            if (f !== null) {
              totalScoreSum += f;
              totalFieldsCount++;
            }
          });

          if (ev.productQuality !== null) {
            qualitySum += ev.productQuality;
            qualityCount++;
          }

          if (ev.deliveryCompliance !== null) {
            deliverySum += ev.deliveryCompliance;
            deliveryCount++;
          }
        } else {
          const fields = [
            ev.rfqResponsiveness,
            ev.competitivePricing,
            ev.specificationCompliance,
            ev.documentCompliance,
            ev.deliveryPerformance
          ];

          fields.forEach(f => {
            if (f !== null) {
              totalScoreSum += f;
              totalFieldsCount++;
            }
          });

          if (ev.specificationCompliance !== null) {
            qualitySum += ev.specificationCompliance;
            qualityCount++;
          }

          if (ev.deliveryPerformance !== null) {
            deliverySum += ev.deliveryPerformance;
            deliveryCount++;
          }
        }
      }

      // Calculations scaled to requirements
      // reliabilityRating: 0.00 to 5.00 scale (average of 1-4 ratings scaled to 5)
      const avgScore = totalFieldsCount > 0 ? totalScoreSum / totalFieldsCount : 4;
      const reliabilityRating = (avgScore / 4) * 5;

      // qualityComplianceRate: percentage 0 to 100%
      const avgQuality = qualityCount > 0 ? qualitySum / qualityCount : 4;
      const qualityComplianceRate = (avgQuality / 4) * 100;

      // onTimeDeliveryRate: percentage 0 to 100%
      const avgDelivery = deliveryCount > 0 ? deliverySum / deliveryCount : 4;
      const onTimeDeliveryRate = (avgDelivery / 4) * 100;

      // 3. Update Supplier performance ratings
      await tx.supplier.update({
        where: { id: input.supplierId },
        data: {
          reliabilityRating: new Prisma.Decimal(reliabilityRating),
          qualityComplianceRate: new Prisma.Decimal(qualityComplianceRate),
          onTimeDeliveryRate: new Prisma.Decimal(onTimeDeliveryRate),
        }
      });

      return evalRow;
    });

    logAuditTrail({
      actionType: "SUBMIT_SUPPLIER_EVALUATION",
      tableAffected: "supplier_evaluations",
      recordId: result.id,
      newState: result,
    });

    // Notify Procurement Officers
    const supplier = await prisma.supplier.findUnique({
      where: { id: input.supplierId },
      select: { companyName: true }
    });
    
    await createNotificationHelper({
      title: 'Supplier Evaluation Submitted',
      description: `A new performance evaluation for "${supplier?.companyName || 'Supplier'}" has been submitted by ${input.evaluatorName}.`,
      icon: '📊',
      role: 'Procurement Officer'
    });

    revalidatePath("/", "layout");
    return { success: true, evaluation: result };
  } catch (error: any) {
    console.error("Error submitting evaluation:", error);
    return { success: false, error: error.message || "Failed to submit evaluation." };
  }
}

export async function getSupplierScorecard(supplierId: number) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        evaluations: true,
        quotes: {
          include: {
            rfq: true
          }
        }
      }
    });

    if (!supplier) return null;

    // Compute average scores
    const endUserEvals = supplier.evaluations.filter(e => e.evaluationType === EvaluationType.EndUser);
    const officeEvals = supplier.evaluations.filter(e => e.evaluationType === EvaluationType.ProcurementOffice);

    const getAvg = (evalList: typeof supplier.evaluations, fields: string[]) => {
      let sum = 0;
      let count = 0;
      evalList.forEach(ev => {
        fields.forEach(f => {
          const val = (ev as any)[f];
          if (val !== null && val !== undefined) {
            sum += val;
            count++;
          }
        });
      });
      return count > 0 ? (sum / count) : 0;
    };

    const avgEndUser = getAvg(endUserEvals, ["productQuality", "deliveryCompliance", "accuracy", "responsiveness", "communication", "costEffectiveness", "overallSatisfaction"]);
    const avgOffice = getAvg(officeEvals, ["rfqResponsiveness", "competitivePricing", "specificationCompliance", "documentCompliance", "deliveryPerformance"]);

    return {
      supplierId: supplier.id,
      companyName: supplier.companyName,
      reliabilityRating: Number(supplier.reliabilityRating),
      qualityComplianceRate: Number(supplier.qualityComplianceRate),
      onTimeDeliveryRate: Number(supplier.onTimeDeliveryRate),
      avgEndUserScore: Number((avgEndUser / 4 * 100).toFixed(2)),
      avgOfficeScore: Number((avgOffice / 4 * 100).toFixed(2)),
      totalEvaluations: supplier.evaluations.length,
      evaluations: supplier.evaluations,
    };
  } catch (error) {
    console.error("Error fetching supplier scorecard:", error);
    return null;
  }
}
