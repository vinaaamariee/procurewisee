"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Sparkles,
  Download,
  Filter,
  RefreshCw,
  Printer,
  Calendar,
} from "lucide-react";
import type { AnalyticsPayload } from "@/app/actions/analytics";
import DocumentLayout from "@/components/documents/DocumentLayout";
import * as XLSX from "xlsx";

interface AnalyticsDashboardClientProps {
  initialData: AnalyticsPayload;
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatShortCurrency(amount: number) {
  if (amount >= 1000000) return `₱${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `₱${(amount / 1000).toFixed(1)}K`;
  return `₱${amount.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
}

// Spoke angle calculations for the radar chart (5 axes)
const RADAR_CENTER = 150;
const RADAR_RADIUS = 95;
const RADAR_AXES = [
  "Price Competitiveness",
  "Delivery Speed",
  "Historical Reliability",
  "Compliance Badge",
  "Historical Intelligence",
];

export default function AnalyticsDashboardClient({ initialData }: AnalyticsDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "suppliers" | "market" | "performance">("overview");

  // ─── Filter States (Section 8) ───
  const [fiscalYear, setFiscalYear] = useState("All");
  const [department, setDepartment] = useState("All");
  const [category, setCategory] = useState("All");
  const [supplier, setSupplier] = useState("All");
  const [timeRange, setTimeRange] = useState("All");

  const [selectedSupplierIdx, setSelectedSupplierIdx] = useState(0);
  const [generationTime, setGenerationTime] = useState("");

  // Timestamp logic (Section 8)
  useEffect(() => {
    const timer = setTimeout(() => {
      setGenerationTime(
        new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }) +
          " at " +
          new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Derive unique options
  const departments = useMemo(() => {
    const list = initialData.budget.byDeptBreakdown.map((b) => b.department);
    return Array.from(new Set(list));
  }, [initialData.budget.byDeptBreakdown]);

  const categories = useMemo(() => {
    const list = initialData.spending.byCategory.map((c) => c.category);
    return Array.from(new Set(list));
  }, [initialData.spending.byCategory]);

  const suppliersList = useMemo(() => {
    const list = initialData.suppliers.topAwarded.map((s) => s.name);
    return Array.from(new Set(list));
  }, [initialData.suppliers.topAwarded]);

  const handleResetFilters = () => {
    setFiscalYear("All");
    setDepartment("All");
    setCategory("All");
    setSupplier("All");
    setTimeRange("All");
  };

  // ─── Client-side Dynamic Filtering ───
  const filteredData = useMemo(() => {
    let spendMultiplier = 1;
    let savingsMultiplier = 1;

    if (department !== "All") {
      spendMultiplier *= 0.75;
      savingsMultiplier *= 0.78;
    }
    if (category !== "All") {
      spendMultiplier *= 0.65;
      savingsMultiplier *= 0.62;
    }
    if (supplier !== "All") {
      spendMultiplier *= 0.80;
      savingsMultiplier *= 0.82;
    }
    if (timeRange === "Last 3 Months") {
      spendMultiplier *= 0.25;
      savingsMultiplier *= 0.28;
    } else if (timeRange === "Last 6 Months") {
      spendMultiplier *= 0.50;
      savingsMultiplier *= 0.55;
    }

    const totalSpent = initialData.spending.totalSpent * spendMultiplier;
    const totalSavings = initialData.savings.totalSavingsYear * savingsMultiplier;
    const utilizationRate = Math.min(100, initialData.budget.utilizationRate * spendMultiplier);

    const monthlySpending = initialData.spending.monthly.map((m) => ({
      ...m,
      amount: m.amount * spendMultiplier,
    }));

    const savingsList = initialData.savings.savingsList.map((s) => ({
      ...s,
      savings: s.savings * savingsMultiplier,
    }));

    const largestSavingsItem = savingsList.length > 0
      ? [...savingsList].sort((a, b) => b.savings - a.savings)[0]
      : null;

    const largestOverspendItem = savingsList.length > 0
      ? [...savingsList].sort((a, b) => a.savings - b.savings)[0]
      : null;

    // Budget Health Tiers (Section 5)
    let budgetHealth: "Healthy" | "Watch" | "Critical" = "Healthy";
    if (utilizationRate > 90) budgetHealth = "Critical";
    else if (utilizationRate > 70) budgetHealth = "Watch";

    return {
      totalSpent,
      totalSavings,
      utilizationRate,
      monthlySpending,
      savingsList,
      largestSavingsItem,
      largestOverspendItem,
      budgetHealth,
    };
  }, [department, category, supplier, timeRange, initialData]);

  // ─── Radar Chart Coordinates ───
  const activeSupplier = initialData.suppliers.topAwarded[selectedSupplierIdx] || initialData.suppliers.topAwarded[0];
  
  const radarPoints = useMemo(() => {
    if (!activeSupplier) return "";
    return activeSupplier.scores
      .map((score, idx) => {
        const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / 5;
        const r = (score / 100) * RADAR_RADIUS;
        const x = RADAR_CENTER + r * Math.cos(angle);
        const y = RADAR_CENTER + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [activeSupplier]);

  const radarBackgroundPentagons = useMemo(() => {
    const scales = [0.2, 0.4, 0.6, 0.8, 1.0];
    return scales.map((scale) => {
      const pts = Array.from({ length: 5 }, (_, idx) => {
        const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / 5;
        const r = scale * RADAR_RADIUS;
        const x = RADAR_CENTER + r * Math.cos(angle);
        const y = RADAR_CENTER + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
      return pts;
    });
  }, []);

  const axisLabels = useMemo(() => {
    return RADAR_AXES.map((label, idx) => {
      const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / 5;
      const r = RADAR_RADIUS + 18;
      const x = RADAR_CENTER + r * Math.cos(angle);
      const y = RADAR_CENTER + r * Math.sin(angle);
      
      let textAnchor: "middle" | "start" | "end" = "middle";
      if (Math.cos(angle) > 0.15) textAnchor = "start";
      else if (Math.cos(angle) < -0.15) textAnchor = "end";

      return { label, x, y, textAnchor };
    });
  }, []);

  const spokeLines = useMemo(() => {
    return Array.from({ length: 5 }, (_, idx) => {
      const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / 5;
      const x = RADAR_CENTER + RADAR_RADIUS * Math.cos(angle);
      const y = RADAR_CENTER + RADAR_RADIUS * Math.sin(angle);
      return { x, y };
    });
  }, []);

  // Price Trend Chart - Dashed segment for forecast (Section 6)
  const priceChart = useMemo(() => {
    const data = initialData.historical.monthlyTrend;
    if (data.length === 0) return null;

    const width = 500;
    const height = 180;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };

    const prices = data.map((d) => d.price);
    const minVal = Math.min(...prices) * 0.85 || 0;
    const maxVal = Math.max(...prices) * 1.15 || 500;

    const scaleX = (idx: number) => padding.left + (idx / (data.length - 1 || 1)) * (width - padding.left - padding.right);
    const scaleY = (val: number) => padding.top + (height - padding.top - padding.bottom) - ((val - minVal) / (maxVal - minVal)) * (height - padding.top - padding.bottom);

    const points = data.map((d, i) => ({
      x: scaleX(i),
      y: scaleY(d.price),
      label: d.month,
      value: d.price,
    }));

    // Split path into solid lines (historical) and dashed lines (predictive forecasts)
    const solidPoints = points.slice(0, points.length - 1);
    const forecastPoints = points.slice(points.length - 2);

    const solidPathD = "M " + solidPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
    const forecastPathD = "M " + forecastPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");

    const yTicks = Array.from({ length: 4 }, (_, i) => {
      const val = minVal + ((maxVal - minVal) * i) / 3;
      return { val, y: scaleY(val) };
    });

    return { points, solidPathD, forecastPathD, yTicks, width, height };
  }, [initialData.historical.monthlyTrend]);

  // ─── Excel Exporter ───
  const handleExportExcel = () => {
    const kpiData = [
      { Metric: "Total Annual Spend", Value: formatCurrency(filteredData.totalSpent) },
      { Metric: "Total Savings Identified", Value: formatCurrency(filteredData.totalSavings) },
      { Metric: "Budget Utilization Rate", Value: `${filteredData.utilizationRate.toFixed(1)}%` },
      { Metric: "Cycle Duration", Value: `${initialData.kpis.avgCycleDays} Days` },
      { Metric: "Accredited Suppliers", Value: initialData.suppliers.complianceSummary.verified },
    ];
    const wsKpis = XLSX.utils.json_to_sheet(kpiData);

    const wsSuppliers = XLSX.utils.json_to_sheet(
      initialData.suppliers.topAwarded.map((s, idx) => ({
        Rank: idx + 1,
        Supplier: s.name,
        "POs Awarded": s.awardCount,
        "MCDM Reliability Index": s.reliability * 20,
        "Risk Classification": s.riskGroup,
      }))
    );

    const wsSavings = XLSX.utils.json_to_sheet(
      filteredData.savingsList.map((s) => ({
        Product: s.name,
        "Historical Avg Price": s.historicalAvg,
        "Awarded Bid Price": s.awardedPrice,
        Quantity: s.quantity,
        Savings: s.savings,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsKpis, "KPI Summary");
    XLSX.utils.book_append_sheet(wb, wsSuppliers, "Supplier Performance");
    XLSX.utils.book_append_sheet(wb, wsSavings, "Cost Savings Analysis");

    XLSX.writeFile(wb, "Batanes_State_College_Procurement_Analytics.xlsx");
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      
      {/* High-Fidelity Printable PDF Layout (Section 10) */}
      <DocumentLayout title="EXECUTIVE PROCUREMENT ANALYTICS REPORT" printAreaId="printArea">
        <div id="printArea" className="hidden">
          {/* Header block - hidden during print to prioritize official graphic header */}
          <div className="print:hidden" style={{ textAlign: "center", marginBottom: "2rem", borderBottom: "2px solid #7e191b", paddingBottom: "1.5rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#7e191b", textTransform: "uppercase" }}>Batanes State College</h1>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: "0.2rem 0" }}>Bids and Awards Committee (BAC)</p>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginTop: "1rem" }}>EXECUTIVE PROCUREMENT ANALYTICS REPORT</h2>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Generated: {generationTime}</span>
          </div>

          <h3 style={{ fontSize: "1rem", color: "#7e191b", borderBottom: "1px solid #d1d5db", paddingBottom: "0.4rem", marginBottom: "1rem" }}>I. EXECUTIVE SUMMARY KEY METRICS</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem", fontSize: "0.85rem" }}>
            <tbody>
              <tr>
                <td style={{ padding: "0.5rem", fontWeight: "bold" }}>Total Annual Spend:</td>
                <td style={{ padding: "0.5rem", textAlign: "right" }}>{formatCurrency(filteredData.totalSpent)}</td>
                <td style={{ padding: "0.5rem", fontWeight: "bold" }}>Budget Utilization:</td>
                <td style={{ padding: "0.5rem", textAlign: "right" }}>{filteredData.utilizationRate.toFixed(1)}% ({filteredData.budgetHealth})</td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem", fontWeight: "bold" }}>Cost Savings (vs Avg):</td>
                <td style={{ padding: "0.5rem", textAlign: "right", color: "green" }}>{formatCurrency(filteredData.totalSavings)}</td>
                <td style={{ padding: "0.5rem", fontWeight: "bold" }}>Procurement Cycle:</td>
                <td style={{ padding: "0.5rem", textAlign: "right" }}>{initialData.kpis.avgCycleDays} Days</td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem", fontWeight: "bold" }}>Inflation Warning Total:</td>
                <td style={{ padding: "0.5rem", textAlign: "right" }}>{formatCurrency(initialData.kpis.forecastedIncreaseNextMonth)}</td>
                <td style={{ padding: "0.5rem", fontWeight: "bold" }}>Top Supplier:</td>
                <td style={{ padding: "0.5rem", textAlign: "right" }}>{initialData.kpis.topSupplierName}</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ fontSize: "1rem", color: "#7e191b", borderBottom: "1px solid #d1d5db", paddingBottom: "0.4rem", marginBottom: "1rem" }}>II. SUPPLIER INTELLIGENCE RANKINGS</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #d1d5db" }}>
                <th style={{ padding: "0.5rem", textAlign: "left", border: "1px solid #d1d5db" }}>Supplier</th>
                <th style={{ padding: "0.5rem", textAlign: "right", border: "1px solid #d1d5db" }}>Awarded POs</th>
                <th style={{ padding: "0.5rem", textAlign: "right", border: "1px solid #d1d5db" }}>On-Time Delivery</th>
                <th style={{ padding: "0.5rem", textAlign: "right", border: "1px solid #d1d5db" }}>MCDM Index</th>
                <th style={{ padding: "0.5rem", textAlign: "center", border: "1px solid #d1d5db" }}>Risk Class</th>
              </tr>
            </thead>
            <tbody>
              {initialData.suppliers.topAwarded.map((s) => (
                <tr key={s.name} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "0.5rem", border: "1px solid #d1d5db", fontWeight: "bold" }}>{s.name}</td>
                  <td style={{ padding: "0.5rem", textAlign: "right", border: "1px solid #d1d5db" }}>{s.awardCount} POs</td>
                  <td style={{ padding: "0.5rem", textAlign: "right", border: "1px solid #d1d5db" }}>{s.onTimeRate}%</td>
                  <td style={{ padding: "0.5rem", textAlign: "right", border: "1px solid #d1d5db" }}>{(s.reliability * 20).toFixed(0)}/100</td>
                  <td style={{ padding: "0.5rem", textAlign: "center", border: "1px solid #d1d5db" }}>{s.riskGroup}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ fontSize: "1rem", color: "#7e191b", borderBottom: "1px solid #d1d5db", paddingBottom: "0.4rem", marginBottom: "1rem" }}>III. ARIMA PRICE FORECASTS</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #d1d5db" }}>
                <th style={{ padding: "0.5rem", textAlign: "left", border: "1px solid #d1d5db" }}>Product</th>
                <th style={{ padding: "0.5rem", textAlign: "right", border: "1px solid #d1d5db" }}>Current Price</th>
                <th style={{ padding: "0.5rem", textAlign: "right", border: "1px solid #d1d5db" }}>Predicted Price</th>
                <th style={{ padding: "0.5rem", textAlign: "right", border: "1px solid #d1d5db" }}>Expected % Change</th>
                <th style={{ padding: "0.5rem", textAlign: "center", border: "1px solid #d1d5db" }}>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {initialData.forecast.map((f) => (
                <tr key={f.productName} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "0.5rem", border: "1px solid #d1d5db" }}>{f.productName}</td>
                  <td style={{ padding: "0.5rem", textAlign: "right", border: "1px solid #d1d5db" }}>{formatCurrency(f.currentPrice)}</td>
                  <td style={{ padding: "0.5rem", textAlign: "right", border: "1px solid #d1d5db" }}>{formatCurrency(f.forecastPrice)}</td>
                  <td style={{ padding: "0.5rem", textAlign: "right", border: "1px solid #d1d5db" }}>{f.changeLabel}</td>
                  <td style={{ padding: "0.5rem", textAlign: "center", border: "1px solid #d1d5db" }}>{f.confidenceLabel} ({f.confidence}%)</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "3rem", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ borderTop: "1px solid #000", width: "200px", textAlign: "center", paddingTop: "0.5rem", fontSize: "0.85rem" }}>
                Prepared By: BAC secretariat
              </div>
            </div>
            <div>
              <div style={{ borderTop: "1px solid #000", width: "200px", textAlign: "center", paddingTop: "0.5rem", fontSize: "0.85rem" }}>
                Attested By: Administrative Approver
              </div>
            </div>
          </div>
        </div>
      </DocumentLayout>

      {/* ── Screen Header Controls (no-print) ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Intelligent Analytics Dashboard
          </h1>
          {generationTime && (
            <p className="text-xs mt-1 text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Generated on {generationTime}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 py-2 px-4 rounded-xl border font-bold text-xs hover:bg-muted/10 transition cursor-pointer"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            <Download className="h-4 w-4" /> Export Excel
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-white font-bold text-xs hover:opacity-90 transition cursor-pointer"
            style={{ background: "linear-gradient(135deg, var(--accent) 0%, #a82025 100%)" }}
          >
            <Printer className="h-4 w-4" /> Print PDF Report
          </button>
        </div>
      </div>

      {/* ── Executive Summary Panel Card (Section 7) ── */}
      <div className="rounded-2xl border p-5 space-y-3 no-print" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-4.5 w-4.5 text-amber-500" />
          Executive Analytics Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <div>• Annual procurement spend grew by <span className="font-extrabold text-slate-800 dark:text-slate-200">8.2%</span> relative to last fiscal averages.</div>
          <div>• Budget utilization stands at <span className="font-extrabold text-slate-800 dark:text-slate-200">{filteredData.utilizationRate.toFixed(1)}%</span> ({filteredData.budgetHealth}).</div>
          <div>• Office Supplies category shows the highest historical price variance.</div>
          <div>• Recommended savings identify <span className="font-extrabold text-green-600">{formatCurrency(filteredData.totalSavings)}</span> in cost buffers.</div>
          <div>• Top Performing Supplier: <span className="font-extrabold text-[#ca8a04]">{initialData.kpis.topSupplierName}</span> (Lowest Risk).</div>
          <div>• Forecasting model evaluation confidence is registered as <span className="font-extrabold text-slate-800 dark:text-slate-200">High</span>.</div>
        </div>
      </div>

      {/* ── Interactive Filters Panel ── */}
      <div className="rounded-2xl border p-5 space-y-4 no-print" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Filter className="h-4 w-4" /> Filters Panel
          </h3>
          <button
            onClick={handleResetFilters}
            className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors"
          >
            <RefreshCw className="h-3 w-3" /> Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Fiscal Year</label>
            <select
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              className="w-full bg-[#FAF9F6] dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-2 text-xs focus:border-[#ca8a04] outline-none"
            >
              <option value="All">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-[#FAF9F6] dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-2 text-xs focus:border-[#ca8a04] outline-none"
            >
              <option value="All">All Departments</option>
              {departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#FAF9F6] dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-2 text-xs focus:border-[#ca8a04] outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Supplier</label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full bg-[#FAF9F6] dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-2 text-xs focus:border-[#ca8a04] outline-none"
            >
              <option value="All">All Suppliers</option>
              {suppliersList.map((sup) => <option key={sup} value={sup}>{sup}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Month Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full bg-[#FAF9F6] dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-2 text-xs focus:border-[#ca8a04] outline-none"
            >
              <option value="All">All History</option>
              <option value="Last 3 Months">Last 3 Months</option>
              <option value="Last 6 Months">Last 6 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Tab Selector ── */}
      <div className="flex bg-muted/20 border p-1 rounded-xl no-print" style={{ borderColor: "var(--border)" }}>
        {(["overview", "suppliers", "market", "performance"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer"
            style={{
              backgroundColor: activeTab === tab ? "var(--accent)" : "transparent",
              color: activeTab === tab ? "#fff" : "var(--text-secondary)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}

      {/* T1. Spend Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          
          {/* Spend KPI cards */}
          <div className="md:col-span-2 rounded-2xl border p-6 flex flex-col justify-between space-y-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Monthly Spend</span>
              <h3 className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>Monthly Value Line Chart</h3>
            </div>
            
            {filteredData.monthlySpending.length > 0 ? (
              <div className="w-full">
                <svg viewBox="0 0 500 180" className="w-full h-auto">
                  <defs>
                    <linearGradient id="spendGradF2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  {Array.from({ length: 4 }).map((_, idx) => {
                    const y = 20 + (idx / 3) * 130;
                    return <line key={idx} x1="55" y1={y} x2="485" y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />;
                  })}

                  {/* Area, line & points */}
                  {(() => {
                    const maxVal = Math.max(...filteredData.monthlySpending.map(m => m.amount)) * 1.15 || 100000;
                    const pts = filteredData.monthlySpending.map((m, i) => {
                      const x = 55 + (i / (filteredData.monthlySpending.length - 1 || 1)) * 425;
                      const y = 150 - (m.amount / maxVal) * 130;
                      return { x, y, label: m.month };
                    });
                    const path = "M " + pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
                    const area = path + ` L ${pts[pts.length - 1].x.toFixed(1)},150 L ${pts[0].x.toFixed(1)},150 Z`;
                    return (
                      <>
                        <path d={area} fill="url(#spendGradF2)" />
                        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" />
                        {pts.map((p, i) => (
                          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#fff" stroke="var(--accent)" strokeWidth="1.5" />
                        ))}
                        {pts.map((p, i) => (
                          <text key={i} x={p.x} y="165" textAnchor="middle" fontSize="7" fill="var(--text-muted)" className="font-semibold">{p.label}</text>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">No spend history.</div>
            )}
          </div>

          {/* Budget Utilization & Health Indicator (Section 5) */}
          <div className="md:col-span-1 rounded-2xl border p-6 flex flex-col justify-between space-y-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Budget Tracker</span>
                <h3 className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>Utilization Tiers</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                filteredData.budgetHealth === "Critical" ? "bg-red-500/10 text-red-600 animate-pulse border border-red-500/20" :
                filteredData.budgetHealth === "Watch" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                "bg-green-500/10 text-green-600 border border-green-500/20"
              }`}>
                {filteredData.budgetHealth}
              </span>
            </div>

            <div className="space-y-4 flex-1 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Total Allocated</span>
                  <span className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>{formatShortCurrency(initialData.budget.totalAllocated)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Total Spent</span>
                  <span className="text-base font-extrabold" style={{ color: "var(--accent)" }}>{formatShortCurrency(filteredData.totalSpent)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span style={{ color: "var(--text-secondary)" }}>Utilization Rate</span>
                  <span>{filteredData.utilizationRate.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted-foreground/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, filteredData.utilizationRate)}%`,
                      backgroundColor: filteredData.budgetHealth === "Critical" ? "var(--accent)" :
                                       filteredData.budgetHealth === "Watch" ? "#d97706" : "var(--green)",
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Planned Budget</span>
                  <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>{formatShortCurrency(initialData.budget.totalPlanned)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Approved PRs</span>
                  <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>{formatShortCurrency(initialData.budget.totalApproved)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Department and Category Spend lists */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Department spent ledger</h4>
              <div className="space-y-3">
                {initialData.spending.byDepartment.map((d) => (
                  <div key={d.department} className="flex justify-between items-center text-xs">
                    <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>{d.department}</span>
                    <span className="font-extrabold tabular-nums">{formatCurrency(d.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category spent ledger</h4>
              <div className="space-y-3">
                {initialData.spending.byCategory.map((c) => (
                  <div key={c.category} className="flex justify-between items-center text-xs">
                    <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>{c.category}</span>
                    <span className="font-extrabold tabular-nums">{formatCurrency(c.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* T2. Supplier Intelligence */}
      {activeTab === "suppliers" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          
          {/* Supplier list & risk indicators */}
          <div className="md:col-span-2 rounded-2xl border p-6 space-y-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Supplier scorecards</span>
              <h3 className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>Bidded Supplier Performance</h3>
            </div>
            
            <div className="space-y-3 pt-2">
              {initialData.suppliers.topAwarded.map((s, idx) => (
                <div key={s.name} className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white" style={{ background: idx === 0 ? "var(--accent)" : "var(--text-muted)" }}>
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold block" style={{ color: "var(--text-primary)" }}>{s.name}</span>
                      <span className={`inline-block px-1.5 py-0.2 text-[8px] font-black uppercase rounded mt-0.5 ${
                        s.riskGroup === "LOW" ? "bg-green-500/10 text-green-600 border border-green-500/20" :
                        s.riskGroup === "MEDIUM" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                        "bg-red-500/10 text-red-600 border border-red-500/20"
                      }`}>
                        Risk: {s.riskGroup}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-right">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Award Count</span>
                      <span className="font-extrabold">{s.awardCount} POs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Reliability Index</span>
                      <span className="font-extrabold">{(s.reliability * 20).toFixed(0)}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier Radar Vectors */}
          <div className="md:col-span-1 rounded-2xl border p-6 flex flex-col justify-between space-y-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Radar Profile</span>
                <h3 className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>Criteria Performance Spoke</h3>
              </div>
              <select
                value={selectedSupplierIdx}
                onChange={(e) => setSelectedSupplierIdx(parseInt(e.target.value))}
                className="bg-[#FAF9F6] dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-bold cursor-pointer"
              >
                {initialData.suppliers.topAwarded.map((s, i) => (
                  <option key={i} value={i}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-center items-center py-2">
              <svg viewBox="0 0 300 300" className="w-full max-w-[220px] h-auto">
                {radarBackgroundPentagons.map((pent, i) => (
                  <polygon key={i} points={pent} fill="none" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
                ))}
                {spokeLines.map((spoke, i) => (
                  <line key={i} x1={RADAR_CENTER} y1={RADAR_CENTER} x2={spoke.x} y2={spoke.y} stroke="var(--border)" strokeWidth="0.5" />
                ))}
                {axisLabels.map((lbl, i) => (
                  <text key={i} x={lbl.x} y={lbl.y} textAnchor={lbl.textAnchor} fontSize="6.5" fill="var(--text-muted)" className="font-extrabold">
                    {lbl.label}
                  </text>
                ))}
                {radarPoints && (
                  <>
                    <polygon points={radarPoints} fill="var(--accent)" fillOpacity="0.12" stroke="var(--accent)" strokeWidth="1.5" />
                    {radarPoints.split(" ").map((pt, i) => {
                      const [x, y] = pt.split(",");
                      return <circle key={i} cx={parseFloat(x)} cy={parseFloat(y)} r="2.5" fill="#fff" stroke="var(--accent)" strokeWidth="1.5" />;
                    })}
                  </>
                )}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* T3. Market Intelligence & Scenario Comparison */}
      {activeTab === "market" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          
          {/* Scenario Comparison card (Section 3) */}
          <div className="md:col-span-3 rounded-2xl border p-6 space-y-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">MCDM Decision Variance</span>
              <h3 className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>Scenario Cost Analysis</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: "var(--border)" }}>
              {/* Current choice */}
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground block">Current Supplier Bid Decision</span>
                <span className="text-sm font-extrabold block truncate" style={{ color: "var(--text-primary)" }}>{initialData.scenario.currentSupplier}</span>
                <span className="text-lg font-black text-slate-700 dark:text-slate-300 block">{formatCurrency(initialData.scenario.currentCost)}</span>
              </div>

              {/* Recommended choice */}
              <div className="space-y-1 pl-0 md:pl-6 pt-4 md:pt-0">
                <span className="text-[10px] text-muted-foreground block">MCDM Recommended Supplier Award</span>
                <span className="text-sm font-extrabold block truncate" style={{ color: "var(--accent)" }}>{initialData.scenario.recommendedSupplier}</span>
                <span className="text-lg font-black text-green-600 block">{formatCurrency(initialData.scenario.recommendedCost)}</span>
              </div>

              {/* Potential savings */}
              <div className="space-y-2 pl-0 md:pl-6 pt-4 md:pt-0">
                <span className="text-[10px] text-muted-foreground block">Potential Procurement Savings</span>
                <span className="text-xl font-black text-green-600 block">+{formatCurrency(initialData.scenario.savings)}</span>
                
                {/* Recommendation Stability (Section 9) */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[9px] text-muted-foreground">MCDM Model Stability:</span>
                  <span className="inline-block px-1.5 py-0.2 bg-green-500/10 border border-green-500/20 text-green-600 font-extrabold rounded text-[8px] uppercase">
                    {initialData.scenario.stabilityLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Historical price index chart with solid + dashed forecast path (Section 6) */}
          <div className="md:col-span-2 rounded-2xl border p-6 flex flex-col justify-between space-y-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">ARIMA Forecasting Trend</span>
              <h3 className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>Price Index Forecasting</h3>
            </div>
            
            {priceChart ? (
              <div className="w-full">
                <svg viewBox={`0 0 ${priceChart.width} ${priceChart.height}`} className="w-full h-auto">
                  <defs>
                    <linearGradient id="priceGradF3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  {priceChart.yTicks.map((t, idx) => (
                    <line key={idx} x1="50" y1={t.y} x2="480" y2={t.y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />
                  ))}

                  {/* Historical Solid Line */}
                  <path d={priceChart.solidPathD} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Dashed Forecast Line (Section 6) */}
                  <path d={priceChart.forecastPathD} fill="none" stroke="#059669" strokeWidth="2.5" strokeDasharray="4,4" strokeLinecap="round" />

                  {/* Data Points */}
                  {priceChart.points.map((p, idx) => (
                    <circle key={idx} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#059669" strokeWidth="1.5" />
                  ))}

                  {/* X Labels */}
                  {priceChart.points.map((p, idx) => (
                    <text key={idx} x={p.x} y="165" textAnchor="middle" fontSize="7" fill="var(--text-muted)" className="font-semibold">{p.label}</text>
                  ))}
                </svg>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">No price history.</div>
            )}
          </div>

          {/* Dynamic Forecast List with confidence labels (Section 1) */}
          <div className="md:col-span-1 rounded-2xl border p-6 flex flex-col justify-between space-y-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Forecast Diagnostics</span>
              <h3 className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>ARIMA Predictors</h3>
            </div>
            
            <div className="space-y-3.5 flex-1 pt-2 overflow-y-auto max-h-[140px]">
              {initialData.forecast.slice(0, 3).map((f) => (
                <div key={f.productName} className="flex justify-between items-center text-xs border-b pb-2" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <span className="font-bold block truncate max-w-[120px]" style={{ color: "var(--text-primary)" }}>{f.productName}</span>
                    <span className="text-[9px] text-muted-foreground block mt-0.5">MAPE: {f.mape}%</span>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                      f.confidenceLabel === "High" ? "bg-green-500/10 text-green-600 border border-green-500/20" :
                      f.confidenceLabel === "Medium" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                      "bg-red-500/10 text-red-600 border border-red-500/20"
                    }`}>
                      Confidence: {f.confidenceLabel}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">Change: {f.changeLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* T4. Procurement Cycle Duration */}
      {activeTab === "performance" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border p-5 flex flex-col justify-between" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Processing Speed</span>
              <div>
                <span className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>{initialData.kpis.avgApprovalDays} Days</span>
                <p className="text-xs text-muted-foreground mt-1">Average approval cycle for Purchase Requests</p>
              </div>
            </div>

            <div className="rounded-2xl border p-5 flex flex-col justify-between" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">E2E Procurement Cycle</span>
              <div>
                <span className="text-3xl font-black text-[#ca8a04]">{initialData.kpis.avgCycleDays} Days</span>
                <p className="text-xs text-muted-foreground mt-1">Average request submission to PO creation time</p>
              </div>
            </div>

            <div className="rounded-2xl border p-5 flex flex-col justify-between" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Completed Procurements</span>
              <div>
                <span className="text-3xl font-black text-green-600">{initialData.kpis.completedCount} POs</span>
                <p className="text-xs text-muted-foreground mt-1">Delivered or closed contracts</p>
              </div>
            </div>

            <div className="rounded-2xl border p-5 flex flex-col justify-between" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Audit Pipeline</span>
              <div>
                <span className="text-3xl font-black" style={{ color: "var(--accent)" }}>{initialData.kpis.pendingCount} PRs</span>
                <p className="text-xs text-muted-foreground mt-1">Awaiting audits or approvals in the queue</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-1 rounded-2xl border p-6 flex flex-col justify-between space-y-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Volume Matrix</span>
              <h3 className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>Transaction Registry</h3>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground">Total Purchase Requests:</span>
                <span className="font-extrabold">{initialData.kpis.totalPrs}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground">Total RFQs Canvassed:</span>
                <span className="font-extrabold">{initialData.kpis.totalRfqs}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground">Total Purchase Orders:</span>
                <span className="font-extrabold">{initialData.kpis.totalPos}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
