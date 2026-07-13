import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import ForecastIntelligenceSection from './ForecastIntelligenceSection';
import ForecastSkeleton from './ForecastSkeleton';
import { startTimer } from '@/lib/performance-logger';
import EmptyState from '@/components/ui/EmptyState';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

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

interface DashboardTask {
  id: string;
  type: 'pr' | 'rfq' | 'po' | 'quote';
  title: string;
  badge: string;
  dueDate: string;
  link: string;
  btnLabel: string;
}

async function getOfficerTasks(): Promise<DashboardTask[]> {
  const timer = startTimer('getOfficerTasks');
  
  const [prs, rfqs, pos, quotes] = await Promise.all([
    prisma.purchaseRequest.findMany({
      where: { status: { in: ['Submitted', 'UnderReview'] } },
      select: { id: true, prNumber: true, purpose: true, requestDate: true },
      orderBy: { requestDate: 'asc' },
      take: 2
    }),
    prisma.requestForQuote.findMany({
      where: { status: 'Published' },
      select: { id: true, rfqNumber: true, title: true, deadlineDate: true },
      orderBy: { deadlineDate: 'asc' },
      take: 2
    }),
    prisma.purchaseOrder.findMany({
      where: { status: { in: ['Draft', 'Approved'] } },
      select: { id: true, poNumber: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
      take: 2
    }),
    prisma.supplierQuote.findMany({
      where: { status: { in: ['Submitted', 'UnderReview'] } },
      select: { 
        id: true, 
        rfq: { select: { id: true, rfqNumber: true, title: true } }, 
        supplier: { select: { companyName: true } },
        submissionDate: true 
      },
      orderBy: { submissionDate: 'asc' },
      take: 2
    })
  ]);

  timer.end();

  const taskList: DashboardTask[] = [];

  prs.forEach(pr => {
    taskList.push({
      id: `pr-${pr.id}`,
      type: 'pr',
      title: `${pr.prNumber}: ${pr.purpose}`,
      badge: 'PR Audit',
      dueDate: new Date(pr.requestDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
      link: `/dashboard/officer/pr/${pr.id}`,
      btnLabel: 'Audit PR'
    });
  });

  rfqs.forEach(rfq => {
    taskList.push({
      id: `rfq-${rfq.id}`,
      type: 'rfq',
      title: `${rfq.rfqNumber}: ${rfq.title}`,
      badge: 'RFQ Deadline',
      dueDate: new Date(rfq.deadlineDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
      link: `/dashboard/officer/rfq/${rfq.id}`,
      btnLabel: 'View RFQ'
    });
  });

  pos.forEach(po => {
    taskList.push({
      id: `po-${po.id}`,
      type: 'po',
      title: `${po.poNumber}: Purchase Order Draft`,
      badge: 'PO Print',
      dueDate: new Date(po.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
      link: `/dashboard/officer/po/${po.id}`,
      btnLabel: 'Print PO'
    });
  });

  quotes.forEach(q => {
    taskList.push({
      id: `quote-${q.id}`,
      type: 'quote',
      title: `Quote from ${q.supplier.companyName} for ${q.rfq.rfqNumber}`,
      badge: 'Quote Review',
      dueDate: new Date(q.submissionDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
      link: `/dashboard/officer/rfq/${q.rfq.id}`,
      btnLabel: 'Review Quote'
    });
  });

  return taskList;
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
  const [stats, rfqs, tasks] = await Promise.all([
    getOfficerStats(),
    getRecentRfqs(),
    getOfficerTasks(),
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

      {/* ── Dashboard Action Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr lg:grid-cols-3', gap: '2rem' }} className="grid grid-cols-1 lg:grid-cols-3">
        {/* Left Column: Today's Tasks */}
        <div style={{ gridColumn: 'span 2' }} className="lg:col-span-2">
          <div style={{
            background: v.surface,
            border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.5rem',
            boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: '1.25rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: v.textPrimary, margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🎯 Today&apos;s Tasks
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                A list of urgent workflows requiring immediate review, validation, or contract execution.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {tasks.length > 0 ? (
                tasks.map((task) => {
                  const badgeColor = 
                    task.type === 'pr' 
                      ? { bg: 'rgba(220,179,83,0.15)', text: '#b88a1b' }
                      : task.type === 'rfq'
                      ? { bg: 'rgba(239,68,68,0.1)', text: '#dc2626' }
                      : task.type === 'po'
                      ? { bg: 'rgba(79,70,229,0.1)', text: '#4f46e5' }
                      : { bg: 'rgba(16,185,129,0.1)', text: '#059669' };

                  return (
                    <div 
                      key={task.id} 
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '1rem',
                        background: 'var(--bg-dark)', border: `1px solid ${v.border}`, gap: '1rem'
                      }}
                      className="flex-col sm:flex-row gap-4"
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start', flexGrow: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ 
                            fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px',
                            backgroundColor: badgeColor.bg, color: badgeColor.text, textTransform: 'uppercase', letterSpacing: '0.5px'
                          }}>
                            {task.badge}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            Due: {task.dueDate}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: v.textPrimary, textAlign: 'left' }}>
                          {task.title}
                        </div>
                      </div>
                      
                      <a 
                        href={task.link} 
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem',
                          background: `linear-gradient(135deg, ${v.accent}, ${v.accentLight})`, color: '#fff',
                          fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap',
                          boxShadow: '0 2px 8px rgba(30,58,138,0.1)',
                          transition: 'all 0.15s ease'
                        }}
                        className="hover:opacity-90 hover:shadow-md w-full sm:w-auto"
                      >
                        {task.btnLabel} &rarr;
                      </a>
                    </div>
                  );
                })
              ) : (
                <div style={{
                  padding: '2.5rem 1.5rem', border: `1px dashed ${v.border}`, borderRadius: '1rem',
                  textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
                  All caught up! No tasks awaiting attention today.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Statistics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'space-between' }}>
          {statCards.map(card => (
            <a href={card.href} key={card.label} style={{
              background: v.surface,
              border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.25rem 1.5rem',
              boxShadow: v.shadow, position: 'relative', overflow: 'hidden',
              display: 'block', textDecoration: 'none', cursor: 'pointer',
              transition: 'all 0.2s ease-in-out', flexGrow: 1
            }} className="hover:-translate-y-0.5 hover:shadow-lg hover:border-amber-500/40 group">
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: card.color }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: v.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</div>
                  <div style={{ fontSize: '1.875rem', fontWeight: 900, color: v.textPrimary, marginTop: '0.25rem', lineHeight: 1 }}>{card.value}</div>
                </div>
                <div style={{ fontSize: '1.875rem' }}>{card.icon}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Decision Intelligence & Forecasting Widgets (Point 6) ── */}
      <Suspense fallback={<ForecastSkeleton />}>
        <ForecastIntelligenceSection />
      </Suspense>

      {/* ── Activity Feed + Recent Solicitations ── */}
      <div style={{ display: 'grid', gap: '2rem' }} className="grid grid-cols-1 xl:grid-cols-5">
        {/* Activity feed — spans 2 of 5 cols */}
        <div className="xl:col-span-2">
          <ActivityFeed limit={10} />
        </div>

        {/* Recent RFQs Table — spans 3 of 5 cols */}
        <div className="xl:col-span-3">

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
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                      {rfq.deadlineDate ? (
                        (() => {
                          const deadline = new Date(rfq.deadlineDate);
                          const formattedDeadline = deadline.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
                          
                          const now = new Date();
                          const dDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
                          const nDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                          const diffTime = dDate.getTime() - nDate.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          let remainingLabel = "";
                          let textColor = "#059669"; // Green
                          
                          if (diffDays < 0) {
                            remainingLabel = "Expired";
                            textColor = "#dc2626"; // Red
                          } else if (diffDays === 0) {
                            remainingLabel = "Expiring Today";
                            textColor = "#dc2626"; // Red
                          } else if (diffDays === 1) {
                            remainingLabel = "1 Day Remaining";
                            textColor = "#dc2626"; // Red
                          } else {
                            remainingLabel = `${diffDays} Days Remaining`;
                            if (diffDays <= 5) {
                              textColor = "#d97706"; // Yellow
                            } else {
                              textColor = "#059669"; // Green
                            }
                          }
                          
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                              <span style={{ color: v.textSecondary, fontWeight: 600 }}>{formattedDeadline}</span>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: textColor }}>{remainingLabel}</span>
                            </div>
                          );
                        })()
                      ) : '—'}
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
                  <td colSpan={5} style={{ padding: '1rem' }}>
                    <EmptyState
                      preset="rfq"
                      title="No Active Solicitations"
                      description="No requests for quotation have been created yet. Draft a new RFQ from the solicitation workspace."
                      action={{ label: '+ New RFQ', href: '/dashboard/officer/rfq/new' }}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </div>{/* end xl:col-span-3 */}
      </div>{/* end activity+solicitations grid */}

    </div>
  );
}