/**
 * Core types for the ProcureWise time-series forecasting pipeline.
 * Used by ARIMA infrastructure (Sprint 4.2+).
 */

/** A single historical price observation with its associated date. */
export interface HistoricalPoint {
  date: Date;
  value: number;
}

/** A single forecasted value with confidence bounds. */
export interface ForecastPoint {
  date: Date;
  value: number;
  lower: number; // lower confidence bound
  upper: number; // upper confidence bound
}

/** The full result of a forecasting run for a given product. */
export interface ForecastResult {
  productId: number;
  forecastedAt: Date;
  horizon: number;         // number of periods forecasted
  points: ForecastPoint[];
  trend: TrendDirection;
  modelUsed: string;       // e.g. "ARIMA(1,1,1)"
  metadata?: Record<string, unknown>;
}

/** Overall price direction classification. */
export type TrendDirection = "increasing" | "decreasing" | "stable";

/** Result of a stationarity check. */
export interface StationarityResult {
  stationary: boolean;
  reason: string;
  rollingMeans?: number[];
  rollingVariances?: number[];
}

/** Differenced series metadata. */
export interface DifferencedSeries {
  values: number[];
  order: number; // order of differencing applied
}
