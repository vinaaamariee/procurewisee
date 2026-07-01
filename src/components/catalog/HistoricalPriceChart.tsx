"use client";

import { useMemo } from "react";
import type { PriceHistoryPoint } from "@/features/catalog/server/queries";

interface HistoricalPriceChartProps {
  data: PriceHistoryPoint[];
}

const CHART_WIDTH = 600;
const CHART_HEIGHT = 200;
const PADDING = { top: 24, right: 24, bottom: 40, left: 64 };

function formatCurrency(amount: number) {
  if (amount >= 1000000) return `₱${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `₱${(amount / 1000).toFixed(1)}K`;
  return `₱${amount.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-PH", {
    month: "short",
    year: "2-digit",
  });
}

export default function HistoricalPriceChart({ data }: HistoricalPriceChartProps) {
  const { points, yTicks, xLabels, pathD, areaD, minY, maxY } = useMemo(() => {
    if (data.length < 2) return { points: [], yTicks: [], xLabels: [], pathD: "", areaD: "", minY: 0, maxY: 0 };

    const prices = data.map((d) => d.price);
    const rawMin = Math.min(...prices);
    const rawMax = Math.max(...prices);
    const padding = (rawMax - rawMin) * 0.15 || rawMax * 0.1 || 1;
    const minY = Math.max(0, rawMin - padding);
    const maxY = rawMax + padding;

    const innerW = CHART_WIDTH - PADDING.left - PADDING.right;
    const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom;

    const xScale = (i: number) => PADDING.left + (i / (data.length - 1)) * innerW;
    const yScale = (v: number) => PADDING.top + innerH - ((v - minY) / (maxY - minY)) * innerH;

    const points = data.map((d, i) => ({
      x: xScale(i),
      y: yScale(d.price),
      price: d.price,
      date: d.effectiveDate,
      supplier: d.supplierName,
    }));

    const pathD =
      "M " + points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");

    const areaD =
      pathD +
      ` L ${points[points.length - 1].x.toFixed(1)},${(PADDING.top + innerH).toFixed(1)}` +
      ` L ${points[0].x.toFixed(1)},${(PADDING.top + innerH).toFixed(1)} Z`;

    // 4 Y ticks
    const yTicks = Array.from({ length: 5 }, (_, i) => {
      const value = minY + ((maxY - minY) * i) / 4;
      return { value, y: yScale(value) };
    });

    // Trim X labels to avoid crowding (max 6)
    const step = Math.ceil(data.length / 6);
    const xLabels = data
      .map((d, i) => ({ i, date: d.effectiveDate, x: xScale(i) }))
      .filter((_, i) => i % step === 0 || i === data.length - 1);

    return { points, yTicks, xLabels, pathD, areaD, minY, maxY };
  }, [data]);

  if (points.length < 2) {
    return (
      <div
        className="flex items-center justify-center py-8 text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        Not enough price history to display a trend
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="w-full"
        style={{ minWidth: 320, height: CHART_HEIGHT }}
        role="img"
        aria-label="Historical price trend chart"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y Grid lines */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={PADDING.left}
              y1={tick.y}
              x2={CHART_WIDTH - PADDING.right}
              y2={tick.y}
              stroke="var(--border)"
              strokeWidth={0.5}
              strokeDasharray="4 4"
            />
            <text
              x={PADDING.left - 6}
              y={tick.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="var(--text-muted)"
            >
              {formatCurrency(tick.value)}
            </text>
          </g>
        ))}

        {/* X Labels */}
        {xLabels.map((lbl) => (
          <text
            key={lbl.i}
            x={lbl.x}
            y={CHART_HEIGHT - 8}
            textAnchor="middle"
            fontSize="10"
            fill="var(--text-muted)"
          >
            {formatDate(lbl.date)}
          </text>
        ))}

        {/* Area fill */}
        <path d={areaD} fill="url(#priceGradient)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--green)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data Points */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r={4} fill="var(--green)" />
            <circle
              cx={pt.x}
              cy={pt.y}
              r={7}
              fill="var(--green)"
              fillOpacity={0.15}
            />
            {/* Tooltip-style label on last point */}
            {i === points.length - 1 && (
              <text
                x={pt.x}
                y={pt.y - 14}
                textAnchor="end"
                fontSize="10"
                fontWeight="bold"
                fill="var(--green)"
              >
                {formatCurrency(pt.price)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
