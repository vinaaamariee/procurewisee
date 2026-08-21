"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
          ev.clearCommunication,
          ev.costEffectiveness,
          ev.valueForMoney,
          ev.wouldRecommend,
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
      } else {
        setErrorMsg(res.error ?? "Failed to finalize canvass. Please try again.");
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

          {/* RFQ Metadata Details & Visual Timeline Stepper */}
          <div className="space-y-6">
            <Card className="p-6 space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-[var(--border)] pb-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                    Solicitation Reference
                  </span>
                  <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">
                    {rfq.rfqNumber}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium">
                    {rfq.title}
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <div className="text-xs text-[var(--text-muted)] font-medium">
                    Approved Budget (ABC)
                  </div>
                  <div className="text-xl font-black text-[var(--text-primary)]">
                    {formatCurrency(Number(rfq.approvedBudgetContract))}
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={currentRfqStatus} />
                  </div>
                </div>
              </div>

              {/* Grid Metadata details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[var(--text-muted)] font-medium block">Originating Purchase Request</span>
                  <span className="font-bold mt-0.5 block">
                    {rfq.pr ? (
                      <Link
                        href={`/dashboard/officer/pr/${rfq.pr.id}`}
                        className="text-[var(--accent)] hover:underline"
                      >
                        {rfq.pr.prNumber}
                      </Link>
                    ) : (
                      'Standalone RFQ'
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-[var(--text-muted)] font-medium block">Office / Department</span>
                  <span className="font-semibold mt-0.5 text-[var(--text-primary)] block">
                    {rfq.pr?.office || rfq.pr?.department || 'N/A'}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[var(--text-muted)] font-medium block">PR Purpose</span>
                  <span className="mt-0.5 text-[var(--text-secondary)] block italic">
                    &ldquo;{rfq.pr?.purpose || 'N/A'}&rdquo;
                  </span>
                </div>

                <div>
                  <span className="text-[var(--text-muted)] font-medium block">Submission Deadline</span>
                  <span className="font-bold text-[var(--accent)] mt-0.5 block">
                    {rfq.deadlineDate
                      ? new Date(rfq.deadlineDate).toLocaleDateString('en-PH', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-[var(--text-muted)] font-medium block">Procurement Items Count</span>
                  <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">
                    {rfq.items?.length || 0} line item(s)
                  </span>
                </div>
              </div>

              {/* Stepper Timeline progress bar */}
              <div className="pt-4 border-t border-[var(--border)]">
                <div className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                  Solicitation Timeline
                </div>
                <div className="flex items-center justify-between w-full max-w-lg mx-auto py-2">
                  {[
                    { id: 'Draft', label: 'Draft' },
                    { id: 'Published', label: 'Published' },
                    { id: 'Closed', label: 'Closed' },
                    { id: 'Evaluated', label: 'Awarded' },
                  ].map((step, idx, arr) => {
                    const getStepActiveState = (stepId: string) => {
                      if (currentRfqStatus === 'Evaluated') return true;
                      if (currentRfqStatus === 'Closed') {
                        return stepId === 'Draft' || stepId === 'Published' || stepId === 'Closed';
                      }
                      if (currentRfqStatus === 'Published') {
                        return stepId === 'Draft' || stepId === 'Published';
                      }
                      return stepId === 'Draft';
                    };
                    
                    const isActive = getStepActiveState(step.id);
                    const isLast = idx === arr.length - 1;
                    return (
                      <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center gap-1.5 z-10 relative">
                          <div
                            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                              isActive
                                ? 'bg-[#800000] text-white border-[#800000] shadow-sm font-extrabold'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <span
                            className={`text-[10px] font-bold ${
                              isActive
                                ? 'text-[#800000] font-extrabold'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                        {!isLast && (
                          <div
                            className={`flex-1 h-0.5 -mt-4 transition-all duration-300 ${
                              getStepActiveState(arr[idx + 1].id)
                                ? 'bg-[#800000]'
                                : 'bg-gray-200 dark:bg-gray-800'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Recommendation Panel */}
          {topScored ? (
            <RecommendationPanel
              topRecommendation={(topScored as any)}
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
            rankings={(scoredSuppliers as any)}
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
              <div className="text-sm font-semibold text-[var(--accent)]">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="text-sm font-semibold text-[var(--accent)]">
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