import Link from "next/link";
import { PrStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import { startTimer } from "@/lib/performance-logger";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import AddStaffForm from "./add-staff-form";
import ApproveButton from "./approve-button";
import {
  FileCheck2,
  Undo2,
  CalendarCheck2,
  Truck,
  AlertTriangle,
  ShieldCheck,
  FileText,
  CheckCircle2,
  TrendingUpDown,
} from "lucide-react";

export const metadata = { title: "Procurement Officer II Dashboard — ProcureWise" };

async function getProcurementOfficerIIStats() {
  const timer = startTimer("getProcurementOfficerIIStats");
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [pendingPrs, returnedPrs, verifiedToday, pendingDeliveries, partialDeliveries, deliveredCount] =
    await Promise.all([
      prisma.purchaseRequest.count({
        where: {
          status: { in: [PrStatus.Submitted, PrStatus.UnderReview, (PrStatus as any).PendingProcurementReview || "Submitted"] as any[] },
        },
      }),
      prisma.purchaseRequest.count({
        where: {
          status: { in: [(PrStatus as any).Returned || "ReturnedForRevision", PrStatus.ReturnedForRevision] as any[] },
        },
      }),
      prisma.purchaseRequest.count({
        where: { status: PrStatus.Approved, approvedAt: { gte: startOfDay } },
      }),
      prisma.purchaseOrder.count({
        where: { status: { in: ["Draft", "PendingApproval", "Approved", "SentToSupplier"] } },
      }),
      prisma.purchaseOrder.count({ where: { status: "PartiallyDelivered" } }),
      prisma.purchaseOrder.count({ where: { status: { in: ["Delivered", "Completed"] } } }),
    ]);
  timer.end();

  return {
    pendingPrs,
    returnedPrs,
    verifiedToday,
    pendingDeliveries,
    partialDeliveries,
    deliveredCount,
  };
}

async function getProcurementAlerts() {
  const timer = startTimer("getProcurementIIAlerts");

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const stalePrs = await prisma.purchaseRequest.findMany({
    where: {
      status: { in: [PrStatus.Submitted, PrStatus.UnderReview, (PrStatus as any).PendingProcurementReview || "Submitted"] as any[] },
      submittedAt: { lte: threeDaysAgo },
    },
    select: {
      id: true,
      prNumber: true,
      department: true,
      office: true,
      purpose: true,
      submittedAt: true,
    },
    orderBy: { submittedAt: "asc" },
    take: 5,
  });

  const overdueDeliveries = await prisma.purchaseOrder.findMany({
    where: {
      status: { in: ["Approved", "SentToSupplier"] },
      dateOfDelivery: { not: null, lte: threeDaysAgo },
    },
    select: {
      id: true,
      poNumber: true,
      supplier: { select: { companyName: true } },
      dateOfDelivery: true,
      totalCost: true,
    },
    orderBy: { dateOfDelivery: "asc" },
    take: 5,
  });

  const now = new Date();
  const stalePrsWithAge = stalePrs.map((pr) => ({
    ...pr,
    daysPending: Math.ceil((now.getTime() - (pr.submittedAt ? pr.submittedAt.getTime() : now.getTime())) / (1000 * 60 * 60 * 24)),
  }));

  timer.end();
  return { stalePrs: stalePrsWithAge, overdueDeliveries };
}

async function getRecentActivity() {
  const timer = startTimer("getProcurementIIRecentActivity");

  const recentlyVerified = await prisma.purchaseRequest.findMany({
    where: { status: PrStatus.Approved },
    select: {
      id: true,
      prNumber: true,
      department: true,
      office: true,
      approvedAt: true,
      reviewedBy: { select: { fullName: true } },
    },
    orderBy: { approvedAt: "desc" },
    take: 5,
  });

  timer.end();
  return { recentlyVerified };
}

async function getPendingRecommendations() {
  const timer = startTimer("getPendingRecommendations");
  const data = await prisma.recommendation.findMany({
    where: { approvalStatus: "Pending Review" },
    select: {
      id: true,
      compositeMcdmScore: true,
      priceScore: true,
      deliveryScore: true,
      reliabilityScore: true,
      rankPosition: true,
      justificationLog: true,
      approvalStatus: true,
      supplier: {
        select: {
          companyName: true,
        },
      },
      supplierQuote: {
        select: {
          rfqId: true,
          totalQuotedAmount: true,
        },
      },
    },
    orderBy: { rankPosition: "asc" },
    take: 5,
  });
  timer.end();

  return data.map((rec) => ({
    id: rec.id,
    compositeScore: rec.compositeMcdmScore,
    priceScore: rec.priceScore,
    deliveryScore: rec.deliveryScore,
    reliabilityScore: rec.reliabilityScore,
    rank: rec.rankPosition,
    reasoning: rec.justificationLog,
    approvalStatus: rec.approvalStatus,
    supplier: rec.supplier,
    quote: rec.supplierQuote
      ? {
          rfqId: rec.supplierQuote.rfqId,
          totalQuotedAmount: rec.supplierQuote.totalQuotedAmount,
        }
      : null,
  }));
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function ProcurementOfficerIIDashboard() {
  const { profile } = await requireRole("Administrative Approver");
  const [stats, alerts, activity, recs] = await Promise.all([
    getProcurementOfficerIIStats(),
    getProcurementAlerts(),
    getRecentActivity(),
    getPendingRecommendations(),
  ]);

  const statCards = [
    {
      label: "Pending Verification",
      value: stats.pendingPrs,
      desc: "PRs awaiting compliance verification",
      href: "/dashboard/approver/pr",
      Icon: FileCheck2,
      accentClass: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    },
    {
      label: "Returned for Compliance",
      value: stats.returnedPrs,
      desc: "Sent back to End Users for corrections",
      href: "/dashboard/approver/pr",
      Icon: Undo2,
      accentClass: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    },
    {
      label: "Verified Today",
      value: stats.verifiedToday,
      desc: "Approved and forwarded to Procurement Staff",
      href: "/dashboard/approver/history",
      Icon: CalendarCheck2,
      accentClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    },
    {
      label: "Pending Deliveries",
      value: stats.pendingDeliveries,
      desc: "POs not yet delivered",
      href: "/dashboard/approver/deliveries",
      Icon: Truck,
      accentClass: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    },
  ];

  return (
    <DashboardShell>
      <DashboardHeader profile={profile} displayRole="Procurement Officer II" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            desc={card.desc}
            href={card.href}
            Icon={card.Icon}
            accentClass={card.accentClass}
          />
        ))}
      </div>

      {/* Delivery Monitoring Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            label: "Pending Delivery",
            value: stats.pendingDeliveries,
            desc: "POs not yet delivered",
            accent: "border-amber-300/60 text-amber-700 dark:text-amber-300",
          },
          {
            label: "Partial Deliveries",
            value: stats.partialDeliveries,
            desc: "POs with partial receipt",
            accent: "border-blue-300/60 text-blue-700 dark:text-blue-300",
          },
          {
            label: "Delivered",
            value: stats.deliveredCount,
            desc: "Completed deliveries",
            accent: "border-emerald-300/60 text-emerald-700 dark:text-emerald-300",
          },
        ].map((d) => (
          <Link
            key={d.label}
            href="/dashboard/approver/deliveries"
            className="rounded-md border border-base-300 bg-base-100 p-4 flex items-center justify-between hover:bg-base-200/50 transition-colors"
          >
            <div className="text-left">
              <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/65">{d.label}</div>
              <div className={`text-2xl font-bold font-display ${d.accent}`}>{d.value}</div>
              <div className="text-[10px] text-base-content/50">{d.desc}</div>
            </div>
            <Truck className={`h-8 w-8 shrink-0 ${d.accent}`} />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Procurement Alerts */}
        <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-base-200 pb-3 text-left">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">Procurement Alerts</h3>
            </div>
            <Link href="/dashboard/approver/pr" className="text-xs font-bold text-primary hover:underline">
              View Queue
            </Link>
          </div>

          <div className="space-y-3">
            {alerts.stalePrs.length === 0 && alerts.overdueDeliveries.length === 0 && (
              <p className="text-xs text-base-content/60 py-4">No pending alerts. All verification and delivery targets are on track.</p>
            )}
            {alerts.stalePrs.map((pr) => (
              <Link key={pr.id} href={`/dashboard/approver/pr/${pr.id}`} className="block rounded-md border border-base-200 bg-base-200/40 p-3 hover:bg-base-200 transition-colors text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-primary">{pr.prNumber}</span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                    {pr.daysPending}d pending
                  </span>
                </div>
                <p className="text-xs text-base-content/70 mt-1 line-clamp-1">{pr.purpose}</p>
                <p className="text-[10px] text-base-content/50 mt-0.5">{pr.department} · {pr.office}</p>
              </Link>
            ))}
            {alerts.overdueDeliveries.map((po) => (
              <Link key={po.id} href="/dashboard/approver/deliveries" className="block rounded-md border border-base-200 bg-base-200/40 p-3 hover:bg-base-200 transition-colors text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-primary">{po.poNumber}</span>
                  <span className="text-[10px] font-bold text-red-700 dark:text-red-300">Overdue delivery</span>
                </div>
                <p className="text-xs text-base-content/70 mt-1">{po.supplier.companyName}</p>
                <p className="text-[10px] text-base-content/50 mt-0.5">
                  Due {po.dateOfDelivery ? new Date(po.dateOfDelivery).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Verification Activity */}
        <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-base-200 pb-3 text-left">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">Recent Verification Activity</h3>
            </div>
            <Link href="/dashboard/approver/history" className="text-xs font-bold text-primary hover:underline">
              View History
            </Link>
          </div>

          <div className="space-y-3">
            {activity.recentlyVerified.map((pr: any) => (
              <Link key={pr.id} href={`/dashboard/approver/pr/${pr.id}`} className="block rounded-md border border-base-200 bg-base-200/40 p-3 hover:bg-base-200 transition-colors text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-primary">{pr.prNumber}</span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    {pr.approvedAt ? new Date(pr.approvedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </span>
                </div>
                <p className="text-xs text-base-content/70 mt-1">{pr.department} · {pr.office}</p>
                <p className="text-[10px] text-base-content/50 mt-0.5">Verified by {pr.reviewedBy?.fullName || "Procurement Officer II"}</p>
              </Link>
            ))}
            {activity.recentlyVerified.length === 0 && (
              <p className="text-xs text-base-content/60 py-4">No verified Purchase Requests yet this period.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Supplier Award: Pending MCDM Recommendations ── */}
      <Card id="pending-reviews">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 flex-wrap gap-2">
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Pending MCDM Recommendations
          </h2>
          {recs.length > 0 && (
            <span className="rounded-full bg-[var(--bg-dark)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)] border border-[var(--border)]">
              {recs.length} awaiting review
            </span>
          )}
        </div>

        <div className="divide-y divide-[var(--border)] p-6 space-y-8">
          {recs.length === 0 ? (
            <EmptyState
              preset="rfq"
              title="No Pending Recommendations"
              description="All MCDM canvas recommendations have been reviewed. No submissions require approval at this time."
            />
          ) : (
            recs.map((rec: any) => {
              let snapshot: any;
              try {
                snapshot = JSON.parse(rec.reasoning);
              } catch (e) {
                snapshot = {
                  reason: rec.reasoning,
                  complianceScore: 100,
                  historicalPerformanceScore: 85,
                  confidence: 75,
                  confidenceLabel: "Medium",
                  expectedChange: null,
                  forecastTrend: "unknown",
                  weights: { price: 0.40, delivery: 0.20, reliability: 0.20, compliance: 0.10, historicalPerformance: 0.10 },
                };
              }

              const w = snapshot.weights || { price: 0.40, delivery: 0.20, reliability: 0.20, compliance: 0.10, historicalPerformance: 0.10 };
              const priceCont = (Number(rec.priceScore) * w.price).toFixed(1);
              const deliveryCont = (Number(rec.deliveryScore) * w.delivery).toFixed(1);
              const reliabilityCont = (Number(rec.reliabilityScore) * w.reliability).toFixed(1);
              const complianceCont = (snapshot.complianceScore * w.compliance).toFixed(1);
              const historicalCont = (snapshot.historicalPerformanceScore * w.historicalPerformance).toFixed(1);

              const priceLimit = (w.price * 100).toFixed(0);
              const deliveryLimit = (w.delivery * 100).toFixed(0);
              const reliabilityLimit = (w.reliability * 100).toFixed(0);
              const complianceLimit = (w.compliance * 100).toFixed(0);
              const historicalLimit = (w.historicalPerformance * 100).toFixed(0);

              const confidenceColorClass =
                snapshot.confidenceLabel === "High"
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : snapshot.confidenceLabel === "Medium"
                  ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
                  : "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20";

              return (
                <div
                  key={rec.id}
                  className="rounded-md border border-base-300 bg-base-100 overflow-hidden flex flex-col shadow-none hover:bg-base-200/40 transition-colors duration-100"
                >
                  {/* Card Header Banner */}
                  <div className="flex items-center justify-between px-6 py-4 bg-[var(--bg-dark)] border-b border-[var(--border)] flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded bg-primary text-white text-xs font-black shadow-none">
                        #{rec.rank}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">
                          {(rec.supplier as any)?.companyName ?? "Unknown Supplier"}
                        </h3>
                        <span className="text-xs text-[var(--text-muted)]">
                          Submitted for RFQ Ref: {rec.quote?.rfqId ? `RFQ-${rec.quote.rfqId}` : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">Overall MCDM Score</span>
                        <div className="text-lg font-black text-[var(--accent)]">
                          {Number(rec.compositeScore).toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">Quoted Price</span>
                        <div className="text-lg font-bold text-[var(--text-primary)]">
                          ₱{Number((rec.quote as any)?.totalQuotedAmount ?? 0).toLocaleString("en-PH")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
                    {/* Left: Criteria score progress bars */}
                    <div className="p-6 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        Explainable Criteria Breakdown (Normalized)
                      </h4>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-base-content">
                          <span>Price Score ({priceLimit}%)</span>
                          <span className="font-bold">{priceCont} / {priceLimit}</span>
                        </div>
                        <div className="h-2 w-full rounded bg-base-200 overflow-hidden">
                          <div className="h-full bg-primary rounded transition-all duration-300" style={{ width: `${rec.priceScore}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-base-content">
                          <span className="inline-flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Delivery</span>
                          <span className="font-bold">{deliveryCont} / {deliveryLimit}</span>
                        </div>
                        <div className="h-2 w-full rounded bg-base-200 overflow-hidden">
                          <div className="h-full bg-secondary rounded transition-all duration-300" style={{ width: `${rec.deliveryScore}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-base-content">
                          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Reliability</span>
                          <span className="font-bold">{reliabilityCont} / {reliabilityLimit}</span>
                        </div>
                        <div className="h-2 w-full rounded bg-base-200 overflow-hidden">
                          <div className="h-full bg-success rounded transition-all duration-300" style={{ width: `${rec.reliabilityScore}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-base-content">
                          <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Compliance</span>
                          <span className="font-bold">{complianceCont} / {complianceLimit}</span>
                        </div>
                        <div className="h-2 w-full rounded bg-base-200 overflow-hidden">
                          <div className="h-full bg-info rounded transition-all duration-300" style={{ width: `${snapshot.complianceScore}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-base-content">
                          <span>Historical performance</span>
                          <span className="font-bold">{historicalCont} / {historicalLimit}</span>
                        </div>
                        <div className="h-2 w-full rounded bg-base-200 overflow-hidden">
                          <div className="h-full bg-accent rounded transition-all duration-300" style={{ width: `${snapshot.historicalPerformanceScore}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Right: Justifications & Forecast Analytics */}
                    <div className="p-6 flex flex-col gap-6 justify-between">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                          Recommendation Justification
                        </h4>
                        <div className="space-y-2">
                          {snapshot.reason.split("\n").map((line: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-[var(--text-primary)]">
                              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 mt-0.5 shrink-0" />
                              <span>{line.replace(/^•\s*/, "")}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-md border border-base-300 bg-base-200 p-4 space-y-3">
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-base-content/75 flex items-center gap-1.5">
                          <TrendingUpDown className="h-4 w-4 text-[var(--accent)]" />
                          Historical Price Intelligence
                        </h5>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>Average: <strong className="text-[var(--text-primary)]">{snapshot.historicalAvgPrice ? formatCurrency(snapshot.historicalAvgPrice) : "N/A"}</strong></div>
                          <div>Lowest: <strong className="text-[var(--text-primary)]">{snapshot.historicalMinPrice ? formatCurrency(snapshot.historicalMinPrice) : "N/A"}</strong></div>
                          <div>Latest: <strong className="text-[var(--text-primary)]">{snapshot.historicalLatestPrice ? formatCurrency(snapshot.historicalLatestPrice) : "N/A"}</strong></div>
                          <div>Forecast: <strong className={snapshot.forecastTrend === "increasing" ? "text-[var(--accent)]" : "text-emerald-600"}>
                            {snapshot.forecastTrend ? snapshot.forecastTrend.toUpperCase() : "UNKNOWN"}
                          </strong></div>
                        </div>
                        {snapshot.expectedChange && (
                          <div className="flex items-center justify-between text-xs border-t border-[var(--border)] pt-2 mt-2">
                            <span className="text-[var(--text-muted)]">Expected Change:</span>
                            <span className={`font-bold ${snapshot.expectedChange.startsWith("+") ? "text-[var(--accent)]" : "text-emerald-600"}`}>
                              {snapshot.expectedChange}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 flex-wrap gap-3 mt-auto">
                        <div className="text-xs">
                          <span className="text-[var(--text-muted)]">Confidence: </span>
                          <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-bold uppercase ${confidenceColorClass}`}>
                            {snapshot.confidenceLabel} ({snapshot.confidence}%)
                          </span>
                        </div>
                        <ApproveButton recommId={rec.id} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* ── Secondary Activities ── */}
      <div className="grid grid-cols-1 gap-6">
        <ActivityFeed limit={12} />
      </div>

      {/* ── Administrative Add Staff ── */}
      <Card className="p-6">
        <AddStaffForm />
      </Card>
    </DashboardShell>
  );
}
