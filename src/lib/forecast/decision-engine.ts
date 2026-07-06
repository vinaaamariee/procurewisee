import type { ForecastResult } from "./forecast-types";

export type ProcurementAction = "BUY_NOW" | "WAIT_FOR_PRICE_DROP" | "MONITOR_MARKET" | "INSUFFICIENT_DATA";

/**
 * Evaluates the ARIMA forecast output alongside pricing volatility to recommend a strategic procurement action.
 */
export function determineProcurementAction(
  forecast: ForecastResult | null,
  currentPrice: number
): ProcurementAction {
  if (!forecast || forecast.points.length === 0 || currentPrice <= 0) {
    return "INSUFFICIENT_DATA";
  }

  const nextPrice = forecast.points[0].value;
  const pctChange = ((nextPrice - currentPrice) / currentPrice) * 100;

  // Decision logic:
  // 1. If prices are trended to increase significantly (> 1.5%), buy immediately to lock in low rates.
  // 2. If prices are expected to drop significantly (< -1.5%), wait for the price drop.
  // 3. Otherwise, if trend is stable or change is minor, monitor market.
  if (forecast.trend === "increasing" || pctChange > 1.5) {
    return "BUY_NOW";
  }

  if (forecast.trend === "decreasing" || pctChange < -1.5) {
    return "WAIT_FOR_PRICE_DROP";
  }

  return "MONITOR_MARKET";
}
