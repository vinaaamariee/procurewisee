/**
 * Determines the price volatility badge for a product based on historical coefficient of variation and trend direction.
 */
export function determineForecastBadge(
  historicalPrices: number[],
  trend: "increasing" | "decreasing" | "stable" | "unknown"
): "Stable" | "Increasing" | "Decreasing" | "Highly Volatile" {
  if (historicalPrices.length < 3) {
    if (trend === "increasing") return "Increasing";
    if (trend === "decreasing") return "Decreasing";
    return "Stable";
  }

  // 1. Calculate Mean
  const sum = historicalPrices.reduce((acc, v) => acc + v, 0);
  const mean = sum / historicalPrices.length;

  if (mean === 0) return "Stable";

  // 2. Calculate Standard Deviation
  const variance = historicalPrices.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / historicalPrices.length;
  const stdDev = Math.sqrt(variance);

  // 3. Coefficient of Variation (CV)
  const cv = stdDev / mean;

  // Threshold: If CV exceeds 15%, classify as Highly Volatile
  if (cv > 0.15) {
    return "Highly Volatile";
  }

  // 4. Fallback to ARIMA trend
  if (trend === "increasing") return "Increasing";
  if (trend === "decreasing") return "Decreasing";
  return "Stable";
}
