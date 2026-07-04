import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface TrendItem {
  month: string;
  year: number;
  averagePrice: number;
}

interface PriceTrendProps {
  trendData: TrendItem[];
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PriceTrend({ trendData }: PriceTrendProps) {
  // Get latest 12 monthly prices in chronological order
  const latest12 = trendData.slice(-12);

  if (latest12.length === 0) {
    return (
      <div className="py-4 text-center text-sm" style={{ color: "var(--text-muted)" }}>
        No monthly trend data available.
      </div>
    );
  }

  // Calculate percentage change from oldest to newest value
  const oldest = latest12[0]?.averagePrice || 0;
  const newest = latest12[latest12.length - 1]?.averagePrice || 0;
  const pctChange = oldest > 0 ? ((newest - oldest) / oldest) * 100 : 0;

  let trendDirection: "increasing" | "decreasing" | "stable" = "stable";
  if (pctChange > 0.05) {
    trendDirection = "increasing";
  } else if (pctChange < -0.05) {
    trendDirection = "decreasing";
  }

  // Map month name to 3-letter abbreviation
  const getAbbr = (monthStr: string) => {
    const clean = monthStr.trim();
    if (clean.length > 3) {
      return clean.substring(0, 3);
    }
    return clean;
  };

  return (
    <div
      className="rounded-2xl border p-6 shadow-sm"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <h3
        className="mb-4 text-xs font-bold uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        Historical Price Trend (Last 12 Months)
      </h3>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Trend Summary Metric */}
        <div
          className="flex flex-col justify-center rounded-xl p-5 border md:col-span-1"
          style={{ borderColor: "var(--border)", background: "var(--bg-dark)" }}
        >
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            Overall Trend
          </span>
          
          <div className="mt-2 flex items-center gap-1.5 font-extrabold text-xl">
            {trendDirection === "increasing" && (
              <span className="flex items-center gap-1 text-[var(--green)]" style={{ color: "var(--green)" }}>
                <ArrowUpRight className="h-5 w-5" />
                ↑ increasing
              </span>
            )}
            {trendDirection === "decreasing" && (
              <span className="flex items-center gap-1 text-[var(--accent)]" style={{ color: "var(--accent)" }}>
                <ArrowDownRight className="h-5 w-5" />
                ↓ decreasing
              </span>
            )}
            {trendDirection === "stable" && (
              <span className="flex items-center gap-1 text-[var(--text-muted)]" style={{ color: "var(--text-muted)" }}>
                <Minus className="h-5 w-5" />
                → stable
              </span>
            )}
          </div>

          <span
            className="mt-1 text-xs font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            {trendDirection !== "stable"
              ? `${Math.abs(pctChange).toFixed(1)}% change over 12 months`
              : "Less than 0.1% change"}
          </span>
        </div>

        {/* Monthly Price List */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:col-span-3">
          {latest12.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center rounded-xl p-3 border text-center transition-colors hover:border-[var(--text-muted)]"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
              }}
            >
              <span
                className="text-xs font-bold uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                {getAbbr(item.month)}
              </span>
              <span
                className="text-[0.65rem]"
                style={{ color: "var(--text-muted)" }}
              >
                {item.year}
              </span>
              <span
                className="mt-1 text-sm font-extrabold tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                {formatCurrency(item.averagePrice)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
