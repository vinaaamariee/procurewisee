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
    { label: 'Canvas Abstracts', value: stats.totalCanvases, icon: '📄', color: 'var(--secondary)', desc: 'Bid opening records' },
    { label: 'Pending Review',   value: stats.pendingReview, icon: '⏳', color: 'var(--accent)', desc: 'Awaiting approval' },
    { label: 'Approved',         value: stats.approvedCount, icon: '✅', color: '#10b981', desc: 'Recommendations accepted' },
    { label: 'Audit Logs',       value: stats.recentAuditLogs.length, icon: '🔒', color: 'var(--accent-light)', desc: 'Recent trail entries' },
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
          className="px-5 py-2.5 rounded-xl border border-[#ca8a04]/30 bg-[#ca8a04]/10 hover:bg-[#ca8a04] text-[#7e191b] dark:text-[#f59e0b] hover:text-white font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ca8a04]/20 cursor-pointer text-center"
          style={{ textDecoration: 'none' }}
        >
          👁️ Product Catalog
        </a>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
        {statCards.map(card => (
          <div key={card.label} className="summary-card">
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: card.color, borderRadius: '16px 16px 0 0' }} />
            <div className="summary-card-icon" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <div className="summary-card-value">{card.value}</div>
            <div className="summary-card-label">{card.label}</div>
            <div className="summary-card-sublabel">{card.desc}</div>
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
        <div>
          {recs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Submissions cleared or pending review.
            </div>
          ) : (
            recs.map((rec: any, i: number) => (
              <div key={rec.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                <div className="flex items-center gap-4">
                  {rec.rank === 1 ? (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ca8a04] to-[#eab308] border border-[#ca8a04]/50 shadow-md text-white font-black text-sm flex items-center justify-center flex-shrink-0 animate-pulse-subtle">
                      #{rec.rank}
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#7e191b]/10 border border-[#7e191b]/30 text-[#7e191b] dark:text-[#f59e0b] font-bold text-xs flex items-center justify-center flex-shrink-0">
                      #{rec.rank}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div className="text-sm font-black text-slate-800 dark:text-slate-200">
                      {(rec.supplier as any)?.companyName ?? 'Unknown Supplier'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 overflow-hidden text-overflow-ellipsis whitespace-nowrap max-w-[280px] sm:max-w-md">
                      {rec.reasoning}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-black text-[#7e191b] dark:text-[#f59e0b]">
                      Score: {Number(rec.compositeScore).toFixed(4)}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                      ₱{Number((rec.quote as any)?.totalQuotedAmount ?? 0).toLocaleString('en-PH')}
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-emerald-600/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                    Approve
                  </button>
                </div>
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
            <div key={log.id} className="flex items-center gap-4 py-4 px-6 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ca8a04] shadow-sm shadow-[#ca8a04]/50 flex-shrink-0 animate-pulse-subtle" />
              <div style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-secondary)' }} className="font-semibold">{log.action}</div>
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
