import { recommendBestSupplierInternal } from "./recommendation/engine";
import type { RecommendationEngineResult } from "./recommendation/types";

export async function recommendBestSupplier(productId: number): Promise<RecommendationEngineResult> {
  return recommendBestSupplierInternal(productId);
}

// ─── Legacy Canvas-RFQ Scoring ──────────────────────────────────────────────
interface QuoteInput {
  quoteId: number;
  supplierId: number;
  supplierName: string;
  totalPrice: number;
  deliveryDays: number;
  reliabilityRating: number; // 0.00 - 5.00
}

interface RankedRecommendation {
  quoteId: number;
  supplierId: number;
  supplierName: string;
  priceScore: number;
  deliveryScore: number;
  reliabilityScore: number;
  compositeScore: number;
  rank: number;
  justification: string;
}

/**
 * Calculates the Best Value recommendation using Multi-Criteria Decision Making (MCDM)
 * via the Weighted Sum Model (WSM).
 * 
 * Criteria:
 * 1. Price (50% weight) - Minimize price: (MinPrice / QuotePrice) * 100
 * 2. Delivery Speed (30% weight) - Minimize delivery days: (MinDelivery / QuoteDelivery) * 100
 * 3. Supplier Rating (20% weight) - Maximize reliability: (ReliabilityRating / 5.0) * 100
 */
export function calculateBestValue(quotes: QuoteInput[]): RankedRecommendation[] {
  if (quotes.length === 0) return [];

  // Identify minimum benchmarks (safeguarding against zero values)
  const minPrice = Math.min(...quotes.map(q => q.totalPrice));
  const minDelivery = Math.min(...quotes.map(q => Math.max(q.deliveryDays, 1)));

  // Calculate normalized scores and composite weights
  const scoredQuotes = quotes.map(quote => {
    const priceScore = minPrice > 0 
      ? (minPrice / quote.totalPrice) * 100 
      : 0;

    const deliveryScore = minDelivery > 0 
      ? (minDelivery / Math.max(quote.deliveryDays, 1)) * 100 
      : 0;

    const reliabilityScore = (quote.reliabilityRating / 5.0) * 100;

    // Weighted Sum Formula
    const compositeScore = (0.50 * priceScore) + (0.30 * deliveryScore) + (0.20 * reliabilityScore);

    return {
      quoteId: quote.quoteId,
      supplierId: quote.supplierId,
      supplierName: quote.supplierName,
      priceScore: Math.round(priceScore * 100) / 100,
      deliveryScore: Math.round(deliveryScore * 100) / 100,
      reliabilityScore: Math.round(reliabilityScore * 100) / 100,
      compositeScore: Math.round(compositeScore * 100) / 100,
      totalPrice: quote.totalPrice,
      deliveryDays: quote.deliveryDays,
      reliabilityRating: quote.reliabilityRating,
    };
  });

  // Sort by composite score descending
  const sorted = [...scoredQuotes].sort((a, b) => b.compositeScore - a.compositeScore);

  // Map ranks and compile human-readable justification logs
  return sorted.map((scored, index) => {
    const rank = index + 1;
    let justification = "";

    if (rank === 1) {
      const cheapest = scored.totalPrice === minPrice;
      const fastest = scored.deliveryDays === minDelivery;
      
      if (cheapest && fastest) {
        justification = `Recommended as Best Value because they offered the lowest price (₱${scored.totalPrice.toLocaleString()}) and the fastest delivery times (${scored.deliveryDays} days) with an outstanding reliability rating of ${scored.reliabilityRating}/5.0.`;
      } else if (cheapest) {
        justification = `Recommended as Best Value. Provides maximum cost savings (₱${scored.totalPrice.toLocaleString()} total) with a strong reliability rating of ${scored.reliabilityRating}/5.0, offsetting delivery speed delays.`;
      } else {
        const costDiff = scored.totalPrice - minPrice;
        justification = `Recommended as Best Value despite being ₱${costDiff.toLocaleString()} more expensive than the lowest bid. Their rapid delivery (${scored.deliveryDays} days vs. slower bids) and superior reliability rating (${scored.reliabilityRating}/5.0) represent the highest quality-cost trade-off.`;
      }
    } else {
      const gap = (sorted[0].compositeScore - scored.compositeScore).toFixed(2);
      justification = `Ranked #${rank}. Falls behind the best option by ${gap} points primarily due to ${
        scored.totalPrice > minPrice * 1.25 
          ? "higher pricing" 
          : scored.deliveryDays > minDelivery * 2 
            ? "slower delivery speed" 
            : "lower historical reliability"
      }.`;
    }

    return {
      quoteId: scored.quoteId,
      supplierId: scored.supplierId,
      supplierName: scored.supplierName,
      priceScore: scored.priceScore,
      deliveryScore: scored.deliveryScore,
      reliabilityScore: scored.reliabilityScore,
      compositeScore: scored.compositeScore,
      rank,
      justification
    };
  });
}
