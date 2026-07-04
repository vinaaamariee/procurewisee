import React from "react";
import { TrendingUp, DollarSign, Users, Calendar } from "lucide-react";

interface HistoricalPriceCardProps {
  currentPrice: number;
  averagePrice: number | null;
  lowestPrice: number | null;
  highestPrice: number | null;
  supplierCount: number;
  latestProcurementDate: Date | null;
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function HistoricalPriceCard({
  currentPrice,
  averagePrice,
  lowestPrice,
  highestPrice,
  supplierCount,
  latestProcurementDate,
}: HistoricalPriceCardProps) {
  const formattedDate = latestProcurementDate
    ? new Date(latestProcurementDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div
      className="rounded-2xl border p-6 shadow-sm"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <h3
        className="mb-4 text-xs font-bold uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        Historical Pricing Overview
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Current Price */}
        <div
          className="flex flex-col gap-1 rounded-xl p-4 border"
          style={{ borderColor: "var(--border)", background: "var(--bg-dark)" }}
        >
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            Current Benchmark Price
          </span>
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {formatCurrency(currentPrice)}
          </span>
        </div>

        {/* Average Price */}
        <div
          className="flex flex-col gap-1 rounded-xl p-4 border"
          style={{ borderColor: "var(--border)", background: "var(--bg-dark)" }}
        >
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            Average Historical Price
          </span>
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: averagePrice ? "var(--text-primary)" : "var(--text-muted)" }}
          >
            {averagePrice ? formatCurrency(averagePrice) : "—"}
          </span>
        </div>

        {/* Lowest Price */}
        <div
          className="flex flex-col gap-1 rounded-xl p-4 border"
          style={{ borderColor: "var(--border)", background: "var(--bg-dark)" }}
        >
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            Lowest Historical Price
          </span>
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: lowestPrice ? "var(--green)" : "var(--text-muted)" }}
          >
            {lowestPrice ? formatCurrency(lowestPrice) : "—"}
          </span>
        </div>

        {/* Highest Price */}
        <div
          className="flex flex-col gap-1 rounded-xl p-4 border"
          style={{ borderColor: "var(--border)", background: "var(--bg-dark)" }}
        >
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            Highest Historical Price
          </span>
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: highestPrice ? "var(--accent)" : "var(--text-muted)" }}
          >
            {highestPrice ? formatCurrency(highestPrice) : "—"}
          </span>
        </div>

        {/* Supplier Count */}
        <div
          className="flex flex-col gap-1 rounded-xl p-4 border"
          style={{ borderColor: "var(--border)", background: "var(--bg-dark)" }}
        >
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            Supplier Count
          </span>
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {supplierCount} {supplierCount === 1 ? "supplier" : "suppliers"}
          </span>
        </div>

        {/* Latest Procurement Date */}
        <div
          className="flex flex-col gap-1 rounded-xl p-4 border"
          style={{ borderColor: "var(--border)", background: "var(--bg-dark)" }}
        >
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            Latest Procurement Date
          </span>
          <span
            className="text-sm font-bold truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}
