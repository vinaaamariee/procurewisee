/**
 * Lightweight, dependency-free ARIMA(p, d, q) implementation.
 *
 * Fitting strategy:
 *   AR(p): parameters estimated via Yule-Walker equations (solved with Gaussian elimination).
 *   MA(q): parameters estimated by regressing residuals on lagged residuals (iterative OLS).
 *   I(d):  handled externally by differencing.ts before this module is called.
 *
 * This is a practical approximation suitable for procurement price forecasting.
 * It is not a full maximum-likelihood ARIMA — it is designed to be fast,
 * transparent, and dependency-free.
 */

import { calculateACF } from "./autocorrelation";
import { calculateMean } from "./stationarity";

// ─── Internal Types ────────────────────────────────────────────────────────────

export interface ARIMAParams {
  p: number;
  d: number;
  q: number;
  arCoeffs: number[];    // φ₁ … φₚ
  maCoeffs: number[];    // θ₁ … θq
  intercept: number;     // constant term c
  sigma2: number;        // residual variance σ²
}

export interface ARIMAFitResult {
  params: ARIMAParams;
  residuals: number[];
  fitted: number[];      // in-sample fitted values (differenced domain)
  aic: number;           // Akaike Information Criterion (lower = better)
  summary: string;
}

export interface ARIMAForecast {
  values: number[];                 // point forecasts (differenced domain)
  lower: number[];                  // 95 % lower confidence bounds
  upper: number[];                  // 95 % upper confidence bounds
}

// ─── Linear Algebra Utilities ─────────────────────────────────────────────────

/**
 * Solves a square linear system A·x = b using partial-pivot Gauss-Jordan elimination.
 * Returns x, or null if the system is singular.
 */
function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  // Build augmented matrix [A | b]
  const M: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    // Find the pivot row
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row;
    }
    [M[col], M[maxRow]] = [M[maxRow], M[col]];

    if (Math.abs(M[col][col]) < 1e-12) return null; // singular

    // Eliminate all other rows
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = M[row][col] / M[col][col];
      for (let j = col; j <= n; j++) {
        M[row][j] -= factor * M[col][j];
      }
    }
  }

  return M.map((row, i) => row[n] / row[i]);
}

// ─── Yule-Walker AR Estimation ────────────────────────────────────────────────

/**
 * Estimates AR(p) coefficients using the Yule-Walker equations.
 *
 * Yule-Walker: R·φ = r
 *   R[i][j] = γ(|i-j|)  (autocorrelation matrix)
 *   r[i]    = γ(i+1)    (lag vector)
 *
 * Returns [φ₁ … φₚ] or zeros if the system is ill-conditioned.
 */
function fitAR(values: number[], p: number): number[] {
  if (p === 0) return [];
  const n = values.length;
  if (n <= p) return new Array(p).fill(0);

  // Compute autocorrelations γ(0) .. γ(p)
  const acf = [1, ...calculateACF(values, p)]; // length p+1; index k = lag k

  // Build symmetric Toeplitz matrix R (p×p)
  const R: number[][] = [];
  for (let i = 0; i < p; i++) {
    R.push([]);
    for (let j = 0; j < p; j++) {
      R[i].push(acf[Math.abs(i - j)]);
    }
  }

  const r = acf.slice(1, p + 1); // [γ(1) … γ(p)]
  const phi = solveLinearSystem(R, r);

  return phi ?? new Array(p).fill(0);
}

// ─── MA Estimation via Residual OLS ───────────────────────────────────────────

/**
 * Estimates MA(q) coefficients by regressing residuals on their own lags.
 *
 * After fitting AR, the residuals approximate the MA innovations.
 * We regress εₜ on εₜ₋₁ … εₜ₋q to get θ₁ … θq.
 *
 * This is an approximation but is stable, fast, and suitable for low q.
 */
function fitMA(residuals: number[], q: number): number[] {
  if (q === 0 || residuals.length <= q) return [];

  const n = residuals.length;
  // Build X matrix where X[t][j] = residuals[t - j - 1] for j in 0..q-1
  const X: number[][] = [];
  const y: number[] = [];

  for (let t = q; t < n; t++) {
    const row: number[] = [];
    for (let j = 1; j <= q; j++) {
      row.push(residuals[t - j]);
    }
    X.push(row);
    y.push(residuals[t]);
  }

  // Normal equations: (Xᵀ X) θ = Xᵀ y
  const XtX: number[][] = Array.from({ length: q }, () => new Array(q).fill(0));
  const Xty: number[] = new Array(q).fill(0);

  for (let i = 0; i < X.length; i++) {
    for (let a = 0; a < q; a++) {
      Xty[a] += X[i][a] * y[i];
      for (let b = 0; b < q; b++) {
        XtX[a][b] += X[i][a] * X[i][b];
      }
    }
  }

  const theta = solveLinearSystem(XtX, Xty);
  return theta ?? new Array(q).fill(0);
}

// ─── ARIMA Fitting ────────────────────────────────────────────────────────────

/**
 * Fits ARIMA(p, d, q) on a pre-differenced series.
 *
 * The caller is responsible for differencing (handled in engine.ts).
 * This function receives the differenced values and fits AR + MA components.
 *
 * @param diffValues  Already-differenced series (length N - d)
 * @param p           AR order (from PACF)
 * @param d           Integration order (informational only here)
 * @param q           MA order (from ACF)
 */
export function fitARIMA(
  diffValues: number[],
  p: number,
  d: number,
  q: number
): ARIMAFitResult {
  const n = diffValues.length;
  const intercept = calculateMean(diffValues);

  // Center the series
  const centered = diffValues.map((v) => v - intercept);

  // Step 1: fit AR
  const arCoeffs = fitAR(centered, p);

  // Step 2: compute AR residuals
  const arResiduals: number[] = [];
  const arFitted: number[] = [];

  for (let t = 0; t < n; t++) {
    let arHat = 0;
    for (let i = 0; i < p; i++) {
      if (t - i - 1 >= 0) arHat += arCoeffs[i] * centered[t - i - 1];
    }
    arFitted.push(arHat + intercept);
    arResiduals.push(centered[t] - arHat);
  }

  // Step 3: fit MA on AR residuals
  const maCoeffs = fitMA(arResiduals, q);

  // Step 4: compute final fitted values and full residuals
  const fitted: number[] = [];
  const residuals: number[] = [];
  const innovations: number[] = new Array(n).fill(0); // running residual memory

  for (let t = 0; t < n; t++) {
    let hat = intercept;

    // AR component
    for (let i = 0; i < p; i++) {
      if (t - i - 1 >= 0) hat += arCoeffs[i] * centered[t - i - 1];
    }

    // MA component
    for (let j = 0; j < q; j++) {
      if (t - j - 1 >= 0) hat += maCoeffs[j] * innovations[t - j - 1];
    }

    const residual = diffValues[t] - hat;
    innovations[t] = residual;
    fitted.push(hat);
    residuals.push(residual);
  }

  // Residual variance σ²
  const sigma2 =
    residuals.reduce((acc, r) => acc + r * r, 0) / Math.max(1, n - p - q - 1);

  // AIC = 2k - 2ln(L) ≈ n·ln(σ²) + 2(p+q+1)
  const k = p + q + 1;
  const aic = n * Math.log(Math.max(sigma2, 1e-10)) + 2 * k;

  const summary = `ARIMA(${p},${d},${q}) | intercept=${intercept.toFixed(4)} | σ²=${sigma2.toFixed(4)} | AIC=${aic.toFixed(2)}`;

  return {
    params: { p, d, q, arCoeffs, maCoeffs, intercept, sigma2 },
    residuals,
    fitted,
    aic,
    summary,
  };
}

// ─── Forecasting ──────────────────────────────────────────────────────────────

/**
 * Generates h-step-ahead forecasts using the fitted ARIMA model.
 *
 * Forecasts are produced in the **differenced domain**.
 * Call `invertDifference` from differencing.ts to get original-scale values.
 *
 * Confidence intervals use the forecast error variance formula:
 *   σ²_h ≈ σ² · h  (simplified for AR-dominated models)
 * giving a 95 % interval of ±1.96 · √(σ²_h).
 */
export function forecastARIMA(
  fit: ARIMAFitResult,
  diffValues: number[],
  horizon: number
): ARIMAForecast {
  const { arCoeffs, maCoeffs, intercept, sigma2, p, q } = fit.params;
  const n = diffValues.length;

  // History for AR look-back (centered)
  const history = diffValues.map((v) => v - intercept);
  // Innovation history for MA look-back
  const innovations = [...fit.residuals];

  const pointForecasts: number[] = [];

  for (let h = 0; h < horizon; h++) {
    let hat = intercept;

    // AR component: look back through actual history, then into forecasts
    for (let i = 0; i < p; i++) {
      const idx = n + h - i - 1;
      if (idx < n) {
        hat += arCoeffs[i] * history[idx];
      } else {
        // We're referencing a previous forecast (already centered)
        hat += arCoeffs[i] * (pointForecasts[h - (i + 1 - (n - idx))] - intercept);
      }
    }

    // MA component: only use real innovations (future innovations = 0)
    for (let j = 0; j < q; j++) {
      const idx = n + h - j - 1;
      if (idx < innovations.length) {
        hat += maCoeffs[j] * innovations[idx];
      }
      // Future innovations are 0 in expectation
    }

    pointForecasts.push(hat);
    innovations.push(0); // extend with zeros for future steps
  }

  // Confidence intervals: σ²_h ≈ σ² · (1 + (h-1)·ψ²) — simplified linear growth
  const z95 = 1.96;
  const lower: number[] = [];
  const upper: number[] = [];

  for (let h = 1; h <= horizon; h++) {
    const seH = Math.sqrt(sigma2 * h);
    lower.push(pointForecasts[h - 1] - z95 * seH);
    upper.push(pointForecasts[h - 1] + z95 * seH);
  }

  return { values: pointForecasts, lower, upper };
}
