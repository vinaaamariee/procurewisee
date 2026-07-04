/**
 * Autocorrelation (ACF) and Partial Autocorrelation (PACF) calculations.
 *
 * Dependency-free implementation used to estimate the p and q
 * order parameters for ARIMA(p, d, q).
 */

import { calculateMean } from "./stationarity";

// ─── ACF ──────────────────────────────────────────────────────────────────────

/**
 * Calculates the Autocorrelation Function (ACF) for lags 1..maxLag.
 *
 * ACF(k) = Σ[(yₜ - ȳ)(yₜ₋ₖ - ȳ)] / Σ[(yₜ - ȳ)²]
 *
 * The returned array has length `maxLag`. Index 0 corresponds to lag 1.
 */
export function calculateACF(values: number[], maxLag: number): number[] {
  const n = values.length;
  const mean = calculateMean(values);

  const denom = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  if (denom === 0) return new Array(maxLag).fill(0);

  const acf: number[] = [];
  for (let lag = 1; lag <= maxLag; lag++) {
    let numer = 0;
    for (let t = lag; t < n; t++) {
      numer += (values[t] - mean) * (values[t - lag] - mean);
    }
    acf.push(numer / denom);
  }
  return acf;
}

// ─── PACF ─────────────────────────────────────────────────────────────────────

/**
 * Calculates the Partial Autocorrelation Function (PACF) for lags 1..maxLag
 * using the Durbin-Levinson recursion.
 *
 * PACF removes the effect of intermediate lags, making it the correct
 * tool for determining the AR order p.
 *
 * The returned array has length `maxLag`. Index 0 corresponds to lag 1.
 */
export function calculatePACF(values: number[], maxLag: number): number[] {
  // First compute ACF up to maxLag (includes lag 0 = 1.0 implicitly)
  const fullACF = [1, ...calculateACF(values, maxLag)]; // index 0 = lag 0 = 1

  const pacf: number[] = [];
  // phi[k][j] = PACF coefficients at AR order k
  const phi: number[][] = [];

  for (let k = 1; k <= maxLag; k++) {
    phi[k] = new Array(k + 1).fill(0);

    if (k === 1) {
      phi[1][1] = fullACF[1];
      pacf.push(phi[1][1]);
      continue;
    }

    // Durbin-Levinson: compute phi[k][k]
    let numerator = fullACF[k];
    let denominator = 1;

    for (let j = 1; j < k; j++) {
      numerator -= phi[k - 1][j] * fullACF[k - j];
      denominator -= phi[k - 1][j] * fullACF[j];
    }

    if (Math.abs(denominator) < 1e-10) {
      pacf.push(0);
      for (let j = 1; j <= k; j++) phi[k][j] = 0;
      continue;
    }

    phi[k][k] = numerator / denominator;

    // Update lower-order coefficients
    for (let j = 1; j < k; j++) {
      phi[k][j] = phi[k - 1][j] - phi[k][k] * phi[k - 1][k - j];
    }

    pacf.push(phi[k][k]);
  }

  return pacf;
}

// ─── Order Estimation ─────────────────────────────────────────────────────────

/**
 * Estimates the AR order p from the PACF.
 *
 * Uses the standard significance threshold of 2 / √N.
 * Counts the last lag where |PACF(k)| exceeds the threshold.
 * Caps the result at `maxP` (default 4).
 */
export function estimateP(pacf: number[], seriesLength: number, maxP = 4): number {
  const threshold = 2 / Math.sqrt(seriesLength);
  let lastSignificant = 0;
  for (let i = 0; i < pacf.length; i++) {
    if (Math.abs(pacf[i]) > threshold) {
      lastSignificant = i + 1; // lag number (1-indexed)
    }
  }
  return Math.min(lastSignificant, maxP);
}

/**
 * Estimates the MA order q from the ACF.
 *
 * Uses the standard significance threshold of 2 / √N.
 * Counts the last lag where |ACF(k)| exceeds the threshold.
 * Caps the result at `maxQ` (default 3).
 */
export function estimateQ(acf: number[], seriesLength: number, maxQ = 3): number {
  const threshold = 2 / Math.sqrt(seriesLength);
  let lastSignificant = 0;
  for (let i = 0; i < acf.length; i++) {
    if (Math.abs(acf[i]) > threshold) {
      lastSignificant = i + 1;
    }
  }
  return Math.min(lastSignificant, maxQ);
}
