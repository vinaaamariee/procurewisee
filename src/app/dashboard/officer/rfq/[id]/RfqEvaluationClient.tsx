"use client";

import React, { useState, useMemo } from "react";
import {
  Sliders,
  RotateCcw,
  Printer,
  TrendingUp,
  TrendingDown,
  Minus,
  TrendingUpDown,
  FileCheck,
  UserCheck,
  Scale,
} from "lucide-react";
import { generateRecommendations } from "@/app/actions/recommendations";
import DocumentLayout from "@/components/documents/DocumentLayout";
import {
  calculatePriceScore,
  calculateDeliveryScore,
  calculateReliabilityScore,
  calculateComplianceScore,
  calculateHistoricalPerformanceScore,
} from "@/lib/recommendation/scoring";
import RecommendationPanel from "@/components/recommendation/RecommendationPanel";
import SupplierRankingTable from "@/components/recommendation/SupplierRankingTable";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";

interface QuoteMetric {
  quoteId: number;
  supplierId: number;
  supplierName: string;
  price: number;
  deliveryDays: number;
  historicalDeliveryDays: number;
  totalDeliveriesCount: number;
  lateDeliveriesCount: number;
  reliabilityRating?: number;
  qualityComplianceRate?: number;
  isVerified: boolean;
  tin: string | null;
  businessAddress: string | null;
  contactNumber: string | null;
  contactPerson: string | null;
  evaluations: any[];
  purchaseOrders: any[];
  pricesList: number[];
}

interface ForecastInfo {
  forecastPrice: number | null;
  forecastTrend: "increasing" | "decreasing" | "stable" | "unknown";
  expectedChange: string | null;
  historicalAvgPrice?: number;
  historicalMinPrice?: number;
  historicalLatestPrice?: number;
}

interface RfqEvaluationClientProps {
  rfq: any;
  quoteMetrics: QuoteMetric[];
  initialRecommendations: any[];
  forecastInfo: ForecastInfo;
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getConfidenceLabel(percentage: number): "High" | "Medium" | "Low" {
  if (percentage >= 90) return "High";
  if (percentage >= 70) return "Medium";
  return "Low";
}

export default function RfqEvaluationClient({
  rfq,
  quoteMetrics,
  initialRecommendations,
  forecastInfo,
}: RfqEvaluationClientProps) {

  const [priceWeight, setPriceWeight] = useState(40);
  const [deliveryWeight, setDeliveryWeight] = useState(20);
  const [reliabilityWeight, setReliabilityWeight] = useState(20);
  const [complianceWeight, setComplianceWeight] = useState(10);
  const [historicalWeight, setHistoricalWeight] = useState(10);

  const [savedRecommendationId, setSavedRecommendationId] =
    useState<number | null>(
      initialRecommendations?.length ? initialRecommendations[0].id : null
    );

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentRfqStatus, setCurrentRfqStatus] = useState(rfq.status);

  const handleResetWeights = () => {
    setPriceWeight(40);
    setDeliveryWeight(20);
    setReliabilityWeight(20);
    setComplianceWeight(10);
    setHistoricalWeight(10);
  };

  const normalizedWeights = useMemo(() => {
    const total =
      priceWeight +
      deliveryWeight +
      reliabilityWeight +
      complianceWeight +
      historicalWeight;

    if (!total) {
      return {
        price: 0,
        delivery: 0,
        reliability: 0,
        compliance: 0,
        historicalPerformance: 0,
      };
    }

    return {
      price: priceWeight / total,
      delivery: deliveryWeight / total,
      reliability: reliabilityWeight / total,
      compliance: complianceWeight / total,
      historicalPerformance: historicalWeight / total,
    };
  }, [
    priceWeight,
    deliveryWeight,
    reliabilityWeight,
    complianceWeight,
    historicalWeight,
  ]);

  /* --------------------------
     (SCORING LOGIC UNCHANGED)
     -------------------------- */

  const scoredSuppliers = useMemo(() => {
    if (quoteMetrics.length === 0) return [];

    const prices = quoteMetrics.map((qm) => qm.price);
    const minPrice = Math.min(...prices);

    const deliveries = quoteMetrics.map((qm) => qm.deliveryDays);
    const minDeliveryDays = Math.min(...deliveries);

    const result = quoteMetrics.map((qm) => {
      const priceScore = calculatePriceScore(qm.price, minPrice);

      const deliveryScore = calculateDeliveryScore({
        historicalDeliveryDays: qm.deliveryDays,
        totalDeliveries: qm.totalDeliveriesCount,
        lateDeliveries: qm.lateDeliveriesCount,
        minDeliveryDays,
      });

      const evaluations = qm.evaluations || [];
      let ratingsSum = 0;
      let ratingsCount = 0;
      let docSum = 0;
      let docCount = 0;

      evaluations.forEach((ev: any) => {
        const fields = [
          ev.productQuality,
          ev.deliveryCompliance,
          ev.accuracy,
          ev.responsiveness,
          ev.communication,
          ev.costEffectiveness,
          ev.overallSatisfaction,
          ev.rfqResponsiveness,
          ev.competitivePricing,
          ev.specificationCompliance,
          ev.documentCompliance,
          ev.deliveryPerformance,
        ];

        fields.forEach((f) => {
          if (f !== null && f !== undefined) {
            ratingsSum += f;
            ratingsCount++;
          }
        });

        if (ev.documentCompliance !== null && ev.documentCompliance !== undefined) {
          docSum += ev.documentCompliance;
          docCount++;
        }
      });

      const avgEvaluationRating =
        ratingsCount > 0 ? ratingsSum / ratingsCount : undefined;

      const avgDocumentCompliance =
        docCount > 0 ? docSum / docCount : null;

      const nonDraftPos = qm.purchaseOrders.filter(
        (po) => po.status !== "Draft"
      );

      const completedPos = nonDraftPos.filter(
        (po) => po.status === "Delivered" || po.status === "Closed"
      );

      const reliabilityScore = calculateReliabilityScore({
        reliabilityRating: qm.reliabilityRating,
        hasEvaluations: evaluations.length > 0,
        avgEvaluationRating,
        qualityComplianceRate: qm.qualityComplianceRate,
        totalPOs: nonDraftPos.length,
        completedPOs: completedPos.length,
      });

      const complianceScore = calculateComplianceScore({
        isVerified: qm.isVerified,
        tin: qm.tin,
        businessAddress: qm.businessAddress,
        contactNumber: qm.contactNumber,
        avgDocumentCompliance,
      });

      const historicalPerformanceScore =
        calculateHistoricalPerformanceScore({
          historicalPrices: qm.pricesList,
          currentPrice: qm.price,
          forecastPrice: forecastInfo.forecastPrice,
        });

      const overallScore =
        priceScore * normalizedWeights.price +
        deliveryScore * normalizedWeights.delivery +
        reliabilityScore * normalizedWeights.reliability +
        complianceScore * normalizedWeights.compliance +
        historicalPerformanceScore *
          normalizedWeights.historicalPerformance;

      let confidence = 75;
      const confidenceLabel = getConfidenceLabel(confidence);

      return {
        quoteId: qm.quoteId,
        supplierId: qm.supplierId,
        supplierName: qm.supplierName,
        price: qm.price,
        deliveryDays: qm.deliveryDays,
        overallScore: Math.round(overallScore * 100) / 100,
        confidence,
        confidenceLabel,
        reasons: ["Recommended based on balanced MCDM score metrics"],
        individualScores: {
          priceScore,
          deliveryScore,
          reliabilityScore,
          complianceScore,
          historicalPerformanceScore,
        },
      };
    });

    return [...result].sort((a, b) => b.overallScore - a.overallScore);
  }, [quoteMetrics, normalizedWeights, forecastInfo.forecastPrice]);

  const topScored = scoredSuppliers[0] || null;

  const handleAwardCanvass = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await generateRecommendations(rfq.id, normalizedWeights);
      if (res.success) {
        setSuccessMsg("Canvass evaluated successfully.");
        setCurrentRfqStatus("Evaluated");
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  /* --------------------------
       UPDATED CLEAN LAYOUT
     -------------------------- */

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* LEFT MAIN COLUMN */}
        <div className="space-y-6 lg:col-span-2">

          {/* RFQ Metadata */}
          <Card className="p-6 flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                RFQ Reference
              </span>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                {rfq.rfqNumber}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {rfq.title}
              </p>
            </div>

            <div className="text-right space-y-2">
              <div className="text-xs text-[var(--text-muted)]">
                Approved Budget (ABC)
              </div>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {formatCurrency(Number(rfq.approvedBudgetContract))}
              </div>
              <StatusBadge status={currentRfqStatus} />
            </div>
          </Card>

          {/* Recommendation Panel */}
          {topScored ? (
            <RecommendationPanel
              topRecommendation={topScored as any}
              savedRecommendationId={savedRecommendationId}
              forecastInfo={forecastInfo}
            />
          ) : (
            <Card className="p-6 text-center text-[var(--text-muted)]">
              No award recommendation generated yet.
            </Card>
          )}

          {/* Rankings Table */}
          <SupplierRankingTable
            rankings={scoredSuppliers as any}
            weights={normalizedWeights}
          />
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6 lg:col-span-1">

          {/* Sensitivity Panel */}
          <Card className="p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                Sensitivity Analysis
              </h3>
              <button
                onClick={handleResetWeights}
                className="text-xs font-bold uppercase flex items-center gap-1 text-muted-foreground hover:text-[var(--accent)]"
              >
                <RotateCcw className="h-3 w-3" /> Defaults
              </button>
            </div>

            {[{
              label: "Price Weight",
              value: priceWeight,
              setter: setPriceWeight
            },{
              label: "Delivery Weight",
              value: deliveryWeight,
              setter: setDeliveryWeight
            },{
              label: "Reliability Weight",
              value: reliabilityWeight,
              setter: setReliabilityWeight
            },{
              label: "Compliance Weight",
              value: complianceWeight,
              setter: setComplianceWeight
            },{
              label: "Historical Weight",
              value: historicalWeight,
              setter: setHistoricalWeight
            }].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={item.value}
                  onChange={(e) =>
                    item.setter(parseInt(e.target.value))
                  }
                  className="w-full accent-[var(--accent)]"
                />
              </div>
            ))}
          </Card>

          {/* Decision Actions */}
          <Card className="p-6 space-y-4">
            {successMsg && (
              <div className="text-sm font-semibold text-emerald-600">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="text-sm font-semibold text-red-600">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleAwardCanvass}
              disabled={isSaving}
              className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              Finalize & Approve Canvass
            </button>

            <button
              onClick={handlePrint}
              className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-xs font-bold hover:bg-[var(--surface-hover)]"
            >
              Print BAC Report
            </button>
          </Card>

        </div>
      </div>
    </div>
  );
}