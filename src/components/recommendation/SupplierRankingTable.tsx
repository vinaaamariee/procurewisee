"use client";

import React from "react";
import type { RfqQuoteRecommendation } from "@/lib/recommendation/types";

interface SupplierRankingTableProps {
  rankings: RfqQuoteRecommendation[];
  weights: {
    price: number;
    delivery: number;
    reliability: number;
    compliance: number;
    historicalPerformance: number;
  };
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function SupplierRankingTable({ rankings, weights }: SupplierRankingTableProps) {
  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-sm"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
          Supplier Comparison & MCDM Rankings
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-muted/10 border-b" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              <th className="p-3 font-semibold">Rank</th>
              <th className="p-3 font-semibold">Supplier</th>
              <th className="p-3 font-semibold text-right">Quoted Price</th>
              <th className="p-3 font-semibold text-center">Lead Time</th>
              <th className="p-3 font-semibold text-right">MCDM Overall Score</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((s, idx) => {
              const rank = idx + 1;
              const isTop = rank === 1;
              
              // Score contributions
              const priceCont = (s.individualScores.priceScore * weights.price).toFixed(1);
              const deliveryCont = (s.individualScores.deliveryScore * weights.delivery).toFixed(1);
              const reliabilityCont = (s.individualScores.reliabilityScore * weights.reliability).toFixed(1);
              const complianceCont = (s.individualScores.complianceScore * weights.compliance).toFixed(1);
              const historicalCont = (s.individualScores.historicalPerformanceScore * weights.historicalPerformance).toFixed(1);

              const priceLimit = (weights.price * 100).toFixed(0);
              const deliveryLimit = (weights.delivery * 100).toFixed(0);
              const reliabilityLimit = (weights.reliability * 100).toFixed(0);
              const complianceLimit = (weights.compliance * 100).toFixed(0);
              const historicalLimit = (weights.historicalPerformance * 100).toFixed(0);

              return (
                <tr
                  key={s.supplierId}
                  className="border-b transition-colors hover:bg-muted/5 text-xs"
                  style={{
                    borderColor: "var(--border)",
                    background: isTop ? "var(--accent-glass)" : "transparent",
                  }}
                >
                  {/* Rank Badge */}
                  <td className="p-4 font-extrabold align-middle">
                    {rank === 1 ? "🥇 1st" : rank === 2 ? "🥈 2nd" : rank === 3 ? "🥉 3rd" : `#${rank}`}
                  </td>
                  
                  {/* Supplier details + detailed breakdown */}
                  <td className="p-4 align-middle">
                    <div>
                      <span className="font-bold block text-sm" style={{ color: "var(--text-primary)" }}>
                        {s.supplierName}
                      </span>
                      {/* Criteria Score visual progress indicators */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-5 gap-3 max-w-2xl">
                        {/* Price */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Price ({priceLimit}%)</span>
                            <span className="font-semibold">{priceCont}</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted-foreground/10 rounded-full overflow-hidden">
                            <div className="h-full bg-red-800 rounded-full" style={{ width: `${s.individualScores.priceScore}%` }} />
                          </div>
                        </div>
                        {/* Delivery */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Delivery ({deliveryLimit}%)</span>
                            <span className="font-semibold">{deliveryCont}</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted-foreground/10 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-600 rounded-full" style={{ width: `${s.individualScores.deliveryScore}%` }} />
                          </div>
                        </div>
                        {/* Reliability */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Reliability ({reliabilityLimit}%)</span>
                            <span className="font-semibold">{reliabilityCont}</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted-foreground/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${s.individualScores.reliabilityScore}%` }} />
                          </div>
                        </div>
                        {/* Compliance */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Compliance ({complianceLimit}%)</span>
                            <span className="font-semibold">{complianceCont}</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted-foreground/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${s.individualScores.complianceScore}%` }} />
                          </div>
                        </div>
                        {/* Historical */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Historical ({historicalLimit}%)</span>
                            <span className="font-semibold">{historicalCont}</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted-foreground/10 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-600 rounded-full" style={{ width: `${s.individualScores.historicalPerformanceScore}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Quoted Price */}
                  <td className="p-4 text-right align-middle font-semibold tabular-nums text-sm">
                    {formatCurrency(s.price)}
                  </td>
                  
                  {/* Lead time */}
                  <td className="p-4 text-center align-middle font-medium tabular-nums text-sm">
                    {s.deliveryDays} days
                  </td>
                  
                  {/* MCDM Score */}
                  <td className="p-4 text-right align-middle font-black tabular-nums text-base" style={{ color: isTop ? "var(--accent)" : "inherit" }}>
                    {s.overallScore} <span className="text-[10px] font-normal text-muted-foreground">/ 100</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
