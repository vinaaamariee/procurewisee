import React from "react";
import { TrendingUp, TrendingDown, Minus, AlertCircle, Sparkles, ShoppingCart, Clock } from "lucide-react";
import type { ForecastResult } from "@/lib/forecast/forecast-types";

interface ForecastCardProps {
  forecast: ForecastResult | null;
  currentPrice: number;
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Trend Config ──────────────────────────────────────────────────────────────

function getTrendConfig(trend: "increasing" | "decreasing" | "stable") {
  switch (trend) {
    case "increasing":
      return {
        icon: TrendingUp,
        label: "↑ Increasing",
        description: "Prices are projected to rise.",
        color: "var(--accent)",
        bgColor: "rgba(239, 68, 68, 0.08)",
        recommendation: "Purchase Now",
        recommendationDetail:
          "Prices are trending upward. Procuring now may save costs before the next increase.",
        recIcon: ShoppingCart,
        recColor: "var(--green)",
        recBg: "rgba(34, 197, 94, 0.08)",
      };
    case "decreasing":
      return {
        icon: TrendingDown,
        label: "↓ Decreasing",
        description: "Prices are projected to fall.",
        color: "var(--green)",
        bgColor: "rgba(34, 197, 94, 0.08)",
        recommendation: "Delay Purchase",
        recommendationDetail:
          "Prices are trending downward. Waiting may allow procurement at a lower cost.",
        recIcon: Clock,
        recColor: "var(--accent)",
        recBg: "rgba(239, 68, 68, 0.08)",
      };
    case "stable":
    default:
      return {
        icon: Minus,
        label: "→ Stable",
        description: "Prices are projected to remain steady.",
        color: "var(--text-secondary)",
        bgColor: "rgba(107, 114, 128, 0.08)",
        recommendation: "Monitor",
        recommendationDetail:
          "Prices are stable. Proceed based on your procurement schedule.",
        recIcon: Sparkles,
        recColor: "var(--text-secondary)",
        recBg: "rgba(107, 114, 128, 0.08)",
      };
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ForecastCard({ forecast, currentPrice }: ForecastCardProps) {
  // ── Insufficient Data ───────────────────────────────────────────────────────
  if (!forecast) {
    return (
      <div
        className="flex items-start gap-4 rounded-2xl border p-6"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "rgba(107,114,128,0.1)" }}
        >
          <AlertCircle className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
        </div>
        <div>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Forecast Unavailable
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Not enough historical data to generate a forecast. At least 6 months of price history
            are required.
          </p>
        </div>
      </div>
    );
  }

  const cfg = getTrendConfig(forecast.trend);
  const TrendIcon = cfg.icon;
  const RecIcon = cfg.recIcon;

  const next1 = forecast.points[0];
  const next3 = forecast.points[forecast.points.length - 1];

  // Price change from current to next month
  const priceDelta = next1 ? next1.value - currentPrice : 0;
  const priceDeltaPct = currentPrice > 0 ? (priceDelta / currentPrice) * 100 : 0;

  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-sm"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-5 py-4"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: "var(--accent)" }} />
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            AI Price Forecast
          </h3>
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ background: "var(--accent-glass)", color: "var(--accent)" }}
        >
          {forecast.modelUsed}
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Trend + Summary Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Trend */}
          <div
            className="flex flex-col gap-2 rounded-xl p-4"
            style={{ background: cfg.bgColor }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Trend
            </span>
            <div className="flex items-center gap-2">
              <TrendIcon className="h-5 w-5" style={{ color: cfg.color }} />
              <span className="text-base font-extrabold" style={{ color: cfg.color }}>
                {cfg.label}
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {cfg.description}
            </p>
          </div>

          {/* Next Month Forecast */}
          {next1 && (
            <div
              className="flex flex-col gap-2 rounded-xl p-4 border"
              style={{ borderColor: "var(--border)", background: "var(--bg-dark)" }}
            >
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Forecast — Next Month
              </span>
              <span className="text-xl font-extrabold tabular-nums" style={{ color: "var(--text-primary)" }}>
                {formatCurrency(next1.value)}
              </span>
              <span
                className="text-xs font-semibold"
                style={{ color: priceDelta >= 0 ? "var(--accent)" : "var(--green)" }}
              >
                {priceDelta >= 0 ? "+" : ""}
                {formatCurrency(priceDelta)} ({priceDeltaPct >= 0 ? "+" : ""}
                {priceDeltaPct.toFixed(1)}% vs current)
              </span>
            </div>
          )}

          {/* 3-Month Forecast */}
          {next3 && (
            <div
              className="flex flex-col gap-2 rounded-xl p-4 border"
              style={{ borderColor: "var(--border)", background: "var(--bg-dark)" }}
            >
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Forecast — Next 3 Months
              </span>
              <span className="text-xl font-extrabold tabular-nums" style={{ color: "var(--text-primary)" }}>
                {formatCurrency(next3.value)}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {next3.date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>
          )}
        </div>

        {/* Monthly Breakdown with Confidence */}
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Monthly Breakdown & Confidence Interval
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {forecast.points.map((pt, i) => (
              <div
                key={i}
                className="rounded-xl border p-4"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <p className="mb-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  Month {i + 1} —{" "}
                  {pt.date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
                <p className="text-base font-extrabold tabular-nums" style={{ color: "var(--text-primary)" }}>
                  {formatCurrency(pt.value)}
                </p>
                <p className="mt-1 text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
                  95% CI: {formatCurrency(pt.lower)} — {formatCurrency(pt.upper)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div
          className="flex items-start gap-4 rounded-xl p-4"
          style={{ background: cfg.recBg, border: `1px solid ${cfg.recColor}22` }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${cfg.recColor}22` }}
          >
            <RecIcon className="h-5 w-5" style={{ color: cfg.recColor }} />
          </div>
          <div>
            <p className="font-bold" style={{ color: cfg.recColor }}>
              {cfg.recommendation}
            </p>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              {cfg.recommendationDetail}
            </p>
          </div>
        </div>

        {/* Footer metadata */}
        <p className="text-right text-xs" style={{ color: "var(--text-muted)" }}>
          Generated{" "}
          {forecast.forecastedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}{" "}
          · {(forecast.metadata as Record<string, unknown>)?.seriesLength as number} months of data ·{" "}
          {forecast.modelUsed}
        </p>
      </div>
    </div>
  );
}
