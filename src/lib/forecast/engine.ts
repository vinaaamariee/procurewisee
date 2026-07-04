/**
 * ProcureWise Forecasting Engine
 *
 * Orchestrates the full ARIMA pipeline for a given catalog product:
 *
 *   Historical Data
 *       ↓
 *   Stationarity Check
 *       ↓
 *   Differencing (if required)
 *       ↓
 *   ACF / PACF → estimate p, q
 *       ↓
 *   Fit ARIMA(p, d, q)
 *       ↓
 *   Forecast next `horizon` months
 *       ↓
 *   Invert differencing → original price scale
 *       ↓
 *   Return ForecastResult
 */

import { getHistoricalSeries } from "./time-series";
import { isApproximatelyStationary } from "./stationarity";
import { differenceSeries, invertDifference } from "./differencing";
import { calculateACF, calculatePACF, estimateP, estimateQ } from "./autocorrelation";
import { fitARIMA, forecastARIMA } from "./arima";
import type { ForecastResult, ForecastPoint, TrendDirection } from "./forecast-types";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Minimum monthly data points required to produce a forecast. */
export const MIN_SERIES_LENGTH = 6;

/** Default forecast horizon (months ahead). */
export const DEFAULT_HORIZON = 3;

/** Maximum ACF / PACF lag to inspect. */
const MAX_LAG = 8;

/** Maximum AR order allowed. */
const MAX_P = 4;

/** Maximum MA order allowed. */
const MAX_Q = 3;

// ─── Trend Detection ─────────────────────────────────────────────────────────

/**
 * Classifies the forecast trend direction by comparing the first and last
 * point of the forecasted series.
 *
 * A change of more than 0.5 % between first and last forecast is classified
 * as increasing or decreasing; otherwise stable.
 */
function detectTrend(forecastValues: number[]): TrendDirection {
  if (forecastValues.length < 2) return "stable";
  const first = forecastValues[0];
  const last = forecastValues[forecastValues.length - 1];
  if (first === 0) return "stable";
  const pct = (last - first) / Math.abs(first);
  if (pct > 0.005) return "increasing";
  if (pct < -0.005) return "decreasing";
  return "stable";
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

/** Advances a Date by `months` calendar months. */
function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// ─── Main Engine Function ─────────────────────────────────────────────────────

/**
 * Runs the full ARIMA forecasting pipeline for a catalog product.
 *
 * Returns `null` if the product has insufficient historical data
 * (fewer than `MIN_SERIES_LENGTH` monthly data points).
 *
 * @param productId  CatalogProduct.id
 * @param horizon    Number of months ahead to forecast (default 3)
 */
export async function forecastProductPrice(
  productId: number,
  horizon: number = DEFAULT_HORIZON
): Promise<ForecastResult | null> {
  // ── Step 1: Fetch historical series ─────────────────────────────────────────
  const series = await getHistoricalSeries(productId);

  if (series.length < MIN_SERIES_LENGTH) {
    return null; // not enough data
  }

  const values = series.map((p) => p.value);
  const lastDate = series[series.length - 1].date;

  // ── Step 2: Stationarity check → determine d ─────────────────────────────────
  let d = 0;
  let workingValues = values;
  let originForInverse = values[values.length - 1]; // last real value for inversion

  const station1 = isApproximatelyStationary(series);

  if (!station1.stationary) {
    const diff1 = differenceSeries(values);
    workingValues = diff1.values;
    d = 1;

    // Second-order differencing only if series is still non-stationary
    // and we have enough points left
    if (workingValues.length >= MIN_SERIES_LENGTH) {
      const diffPoints = workingValues.map((v, i) => ({ date: new Date(i), value: v }));
      const station2 = isApproximatelyStationary(diffPoints);
      if (!station2.stationary) {
        const diff2 = differenceSeries(workingValues);
        if (diff2.values.length >= MIN_SERIES_LENGTH) {
          workingValues = diff2.values;
          d = 2;
          // For d=2, origin for inversion needs the last two values
          originForInverse = values[values.length - 1];
        }
      }
    }
  }

  // ── Step 3: ACF / PACF → estimate p and q ────────────────────────────────────
  const lags = Math.min(MAX_LAG, Math.floor(workingValues.length / 2));
  const acfValues = calculateACF(workingValues, lags);
  const pacfValues = calculatePACF(workingValues, lags);

  let p = estimateP(pacfValues, workingValues.length, MAX_P);
  let q = estimateQ(acfValues, workingValues.length, MAX_Q);

  // Safety: ensure we have enough observations for the model
  if (p + q >= workingValues.length) {
    p = Math.min(p, 1);
    q = 0;
  }
  if (p === 0 && q === 0) {
    p = 1; // always use at least AR(1) as a baseline
  }

  // ── Step 4: Fit ARIMA ─────────────────────────────────────────────────────────
  const fit = fitARIMA(workingValues, p, d, q);

  // ── Step 5: Forecast in differenced domain ────────────────────────────────────
  const rawForecast = forecastARIMA(fit, workingValues, horizon);

  // ── Step 6: Invert differencing → original price scale ───────────────────────
  let finalValues: number[];
  let finalLower: number[];
  let finalUpper: number[];

  if (d === 0) {
    finalValues = rawForecast.values;
    finalLower = rawForecast.lower;
    finalUpper = rawForecast.upper;
  } else if (d === 1) {
    finalValues = invertDifference(rawForecast.values, originForInverse);
    finalLower = invertDifference(rawForecast.lower, originForInverse);
    finalUpper = invertDifference(rawForecast.upper, originForInverse);
  } else {
    // d === 2: double inversion
    // First invert inner differentiation using last diff1 value
    const lastDiff1 = values[values.length - 1] - values[values.length - 2];
    const innerValues = invertDifference(rawForecast.values, lastDiff1);
    const innerLower = invertDifference(rawForecast.lower, lastDiff1);
    const innerUpper = invertDifference(rawForecast.upper, lastDiff1);
    // Then invert outer differentiation using last original value
    finalValues = invertDifference(innerValues, originForInverse);
    finalLower = invertDifference(innerLower, originForInverse);
    finalUpper = invertDifference(innerUpper, originForInverse);
  }

  // ── Step 7: Clamp prices (no negative prices) ─────────────────────────────────
  const clamp = (v: number) => Math.max(0, v);
  finalValues = finalValues.map(clamp);
  finalLower = finalLower.map(clamp);
  finalUpper = finalUpper.map(clamp);

  // ── Step 8: Build ForecastPoints ─────────────────────────────────────────────
  const points: ForecastPoint[] = finalValues.map((value, i) => ({
    date: addMonths(lastDate, i + 1),
    value,
    lower: finalLower[i],
    upper: finalUpper[i],
  }));

  // ── Step 9: Trend and metadata ────────────────────────────────────────────────
  const trend = detectTrend(finalValues);

  return {
    productId,
    forecastedAt: new Date(),
    horizon,
    points,
    trend,
    modelUsed: `ARIMA(${p},${d},${q})`,
    metadata: {
      seriesLength: series.length,
      wasStationary: d === 0,
      differenced: d > 0,
      aic: fit.aic,
      sigma2: fit.params.sigma2,
      arCoeffs: fit.params.arCoeffs,
      maCoeffs: fit.params.maCoeffs,
    },
  };
}
