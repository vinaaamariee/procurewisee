import { determineProcurementAction, ProcurementAction } from "./decision-engine";
import type { ForecastResult } from "./forecast-types";

export interface ForecastSummary {
  currentPrice: number;
  forecastPrice: number | null;
  expectedChangePct: number;
  expectedChangeLabel: string; // e.g. "+3.2%" or "-1.5%"
  recommendation: ProcurementAction;
  recommendationText: string;
}

const ACTION_DESCRIPTIONS: Record<ProcurementAction, string> = {
  BUY_NOW: "Prices are projected to rise. Procurement is advised to purchase immediately to optimize savings.",
  WAIT_FOR_PRICE_DROP: "Prices are expected to decline. It is recommended to defer procurement to capitalize on cost savings.",
  MONITOR_MARKET: "Pricing remains stable. Purchase inventory on an as-needed basis while monitoring market trends.",
  INSUFFICIENT_DATA: "Not enough historical cost points exist to compute a forecast or recommendation.",
};

/**
 * Formulates a readable diagnostic forecast summary of the ARIMA output.
 */
export function generateForecastSummary(
  forecast: ForecastResult | null,
  currentPrice: number
): ForecastSummary {
  if (!forecast || forecast.points.length === 0 || currentPrice <= 0) {
    return {
      currentPrice,
      forecastPrice: null,
      expectedChangePct: 0,
      expectedChangeLabel: "0.0%",
      recommendation: "INSUFFICIENT_DATA",
      recommendationText: ACTION_DESCRIPTIONS.INSUFFICIENT_DATA,
    };
  }

  const forecastPrice = forecast.points[0].value;
  const expectedChangePct = ((forecastPrice - currentPrice) / currentPrice) * 100;
  const expectedChangeLabel = expectedChangePct >= 0
    ? `+${expectedChangePct.toFixed(1)}%`
    : `${expectedChangePct.toFixed(1)}%`;

  const recommendation = determineProcurementAction(forecast, currentPrice);
  const recommendationText = ACTION_DESCRIPTIONS[recommendation];

  return {
    currentPrice,
    forecastPrice,
    expectedChangePct,
    expectedChangeLabel,
    recommendation,
    recommendationText,
  };
}
