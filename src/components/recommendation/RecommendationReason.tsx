"use client";

import React, { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import type { IndividualScores } from "@/lib/recommendation/types";

interface RecommendationReasonProps {
  individualScores: IndividualScores;
}

export default function RecommendationReason({ individualScores }: RecommendationReasonProps) {
  const justifications = useMemo(() => {
    const list: string[] = [];

    // Price Score Evaluator
    if (individualScores.priceScore >= 95) {
      list.push("Lowest evaluated price among suppliers");
    } else if (individualScores.priceScore >= 80) {
      list.push("Competitive price quote");
    }

    // Delivery Score Evaluator
    if (individualScores.deliveryScore >= 85) {
      list.push("Excellent delivery performance");
    } else if (individualScores.deliveryScore >= 70) {
      list.push("Satisfactory delivery speed and history");
    }

    // Reliability Score Evaluator
    if (individualScores.reliabilityScore >= 80) {
      list.push("High supplier reliability");
    } else if (individualScores.reliabilityScore >= 60) {
      list.push("Moderate supplier reliability");
    }

    // Compliance Score Evaluator
    if (individualScores.complianceScore >= 90) {
      list.push("Complete compliance documents");
    } else if (individualScores.complianceScore >= 70) {
      list.push("Adequate regulatory compliance");
    }

    // Historical Performance Score Evaluator
    if (individualScores.historicalPerformanceScore >= 80) {
      list.push("Stable historical pricing trend");
    } else if (individualScores.historicalPerformanceScore >= 60) {
      list.push("Moderate price stability");
    }

    if (list.length === 0) {
      list.push("Recommended based on balanced MCDM score metrics");
    }

    return list;
  }, [individualScores]);

  return (
    <div className="space-y-1.5">
      {justifications.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}
