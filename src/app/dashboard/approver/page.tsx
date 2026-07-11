import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import AddStaffForm from './add-staff-form';
import ApproveButton from './approve-button';
import { ShieldCheck, Truck, FileText, CheckCircle2, TrendingUpDown, AlertCircle, HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { startTimer } from '@/lib/performance-logger';

export const metadata = { title: 'Approver Dashboard — ProcureWise' };

async function getApproverStats() {
  const timer = startTimer('getApproverStats');
  const [totalCanvases, pendingReview, approvedCount, recentAuditLogs] = await Promise.all([
    prisma.canvasAbstract.count(),
    prisma.recommendation.count({ where: { approvalStatus: 'Pending Review' } }),
    prisma.recommendation.count({ where: { approvalStatus: 'Approved' } }),
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

export default async function ApproverDashboard() {
  await requireRole('Administrative Approver');
  const [stats, recs] = await Promise.all([getApproverStats(), getPendingRecommendations()]);

  const v = {
    surface: 'var(--surface)',
    border: 'var(--border)',
    accent: 'var(--accent)',
    accentLight: 'var(--accent-light)',
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    green: '#10b981',
    yellow: '#d97706',
    shadow: '0 4px 24px rgba(30,58,138,0.07)',
  };

  const statCards = [
    { label: 'Canvas Abstracts', value: stats.totalCanvases, icon: '📄', color: v.accent,      desc: 'Bid opening records' },
    { label: 'Pending Review',   value: stats.pendingReview, icon: '⏳', color: '#d97706',     desc: 'Awaiting approval' },
    { label: 'Approved',         value: stats.approvedCount, icon: '✅', color: '#059669',     desc: 'Recommendations accepted' },
    { label: 'Audit Logs',       value: stats.recentAuditLogs.length, icon: '🔒', color: v.accentLight, desc: 'Recent trail entries' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', fontFamily: '"Inter", sans-serif' }}>

      {/* Header Section */}
      <div style={{ borderBottom: `1px solid ${v.border}`, paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 5, height: 48, borderRadius: 4, background: `linear-gradient(180deg, ${v.accent}, ${v.accentLight})`, flexShrink: 0 }} />
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: v.textPrimary, margin: 0, letterSpacing: '-0.5px' }}>
              Administrative Approver Portal
            </h1>
            <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: v.textSecondary, margin: '0.25rem 0 0 0' }}>
              Review MCDM recommendations, approve canvas abstracts, and monitor audit trails.
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            background: v.surface,
            border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.5rem',
            boxShadow: v.shadow, position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: card.color }} />
            <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{card.icon}</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: v.textPrimary, lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: v.textPrimary, marginTop: '0.5rem' }}>{card.label}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: v.textSecondary, marginTop: '0.25rem' }}>{card.desc}</div>
          </div>
        ))}
      </div>

      {/* Pending MCDM Recommendations */}
      <div style={{
        background: v.surface,
        border: `1px solid ${v.border}`, borderRadius: '1.25rem', overflow: 'hidden', boxShadow: v.shadow
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${v.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: v.textPrimary, margin: 0 }}>
            Pending MCDM Recommendations
          </h2>
          {stats.pendingReview > 0 && (
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(30,58,138,0.08)', color: v.accent, padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
              {stats.pendingReview} awaiting review
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
          {recs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: v.textSecondary, fontSize: '0.9rem' }}>
              All submissions cleared. No pending reviews at this time.
            </div>
          ) : (
            recs.map((rec: any) => {
              // Parse audit snapshot JSON safely
              let snapshot: {
                reason: string;
                complianceScore: number;
                historicalPerformanceScore: number;
                confidence: number;
                confidenceLabel: "High" | "Medium" | "Low";
                expectedChange: string | null;
                forecastTrend: "increasing" | "decreasing" | "stable" | "unknown";
                historicalAvgPrice?: number;
                historicalMinPrice?: number;
                historicalLatestPrice?: number;
                weights: any;
              };

              try {
                snapshot = JSON.parse(rec.reasoning);
              } catch (e) {
                // Fallback for legacy rows
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

              // Compute contributions based on weights in the snapshot
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

              const confidenceColor =
                snapshot.confidenceLabel === "High"
                  ? v.green
                  : snapshot.confidenceLabel === "Medium"
                  ? v.yellow
                  : v.accent;

              return (
                <div
                  key={rec.id}
                  style={{
                    border: `1px solid ${v.border}`,
                    borderRadius: '1.25rem',
                    background: v.surface,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: v.shadow
                  }}
                >
                  {/* Card Header Banner */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.5rem',
                      background: 'rgba(30,58,138,0.03)',
                      borderBottom: `1px solid ${v.border}`,
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${v.accent}, ${v.accentLight})`,
                          color: 'white',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          boxShadow: '0 2px 5px rgba(30,58,138,0.3)'
                        }}
                      >
                        #{rec.rank}
                      </span>
                      <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: v.textPrimary, margin: 0 }}>
                          {(rec.supplier as any)?.companyName ?? 'Unknown Supplier'}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: v.textSecondary }}>
                          Submitted for RFQ Ref: {rec.quote?.rfqId ? `RFQ-${rec.quote.rfqId}` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, color: v.textSecondary }}>Overall MCDM Score</span>
                          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: v.accent, lineHeight: 1 }}>
                            {Number(rec.compositeScore).toFixed(2)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, color: v.textSecondary }}>Quoted Price</span>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: v.textPrimary, lineHeight: 1 }}>
                          ₱{Number((rec.quote as any)?.totalQuotedAmount ?? 0).toLocaleString('en-PH')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    
                    {/* Left: Criteria score progress bars */}
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderRight: '1px solid rgba(0,0,0,0.04)' }}>
                      <h4 style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: v.textSecondary, letterSpacing: '0.5px', margin: '0 0 0.5rem 0' }}>
                        Explainable Criteria Breakdown (Normalized)
                      </h4>
                      
                      {/* Price */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                          <span>Price Score ({(w.price * 100).toFixed(0)}%)</span>
                          <span>{priceCont} / {priceLimit}</span>
                        </div>
                          <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${rec.priceScore}%`, height: '100%', background: v.accent, borderRadius: '3px' }} />
                          </div>
                      </div>

                      {/* Delivery */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Truck style={{ width: 12, height: 12 }} /> Delivery</span>
                          <span>{deliveryCont} / {deliveryLimit}</span>
                        </div>
                          <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${rec.deliveryScore}%`, height: '100%', background: v.accentLight, borderRadius: '3px' }} />
                          </div>
                      </div>

                      {/* Reliability */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ShieldCheck style={{ width: 12, height: 12 }} /> Reliability</span>
                          <span>{reliabilityCont} / {reliabilityLimit}</span>
                        </div>
                          <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${rec.reliabilityScore}%`, height: '100%', background: v.green, borderRadius: '3px' }} />
                          </div>
                      </div>

                      {/* Compliance */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FileText style={{ width: 12, height: 12 }} /> Compliance</span>
                          <span>{complianceCont} / {complianceLimit}</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${snapshot.complianceScore}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }} />
                        </div>
                      </div>

                      {/* Historical */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                          <span>Historical performance</span>
                          <span>{historicalCont} / {historicalLimit}</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${snapshot.historicalPerformanceScore}%`, height: '100%', background: '#a855f7', borderRadius: '3px' }} />
                        </div>
                      </div>
                    </div>

                    {/* Right: Justifications & Forecast Analytics */}
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      
                      {/* Explanations */}
                      <div>
                        <h4 style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: v.textSecondary, letterSpacing: '0.5px', margin: '0 0 0.5rem 0' }}>
                          Recommendation Justification
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {snapshot.reason.split("\n").map((line, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.75rem', color: v.textPrimary }}>
                              <CheckCircle2 style={{ width: 14, height: 14, color: v.green, marginTop: '1px', flexShrink: 0 }} />
                              <span>{line.replace(/^•\s*/, "")}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Historical Prices & ARIMA Forecasting Link */}
                        <div style={{ background: 'var(--section-bg)', border: `1px solid ${v.border}`, borderRadius: '0.75rem', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <h5 style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: v.textSecondary, margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <TrendingUpDown style={{ width: 12, height: 12 }} /> Historical Price Intelligence
                        </h5>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.7rem' }}>
                            <div>Average: <strong>{snapshot.historicalAvgPrice ? formatCurrency(snapshot.historicalAvgPrice) : 'N/A'}</strong></div>
                            <div>Lowest: <strong>{snapshot.historicalMinPrice ? formatCurrency(snapshot.historicalMinPrice) : 'N/A'}</strong></div>
                            <div>Latest: <strong>{snapshot.historicalLatestPrice ? formatCurrency(snapshot.historicalLatestPrice) : 'N/A'}</strong></div>
                            <div>Forecast: <strong style={{ color: snapshot.forecastTrend === 'increasing' ? v.accent : v.green }}>
                            {snapshot.forecastTrend ? snapshot.forecastTrend.toUpperCase() : 'UNKNOWN'}
                          </strong></div>
                        </div>
                          {snapshot.expectedChange && (
                            <div style={{ fontSize: '0.7rem', color: v.textSecondary, borderTop: `1px solid ${v.border}`, paddingTop: '0.25rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Expected Change:</span>
                              <span style={{ fontWeight: 800, color: snapshot.expectedChange.startsWith('+') ? v.accent : v.green }}>{snapshot.expectedChange}</span>
                            </div>
                          )}
                      </div>

                      {/* Confidence & Action Bar */}
                        <div style={{ borderTop: `1px solid ${v.border}`, paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <div>
                            <span style={{ fontSize: '0.65rem', color: v.textSecondary }}>Confidence: </span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: confidenceColor }}>
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
      </div>

      {/* Audit Trail */}
      <div style={{
        background: v.surface,
        border: `1px solid ${v.border}`, borderRadius: '1.25rem', overflow: 'hidden', boxShadow: v.shadow
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${v.border}` }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: v.textPrimary, margin: 0 }}>Recent Audit Trail</h2>
        </div>
        <div>
          {stats.recentAuditLogs.map((log: any) => (
            <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: `1px solid ${v.border}` }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: v.accent, flexShrink: 0, boxShadow: `0 0 8px ${v.accent}` }} />
              <div style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600, color: v.textPrimary }}>
                {log.action}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: v.textSecondary, backgroundColor: 'var(--section-bg)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                {new Date(log.createdAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          {stats.recentAuditLogs.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: v.textSecondary, fontSize: '0.9rem' }}>
              No audit entries recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Form Section */}
      <div style={{ marginTop: '1rem' }}>
        <AddStaffForm />
      </div>

    </div>
  );
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}