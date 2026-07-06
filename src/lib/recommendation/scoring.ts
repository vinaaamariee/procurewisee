/**
 * Isolated scoring functions for ProcureWise Best-Value Recommendation Engine.
 * Implements Multi-Criteria Decision-Making (MCDM) scoring with robust fallbacks.
 */

// ─── 1. PRICE SCORE ──────────────────────────────────────────────────────────
/**
 * Price Score: Lowest price receives full score.
 * Other suppliers scaled proportionally.
 */
export function calculatePriceScore(price: number, minPrice: number): number {
  if (price <= 0 || minPrice <= 0) return 0;
  return (minPrice / price) * 100;
}

// ─── 2. DELIVERY SCORE ───────────────────────────────────────────────────────
/**
 * Delivery Score: Based on Average delivery days, Late deliveries, Completed deliveries.
 * Falls back to a neutral default of 70/100 if no delivery history exists.
 */
export function calculateDeliveryScore({
  historicalDeliveryDays,
  totalDeliveries,
  lateDeliveries,
  minDeliveryDays,
}: {
  historicalDeliveryDays: number;
  totalDeliveries: number;
  lateDeliveries: number;
  minDeliveryDays?: number;
}): number {
  const hasHistory = historicalDeliveryDays > 0 || totalDeliveries > 0;

  if (!hasHistory) {
    return 70; // Neutral default score
  }

  // 1. Speed component: Lower average delivery days is better.
  let speedScore = 100;
  if (historicalDeliveryDays > 0) {
    if (minDeliveryDays && minDeliveryDays > 0) {
      speedScore = (minDeliveryDays / historicalDeliveryDays) * 100;
    } else {
      // Absolute benchmark fallback if no competitor comparison is available
      speedScore = historicalDeliveryDays <= 3 ? 100 : Math.max(0, 100 - (historicalDeliveryDays - 3) * 5);
    }
  }
  speedScore = Math.min(100, Math.max(0, speedScore));

  // 2. On-Time component: Based on late deliveries vs completed deliveries.
  let onTimeRate = 100;
  if (totalDeliveries > 0) {
    onTimeRate = ((totalDeliveries - lateDeliveries) / totalDeliveries) * 100;
  }
  onTimeRate = Math.min(100, Math.max(0, onTimeRate));

  // Delivery Score is 50% Speed Score + 50% On-Time Rate
  return speedScore * 0.5 + onTimeRate * 0.5;
}

// ─── 3. RELIABILITY SCORE ────────────────────────────────────────────────────
/**
 * Reliability Score: Based on Supplier rating, Successful procurement history, Order completion.
 * Falls back to rescaled profile rating or 75/100 default if no evaluation history exists.
 */
export function calculateReliabilityScore({
  reliabilityRating,
  hasEvaluations,
  avgEvaluationRating,
  qualityComplianceRate,
  totalPOs,
  completedPOs,
}: {
  reliabilityRating?: number; // 0.00 to 5.00
  hasEvaluations: boolean;
  avgEvaluationRating?: number; // 1 to 4
  qualityComplianceRate?: number; // 0 to 100
  totalPOs: number;
  completedPOs: number;
}): number {
  // 1. Completion Rate: proportion of non-draft POs that were delivered/closed
  const completionRate = totalPOs > 0 ? (completedPOs / totalPOs) * 100 : 100;

  if (hasEvaluations) {
    // 40% rating, 30% PO completion, 30% Evaluation Score
    const ratingScore = reliabilityRating ? (reliabilityRating / 5.0) * 100 : 100;
    const evalScore = avgEvaluationRating
      ? (avgEvaluationRating / 4.0) * 100
      : (qualityComplianceRate !== undefined ? qualityComplianceRate : 100);

    return ratingScore * 0.4 + completionRate * 0.3 + evalScore * 0.3;
  } else {
    // Fallback: use supplier profile information if available
    if (reliabilityRating !== undefined && reliabilityRating > 0) {
      const ratingScore = (reliabilityRating / 5.0) * 100;
      if (totalPOs > 0) {
        return ratingScore * 0.6 + completionRate * 0.4;
      }
      return ratingScore;
    }
    // Neutral reliability score fallback
    return 75;
  }
}

// ─── 4. COMPLIANCE SCORE ─────────────────────────────────────────────────────
/**
 * Compliance Score: Based on Accreditation, Required procurement documents, Supplier status.
 * Extensible checks can be added here without modifying the engine.
 */
export interface ComplianceData {
  isVerified: boolean;
  tin?: string | null;
  businessAddress?: string | null;
  contactNumber?: string | null;
  avgDocumentCompliance?: number | null; // 1 to 4 scale
}

export function calculateComplianceScore(data: ComplianceData): number {
  // 1. Accreditation Score (40% Weight): Verified gets 100%, Unverified gets 60%
  const accreditationScore = data.isVerified ? 100 : 60;

  // 2. Required Documents Score (40% Weight):
  // Based on documentCompliance evaluations (1-4). Extensible fallback based on TIN presence.
  let documentsScore = 70;
  if (data.avgDocumentCompliance !== undefined && data.avgDocumentCompliance !== null) {
    documentsScore = (data.avgDocumentCompliance / 4.0) * 100;
  } else {
    documentsScore = data.tin ? 90 : 60;
  }

  // 3. Supplier Status & Registration Completeness (20% Weight):
  // Checks if essential business data exists. Extensible by design.
  let completenessPoints = 0;
  if (data.isVerified) completenessPoints += 40;
  if (data.tin) completenessPoints += 30;
  if (data.businessAddress) completenessPoints += 15;
  if (data.contactNumber) completenessPoints += 15;
  const statusScore = completenessPoints;

  return accreditationScore * 0.4 + documentsScore * 0.4 + statusScore * 0.2;
}

// ─── 5. HISTORICAL PERFORMANCE ────────────────────────────────────────────────
/**
 * Historical Performance Score: Based on Price stability, Historical price variance, Forecast trend.
 */
export function calculateHistoricalPerformanceScore({
  historicalPrices, // historical unit prices
  currentPrice,
  forecastPrice,
}: {
  historicalPrices: number[];
  currentPrice: number;
  forecastPrice: number | null;
}): number {
  if (historicalPrices.length === 0) {
    // Fallback: If no historical price records, stability is default 100, variance 100, trend 75
    const trendScore = forecastPrice !== null
      ? (currentPrice <= forecastPrice ? 100 : Math.max(0, 100 - ((currentPrice - forecastPrice) / forecastPrice) * 150))
      : 75;
    return 100 * 0.4 + 100 * 0.3 + trendScore * 0.3;
  }

  // 1. Price Stability (40% Weight): Coefficient of variation (CV = stdDev / mean)
  const count = historicalPrices.length;
  const sum = historicalPrices.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  let stabilityScore = 100;
  if (count > 1 && mean > 0) {
    const variance = historicalPrices.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;
    stabilityScore = Math.max(0, 100 - cv * 300); // 0 variance = 100 score, penalise fluctuations
  }

  // 2. Historical Price Variance (30% Weight): Compares current price to historical lowest and average.
  const minHistPrice = Math.min(...historicalPrices);
  const maxHistPrice = Math.max(...historicalPrices);
  let varianceScore = 50;

  if (currentPrice <= minHistPrice) {
    varianceScore = 100;
  } else if (currentPrice <= mean) {
    // Current price is between min and average, scale between 70 and 100
    const range = mean - minHistPrice;
    if (range > 0) {
      varianceScore = 70 + 30 * ((mean - currentPrice) / range);
    } else {
      varianceScore = 100;
    }
  } else {
    // Current price exceeds historical average, penalize proportionally
    varianceScore = Math.max(0, 70 - ((currentPrice - mean) / mean) * 100);
  }

  // 3. Forecast Trend Support (30% Weight)
  let trendScore = 75; // neutral fallback
  if (forecastPrice !== null && forecastPrice > 0) {
    if (currentPrice <= forecastPrice) {
      trendScore = 100;
    } else {
      const pctDiff = (currentPrice - forecastPrice) / forecastPrice;
      trendScore = Math.max(0, 100 - pctDiff * 200);
    }
  }

  return stabilityScore * 0.4 + varianceScore * 0.3 + trendScore * 0.3;
}
