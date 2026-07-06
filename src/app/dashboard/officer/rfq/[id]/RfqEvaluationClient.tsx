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
import {
  calculatePriceScore,
  calculateDeliveryScore,
  calculateReliabilityScore,
  calculateComplianceScore,
  calculateHistoricalPerformanceScore,
} from "@/lib/recommendation/scoring";
import RecommendationPanel from "@/components/recommendation/RecommendationPanel";
import SupplierRankingTable from "@/components/recommendation/SupplierRankingTable";

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
  // ─── Sensitivity Analysis weights states ───
  const [priceWeight, setPriceWeight] = useState(40);
  const [deliveryWeight, setDeliveryWeight] = useState(20);
  const [reliabilityWeight, setReliabilityWeight] = useState(20);
  const [complianceWeight, setComplianceWeight] = useState(10);
  const [historicalWeight, setHistoricalWeight] = useState(10);

  // ─── Saved Recommendation ID state for PO generation link ───
  const [savedRecommendationId, setSavedRecommendationId] = useState<number | null>(
    initialRecommendations && initialRecommendations.length > 0 ? initialRecommendations[0].id : null
  );

  // ─── Action Processing states ───
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentRfqStatus, setCurrentRfqStatus] = useState(rfq.status);

  // ─── Reset sliders helper ───
  const handleResetWeights = () => {
    setPriceWeight(40);
    setDeliveryWeight(20);
    setReliabilityWeight(20);
    setComplianceWeight(10);
    setHistoricalWeight(10);
  };

  // ─── Compute normalized weights (instant client-side math) ───
  const normalizedWeights = useMemo(() => {
    const total = priceWeight + deliveryWeight + reliabilityWeight + complianceWeight + historicalWeight;
    if (total === 0) {
      return { price: 0, delivery: 0, reliability: 0, compliance: 0, historicalPerformance: 0 };
    }
    return {
      price: priceWeight / total,
      delivery: deliveryWeight / total,
      reliability: reliabilityWeight / total,
      compliance: complianceWeight / total,
      historicalPerformance: historicalWeight / total,
    };
  }, [priceWeight, deliveryWeight, reliabilityWeight, complianceWeight, historicalWeight]);

  // ─── Recalculate supplier rankings on slider changes ───
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

      const avgEvaluationRating = ratingsCount > 0 ? ratingsSum / ratingsCount : undefined;
      const avgDocumentCompliance = docCount > 0 ? docSum / docCount : null;

      const nonDraftPos = qm.purchaseOrders.filter((po) => po.status !== "Draft");
      const completedPos = nonDraftPos.filter((po) => po.status === "Delivered" || po.status === "Closed");

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

      const historicalPerformanceScore = calculateHistoricalPerformanceScore({
        historicalPrices: qm.pricesList,
        currentPrice: qm.price,
        forecastPrice: forecastInfo.forecastPrice,
      });

      const overallScore =
        priceScore * normalizedWeights.price +
        deliveryScore * normalizedWeights.delivery +
        reliabilityScore * normalizedWeights.reliability +
        complianceScore * normalizedWeights.compliance +
        historicalPerformanceScore * normalizedWeights.historicalPerformance;

      let infoScore = 0;
      if (qm.tin) infoScore += 10;
      if (qm.businessAddress) infoScore += 5;
      if (qm.contactNumber) infoScore += 5;
      if (qm.contactPerson) infoScore += 5;

      let pHistScore = 0;
      if (qm.pricesList.length >= 6) pHistScore = 25;
      else if (qm.pricesList.length >= 3) pHistScore = 15;
      else if (qm.pricesList.length >= 1) pHistScore = 8;

      let dHistScore = 0;
      if (qm.totalDeliveriesCount > 0 || qm.historicalDeliveryDays > 0) dHistScore = 25;

      let eHistScore = 0;
      if (evaluations.length >= 3) eHistScore = 25;
      else if (evaluations.length >= 1) eHistScore = 15;

      const confidence = infoScore + pHistScore + dHistScore + eHistScore;
      const confidenceLabel = getConfidenceLabel(confidence);

      const explanations: string[] = [];
      if (priceScore >= 95) explanations.push("Lowest evaluated price among suppliers");
      else if (priceScore >= 80) explanations.push("Competitive price quote");

      if (deliveryScore >= 85) explanations.push("Excellent delivery performance");
      else if (deliveryScore >= 70) explanations.push("Satisfactory delivery speed and history");

      if (reliabilityScore >= 80) explanations.push("High supplier reliability");
      else if (reliabilityScore >= 60) explanations.push("Moderate supplier reliability");

      if (complianceScore >= 90) explanations.push("Complete compliance documents");
      else if (complianceScore >= 70) explanations.push("Adequate regulatory compliance");

      if (historicalPerformanceScore >= 80) explanations.push("Stable historical pricing trend");
      else if (historicalPerformanceScore >= 60) explanations.push("Moderate price stability");

      return {
        quoteId: qm.quoteId,
        supplierId: qm.supplierId,
        supplierName: qm.supplierName,
        price: qm.price,
        deliveryDays: qm.deliveryDays,
        overallScore: Math.round(overallScore * 100) / 100,
        confidence,
        confidenceLabel,
        reasons: explanations.length > 0 ? explanations : ["Recommended based on balanced MCDM score metrics"],
        individualScores: {
          priceScore: Math.round(priceScore * 100) / 100,
          deliveryScore: Math.round(deliveryScore * 100) / 100,
          reliabilityScore: Math.round(reliabilityScore * 100) / 100,
          complianceScore: Math.round(complianceScore * 100) / 100,
          historicalPerformanceScore: Math.round(historicalPerformanceScore * 100) / 100,
        },
      };
    });

    return [...result].sort((a, b) => b.overallScore - a.overallScore);
  }, [quoteMetrics, normalizedWeights, forecastInfo.forecastPrice]);

  const topScored = scoredSuppliers.length > 0 ? scoredSuppliers[0] : null;

  // ─── Save snapshot server action trigger ───
  const handleAwardCanvass = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const weightsParam = {
        price: normalizedWeights.price,
        delivery: normalizedWeights.delivery,
        reliability: normalizedWeights.reliability,
        compliance: normalizedWeights.compliance,
        historicalPerformance: normalizedWeights.historicalPerformance,
      };

      const res = await generateRecommendations(rfq.id, weightsParam);
      if (res.success && res.recommendations && res.recommendations.length > 0) {
        setSuccessMsg("Canvassing evaluated successfully! The MCDM recommendation snapshot has been saved to the permanent audit trail.");
        setCurrentRfqStatus("Evaluated");
        setSavedRecommendationId(res.recommendations[0].id);
      } else {
        setErrorMsg(res.error || "Failed to save recommendations.");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Dynamic Printing Container - hidden in normal browser screen */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printArea, #printArea * {
            visibility: visible;
          }
          #printArea {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 2rem;
            color: #000 !important;
            background: #fff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Printable Report Layout */}
      <div id="printArea" className="hidden">
        <div style={{ textAlign: "center", marginBottom: "2rem", borderBottom: "2px solid #7e191b", paddingBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#7e191b", textTransform: "uppercase" }}>Batanes State College</h1>
          <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: "0.2rem 0" }}>Bids and Awards Committee (BAC)</p>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginTop: "1rem" }}>BAC PROCUREMENT RECOMMENDATION REPORT</h2>
        </div>

        <div style={{ marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          <div><strong>RFQ Ref Number:</strong> {rfq.rfqNumber}</div>
          <div><strong>Project Title:</strong> {rfq.title}</div>
          <div><strong>Approved Budget for the Contract (ABC):</strong> {formatCurrency(Number(rfq.approvedBudgetContract))}</div>
          <div><strong>Evaluation Model:</strong> Multi-Criteria Decision-Making (MCDM) Weighted Scoring Model</div>
          <div><strong>Evaluation Date:</strong> {new Date().toLocaleDateString("en-PH")}</div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #d1d5db" }}>
              <th style={{ padding: "0.75rem", textAlign: "left", border: "1px solid #d1d5db" }}>Rank</th>
              <th style={{ padding: "0.75rem", textAlign: "left", border: "1px solid #d1d5db" }}>Supplier</th>
              <th style={{ padding: "0.75rem", textAlign: "right", border: "1px solid #d1d5db" }}>Quoted Price</th>
              <th style={{ padding: "0.75rem", textAlign: "center", border: "1px solid #d1d5db" }}>Lead Time</th>
              <th style={{ padding: "0.75rem", textAlign: "right", border: "1px solid #d1d5db" }}>MCDM Score</th>
            </tr>
          </thead>
          <tbody>
            {scoredSuppliers.map((s, idx) => (
              <tr key={s.supplierId} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "0.75rem", border: "1px solid #d1d5db" }}>{idx === 0 ? "🥇 Rank 1" : idx === 1 ? "🥈 Rank 2" : `🥉 Rank ${idx + 1}`}</td>
                <td style={{ padding: "0.75rem", border: "1px solid #d1d5db", fontWeight: "bold" }}>{s.supplierName}</td>
                <td style={{ padding: "0.75rem", textAlign: "right", border: "1px solid #d1d5db" }}>{formatCurrency(s.price)}</td>
                <td style={{ padding: "0.75rem", textAlign: "center", border: "1px solid #d1d5db" }}>{s.deliveryDays} days</td>
                <td style={{ padding: "0.75rem", textAlign: "right", border: "1px solid #d1d5db", fontWeight: "bold" }}>{s.overallScore} / 100</td>
              </tr>
            ))}
          </tbody>
        </table>

        {topScored && (
          <div style={{ padding: "1.5rem", border: "1px solid #7e191b", borderRadius: "10px", backgroundColor: "#fbf6f6", marginBottom: "3rem" }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#7e191b", fontWeight: 800 }}>AWARD RECOMMENDATION SUMMARY</h3>
            <div>Recommended Awardee: <strong>{topScored.supplierName}</strong></div>
            <div>Score Contribution Breakdown:</div>
            <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>
              <li>Price Score: {topScored.individualScores.priceScore} / 100 (Weighted: {(topScored.individualScores.priceScore * normalizedWeights.price).toFixed(1)} / {(normalizedWeights.price * 100).toFixed(0)})</li>
              <li>Delivery Score: {topScored.individualScores.deliveryScore} / 100 (Weighted: {(topScored.individualScores.deliveryScore * normalizedWeights.delivery).toFixed(1)} / {(normalizedWeights.delivery * 100).toFixed(0)})</li>
              <li>Reliability Score: {topScored.individualScores.reliabilityScore} / 100 (Weighted: {(topScored.individualScores.reliabilityScore * normalizedWeights.reliability).toFixed(1)} / {(normalizedWeights.reliability * 100).toFixed(0)})</li>
              <li>Compliance Score: {topScored.individualScores.complianceScore} / 100 (Weighted: {(topScored.individualScores.complianceScore * normalizedWeights.compliance).toFixed(1)} / {(normalizedWeights.compliance * 100).toFixed(0)})</li>
              <li>Historical Score: {topScored.individualScores.historicalPerformanceScore} / 100 (Weighted: {(topScored.individualScores.historicalPerformanceScore * normalizedWeights.historicalPerformance).toFixed(1)} / {(normalizedWeights.historicalPerformance * 100).toFixed(0)})</li>
            </ul>
            <div style={{ marginTop: "1rem" }}>
              <strong>Justification Log:</strong>
              {topScored.reasons.map((r, i) => (
                <div key={i}>✔ {r}</div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5rem" }}>
          <div>
            <div style={{ borderTop: "1px solid #000", width: "200px", textAlign: "center", paddingTop: "0.5rem" }}>
              Prepared By: BAC Secretariat
            </div>
          </div>
          <div>
            <div style={{ borderTop: "1px solid #000", width: "200px", textAlign: "center", paddingTop: "0.5rem" }}>
              Approved By: Administrative Approver
            </div>
          </div>
        </div>
      </div>

      {/* ─── Column 1 & 2: Main Evaluation view (Left, 2 cols width) ─── */}
      <div className="space-y-6 lg:col-span-2 no-print">
        {/* RFQ Metadata Header */}
        <div
          className="rounded-2xl border p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "var(--accent)" }}
            >
              RFQ Reference
            </span>
            <h2 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              {rfq.rfqNumber}
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {rfq.title}
            </p>
          </div>
          <div className="sm:text-right">
            <span className="text-xs text-muted-foreground block">Approved Budget (ABC)</span>
            <span className="text-lg font-black" style={{ color: "var(--text-primary)" }}>
              {formatCurrency(Number(rfq.approvedBudgetContract))}
            </span>
            <div className="mt-1">
              <span
                className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{
                  backgroundColor:
                    currentRfqStatus === "Evaluated"
                      ? "rgba(220,179,83,0.1)"
                      : currentRfqStatus === "Awarded"
                      ? "rgba(126,25,27,0.1)"
                      : "rgba(107,114,128,0.1)",
                  color:
                    currentRfqStatus === "Evaluated"
                      ? "#b88a1b"
                      : currentRfqStatus === "Awarded"
                      ? "#7e191b"
                      : "#4b5563",
                  border: `1px solid ${
                    currentRfqStatus === "Evaluated"
                      ? "rgba(220,179,83,0.3)"
                      : currentRfqStatus === "Awarded"
                      ? "rgba(126,25,27,0.2)"
                      : "rgba(107,114,128,0.2)"
                  }`,
                }}
              >
                Status: {currentRfqStatus}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Recommendation Panel above comparison table (Point 1 & 4) */}
        {topScored ? (
          <RecommendationPanel
            topRecommendation={topScored as any}
            savedRecommendationId={savedRecommendationId}
            forecastInfo={forecastInfo}
          />
        ) : (
          <div className="rounded-2xl border p-6 text-center text-muted-foreground">
            No award recommendation generated yet.
          </div>
        )}

        {/* 2. Supplier Rankings Table (Point 2) */}
        <SupplierRankingTable
          rankings={scoredSuppliers as any}
          weights={{
            price: normalizedWeights.price,
            delivery: normalizedWeights.delivery,
            reliability: normalizedWeights.reliability,
            compliance: normalizedWeights.compliance,
            historicalPerformance: normalizedWeights.historicalPerformance,
          }}
        />
      </div>

      {/* ─── Column 3: Sensitivity Analysis & Analytics Sidebar (Right, 1 col width) ─── */}
      <div className="space-y-6 lg:col-span-1 no-print">
        {/* Interactive Sensitivity Analysis Weight Adjuster */}
        <div
          className="rounded-2xl border p-6 space-y-6"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
              <Scale className="h-4 w-4 text-muted-foreground" />
              Sensitivity Analysis
            </h3>
            <button
              onClick={handleResetWeights}
              className="text-[10px] font-bold uppercase flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Defaults
            </button>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Drag sliders to adjust criteria weights. Rankings will update instantly on the screen based on the adjusted model.
          </p>

          <div className="space-y-4">
            {/* Price weight */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span style={{ color: "var(--text-primary)" }}>Price Quote Weight</span>
                <span>{priceWeight} / {(normalizedWeights.price * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={priceWeight}
                onChange={(e) => setPriceWeight(parseInt(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-red-800"
              />
            </div>

            {/* Delivery weight */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span style={{ color: "var(--text-primary)" }}>Delivery Speed Weight</span>
                <span>{deliveryWeight} / {(normalizedWeights.delivery * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={deliveryWeight}
                onChange={(e) => setDeliveryWeight(parseInt(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-yellow-600"
              />
            </div>

            {/* Reliability weight */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span style={{ color: "var(--text-primary)" }}>Reliability Weight</span>
                <span>{reliabilityWeight} / {(normalizedWeights.reliability * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={reliabilityWeight}
                onChange={(e) => setReliabilityWeight(parseInt(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>

            {/* Compliance weight */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span style={{ color: "var(--text-primary)" }}>Compliance Weight</span>
                <span>{complianceWeight} / {(normalizedWeights.compliance * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={complianceWeight}
                onChange={(e) => setComplianceWeight(parseInt(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Historical weight */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span style={{ color: "var(--text-primary)" }}>Historical Procurement Intelligence Weight</span>
                <span>{historicalWeight} / {(normalizedWeights.historicalPerformance * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={historicalWeight}
                onChange={(e) => setHistoricalWeight(parseInt(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>
          </div>
        </div>

        {/* Historical Price Intelligence & Forecasting Link */}
        <div
          className="rounded-2xl border p-6 space-y-4"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
            <TrendingUpDown className="h-4 w-4 text-muted-foreground" />
            Historical Price Intelligence
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average Historical Price:</span>
              <span className="font-bold">{forecastInfo.historicalAvgPrice ? formatCurrency(forecastInfo.historicalAvgPrice) : "₱—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lowest Historical Cost:</span>
              <span className="font-bold">{forecastInfo.historicalMinPrice ? formatCurrency(forecastInfo.historicalMinPrice) : "₱—"}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: "var(--border)" }}>
              <span className="text-muted-foreground">Latest Procured Price:</span>
              <span className="font-bold">{forecastInfo.historicalLatestPrice ? formatCurrency(forecastInfo.historicalLatestPrice) : "₱—"}</span>
            </div>

            <div className="pt-2 border-t space-y-1.5" style={{ borderColor: "var(--border)" }}>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ARIMA Forecast Direction:</span>
                <span
                  className="font-bold flex items-center gap-1"
                  style={{
                    color:
                      forecastInfo.forecastTrend === "increasing"
                        ? "var(--accent)"
                        : forecastInfo.forecastTrend === "decreasing"
                        ? "var(--green)"
                        : "var(--text-secondary)",
                  }}
                >
                  {forecastInfo.forecastTrend === "increasing" ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : forecastInfo.forecastTrend === "decreasing" ? (
                    <TrendingDown className="h-3.5 w-3.5" />
                  ) : (
                    <Minus className="h-3.5 w-3.5" />
                  )}
                  {forecastInfo.forecastTrend.toUpperCase()}
                </span>
              </div>
              {forecastInfo.expectedChange && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Change:</span>
                  <span
                    className="font-black px-1.5 py-0.5 rounded"
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

            {topScored && (
              <div className="pt-2 border-t flex justify-between items-center text-xs" style={{ borderColor: "var(--border)" }}>
                <span className="text-muted-foreground">Historical Contribution:</span>
                <span className="font-extrabold text-purple-600">
                  {(topScored.individualScores.historicalPerformanceScore * 0.10).toFixed(1)} / 1.0
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Decision & Report Exports Actions Panel */}
        <div
          className="rounded-2xl border p-6 space-y-4"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
            Decision Actions
          </h3>

          <div className="space-y-3">
            {successMsg && (
              <div className="p-3 text-xs rounded-xl bg-green-500/10 border border-green-500/20 text-green-700 font-semibold leading-relaxed">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 font-semibold leading-relaxed">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleAwardCanvass}
              disabled={isSaving || scoredSuppliers.length === 0}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white shadow transition-all duration-300 flex justify-center items-center gap-2"
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, #a82025 100%)",
                opacity: isSaving || scoredSuppliers.length === 0 ? 0.6 : 1,
                cursor: isSaving || scoredSuppliers.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Snapshot...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  Finalize & Approve Canvass
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              disabled={scoredSuppliers.length === 0}
              className="w-full py-2.5 px-4 rounded-xl border font-bold text-xs transition-all duration-300 flex justify-center items-center gap-2 hover:bg-muted/10"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-primary)",
                background: "transparent",
                cursor: scoredSuppliers.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              <Printer className="h-4 w-4" />
              Print BAC Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
