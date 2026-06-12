import { requireRole } from '@/lib/auth/get-user-profile';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Officer Dashboard — ProcureWise' };

async function getOfficerStats() {
  const supabase = await createClient();

  const [rfqs, suppliers, appItems] = await Promise.all([
    supabase.from('requests_for_quote').select('status'),
    supabase.from('suppliers').select('id:supplier_id'),
    supabase.from('app_items').select('id:app_item_id'),
  ]);

  const rfqList = rfqs.data ?? [];
  return {
    totalRfqs:    rfqList.length,
    openRfqs:     rfqList.filter(r => r.status === 'Published').length,
    totalSuppliers: suppliers.data?.length ?? 0,
    totalAppItems:  appItems.data?.length ?? 0,
  };
}

async function getRecentRfqs() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('requests_for_quote')
    .select('id:rfq_id, rfqNumber, title, status, deadlineDate, approvedBudgetContract')
    .order('rfq_id', { ascending: false })
    .limit(5);
  return data ?? [];
}

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  Published:  { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-950/50' },
  Closed:     { bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' },
  Evaluated:  { bg: 'bg-[#ca8a04]/10 dark:bg-[#ca8a04]/5', text: 'text-[#ca8a04] dark:text-[#f59e0b]', border: 'border-[#ca8a04]/30' },
  Awarded:    { bg: 'bg-[#7e191b]/10 dark:bg-[#7e191b]/5', text: 'text-[#7e191b] dark:text-[#fb7185]', border: 'border-[#7e191b]/20' },
};

export default async function OfficerDashboard() {
  await requireRole('Procurement Officer');
  const [stats, rfqs] = await Promise.all([getOfficerStats(), getRecentRfqs()]);

  const statCards = [
    { label: 'Total RFQs',     value: stats.totalRfqs,     icon: '📋', color: 'var(--accent)', desc: 'All solicitations' },
    { label: 'Open / Active',  value: stats.openRfqs,      icon: '🟢', color: 'var(--secondary)', desc: 'Awaiting quotes' },
    { label: 'Suppliers',      value: stats.totalSuppliers, icon: '🏢', color: 'var(--accent-light)', desc: 'Registered vendors' },
    { label: 'APP Items',      value: stats.totalAppItems,  icon: '📦', color: 'var(--secondary-light)', desc: 'Annual procurement plan' },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Page Header ── */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
          Procurement Officer Portal
        </h1>
        <p style={{ marginTop: '0.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Manage RFQs, review supplier quotes, and track procurement activities.
        </p>
      </div>

      {/* ── Stat Cards ── */}
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

      {/* ── Recent RFQs ── */}
      <div style={{ borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Solicitations</h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--bg-dark)', padding: '0.25rem 0.65rem', borderRadius: 999, border: '1px solid var(--border)' }}>
            Last {rfqs.length} records
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr className="bg-[#7e191b] text-white">
                {['RFQ No.', 'Title', 'Budget (₱)', 'Deadline', 'Status'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap' }} className="text-[#fef08a]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rfqs.map((rfq, i) => {
                const s = STATUS_STYLE[rfq.status] ?? { bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' };
                return (
                  <tr key={rfq.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, whiteSpace: 'nowrap' }} className="text-[#7e191b] dark:text-[#f59e0b]">
                      <a href={`/dashboard/officer/rfq/${rfq.id}`} className="hover:underline">
                        {rfq.rfqNumber}
                      </a>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)', maxWidth: 280 }}>{rfq.title}</td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      ₱{Number(rfq.approvedBudgetContract).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {rfq.deadlineDate ? new Date(rfq.deadlineDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border}`}>
                        {rfq.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {rfqs.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No solicitations found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.75rem' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { label: '+ New RFQ', isPrimary: true, href: '/dashboard/officer/rfq/new' },
            { label: 'View Suppliers', isPrimary: false, href: '/dashboard/supplier-profiles' },
            { label: 'Product Catalog', isPrimary: false, href: '/dashboard/catalog' },
            { label: 'Price Comparison', isPrimary: false, href: '/price-comparison' },
          ].map(action => (
            <a
              key={action.label}
              href={action.href}
              className={
                action.isPrimary
                  ? "px-5 py-2.5 rounded-xl border border-[#ca8a04]/30 bg-[#7e191b] hover:bg-[#962124] text-white font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#7e191b]/20 cursor-pointer text-center"
                  : "px-5 py-2.5 rounded-xl border border-[#ca8a04]/30 bg-[#ca8a04]/10 hover:bg-[#ca8a04] text-[#7e191b] dark:text-[#f59e0b] hover:text-white font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ca8a04]/20 cursor-pointer text-center"
              }
              style={{ textDecoration: 'none' }}
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
