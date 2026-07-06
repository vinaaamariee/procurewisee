"use client";

import React, { useState } from "react";
import { Award, Sparkles, TrendingUp, TrendingDown, Minus, TrendingUpDown, AlertCircle, FileCheck, CheckCircle2 } from "lucide-react";
import RecommendationReason from "./RecommendationReason";
import { createPoFromAwardAction } from "@/app/actions/po";
import type { RfqQuoteRecommendation } from "@/lib/recommendation/types";

interface RecommendationPanelProps {
  topRecommendation: RfqQuoteRecommendation;
  savedRecommendationId?: number | null;
  forecastInfo: {
    forecastPrice: number | null;
    forecastTrend: "increasing" | "decreasing" | "stable" | "unknown";
    expectedChange: string | null;
    historicalAvgPrice?: number;
    historicalMinPrice?: number;
    historicalLatestPrice?: number;
  };
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function RecommendationPanel({
  topRecommendation,
  savedRecommendationId,
  forecastInfo,
}: RecommendationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [poMsg, setPoMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGeneratePo = async () => {
    if (!savedRecommendationId) return;
    setIsGenerating(true);
    setPoMsg(null);
    setErrorMsg(null);

    try {
      const res = await createPoFromAwardAction(savedRecommendationId);
      if (res.success && res.po) {
        setPoMsg(`Formal Purchase Order ${res.po.poNumber} has been successfully drafted for ${topRecommendation.supplierName}! View it in the PO drafting queue.`);
      } else {
        setErrorMsg(res.error || "Failed to draft Purchase Order.");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "An error occurred during PO generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const confidenceColor =
    topRecommendation.confidenceLabel === "High"
      ? "var(--green)"
      : topRecommendation.confidenceLabel === "Medium"
      ? "var(--yellow)"
      : "var(--accent)";

  const trendColor =
    forecastInfo.forecastTrend === "increasing"
      ? "var(--accent)"
      : forecastInfo.forecastTrend === "decreasing"
      ? "var(--green)"
      : "var(--text-secondary)";

  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-md"
      style={{ borderColor: "var(--accent)", background: "var(--surface)" }}
    >
      {/* Banner Title */}
      <div
        className="flex justify-between items-center px-6 py-4 border-b"
        style={{
          borderColor: "var(--border)",
          background: "linear-gradient(135deg, rgba(126,25,27,0.04) 0%, rgba(202,138,4,0.04) 100%)",
        }}
      >
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5" style={{ color: "var(--accent)" }} />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--accent)" }}>
              🏆 Best-Value Award Recommendation
            </span>
            <h3 className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>
              {topRecommendation.supplierName}
            </h3>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">MCDM Score</span>
          <span className="text-2xl font-black" style={{ color: "var(--accent)" }}>
            {topRecommendation.overallScore}
          </span>
          <span className="text-xs text-muted-foreground"> / 100</span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Explanations Column */}
        <div className="md:col-span-1 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Justification Log
          </h4>
          <RecommendationReason individualScores={topRecommendation.individualScores} />
        </div>

        {/* Forecast & Cost intelligence Column */}
        <div className="md:col-span-1 space-y-3 border-y md:border-y-0 md:border-x px-0 md:px-6 py-4 md:py-0" style={{ borderColor: "var(--border)" }}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <TrendingUpDown className="h-3.5 w-3.5" />
            Forecast & Cost Benchmarks
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average Historical Price:</span>
              <span className="font-bold">{forecastInfo.historicalAvgPrice ? formatCurrency(forecastInfo.historicalAvgPrice) : "₱—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lowest Historical Price:</span>
              <span className="font-bold">{forecastInfo.historicalMinPrice ? formatCurrency(forecastInfo.historicalMinPrice) : "₱—"}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: "var(--border)" }}>
              <span className="text-muted-foreground">Latest Price Quote:</span>
              <span className="font-bold">{forecastInfo.historicalLatestPrice ? formatCurrency(forecastInfo.historicalLatestPrice) : "₱—"}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-muted-foreground">ARIMA Trend:</span>
              <span className="font-bold uppercase" style={{ color: trendColor }}>
                {forecastInfo.forecastTrend}
              </span>
            </div>
            {forecastInfo.expectedChange && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Change:</span>
                <span
                  className="font-bold px-1.5 py-0.5 rounded"
                  style={{
                    color: forecastInfo.expectedChange.startsWith("+") ? "var(--accent)" : "var(--green)",
                    backgroundColor: forecastInfo.expectedChange.startsWith("+") ? "rgba(239, 68, 68, 0.05)" : "rgba(34, 197, 94, 0.05)",
                  }}
                >
                  {forecastInfo.expectedChange}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* PO Generation & Confidence Column */}
        <div className="md:col-span-1 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Engine Confidence
            </h4>
            <span className="text-sm font-bold" style={{ color: confidenceColor }}>
              {topRecommendation.confidenceLabel} ({topRecommendation.confidence}%)
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {poMsg && (
              <div className="p-3 text-xs bg-green-500/10 border border-green-500/20 text-green-700 font-semibold rounded-xl leading-relaxed">
                {poMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-700 font-semibold rounded-xl leading-relaxed">
                {errorMsg}
              </div>
            )}

            {savedRecommendationId ? (
              <button
                onClick={handleGeneratePo}
                disabled={isGenerating}
                className="w-full py-2 px-4 rounded-xl text-white font-bold text-xs shadow flex justify-center items-center gap-2 hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg, var(--accent) 0%, #a82025 100%)" }}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating PO...
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4" />
                    Generate Purchase Order
                  </>
                )}
              </button>
            ) : (
              <div className="p-3 bg-muted/20 border rounded-xl text-[10px] text-muted-foreground text-center">
                Canvassing evaluation must be approved to enable Purchase Order generation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
