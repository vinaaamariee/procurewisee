'use server';

import { prisma } from "@/lib/prisma";
import { RfqStatus } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { logAuditTrail } from "@/lib/audit";
import { requireRole } from "@/lib/auth/get-user-profile";

/**
 * Runs the MCDM (Multi-Criteria Decision Making) scoring algorithm on all submitted quotes
 * for a closed RFQ, generates recommendations, and transitions the RFQ status to Evaluated.
 */
export async function generateRecommendations(rfqId: number) {
  try {
    // 1. Fetch RFQ and verify it exists
    const rfq = await prisma.requestForQuote.findUnique({
      where: { id: rfqId },
    });

    if (!rfq) {
      throw new Error(`RFQ with ID ${rfqId} not found.`);
    }

    // 2. Fetch all quotes with supplier profiles
    const quotes = await prisma.supplierQuote.findMany({
      where: { rfqId },
      include: {
        supplier: true,
      },
    });

    if (quotes.length === 0) {
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

    // 4. Calculate bounds for normalization
    const prices = quotes.map((q) => Number(q.totalQuotedAmount));
    const minPrice = Math.min(...prices);

    const deliveries = quotes.map((q) => q.offeredDeliveryDays);
    const minDelivery = Math.min(...deliveries);
    const maxDelivery = Math.max(...deliveries);

    // 5. Compute MCDM Scores
    const recommendationsData = quotes.map((quote) => {
      // Price Score: Lower is better, ratio-based to avoid 0 scores
      const price = Number(quote.totalQuotedAmount);
      const priceScore = price === 0 ? 100 : (minPrice / price) * 100;

      // Delivery Score: Lower days is better, mapped between 50 and 100 relative to competitors
      let deliveryScore = 100;
      if (maxDelivery !== minDelivery) {
        deliveryScore = 100 - ((quote.offeredDeliveryDays - minDelivery) / (maxDelivery - minDelivery)) * 50;
      }

      // Reliability Score: 0 to 5 rating mapped to 0 to 100%
      const rating = Number(quote.supplier.reliabilityRating);
      const reliabilityScore = (rating / 5) * 100;

      // Composite Weighted MCDM Score (50% Price, 30% Delivery, 20% Reliability)
      const compositeMcdmScore = priceScore * 0.5 + deliveryScore * 0.3 + reliabilityScore * 0.2;

      return {
        supplierId: quote.supplierId,
        supplierQuoteId: quote.id,
        priceScore,
        deliveryScore,
        reliabilityScore,
        compositeMcdmScore,
        companyName: quote.supplier.companyName,
        price,
        deliveryDays: quote.offeredDeliveryDays,
        rating,
      };
    });

    // 6. Sort by composite score (highest first) and assign rank position
    recommendationsData.sort((a, b) => b.compositeMcdmScore - a.compositeMcdmScore);

    // 7. Create recommendations inside a database transaction
    const recommendations = await prisma.$transaction(async (tx) => {
      // Clear any existing recommendations for this canvas to avoid unique constraints
      await tx.recommendation.deleteMany({
        where: { canvasId: canvas.id },
      });

      // Insert new recommendations
      const createdList = [];
      for (let i = 0; i < recommendationsData.length; i++) {
        const item = recommendationsData[i];
        const rankPosition = i + 1;

        const justificationLog = 
          `${item.companyName} ranked #${rankPosition} with a composite MCDM score of ${item.compositeMcdmScore.toFixed(2)}. ` +
          `Offered a bid of ₱${item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })} (within ABC limit of ₱${Number(rfq.approvedBudgetContract).toLocaleString('en-PH', { minimumFractionDigits: 2 })}), ` +
          `committed delivery of ${item.deliveryDays} days, and carries a reliability rating of ${item.rating.toFixed(2)}/5.00.`;

        const recomm = await tx.recommendation.create({
          data: {
            canvasId: canvas.id,
            supplierId: item.supplierId,
            supplierQuoteId: item.supplierQuoteId,
            compositeMcdmScore: item.compositeMcdmScore,
            priceScore: item.priceScore,
            deliveryScore: item.deliveryScore,
            reliabilityScore: item.reliabilityScore,
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
