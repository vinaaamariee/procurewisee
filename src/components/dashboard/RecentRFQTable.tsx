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
      className="overflow-hidden rounded-md border border-base-300 scroll-mt-24 bg-base-100 shadow-none"
    >
      {/* Table Header with Tabs */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-base-200 border border-base-300 text-primary">
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
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-md bg-base-200 border border-base-300 w-fit">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors duration-100 ${
                  isActive
                    ? 'bg-base-100 text-primary border border-base-300'
                    : 'text-base-content/70 hover:text-base-content'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`ml-1 rounded px-1.5 py-0.25 text-[10px] font-extrabold ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-base-300 text-base-content/60'
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
            <tr className="border-b border-base-300 bg-base-200">
              {['RFQ No.', 'Title', 'Budget (₱)', 'Deadline', 'Status'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-base-content/80"
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
              let remainingClass = 'text-[var(--accent)]';

              if (deadline && !isNaN(deadline.getTime())) {
                const now = new Date();
                const dDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
                const nDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const diffDays = Math.ceil((dDate.getTime() - nDate.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                  remainingLabel = 'Expired';
                  remainingClass = 'text-[var(--accent)]';
                } else if (diffDays === 0) {
                  remainingLabel = 'Expiring Today';
                  remainingClass = 'text-[var(--accent)]';
                } else if (diffDays === 1) {
                  remainingLabel = '1 Day Remaining';
                  remainingClass = 'text-[var(--accent)]';
                } else if (diffDays <= 5) {
                  remainingLabel = `${diffDays} Days Remaining`;
                  remainingClass = 'text-[var(--secondary)]';
                } else {
                  remainingLabel = `${diffDays} Days Remaining`;
                  remainingClass = 'text-[var(--accent)]';
                }
              }

              const rfqNum = rfq.rfqNumber || String(rfq.id).slice(0, 8);
              const budgetVal = rfq.approvedBudgetContract != null ? Number(rfq.approvedBudgetContract) : null;

              return (
                <tr
                  key={rfq.id}
                  className="group border-b border-base-200 transition-colors duration-100 hover:bg-base-200/50"
                >
                  <td className="px-6 py-3 font-bold whitespace-nowrap">
                    <Link
                      href={`/dashboard/officer/rfq/${rfq.id}`}
                      className="font-bold text-primary hover:underline"
                    >
                      {rfqNum}
                    </Link>
                  </td>
                  <td className="max-w-[280px] px-6 py-3 font-medium text-base-content">
                    <span className="line-clamp-1">{rfq.title}</span>
                  </td>
                  <td className="px-6 py-3 font-semibold whitespace-nowrap text-base-content/80">
                    {budgetVal != null ? (
                      `₱${budgetVal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                    ) : rfq.supplierCount != null ? (
                      `${rfq.supplierCount} Suppliers`
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    {deadline && !isNaN(deadline.getTime()) ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-base-content/85">
                          {deadline.toLocaleDateString('en-PH', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className={`text-[10px] font-bold ${remainingClass}`}>
                          {remainingLabel}
                        </span>
                      </div>
                    ) : (
                      <span className="text-base-content/40">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
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
      <div className="flex items-center justify-between border-t border-base-200 px-6 py-3.5 bg-base-200/50">
        <span className="text-xs text-base-content/60 font-medium">
          Showing {activeList.length} solicitation record{activeList.length === 1 ? '' : 's'}
        </span>
        <Link
          href="/dashboard/officer/rfq"
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          <span>Open Full Solicitations Panel</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}