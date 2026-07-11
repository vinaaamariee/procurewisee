import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import ForecastIntelligenceSection from './ForecastIntelligenceSection';
import ForecastSkeleton from './ForecastSkeleton';
import { startTimer } from '@/lib/performance-logger';

export const metadata = { title: 'Officer Dashboard — ProcureWise' };

async function getOfficerStats() {
  const timer = startTimer('getOfficerStats');
  const [totalRfqs, openRfqs, totalSuppliers] = await Promise.all([
    prisma.requestForQuote.count(),
    prisma.requestForQuote.count({ where: { status: 'Published' } }),
    prisma.supplier.count(),
  ]);
  timer.end();
  return {
    totalRfqs,
    openRfqs,
    totalSuppliers,
  };
}

async function getRecentRfqs() {
  const timer = startTimer('getRecentRfqs');
  const data = await prisma.requestForQuote.findMany({
    select: {
      id: true,
      rfqNumber: true,
      title: true,
      status: true,
      deadlineDate: true,
      approvedBudgetContract: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });
  timer.end();
  return data;
}

// Rewritten style maps to prevent layout collapse
const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Draft:      { bg: 'rgba(107, 114, 128, 0.1)', color: '#4b5563', border: '1px solid rgba(107, 114, 128, 0.2)' },
  Published:  { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' },
  Closed:     { bg: 'rgba(107, 114, 128, 0.1)', color: '#4b5563', border: '1px solid rgba(107, 114, 128, 0.2)' },
  Evaluated:  { bg: 'rgba(220, 179, 83, 0.1)', color: '#b88a1b', border: '1px solid rgba(220, 179, 83, 0.3)' },
  Awarded:    { bg: 'rgba(126, 25, 27, 0.1)', color: '#7e191b', border: '1px solid rgba(126, 25, 27, 0.2)' },
};

export default async function OfficerDashboard() {
  const pageTimer = startTimer('OfficerDashboardPage');
  await requireRole('Procurement Officer');
  const [stats, rfqs] = await Promise.all([
    getOfficerStats(),
    getRecentRfqs(),
  ]);
  pageTimer.end();

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
    glassBg: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.9)',
    shadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
  };

  const v = {
    surface: 'var(--surface)',
    border: 'var(--border)',
    accent: 'var(--accent)',
    accentLight: 'var(--accent-light)',
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    green: '#10b981',
    shadow: '0 4px 24px rgba(30,58,138,0.07)',
  };

  const statCards = [
    { label: 'Total RFQs',    value: stats.totalRfqs,      icon: '📋', color: v.accent,      desc: 'All solicitations', href: '#recent-solicitations' },
    { label: 'Open / Active', value: stats.openRfqs,       icon: '🟢', color: '#059669',     desc: 'Awaiting quotes', href: '#recent-solicitations' },
    { label: 'Suppliers',     value: stats.totalSuppliers, icon: '🏢', color: v.accentLight, desc: 'Registered vendors', href: '/dashboard/supplier-profiles' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', fontFamily: '"Inter", sans-serif' }}>

      {/* ── Page Header ── */}
      <div style={{ borderBottom: `1px solid ${v.border}`, paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 5, height: 48, borderRadius: 4, background: `linear-gradient(180deg, ${v.accent}, ${v.accentLight})`, flexShrink: 0 }} />
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: v.textPrimary, margin: 0, letterSpacing: '-0.5px' }}>
              Procurement Officer Portal
            </h1>
            <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: v.textSecondary, margin: '0.25rem 0 0 0' }}>
              Manage RFQs, review supplier quotes, and track procurement activities.
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {statCards.map(card => (
          <a href={card.href} key={card.label} style={{
            background: v.surface,
            border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.5rem',
            boxShadow: v.shadow, position: 'relative', overflow: 'hidden',
            display: 'block', textDecoration: 'none', cursor: 'pointer',
            transition: 'all 0.2s ease-in-out'
          }} className="hover:-translate-y-1 hover:shadow-lg hover:border-amber-500/40 group">
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: card.color }} />
            <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{card.icon}</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: v.textPrimary, lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: v.textPrimary, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {card.label}
              <span style={{ fontSize: '0.75rem', opacity: 0, transition: 'opacity 0.25s ease' }} className="group-hover:opacity-100 text-[var(--accent)]">
                →
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: v.textSecondary, marginTop: '0.25rem' }}>{card.desc}</div>
          </a>
        ))}
      </div>

      {/* ── Decision Intelligence & Forecasting Widgets (Point 6) ── */}
      <Suspense fallback={<ForecastSkeleton />}>
        <ForecastIntelligenceSection />
      </Suspense>

      {/* ── Recent RFQs Table ── */}
      <div id="recent-solicitations" style={{
        background: v.surface,
        border: `1px solid ${v.border}`, borderRadius: '1.25rem', overflow: 'hidden', boxShadow: v.shadow,
        scrollMarginTop: '5rem'
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${v.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: v.textPrimary, margin: 0 }}>Recent Solicitations</h2>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textMuted, background: 'rgba(0,0,0,0.04)', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
            Last {rfqs.length} records
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--section-bg)', borderBottom: `1px solid ${v.border}` }}>
                {['RFQ No.', 'Title', 'Budget (₱)', 'Deadline', 'Status'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: v.textSecondary, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rfqs.map((rfq) => {
                const s = STATUS_STYLE[rfq.status] ?? { bg: 'rgba(30,58,138,0.05)', color: v.textSecondary, border: `1px solid ${v.border}` };
                return (
                  <tr key={rfq.id} style={{ borderBottom: `1px solid ${v.border}` }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      <a href={`/dashboard/officer/rfq/${rfq.id}`} style={{ color: v.accent, textDecoration: 'none' }}>
                        {rfq.rfqNumber}
                      </a>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: v.textPrimary, maxWidth: '280px', fontWeight: 500 }}>
                      {rfq.title}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: v.textSecondary, whiteSpace: 'nowrap', fontWeight: 600 }}>
                      ₱{Number(rfq.approvedBudgetContract).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: v.textSecondary, whiteSpace: 'nowrap', fontWeight: 500 }}>
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
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: v.textSecondary, fontWeight: 500 }}>
                    No solicitations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}