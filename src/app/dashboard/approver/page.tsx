import { requireRole } from '@/lib/auth/get-user-profile';
import { createClient } from '@/lib/supabase/server';
import AddStaffForm from './add-staff-form';
import ApproveButton from './approve-button';

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
    .select('id:recomm_id, compositeScore:compositeMcdmScore, rank:rankPosition, reasoning:justificationLog, approvalStatus, supplier:suppliers(companyName), quote:supplier_quotes(rfqId, totalQuotedAmount)')
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: theme.textMain, margin: 0, letterSpacing: '-0.5px' }}>
            Administrative Approver Portal
          </h1>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: theme.textMuted, margin: '0.5rem 0 0 0' }}>
            Review MCDM recommendations, approve canvas abstracts, and monitor audit trails.
          </p>
        </div>
        <a
          href="/dashboard/catalog"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem',
            backgroundColor: 'rgba(255,255,255,0.8)', border: `1px solid ${theme.glassBorder}`,
            borderRadius: '999px', color: theme.textMain, textDecoration: 'none',
            fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            cursor: 'pointer'
          }}
        >
          <span>👁️</span> Product Catalog
        </a>
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
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.4)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.textMain, margin: 0 }}>
            Pending MCDM Recommendations
          </h2>
          {stats.pendingReview > 0 && (
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(126, 25, 27, 0.1)', color: theme.crimson, padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
              {stats.pendingReview} awaiting review
            </span>
          )}
        </div>
        
        <div>
          {recs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: theme.textMuted, fontSize: '0.9rem' }}>
              All submissions cleared. No pending reviews at this time.
            </div>
          ) : (
            recs.map((rec: any, i: number) => (
              <div key={rec.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.04)', gap: '1rem', flexWrap: 'wrap' }}>
                
                {/* Left Side: Avatar & Text */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '250px' }}>
                  {rec.rank === 1 ? (
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: `linear-gradient(135deg, ${theme.gold}, ${theme.goldDark})`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0, boxShadow: `0 4px 10px rgba(220, 179, 83, 0.3)` }}>
                      #{rec.rank}
                    </div>
                  ) : (
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                      #{rec.rank}
                    </div>
                  )}
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: theme.textMain, margin: 0 }}>
                      {(rec.supplier as any)?.companyName ?? 'Unknown Supplier'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: theme.textMuted, marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                      {rec.reasoning}
                    </div>
                  </div>
                </div>

                {/* Right Side: Score, Price, Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: rec.rank === 1 ? theme.goldDark : theme.crimson }}>
                      Score: {Number(rec.compositeScore).toFixed(4)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: theme.textMuted, fontWeight: 600, marginTop: '0.1rem' }}>
                      ₱{Number((rec.quote as any)?.totalQuotedAmount ?? 0).toLocaleString('en-PH')}
                    </div>
                  </div>
                  <ApproveButton recommId={rec.id} />
                </div>
              </div>
            ))
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