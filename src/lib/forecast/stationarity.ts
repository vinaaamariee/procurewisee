import type { HistoricalPoint, StationarityResult } from "./forecast-types";

// ─── Mean ─────────────────────────────────────────────────────────────────────

/**
 * Calculates the arithmetic mean of a numeric array.
 * Returns 0 if the array is empty.
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

// ─── Variance ─────────────────────────────────────────────────────────────────

/**
 * Calculates the population variance of a numeric array.
 * Returns 0 if the array has fewer than 2 elements.
 */
export function calculateVariance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = calculateMean(values);
  return values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
}

// ─── Rolling Mean ─────────────────────────────────────────────────────────────

/**
 * Calculates a rolling (moving) mean with the given window size.
 *
 * For each position i ≥ (window - 1), the rolling mean is the average
 * of the window of values ending at index i.
 *
 * Values before a full window is available are omitted from the result.
 *
 * @param values  Input numeric array
 * @param window  Window size (must be ≥ 1)
 * @returns       Array of rolling means (length = values.length - window + 1)
 */
export function calculateRollingMean(values: number[], window: number): number[] {
  if (window < 1 || values.length < window) return [];
  const results: number[] = [];
  for (let i = window - 1; i < values.length; i++) {
    const slice = values.slice(i - window + 1, i + 1);
    results.push(calculateMean(slice));
  }
  return results;
}

// ─── Rolling Variance ─────────────────────────────────────────────────────────

/**
 * Calculates a rolling variance with the given window size.
 *
 * @param values  Input numeric array
 * @param window  Window size (must be ≥ 2)
 * @returns       Array of rolling variances
 */
export function calculateRollingVariance(values: number[], window: number): number[] {
  if (window < 2 || values.length < window) return [];
  const results: number[] = [];
  for (let i = window - 1; i < values.length; i++) {
    const slice = values.slice(i - window + 1, i + 1);
    results.push(calculateVariance(slice));
  }
  return results;
}

// ─── Stationarity Check ───────────────────────────────────────────────────────

/**
 * Approximately tests whether a time series is stationary using:
 *   1. Rolling mean stability: checks that rolling means do not drift too far
 *      from the global mean (threshold: ±30% of global mean).
 *   2. Variance stability: checks that rolling variances do not vary too
 *      wildly (coefficient of variation of rolling variances < 1.0).
 *
 * This is NOT an ADF test. It is a heuristic pre-check before differencing.
 *
 * @param points  Array of HistoricalPoints (date + value)
 * @param window  Rolling window size (default 3)
 */
export function isApproximatelyStationary(
  points: HistoricalPoint[],
  window = 3
): StationarityResult {
  const values = points.map((p) => p.value);

  if (values.length < window * 2) {
    return {
      stationary: false,
      reason: `Insufficient data (${values.length} points). Need at least ${window * 2} for a ${window}-point rolling window.`,
    };
  }

  const globalMean = calculateMean(values);
  const rollingMeans = calculateRollingMean(values, window);
  const rollingVariances = calculateRollingVariance(values, window);

  // 1. Rolling mean stability
  const meanDriftThreshold = 0.30; // 30% of global mean
  const maxDrift = Math.max(...rollingMeans.map((m) => Math.abs(m - globalMean)));
  const meanDriftPct = globalMean !== 0 ? maxDrift / Math.abs(globalMean) : 0;
  const meanIsStable = meanDriftPct <= meanDriftThreshold;

  // 2. Variance stability (coefficient of variation of rolling variances)
  const varMean = calculateMean(rollingVariances);
  const varStdDev = Math.sqrt(calculateVariance(rollingVariances));
  const varCV = varMean !== 0 ? varStdDev / varMean : 0;
  const varianceIsStable = varCV < 1.0;

  const stationary = meanIsStable && varianceIsStable;

  let reason: string;
  if (stationary) {
    reason = `Series appears stationary. Rolling mean drift: ${(meanDriftPct * 100).toFixed(1)}% (≤30%), variance CV: ${varCV.toFixed(2)} (<1.0).`;
  } else if (!meanIsStable && !varianceIsStable) {
    reason = `Non-stationary: rolling mean drifts ${(meanDriftPct * 100).toFixed(1)}% from global mean (threshold 30%), and variance CV is ${varCV.toFixed(2)} (threshold 1.0). Differencing recommended.`;
  } else if (!meanIsStable) {
    reason = `Non-stationary: rolling mean drifts ${(meanDriftPct * 100).toFixed(1)}% from global mean (threshold 30%). Consider first-order differencing.`;
  } else {
    reason = `Non-stationary: variance CV is ${varCV.toFixed(2)} (threshold 1.0). Heteroscedasticity detected.`;
  }

  return {
    stationary,
    reason,
    rollingMeans,
    rollingVariances,
  };
}
