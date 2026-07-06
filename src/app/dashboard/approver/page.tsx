import { requireRole } from '@/lib/auth/get-user-profile';
import { createClient } from '@/lib/supabase/server';
import AddStaffForm from './add-staff-form';
import ApproveButton from './approve-button';
import { ShieldCheck, Truck, FileText, CheckCircle2, TrendingUpDown, AlertCircle, HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const metadata = { title: 'Approver Dashboard — ProcureWise' };

async function getApproverStats() {
  const supabase = await createClient();

  const [canvases, recommendations, auditEntries] = await Promise.all([
    supabase.from('canvas_abstracts').select('id:canvas_id'),
    supabase.from('recommendations').select('id:recomm_id, approvalStatus'),
    supabase.from('audit_trails').select('id:audit_id, action:actionType, createdAt:timestamp').order('timestamp', { ascending: false }).limit(5),
  ]);

  const canvasList = canvases.data ?? [];
  const recList = recommendations.data ?? [];

  return {
    totalCanvases:    canvasList.length,
    pendingReview:    recList.filter(r => r.approvalStatus === 'Pending Review').length,
    approvedCount:    recList.filter(r => r.approvalStatus === 'Approved').length,
    recentAuditLogs:  auditEntries.data ?? [],
  };
}

async function getPendingRecommendations() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('recommendations')
    .select('id:recomm_id, compositeScore:compositeMcdmScore, priceScore, deliveryScore, reliabilityScore, rank:rankPosition, reasoning:justificationLog, approvalStatus, supplier:suppliers(companyName), quote:supplier_quotes(rfqId, totalQuotedAmount)')
    .eq('approvalStatus', 'Pending Review')
    .order('rankPosition', { ascending: true })
    .limit(5);
  return data ?? [];
}

export default async function ApproverDashboard() {
  await requireRole('Administrative Approver');
  const [stats, recs] = await Promise.all([getApproverStats(), getPendingRecommendations()]);

  // Brand Colors
  const theme = {
    crimson: '#7e191b',
    gold: '#dcb353',
    goldDark: '#b88a1b',
    dark: '#111827',
    textMain: '#1f2937',
    textMuted: '#6b7280',
    glassBg: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.9)',
    shadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
    green: '#10b981',
    yellow: '#d97706',
  };

  const statCards = [
    { label: 'Canvas Abstracts', value: stats.totalCanvases, icon: '📄', color: '#1f2937', desc: 'Bid opening records' },
    { label: 'Pending Review',   value: stats.pendingReview, icon: '⏳', color: theme.crimson, desc: 'Awaiting approval' },
    { label: 'Approved',         value: stats.approvedCount, icon: '✅', color: theme.gold, desc: 'Recommendations accepted' },
    { label: 'Audit Logs',       value: stats.recentAuditLogs.length, icon: '🔒', color: '#4b5563', desc: 'Recent trail entries' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', fontFamily: '"Inter", sans-serif' }}>

      {/* Header Section */}
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: theme.textMain, margin: 0, letterSpacing: '-0.5px' }}>
          Administrative Approver Portal
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: theme.textMuted, margin: '0.5rem 0 0 0' }}>
          Review MCDM recommendations, approve canvas abstracts, and monitor audit trails.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            background: theme.glassBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${theme.glassBorder}`, borderRadius: '1.25rem', padding: '1.5rem',
            boxShadow: theme.shadow, position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: card.color }} />
            <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{card.icon}</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.textMain, lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: theme.textMain, marginTop: '0.5rem' }}>{card.label}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: theme.textMuted, marginTop: '0.25rem' }}>{card.desc}</div>
          </div>
        ))}
      </div>

      {/* Pending MCDM Recommendations */}
      <div style={{
        background: theme.glassBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${theme.glassBorder}`, borderRadius: '1.25rem', overflow: 'hidden', boxShadow: theme.shadow
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.4)', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.textMain, margin: 0 }}>
            Pending MCDM Recommendations
          </h2>
          {stats.pendingReview > 0 && (
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(126, 25, 27, 0.1)', color: theme.crimson, padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
              {stats.pendingReview} awaiting review
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
          {recs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: theme.textMuted, fontSize: '0.9rem' }}>
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
                  ? theme.green
                  : snapshot.confidenceLabel === "Medium"
                  ? theme.yellow
                  : theme.crimson;

              return (
                <div
                  key={rec.id}
                  style={{
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderRadius: '1.25rem',
                    background: 'white',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                  }}
                >
                  {/* Card Header Banner */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.5rem',
                      background: 'rgba(126,25,27,0.02)',
                      borderBottom: '1px solid rgba(0,0,0,0.04)',
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
                          background: `linear-gradient(135deg, ${theme.gold}, ${theme.goldDark})`,
                          color: 'white',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          boxShadow: '0 2px 5px rgba(220,179,83,0.3)'
                        }}
                      >
                        #{rec.rank}
                      </span>
                      <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: theme.textMain, margin: 0 }}>
                          {(rec.supplier as any)?.companyName ?? 'Unknown Supplier'}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: theme.textMuted }}>
                          Submitted for RFQ Ref: {rec.quote?.rfqId ? `RFQ-${rec.quote.rfqId}` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, color: theme.textMuted }}>Overall MCDM Score</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: theme.crimson, lineHeight: 1 }}>
                          {Number(rec.compositeScore).toFixed(2)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, color: theme.textMuted }}>Quoted Price</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: theme.textMain, lineHeight: 1 }}>
                          ₱{Number((rec.quote as any)?.totalQuotedAmount ?? 0).toLocaleString('en-PH')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    
                    {/* Left: Criteria score progress bars */}
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderRight: '1px solid rgba(0,0,0,0.04)' }}>
                      <h4 style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textMuted, letterSpacing: '0.5px', margin: '0 0 0.5rem 0' }}>
                        Explainable Criteria Breakdown (Normalized)
                      </h4>
                      
                      {/* Price */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                          <span>Price Score ({(w.price * 100).toFixed(0)}%)</span>
                          <span>{priceCont} / {priceLimit}</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${rec.priceScore}%`, height: '100%', background: theme.crimson, borderRadius: '3px' }} />
                        </div>
                      </div>

                      {/* Delivery */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Truck style={{ width: 12, height: 12 }} /> Delivery</span>
                          <span>{deliveryCont} / {deliveryLimit}</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${rec.deliveryScore}%`, height: '100%', background: theme.gold, borderRadius: '3px' }} />
                        </div>
                      </div>

                      {/* Reliability */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ShieldCheck style={{ width: 12, height: 12 }} /> Reliability</span>
                          <span>{reliabilityCont} / {reliabilityLimit}</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${rec.reliabilityScore}%`, height: '100%', background: theme.green, borderRadius: '3px' }} />
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
                        <h4 style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textMuted, letterSpacing: '0.5px', margin: '0 0 0.5rem 0' }}>
                          Recommendation Justification
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {snapshot.reason.split("\n").map((line, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.75rem', color: theme.textMain }}>
                              <CheckCircle2 style={{ width: 14, height: 14, color: theme.green, marginTop: '1px', flexShrink: 0 }} />
                              <span>{line.replace(/^•\s*/, "")}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Historical Prices & ARIMA Forecasting Link */}
                      <div style={{ background: '#f9fafb', border: '1px solid rgba(0,0,0,0.04)', borderRadius: '0.75rem', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <h5 style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textMuted, margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <TrendingUpDown style={{ width: 12, height: 12 }} /> Historical Price Intelligence
                        </h5>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.7rem' }}>
                          <div>Average: <strong>{snapshot.historicalAvgPrice ? formatCurrency(snapshot.historicalAvgPrice) : 'N/A'}</strong></div>
                          <div>Lowest: <strong>{snapshot.historicalMinPrice ? formatCurrency(snapshot.historicalMinPrice) : 'N/A'}</strong></div>
                          <div>Latest: <strong>{snapshot.historicalLatestPrice ? formatCurrency(snapshot.historicalLatestPrice) : 'N/A'}</strong></div>
                          <div>Forecast: <strong style={{ color: snapshot.forecastTrend === 'increasing' ? theme.crimson : theme.green }}>
                            {snapshot.forecastTrend ? snapshot.forecastTrend.toUpperCase() : 'UNKNOWN'}
                          </strong></div>
                        </div>
                        {snapshot.expectedChange && (
                          <div style={{ fontSize: '0.7rem', color: theme.textMuted, borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '0.25rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Expected Change:</span>
                            <span style={{ fontWeight: 800, color: snapshot.expectedChange.startsWith('+') ? theme.crimson : theme.green }}>{snapshot.expectedChange}</span>
                          </div>
                        )}
                      </div>

                      {/* Confidence & Action Bar */}
                      <div style={{ borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', color: theme.textMuted }}>Confidence: </span>
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
        background: theme.glassBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${theme.glassBorder}`, borderRadius: '1.25rem', overflow: 'hidden', boxShadow: theme.shadow
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)', backgroundColor: 'rgba(255,255,255,0.4)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.textMain, margin: 0 }}>Recent Audit Trail</h2>
        </div>
        <div>
          {stats.recentAuditLogs.map((log: any) => (
            <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: theme.gold, flexShrink: 0, boxShadow: `0 0 8px ${theme.gold}` }} />
              <div style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600, color: theme.textMain }}>
                {log.action}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textMuted, backgroundColor: '#f3f4f6', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                {new Date(log.createdAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          {stats.recentAuditLogs.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: theme.textMuted, fontSize: '0.9rem' }}>
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