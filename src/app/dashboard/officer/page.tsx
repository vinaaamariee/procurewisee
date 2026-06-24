import { requireRole } from '@/lib/auth/get-user-profile';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Officer Dashboard — ProcureWise' };

async function getOfficerStats() {
  const supabase = await createClient();

  const [rfqs, suppliers] = await Promise.all([
    supabase.from('requests_for_quote').select('status'),
    supabase.from('suppliers').select('id:supplier_id'),
  ]);

  const rfqList = rfqs.data ?? [];
  return {
    totalRfqs:      rfqList.length,
    openRfqs:       rfqList.filter(r => r.status === 'Published').length,
    totalSuppliers: suppliers.data?.length ?? 0,
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

// Rewritten to use pure inline styles instead of Tailwind classes to prevent layout collapse
const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Published:  { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' },
  Closed:     { bg: 'rgba(107, 114, 128, 0.1)', color: '#4b5563', border: '1px solid rgba(107, 114, 128, 0.2)' },
  Evaluated:  { bg: 'rgba(220, 179, 83, 0.1)', color: '#b88a1b', border: '1px solid rgba(220, 179, 83, 0.3)' },
  Awarded:    { bg: 'rgba(126, 25, 27, 0.1)', color: '#7e191b', border: '1px solid rgba(126, 25, 27, 0.2)' },
};

export default async function OfficerDashboard() {
  await requireRole('Procurement Officer');
  const [stats, rfqs] = await Promise.all([getOfficerStats(), getRecentRfqs()]);

  // Brand Colors mapped from your Login Page design
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
    { label: 'Total RFQs',     value: stats.totalRfqs,      icon: '📋', color: '#1f2937', desc: 'All solicitations' },
    { label: 'Open / Active',  value: stats.openRfqs,       icon: '🟢', color: theme.gold, desc: 'Awaiting quotes' },
    { label: 'Suppliers',      value: stats.totalSuppliers, icon: '🏢', color: theme.crimson, desc: 'Registered vendors' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', fontFamily: '"Inter", sans-serif' }}>

      {/* ── Page Header ── */}
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: theme.textMain, margin: 0, letterSpacing: '-0.5px' }}>
          Procurement Officer Portal
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: theme.textMuted, margin: '0.5rem 0 0 0' }}>
          Manage RFQs, review supplier quotes, and track procurement activities.
        </p>
      </div>

      {/* ── Stat Cards Grid ── */}
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

      {/* ── Recent RFQs Table ── */}
      <div style={{
        background: theme.glassBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${theme.glassBorder}`, borderRadius: '1.25rem', overflow: 'hidden', boxShadow: theme.shadow
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.4)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.textMain, margin: 0 }}>Recent Solicitations</h2>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textMuted, background: 'rgba(0,0,0,0.04)', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
            Last {rfqs.length} records
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['RFQ No.', 'Title', 'Budget (₱)', 'Deadline', 'Status'].map(h => (
                  <th key={h} style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textMuted, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rfqs.map((rfq) => {
                const s = STATUS_STYLE[rfq.status] ?? { bg: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' };
                return (
                  <tr key={rfq.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      <a href={`/dashboard/officer/rfq/${rfq.id}`} style={{ color: theme.crimson, textDecoration: 'none' }}>
                        {rfq.rfqNumber}
                      </a>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: theme.textMain, maxWidth: '280px', fontWeight: 500 }}>
                      {rfq.title}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: theme.textMuted, whiteSpace: 'nowrap', fontWeight: 600 }}>
                      ₱{Number(rfq.approvedBudgetContract).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: theme.textMuted, whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {rfq.deadlineDate ? new Date(rfq.deadlineDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px', 
                        fontSize: '0.75rem', fontWeight: 700, 
                        backgroundColor: s.bg, color: s.color, border: s.border 
                      }}>
                        {rfq.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {rfqs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: theme.textMuted, fontWeight: 500 }}>
                    No solicitations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '1rem' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { label: '+ New RFQ', isPrimary: true, href: '/dashboard/officer/rfq/new' },
            { label: 'View Suppliers', isPrimary: false, href: '/dashboard/supplier-profiles' },
            { label: 'Product Catalog', isPrimary: false, href: '/dashboard/catalog' },
            { label: 'Price Comparison', isPrimary: false, href: '/price-comparison' },
          ].map(action => (
            <a
              key={action.label}
              href={action.href}
              style={{
                textDecoration: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '999px', // Pill shape like the login buttons
                fontSize: '0.875rem',
                fontWeight: 600,
                textAlign: 'center',
                cursor: 'pointer',
                display: 'inline-block',
                ...(action.isPrimary 
                  ? { 
                      background: `linear-gradient(90deg, ${theme.crimson} 0%, ${theme.goldDark} 100%)`, 
                      color: 'white', 
                      boxShadow: `0 4px 12px rgba(184, 138, 27, 0.25)`,
                      border: 'none'
                    } 
                  : { 
                      background: 'rgba(255,255,255,0.8)', 
                      color: theme.textMain, 
                      border: `1px solid ${theme.glassBorder}`,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                    }
                )
              }}
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}