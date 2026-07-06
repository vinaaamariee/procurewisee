'use server';

import { prisma } from "@/lib/prisma";
import { RfqStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { logAuditTrail } from "@/lib/audit";
import { requireRole } from "@/lib/auth/get-user-profile";
import { scoreRfqQuotesInternal } from "@/lib/recommendation/engine";
import { WEIGHTS, CriterionWeights } from "@/lib/recommendation/weights";

/**
 * Runs the MCDM (Multi-Criteria Decision Making) scoring algorithm on all submitted quotes
 * for a closed RFQ, generates recommendations, and transitions the RFQ status to Evaluated.
 * Optionally accepts custom weights to support sensitivity analysis.
 */
export async function generateRecommendations(rfqId: number, weights?: CriterionWeights) {
  try {
    // 1. Fetch RFQ and verify it exists
    const rfq = await prisma.requestForQuote.findUnique({
      where: { id: rfqId },
    });

    if (!rfq) {
      throw new Error(`RFQ with ID ${rfqId} not found.`);
    }

    // 2. Score quotes using our advanced MCDM engine
    const canvassResult = await scoreRfqQuotesInternal(rfqId, weights);
    if (!canvassResult || canvassResult.rankedRecommendations.length === 0) {
      throw new Error("No quotes have been submitted for this RFQ. Cannot evaluate.");
    }

    // 3. Find or create Canvas Abstract record
    let canvas = await prisma.canvasAbstract.findFirst({
      where: { rfqId },
    });

    if (!canvas) {
      canvas = await prisma.canvasAbstract.create({
        data: {
          rfqId,
          openingDate: new Date(),
          locationOpened: "Basco, Batanes",
        },
      });
    }

    // 4. Create recommendations inside a database transaction
    const recommendations = await prisma.$transaction(async (tx) => {
      // Clear any existing recommendations for this canvas to avoid unique constraints
      await tx.recommendation.deleteMany({
        where: { canvasId: canvas.id },
      });

      // Insert new recommendations
      const createdList = [];
      const rankedData = canvassResult.rankedRecommendations;
      
      for (let i = 0; i < rankedData.length; i++) {
        const item = rankedData[i];
        const rankPosition = i + 1;

        // Store the full snapshot inside the justificationLog JSON audit trail
        const justificationLog = JSON.stringify({
          reason: item.reason,
          complianceScore: item.individualScores.complianceScore,
          historicalPerformanceScore: item.individualScores.historicalPerformanceScore,
          confidence: item.confidence,
          confidenceLabel: item.confidenceLabel,
          expectedChange: item.expectedChange,
          forecastTrend: item.forecastTrend,
          historicalAvgPrice: item.historicalAvgPrice,
          historicalMinPrice: item.historicalMinPrice,
          historicalLatestPrice: item.historicalLatestPrice,
          forecastPrice: item.forecastPrice,
          weights: weights || WEIGHTS
        });

        const recomm = await tx.recommendation.create({
          data: {
            canvasId: canvas.id,
            supplierId: item.supplierId,
            supplierQuoteId: item.quoteId,
            compositeMcdmScore: item.overallScore,
            priceScore: item.individualScores.priceScore,
            deliveryScore: item.individualScores.deliveryScore,
            reliabilityScore: item.individualScores.reliabilityScore,
            rankPosition,
            justificationLog,
            approvalStatus: "Pending Review",
          },
          include: {
            supplier: true,
            supplierQuote: true,
          },
        });
        createdList.push(recomm);
      }

      // Update RFQ status to Evaluated
      await tx.requestForQuote.update({
        where: { id: rfqId },
        data: { status: RfqStatus.Evaluated },
      });

      return createdList;
    });

    revalidatePath("/", "layout");
    return { success: true, recommendations };
  } catch (error: any) {
    console.error("Error generating recommendations:", error);
    return { success: false, error: error.message || "Failed to generate recommendations." };
  }
}

/**
 * Fetches the ranked recommendations for a given RFQ.
 */
export async function getRecommendations(rfqId: number) {
  const canvas = await prisma.canvasAbstract.findFirst({
    where: { rfqId },
  });

  if (!canvas) return [];

  return await prisma.recommendation.findMany({
    where: { canvasId: canvas.id },
    include: {
      supplier: true,
      supplierQuote: true,
    },
    orderBy: {
      rankPosition: "asc",
    },
  });
}

/**
 * Approves a recommendation. Sets its status to Approved, assigns the reviewer's ID,
 * and logs the action in the audit trail.
 */
export async function approveRecommendation(recommId: number) {
  try {
    // 1. Enforce Administrative Approver role and retrieve profile
    const { profile } = await requireRole('Administrative Approver');

    // 2. Fetch the recommendation and ensure it exists
    const recommendation = await prisma.recommendation.findUnique({
      where: { id: recommId },
      include: {
        canvas: true,
      },
    });

    if (!recommendation) {
      throw new Error(`Recommendation with ID ${recommId} not found.`);
    }

    if (recommendation.approvalStatus === 'Approved') {
      return { success: true, message: 'Recommendation is already approved.' };
    }

    // 3. Database Transaction: Update recommendation approval status
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.recommendation.update({
        where: { id: recommId },
        data: {
          approvalStatus: 'Approved',
          reviewedById: profile.id,
        },
      });

      return result;
    });

    // 4. Log the audit trail
    logAuditTrail({
      actionType: 'APPROVE_RECOMMENDATION',
      tableAffected: 'recommendations',
      recordId: recommId,
      oldState: recommendation,
      newState: updated,
    });

    revalidatePath("/", "layout");
    revalidatePath("/dashboard/approver");
    return { success: true, recommendation: updated };
  } catch (error: any) {
    console.error("Error approving recommendation:", error);
    return { success: false, error: error.message || "Failed to approve recommendation." };
  }
}
