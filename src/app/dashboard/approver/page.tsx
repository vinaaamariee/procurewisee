import { requireRole } from '@/lib/auth/get-user-profile';
import { createClient } from '@/lib/supabase/server';
import AddStaffForm from './add-staff-form';

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

  const statCards = [
    { label: 'Canvas Abstracts', value: stats.totalCanvases, icon: '📄', color: '#fbbf24', desc: 'Bid opening records' },
    { label: 'Pending Review',   value: stats.pendingReview, icon: '⏳', color: '#f87171', desc: 'Awaiting approval' },
    { label: 'Approved',         value: stats.approvedCount, icon: '✅', color: '#34d399', desc: 'Recommendations accepted' },
    { label: 'Audit Logs',       value: stats.recentAuditLogs.length, icon: '🔒', color: '#818cf8', desc: 'Recent trail entries' },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            Administrative Approver Portal
          </h1>
          <p style={{ marginTop: '0.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Review MCDM recommendations, approve canvas abstracts, and monitor audit trails.
          </p>
        </div>
        <a
          href="/dashboard/catalog"
          style={{
            padding: '0.55rem 1.25rem',
            borderRadius: 8,
            background: 'var(--bg-dark)',
            border: '1px solid var(--border)',
            color: '#bae6fd',
            fontSize: '0.82rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
        >
          👁️ Product Catalog
        </a>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            padding: '1.25rem', borderRadius: 16,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(12px)',
            boxShadow: 'var(--shadow-card)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: card.color, borderRadius: '16px 16px 0 0' }} />
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{card.desc}</div>
          </div>
        ))}
      </div>

      {/* Pending MCDM Recommendations */}
      <div style={{ borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Pending MCDM Recommendations
          </h2>
          {stats.pendingReview > 0 && (
            <span style={{ fontSize: '0.7rem', background: 'rgba(248,113,113,0.15)', color: '#f87171', padding: '0.25rem 0.65rem', borderRadius: 999, border: '1px solid rgba(248,113,113,0.3)', fontWeight: 700 }}>
              {stats.pendingReview} awaiting review
            </span>
          )}
        </div>
        <div style={{ padding: '0.5rem 0' }}>
          {recs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Submissions cleared or pending review.
            </div>
          ) : (
            recs.map((rec: any, i: number) => (
              <div key={rec.id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: i === 0 ? 'var(--green-dim)' : 'var(--bg-dark)',
                  border: `1px solid ${i === 0 ? 'var(--green)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 800,
                  color: i === 0 ? 'var(--green)' : 'var(--text-muted)', flexShrink: 0,
                }}>
                  #{rec.rank}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {(rec.supplier as any)?.companyName ?? 'Unknown Supplier'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rec.reasoning}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#818cf8' }}>
                    Score: {Number(rec.compositeScore).toFixed(4)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    ₱{Number((rec.quote as any)?.totalQuotedAmount ?? 0).toLocaleString('en-PH')}
                  </div>
                </div>
                <button style={{
                  padding: '0.4rem 0.9rem', borderRadius: 8, flexShrink: 0,
                  background: 'var(--green-dim)', border: '1px solid var(--green)',
                  color: 'var(--green)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Approve
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Audit Trail */}
      <div style={{ borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Audit Trail</h2>
        </div>
        <div>
          {stats.recentAuditLogs.map((log: any) => (
            <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8', flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{log.action}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {new Date(log.createdAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          {stats.recentAuditLogs.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No audit entries yet.</div>
          )}
        </div>
      </div>

      {/* Add Staff Form Section */}
      <AddStaffForm />
    </div>
  );
}
