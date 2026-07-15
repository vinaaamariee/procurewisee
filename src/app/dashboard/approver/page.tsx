import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import AddStaffForm from './add-staff-form';
import ApproveButton from './approve-button';
import { 
  ShieldCheck, 
  Truck, 
  FileText, 
  CheckCircle2, 
  TrendingUpDown, 
  AlertCircle, 
  Clock, 
  CheckSquare, 
  Undo2, 
  XOctagon, 
  History, 
  TrendingUp, 
  Sparkles,
  User,
  ArrowRight
} from 'lucide-react';
import { startTimer } from '@/lib/performance-logger';
import EmptyState from '@/components/ui/EmptyState';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import Card from '@/components/ui/Card';
import SectionHeader from '@/components/ui/SectionHeader';
import TableContainer from '@/components/ui/TableContainer';
import StatusBadge from '@/components/ui/StatusBadge';
import Link from 'next/link';

export const metadata = { title: 'Approver Dashboard — ProcureWise' };

async function getApproverStats() {
  const timer = startTimer('getApproverStats');
  const [totalCanvases, pendingReview, approvedCount, recentAuditLogs] = await Promise.all([
    prisma.canvasAbstract.count(),
    prisma.purchaseRequest.count({ where: { status: { in: ['Submitted', 'UnderReview'] } } }),
    prisma.purchaseRequest.count({ where: { status: { in: ['Approved', 'Received'] } } }),
    prisma.auditTrail.findMany({
      select: {
        id: true,
        actionType: true,
        timestamp: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 5,
    }),
  ]);
  timer.end();

  return {
    totalCanvases,
    pendingReview,
    approvedCount,
    recentAuditLogs: recentAuditLogs.map(log => ({
      id: log.id,
      action: log.actionType,
      createdAt: log.timestamp,
    })),
  };
}

async function getPendingRecommendations() {
  const timer = startTimer('getPendingRecommendations');
  const data = await prisma.recommendation.findMany({
    where: { approvalStatus: 'Pending Review' },
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
    orderBy: { rankPosition: 'asc' },
    take: 5,
  });
  timer.end();

  return data.map(rec => ({
    id: rec.id,
    compositeScore: rec.compositeMcdmScore,
    priceScore: rec.priceScore,
    deliveryScore: rec.deliveryScore,
    reliabilityScore: rec.reliabilityScore,
    rank: rec.rankPosition,
    reasoning: rec.justificationLog,
    approvalStatus: rec.approvalStatus,
    supplier: rec.supplier,
    quote: rec.supplierQuote ? {
      rfqId: rec.supplierQuote.rfqId,
      totalQuotedAmount: rec.supplierQuote.totalQuotedAmount,
    } : null,
  }));
}

async function getApproverDashboardPRs() {
  const timer = startTimer('getApproverDashboardPRs');
  
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [pending, approved, returned, rejected] = await Promise.all([
    prisma.purchaseRequest.findMany({
      where: { status: { in: ['Submitted', 'UnderReview'] } },
      include: { requestedBy: true, assignedOfficer: true },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.purchaseRequest.findMany({
      where: {
        status: { in: ['Approved', 'Received'] },
        updatedAt: { gte: startOfToday }
      },
      include: { requestedBy: true, assignedOfficer: true },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.purchaseRequest.findMany({
      where: { status: 'ReturnedForRevision' },
      include: { requestedBy: true, assignedOfficer: true },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.purchaseRequest.findMany({
      where: { status: 'Rejected' },
      include: { requestedBy: true, assignedOfficer: true },
      orderBy: { updatedAt: 'desc' }
    })
  ]);

  timer.end();

  const mapPr = (pr: any) => ({
    id: pr.id,
    prNumber: pr.prNumber,
    department: pr.department,
    office: pr.office,
    requesterName: pr.requestedBy?.fullName || pr.requesterName || 'N/A',
    assignedOfficerName: pr.assignedOfficer?.fullName || 'Not Assigned',
    totalCost: Number(pr.totalCost),
    status: pr.status,
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt
  });

  return {
    pendingApprovals: pending.map(mapPr),
    approvedToday: approved.map(mapPr),
    returnedPrs: returned.map(mapPr),
    rejectedPrs: rejected.map(mapPr)
  };
}

export default async function ApproverDashboard() {
  await requireRole('Administrative Approver');
  const [stats, recs, prData] = await Promise.all([
    getApproverStats(),
    getPendingRecommendations(),
    getApproverDashboardPRs()
  ]);

  const renderPrTable = (prs: any[], emptyMessage: string) => {
    return (
      <div className="overflow-x-auto">
        {prs.length === 0 ? (
          <div className="p-6">
            <EmptyState
              preset="purchase-requests"
              title="No Requests Here"
              description={emptyMessage}
              compact
            />
          </div>
        ) : (
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-dark)]">
                {['PR Number', 'Department / Office', 'Date Submitted', 'Assigned Officer', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prs.map((pr) => (
                <tr key={pr.id} className="border-b border-[var(--border)] transition hover:bg-[var(--surface-hover)]">
                  <td className="px-5 py-4 font-bold text-[var(--text-primary)]">
                    {pr.prNumber}
                  </td>
                  <td className="px-5 py-4 font-medium text-[var(--text-primary)]">
                    {pr.department} <span className="text-xs text-[var(--text-muted)]">({pr.office})</span>
                  </td>
                  <td className="px-5 py-4 text-[var(--text-secondary)] whitespace-nowrap">
                    {new Date(pr.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-[var(--text-primary)] font-semibold whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-4 w-4 text-[var(--text-muted)]" />
                      {pr.assignedOfficerName}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <StatusBadge status={pr.status === 'ReturnedForRevision' ? 'Returned' : pr.status} />
                  </td>
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <Link
                      href={`/dashboard/approver/history/${pr.id}`}
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
                    >
                      Review PR
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const statCards = [
    { label: 'Canvas Abstracts', value: stats.totalCanvases, icon: FileText, color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-100 dark:border-blue-900/30', desc: 'Bid opening records', href: '#pending-reviews' },
    { label: 'Pending Review',   value: stats.pendingReview, icon: Clock, color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-100 dark:border-amber-900/30', desc: 'Awaiting approval', href: '/dashboard/approver/history?tab=pending' },
    { label: 'Approved',         value: stats.approvedCount, icon: CheckSquare, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30', desc: 'Accepted recommendations', href: '/dashboard/approver/history?tab=approved' },
    { label: 'Audit Logs',       value: stats.recentAuditLogs.length, icon: ShieldCheck, color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/30', desc: 'Recent trail entries', href: '#audit-trail' },
  ];

  return (
    <div className="space-y-10">

      {/* ── Page Header ── */}
      <SectionHeader 
        title="Administrative Approver Portal"
        subtitle="Review MCDM recommendations, approve canvas abstracts, and monitor audit trails."
      />

      {/* ── Decision-Making Focus Area ── */}
      <div className="space-y-8">
        
        {/* Pending Approvals */}
        <Card>
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 flex-wrap gap-2">
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Pending Approvals
            </h2>
            {prData.pendingApprovals.length > 0 && (
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                {prData.pendingApprovals.length} awaiting approval
              </span>
            )}
          </div>
          {renderPrTable(prData.pendingApprovals, "No pending purchase requests awaiting approval.")}
        </Card>

        {/* Approved Today */}
        <Card>
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 flex-wrap gap-2">
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-emerald-500" />
              Approved Today
            </h2>
            {prData.approvedToday.length > 0 && (
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {prData.approvedToday.length} approved today
              </span>
            )}
          </div>
          {renderPrTable(prData.approvedToday, "No purchase requests approved today.")}
        </Card>

        {/* Returned for Revision */}
        <Card>
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 flex-wrap gap-2">
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Undo2 className="h-5 w-5 text-rose-500" />
              Returned for Revision
            </h2>
            {prData.returnedPrs.length > 0 && (
              <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-300">
                {prData.returnedPrs.length} returned for revision
              </span>
            )}
          </div>
          {renderPrTable(prData.returnedPrs, "No purchase requests currently in revision status.")}
        </Card>

        {/* Rejected Requests */}
        <Card>
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 flex-wrap gap-2">
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <XOctagon className="h-5 w-5 text-red-500" />
              Rejected Requests
            </h2>
            {prData.rejectedPrs.length > 0 && (
              <span className="rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-bold text-red-700 dark:text-red-300">
                {prData.rejectedPrs.length} rejected requests
              </span>
            )}
          </div>
          {renderPrTable(prData.rejectedPrs, "No rejected purchase requests recorded.")}
        </Card>

      </div>

      {/* ── Pending MCDM Recommendations ── */}
      <Card id="pending-reviews">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 flex-wrap gap-2">
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Pending MCDM Recommendations
          </h2>
          {stats.pendingReview > 0 && (
            <span className="rounded-full bg-[var(--bg-dark)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)] border border-[var(--border)]">
              {stats.pendingReview} awaiting review
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
                  weights: { price: 0.40, delivery: 0.20, reliability: 0.20, compliance: 0.10, historicalPerformance: 0.10 }
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
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden flex flex-col shadow-sm hover:border-[var(--border-accent)] transition-colors duration-200"
                >
                  {/* Card Header Banner */}
                  <div className="flex items-center justify-between px-6 py-4 bg-[var(--bg-dark)] border-b border-[var(--border)] flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-xs font-black text-white shadow-sm">
                        #{rec.rank}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">
                          {(rec.supplier as any)?.companyName ?? 'Unknown Supplier'}
                        </h3>
                        <span className="text-xs text-[var(--text-muted)]">
                          Submitted for RFQ Ref: {rec.quote?.rfqId ? `RFQ-${rec.quote.rfqId}` : 'N/A'}
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
                          ₱{Number((rec.quote as any)?.totalQuotedAmount ?? 0).toLocaleString('en-PH')}
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
                      
                      {/* Price */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)]">
                          <span>Price Score ({priceLimit}%)</span>
                          <span className="font-bold">{priceCont} / {priceLimit}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-300" style={{ width: `${rec.priceScore}%` }} />
                        </div>
                      </div>

                      {/* Delivery */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)]">
                          <span className="inline-flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Delivery</span>
                          <span className="font-bold">{deliveryCont} / {deliveryLimit}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-[var(--accent-light)] rounded-full transition-all duration-300" style={{ width: `${rec.deliveryScore}%` }} />
                        </div>
                      </div>

                      {/* Reliability */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)]">
                          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Reliability</span>
                          <span className="font-bold">{reliabilityCont} / {reliabilityLimit}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${rec.reliabilityScore}%` }} />
                        </div>
                      </div>

                      {/* Compliance */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)]">
                          <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Compliance</span>
                          <span className="font-bold">{complianceCont} / {complianceLimit}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${snapshot.complianceScore}%` }} />
                        </div>
                      </div>

                      {/* Historical */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)]">
                          <span>Historical performance</span>
                          <span className="font-bold">{historicalCont} / {historicalLimit}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${snapshot.historicalPerformanceScore}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Right: Justifications & Forecast Analytics */}
                    <div className="p-6 flex flex-col gap-6 justify-between">
                      
                      {/* Explanations */}
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

                      {/* Historical Prices & ARIMA Forecasting */}
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-dark)] p-4 space-y-3">
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                          <TrendingUpDown className="h-4 w-4 text-[var(--accent)]" /> 
                          Historical Price Intelligence
                        </h5>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>Average: <strong className="text-[var(--text-primary)]">{snapshot.historicalAvgPrice ? formatCurrency(snapshot.historicalAvgPrice) : 'N/A'}</strong></div>
                          <div>Lowest: <strong className="text-[var(--text-primary)]">{snapshot.historicalMinPrice ? formatCurrency(snapshot.historicalMinPrice) : 'N/A'}</strong></div>
                          <div>Latest: <strong className="text-[var(--text-primary)]">{snapshot.historicalLatestPrice ? formatCurrency(snapshot.historicalLatestPrice) : 'N/A'}</strong></div>
                          <div>Forecast: <strong className={snapshot.forecastTrend === 'increasing' ? 'text-[var(--accent)]' : 'text-emerald-600'}>
                            {snapshot.forecastTrend ? snapshot.forecastTrend.toUpperCase() : 'UNKNOWN'}
                          </strong></div>
                        </div>
                        {snapshot.expectedChange && (
                          <div className="flex items-center justify-between text-xs border-t border-[var(--border)] pt-2 mt-2">
                            <span className="text-[var(--text-muted)]">Expected Change:</span>
                            <span className={`font-bold ${snapshot.expectedChange.startsWith('+') ? 'text-[var(--accent)]' : 'text-emerald-600'}`}>
                              {snapshot.expectedChange}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Confidence & Action Bar */}
                      <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 flex-wrap gap-3 mt-auto">
                        <div className="text-xs">
                          <span className="text-[var(--text-muted)]">Confidence: </span>
                          <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold uppercase ${confidenceColorClass}`}>
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

      {/* ── Stat Cards Grid (Below Critical Actions) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="group">
              <Card className="p-6 h-full transition hover:-translate-y-0.5 hover:shadow-md border-[var(--border)] bg-[var(--surface)]">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                      {card.label}
                    </span>
                    <span className="text-3xl font-black tracking-tight text-[var(--text-primary)] block">
                      {card.value}
                    </span>
                  </div>
                  <div className={`rounded-xl border p-2.5 shrink-0 ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)]">{card.desc}</span>
                  <span className="font-extrabold text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-250">
                    Manage &rarr;
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* ── Secondary Activities ── */}
      <div className="grid grid-cols-1 gap-6">
        <ActivityFeed limit={12} />
      </div>

      {/* ── Administrative Add Staff ── */}
      <Card className="p-6">
        <AddStaffForm />
      </Card>

    </div>
  );
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}