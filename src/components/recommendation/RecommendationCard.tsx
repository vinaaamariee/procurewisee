import React from "react";
import {
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  Truck,
  Sparkles,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
  TrendingUpDown,
} from "lucide-react";
import type { RecommendationEngineResult } from "@/lib/recommendation/types";

interface RecommendationCardProps {
  recommendation: RecommendationEngineResult | null;
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getTrendConfig(trend: string) {
  switch (trend) {
    case "increasing":
      return {
        icon: TrendingUp,
        label: "Increasing",
        color: "var(--accent)",
        bgColor: "rgba(239, 68, 68, 0.08)",
      };
    case "decreasing":
      return {
        icon: TrendingDown,
        label: "Decreasing",
        color: "var(--green)",
        bgColor: "rgba(34, 197, 94, 0.08)",
      };
    case "stable":
      return {
        icon: Minus,
        label: "Stable",
        color: "var(--text-secondary)",
        bgColor: "rgba(107, 114, 128, 0.08)",
      };
    default:
      return {
        icon: HelpCircle,
        label: "Unknown",
        color: "var(--text-muted)",
        bgColor: "rgba(156, 163, 175, 0.08)",
      };
  }
}

function getConfidenceColor(label: string) {
  switch (label) {
    case "High":
      return { color: "var(--green)", bgColor: "rgba(34, 197, 94, 0.08)" };
    case "Medium":
      return { color: "var(--yellow)", bgColor: "rgba(202, 138, 4, 0.08)" };
    case "Low":
    default:
      return { color: "var(--accent)", bgColor: "rgba(239, 68, 68, 0.08)" };
  }
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  if (!recommendation || !recommendation.topSupplier) {
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
            Recommendation Unavailable
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            No suppliers or procurement records are available to generate a recommendation.
          </p>
        </div>
      </div>
    );
  }

  const { topSupplier, rankedSuppliers, reason: academicContext, forecastTrend, expectedChange, confidence, confidenceLabel } = recommendation;
  const confidenceColor = getConfidenceColor(confidenceLabel);
  const trendCfg = getTrendConfig(forecastTrend);
  const TrendIcon = trendCfg.icon;

  // Derive Historical Trend label from historicalPerformanceScore
  let historicalTrendLabel = "Stable";
  if (topSupplier.individualScores.historicalPerformanceScore < 60) {
    historicalTrendLabel = "Volatile";
  } else if (topSupplier.individualScores.historicalPerformanceScore < 80) {
    historicalTrendLabel = "Moderate";
  }

  // Breakdown Contributions: (Score / 100) * Weights
  const priceCont = (topSupplier.individualScores.priceScore * 0.40).toFixed(1);
  const deliveryCont = (topSupplier.individualScores.deliveryScore * 0.20).toFixed(1);
  const reliabilityCont = (topSupplier.individualScores.reliabilityScore * 0.20).toFixed(1);
  const complianceCont = (topSupplier.individualScores.complianceScore * 0.10).toFixed(1);
  const historicalCont = (topSupplier.individualScores.historicalPerformanceScore * 0.10).toFixed(1);

  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-md transition-all duration-300 hover:shadow-lg"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      {/* Header Banner */}
      <div
        className="flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
        style={{
          borderColor: "var(--border)",
          background: "linear-gradient(135deg, rgba(126,25,27,0.04) 0%, rgba(202,138,4,0.04) 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-inner"
            style={{
              background: "rgba(126, 25, 27, 0.08)",
              border: "1px solid rgba(126, 25, 27, 0.15)",
            }}
          >
            <Sparkles className="h-5 w-5" style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "var(--accent)" }}
            >
              <Award className="h-3 w-3" /> Best-Value Recommendation
            </span>
            <h2 className="text-lg font-extrabold leading-tight" style={{ color: "var(--text-primary)" }}>
              {topSupplier.supplier.companyName}
            </h2>
          </div>
        </div>

        {/* Overall Score Badge */}
        <div className="flex items-center gap-4 sm:text-right">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              MCDM Overall Score
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black tracking-tight" style={{ color: "var(--accent)" }}>
                {topSupplier.overallScore.toFixed(1)}
              </span>
              <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                / 100
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y lg:grid-cols-5 lg:divide-x lg:divide-y-0" style={{ borderColor: "var(--border)" }}>
        {/* Left Column: Thesis Explanations & Scores Breakdown (3 cols) */}
        <div className="p-6 space-y-6 lg:col-span-3">
          {/* Academic MCDM Thesis Block */}
          <div className="rounded-xl border p-4 bg-muted/20" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs italic leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {academicContext}
            </p>
          </div>

          {/* Explainability Summary Box */}
          <div className="rounded-xl border p-4 space-y-3.5 bg-muted/5" style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recommendation Confidence</span>
              <span className="text-sm font-black text-green-600">{confidence}%</span>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Top Reasons Summary</span>
              <div className="space-y-1.5">
                {(() => {
                  const list: string[] = [];
                  const scores = topSupplier.individualScores;
                  
                  if (scores.priceScore >= 95) list.push("Lowest normalized price quote");
                  else if (scores.priceScore >= 80) list.push("Competitive and highly cost-efficient pricing");
                  
                  if (scores.deliveryScore >= 85) list.push("Excellent delivery history");
                  if (scores.reliabilityScore >= 85) list.push("Highest compliance and reliability index");
                  if (scores.complianceScore >= 90) list.push("Fully accredited and compliant supplier");
                  if (scores.historicalPerformanceScore >= 80) list.push("Stable historical prices");
                  if (forecastTrend === "increasing") list.push("Forecast indicates future inflation warning");
                  
                  if (list.length === 0) {
                    list.push("Recommended based on balanced MCDM score metrics");
                  }

                  return list.map((line, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs font-semibold leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span>{line}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* Explainable Scoring Breakdown */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Explainable Scoring Breakdown
            </h3>
            <div className="space-y-3.5">
              {/* Price */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                    Price Score <span className="text-[10px] text-muted-foreground">(40% wt.)</span>
                  </span>
                  <span className="font-semibold tabular-nums">
                    {priceCont} <span className="text-[10px] text-muted-foreground">/ 40.0</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted-foreground/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${topSupplier.individualScores.priceScore}%`,
                      background: "var(--accent)",
                    }}
                  />
                </div>
              </div>

              {/* Delivery */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                    <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                    Delivery Performance <span className="text-[10px] text-muted-foreground">(20% wt.)</span>
                  </span>
                  <span className="font-semibold tabular-nums">
                    {deliveryCont} <span className="text-[10px] text-muted-foreground">/ 20.0</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted-foreground/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${topSupplier.individualScores.deliveryScore}%`,
                      background: "var(--yellow)",
                    }}
                  />
                </div>
              </div>

              {/* Reliability */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                    <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                    Reliability <span className="text-[10px] text-muted-foreground">(20% wt.)</span>
                  </span>
                  <span className="font-semibold tabular-nums">
                    {reliabilityCont} <span className="text-[10px] text-muted-foreground">/ 20.0</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted-foreground/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${topSupplier.individualScores.reliabilityScore}%`,
                      background: "var(--green)",
                    }}
                  />
                </div>
              </div>

              {/* Compliance */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Compliance <span className="text-[10px] text-muted-foreground">(10% wt.)</span>
                  </span>
                  <span className="font-semibold tabular-nums">
                    {complianceCont} <span className="text-[10px] text-muted-foreground">/ 10.0</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted-foreground/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${topSupplier.individualScores.complianceScore}%`,
                      background: "rgb(59, 130, 246)",
                    }}
                  />
                </div>
              </div>

              {/* Historical Performance */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                    Historical Procurement Intelligence <span className="text-[10px] text-muted-foreground">(10% wt.)</span>
                  </span>
                  <span className="font-semibold tabular-nums">
                    {historicalCont} <span className="text-[10px] text-muted-foreground">/ 10.0</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted-foreground/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${topSupplier.individualScores.historicalPerformanceScore}%`,
                      background: "rgb(168, 85, 247)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Stats, Forecasts, and Alternatives (2 cols) */}
        <div className="p-6 space-y-6 lg:col-span-2">
          
          {/* Top Panel: Confidence Metric */}
          <div
            className="rounded-xl border p-4 text-center sm:text-left"
            style={{ borderColor: "var(--border)", background: "var(--bg-dark)" }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Recommendation Confidence
            </span>
            <div className="mt-1 flex flex-wrap items-baseline gap-2 justify-center sm:justify-start">
              <span className="text-2xl font-extrabold tracking-tight" style={{ color: confidenceColor.color }}>
                {confidenceLabel} ({confidence}%)
              </span>
            </div>
          </div>

          {/* Separated Forecast & Trend Display Panel */}
          <div
            className="rounded-xl border p-4 space-y-4"
            style={{ borderColor: "var(--border)", background: "var(--bg-dark)" }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
              Forecast & Historical Trend
            </span>
            
            <div className="grid grid-cols-2 gap-4 divide-x" style={{ borderColor: "var(--border)" }}>
              {/* Historical Trend */}
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground block">
                  Historical Trend:
                </span>
                <div className="flex items-center gap-1.5">
                  <TrendingUpDown className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {historicalTrendLabel}
                  </span>
                </div>
              </div>

              {/* Forecast Direction */}
              <div className="space-y-1 pl-4">
                <span className="text-[10px] font-medium text-muted-foreground block">
                  Forecast:
                </span>
                <div className="flex items-center gap-1.5">
                  <TrendIcon className="h-4 w-4" style={{ color: trendCfg.color }} />
                  <span className="text-sm font-bold" style={{ color: trendCfg.color }}>
                    {trendCfg.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Expected Price Change if Available */}
            {expectedChange && (
              <div className="pt-3 border-t flex justify-between items-center text-xs" style={{ borderColor: "var(--border)" }}>
                <span className="text-muted-foreground">Expected Change:</span>
                <span
                  className="font-bold px-2 py-0.5 rounded-md"
                  style={{
                    color: expectedChange.startsWith("+") ? "var(--accent)" : "var(--green)",
                    background: expectedChange.startsWith("+") ? "rgba(239, 68, 68, 0.06)" : "rgba(34, 197, 94, 0.06)",
                  }}
                >
                  {expectedChange}
                </span>
              </div>
            )}

            {/* Procurement Strategy Advice */}
            <div className="pt-3 border-t text-xs space-y-1" style={{ borderColor: "var(--border)" }}>
              <span className="text-muted-foreground block text-[10px] font-medium">Procurement Strategy Advice:</span>
              <div className="flex items-start gap-1.5">
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-extrabold shrink-0"
                  style={{
                    color:
                      forecastTrend === "increasing"
                        ? "var(--accent)"
                        : forecastTrend === "decreasing"
                        ? "var(--green)"
                        : "var(--text-secondary)",
                    backgroundColor:
                      forecastTrend === "increasing"
                        ? "rgba(239, 68, 68, 0.05)"
                        : forecastTrend === "decreasing"
                        ? "rgba(34, 197, 94, 0.05)"
                        : "rgba(107, 114, 128, 0.05)",
                  }}
                >
                  {forecastTrend === "increasing" ? "BUY NOW" : forecastTrend === "decreasing" ? "WAIT FOR PRICE" : "MONITOR MARKET"}
                </span>
                <span className="text-[10px] text-muted-foreground leading-snug">
                  {forecastTrend === "increasing"
                    ? "Prices are projected to rise. Procurement is advised to purchase immediately to optimize savings."
                    : forecastTrend === "decreasing"
                    ? "Prices are expected to decline. It is recommended to defer procurement to capitalize on cost savings."
                    : "Pricing remains stable. Purchase inventory on an as-needed basis while monitoring market trends."}
                </span>
              </div>
            </div>
          </div>

          {/* Alternative Rankings list */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Alternative Candidates Ranked
            </h3>
            <div className="space-y-2">
              {rankedSuppliers.map((rec, idx) => {
                const rank = idx + 1;
                const isTop = rank === 1;
                return (
                  <div
                    key={rec.supplier.id}
                    className="flex items-center justify-between rounded-xl border p-3 transition-colors duration-200 hover:bg-muted/10"
                    style={{
                      borderColor: isTop ? "var(--accent)" : "var(--border)",
                      background: isTop ? "var(--accent-glass)" : "var(--surface)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white"
                        style={{ background: isTop ? "var(--accent)" : "var(--text-muted)" }}
                      >
                        {rank}
                      </span>
                      <div>
                        <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                          {rec.supplier.companyName}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatCurrency(rec.price)} · {rec.deliveryDays}d delivery
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black tabular-nums" style={{ color: isTop ? "var(--accent)" : "var(--text-secondary)" }}>
                        {rec.overallScore.toFixed(1)}
                      </span>
                      <p className="text-[9px] text-muted-foreground">Score</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
