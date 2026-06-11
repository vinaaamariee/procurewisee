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

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Published:  { bg: 'rgba(99,102,241,0.15)',  text: '#818cf8' },
  Closed:     { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
  Evaluated:  { bg: 'rgba(16,185,129,0.15)',  text: '#34d399' },
  Awarded:    { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24' },
};

export default async function OfficerDashboard() {
  await requireRole('Procurement Officer');
  const [stats, rfqs] = await Promise.all([getOfficerStats(), getRecentRfqs()]);

  const statCards = [
    { label: 'Total RFQs',     value: stats.totalRfqs,     icon: '📋', color: '#6366f1', desc: 'All solicitations' },
    { label: 'Open / Active',  value: stats.openRfqs,      icon: '🟢', color: '#34d399', desc: 'Awaiting quotes' },
    { label: 'Suppliers',      value: stats.totalSuppliers, icon: '🏢', color: '#38bdf8', desc: 'Registered vendors' },
    { label: 'APP Items',      value: stats.totalAppItems,  icon: '📦', color: '#fbbf24', desc: 'Annual procurement plan' },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Page Header ── */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
          Procurement Officer Portal
        </h1>
        <p style={{ marginTop: '0.4rem', fontSize: '0.875rem', color: '#64748b' }}>
          Manage RFQs, review supplier quotes, and track procurement activities.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            padding: '1.25rem', borderRadius: 16,
            background: 'rgba(15,23,42,0.65)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: card.color, borderRadius: '16px 16px 0 0' }} />
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-1px', lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</div>
            <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.15rem' }}>{card.desc}</div>
          </div>
        ))}
      </div>

      {/* ── Recent RFQs ── */}
      <div style={{ borderRadius: 16, background: 'rgba(15,23,42,0.65)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>Recent Solicitations</h2>
          <span style={{ fontSize: '0.72rem', color: '#64748b', background: 'rgba(255,255,255,0.04)', padding: '0.25rem 0.65rem', borderRadius: 999, border: '1px solid rgba(255,255,255,0.07)' }}>
            Last {rfqs.length} records
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'rgba(56,189,248,0.05)', borderBottom: '1px solid rgba(56,189,248,0.15)' }}>
                {['RFQ No.', 'Title', 'Budget (₱)', 'Deadline', 'Status'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#38bdf8', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rfqs.map((rfq, i) => {
                const s = STATUS_STYLE[rfq.status] ?? { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' };
                return (
                  <tr key={rfq.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '0.85rem 1rem', color: '#818cf8', fontWeight: 600, whiteSpace: 'nowrap' }}>{rfq.rfqNumber}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#f1f5f9', maxWidth: 280 }}>{rfq.title}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      ₱{Number(rfq.approvedBudgetContract).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {rfq.deadlineDate ? new Date(rfq.deadlineDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: 999, background: s.bg, color: s.text, fontSize: '0.7rem', fontWeight: 700, border: `1px solid ${s.text}33` }}>
                        {rfq.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {rfqs.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>No solicitations found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.75rem' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { label: '+ New RFQ', color: '#6366f1', href: '/dashboard/officer/rfq/new' },
            { label: 'View Suppliers', color: '#38bdf8', href: '#' },
            { label: 'APP Items', color: '#fbbf24', href: '#' },
            { label: 'Price Comparison', color: '#34d399', href: '/price-comparison' },
          ].map(action => (
            <a key={action.label} href={action.href} style={{
              padding: '0.6rem 1.25rem', borderRadius: 10,
              background: `${action.color}18`, border: `1px solid ${action.color}40`,
              color: action.color, fontSize: '0.82rem', fontWeight: 600,
              textDecoration: 'none', transition: 'all 0.2s',
            }}>
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
