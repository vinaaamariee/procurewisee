'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ClipboardList, Clock, CheckCircle, FileText, AlertTriangle } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';

export interface RFQItem {
  id: string | number;
  rfqNumber?: string;
  title: string;
  status: string;
  deadlineDate?: Date | string | null;
  closingDate?: Date | string | null;
  approvedBudgetContract?: any;
  supplierCount?: number;
}

interface RecentRFQTableProps {
  published: RFQItem[];
  draft: RFQItem[];
  closingSoon: RFQItem[];
  closed: RFQItem[];
}

type TabType = 'published' | 'draft' | 'closingSoon' | 'closed';

export default function RecentRFQTable({
  published = [],
  draft = [],
  closingSoon = [],
  closed = [],
}: RecentRFQTableProps) {
  const [activeTab, setActiveTab] = useState<TabType>('published');

  const getActiveList = () => {
    switch (activeTab) {
      case 'published':
        return published;
      case 'draft':
        return draft;
      case 'closingSoon':
        return closingSoon;
      case 'closed':
        return closed;
      default:
        return published;
    }
  };

  const activeList = getActiveList();

  const tabsConfig = [
    { id: 'published', label: 'Published', count: published.length, icon: CheckCircle },
    { id: 'draft', label: 'Drafts', count: draft.length, icon: FileText },
    { id: 'closingSoon', label: 'Closing Soon', count: closingSoon.length, icon: Clock },
    { id: 'closed', label: 'Closed / Awarded', count: closed.length, icon: AlertTriangle },
  ];

  return (
    <section
      id="recent-solicitations"
      className="overflow-hidden rounded-2xl border border-[var(--border)] scroll-mt-24 bg-[var(--surface)] shadow-[var(--shadow-card)]"
    >
      {/* Table Header with Tabs */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-[var(--border)] text-[var(--accent)]">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
              Solicitation Board
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Monitor Requests for Quotation (RFQs) by status
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 w-fit">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 active:scale-[0.97] ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-[var(--accent)] shadow-sm border border-slate-200/40 dark:border-slate-700/40'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.25 text-[10px] font-extrabold ${
                    isActive
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-dark)]">
              {['RFQ No.', 'Title', 'Budget (₱)', 'Deadline', 'Status'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeList.map((rfq) => {
              const rawDeadline = rfq.deadlineDate ?? rfq.closingDate;
              const deadline = rawDeadline ? new Date(rawDeadline) : null;
              let remainingLabel = '—';
              let remainingClass = 'text-emerald-600';

              if (deadline && !isNaN(deadline.getTime())) {
                const now = new Date();
                const dDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
                const nDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const diffDays = Math.ceil((dDate.getTime() - nDate.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                  remainingLabel = 'Expired';
                  remainingClass = 'text-red-600';
                } else if (diffDays === 0) {
                  remainingLabel = 'Expiring Today';
                  remainingClass = 'text-red-600';
                } else if (diffDays === 1) {
                  remainingLabel = '1 Day Remaining';
                  remainingClass = 'text-red-600';
                } else if (diffDays <= 5) {
                  remainingLabel = `${diffDays} Days Remaining`;
                  remainingClass = 'text-amber-600';
                } else {
                  remainingLabel = `${diffDays} Days Remaining`;
                  remainingClass = 'text-emerald-600';
                }
              }

              const rfqNum = rfq.rfqNumber || String(rfq.id).slice(0, 8);
              const budgetVal = rfq.approvedBudgetContract != null ? Number(rfq.approvedBudgetContract) : null;

              return (
                <tr
                  key={rfq.id}
                  className="group border-b border-[var(--border)] transition-colors duration-150 hover:bg-[var(--surface-hover)]"
                >
                  <td className="px-6 py-4 font-bold whitespace-nowrap">
                    <Link
                      href={`/dashboard/officer/rfq/${rfq.id}`}
                      className="font-bold text-[var(--accent)] hover:underline active:scale-[0.98] transition-transform duration-100"
                    >
                      {rfqNum}
                    </Link>
                  </td>
                  <td className="max-w-[280px] px-6 py-4 font-medium text-[var(--text-primary)]">
                    <span className="line-clamp-1">{rfq.title}</span>
                  </td>
                  <td className="px-6 py-4 font-semibold whitespace-nowrap text-[var(--text-secondary)]">
                    {budgetVal != null ? (
                      `₱${budgetVal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                    ) : rfq.supplierCount != null ? (
                      `${rfq.supplierCount} Suppliers`
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {deadline && !isNaN(deadline.getTime()) ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-[var(--text-secondary)]">
                          {deadline.toLocaleDateString('en-PH', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className={`text-xs font-bold ${remainingClass}`}>
                          {remainingLabel}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={rfq.status} />
                  </td>
                </tr>
              );
            })}

            {activeList.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6">
                  <EmptyState
                    preset="rfq"
                    title={`No ${activeTab === 'closingSoon' ? 'closing soon' : activeTab} RFQs`}
                    description={`There are currently no Request for Quotations categorized under ${activeTab}.`}
                    action={{ label: '+ Create RFQ', href: '/dashboard/officer/rfq/new' }}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Widget Footer */}
      <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-3.5 bg-slate-50/50 dark:bg-slate-900/10">
        <span className="text-xs text-[var(--text-muted)] font-medium">
          Showing {activeList.length} solicitation record{activeList.length === 1 ? '' : 's'}
        </span>
        <Link
          href="/dashboard/officer/rfq"
          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline active:scale-[0.98] transition-transform duration-100"
        >
          <span>Open Full Solicitations Panel</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}