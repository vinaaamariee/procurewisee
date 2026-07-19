import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import ForecastIntelligenceSection from './ForecastIntelligenceSection';
import ForecastSkeleton from './ForecastSkeleton';
import { startTimer } from '@/lib/performance-logger';
import EmptyState from '@/components/ui/EmptyState';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import Link from "next/link";
import {
  ClipboardList,
  CircleDot,
  Building2,
  Target,
  ArrowRight,
  FileText,
  ShoppingCart,
  Quote,
  PartyPopper,
} from "lucide-react";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import SectionHeader from "@/components/ui/SectionHeader";
import TableContainer from "@/components/ui/TableContainer";

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

export default async function OfficerDashboard() {
  const pageTimer = startTimer('OfficerDashboardPage');
  await requireRole('Procurement Officer');
  const [stats, rfqs, tasks] = await Promise.all([
    getOfficerStats(),
    getRecentRfqs(),
    getOfficerTasks(),
  ]);
  pageTimer.end();

  const statCards = [
    {
      label: "Total RFQs",
      value: stats.totalRfqs,
      desc: "All solicitations",
      href: "#recent-solicitations",
      icon: ClipboardList,
      accent: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    },
    {
      label: "Open / Active",
      value: stats.openRfqs,
      desc: "Awaiting quotes",
      href: "#recent-solicitations",
      icon: CircleDot,
      accent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    },
    {
      label: "Suppliers",
      value: stats.totalSuppliers,
      desc: "Registered vendors",
      href: "/dashboard/supplier-profiles",
      icon: Building2,
      accent: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300",
    },
  ];

  const taskAccent = {
    pr: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
    rfq: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    po: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
    quote: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
  } as const;

  const taskIcon = {
    pr: FileText,
    rfq: ClipboardList,
    po: ShoppingCart,
    quote: Quote,
  } as const;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 border-b border-[var(--border)] pb-6">
        <div className="h-12 w-1.5 rounded-full bg-gradient-to-b from-[var(--accent)] to-[var(--accent-light)]" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Procurement Officer Portal
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage RFQs, review supplier quotes, and track procurement activities.
          </p>
        </div>
      </div>

      {/* Tasks + Stats */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Today's Tasks */}
        <Card className="xl:col-span-2 p-6 space-y-5">
          <div className="flex items-center gap-2 text-[var(--accent)] mb-[-12px]">
            <Target className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Current Focus</span>
          </div>
          <SectionHeader
            title="Today's Tasks"
            subtitle="Urgent workflows requiring review, validation, or execution."
          />

          <div className="space-y-3">
            {tasks.length > 0 ? (
              tasks.map((task) => {
                const Icon = taskIcon[task.type];
                return (
                  <div
                    key={task.id}
                    className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-dark)] p-4 transition hover:border-[var(--border-accent)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 rounded-xl bg-[var(--surface)] p-2.5 text-[var(--accent)] shadow-sm">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${taskAccent[task.type]}`}
                          >
                            {task.badge}
                          </span>
                          <span className="text-xs font-medium text-[var(--text-muted)]">
                            Due: {task.dueDate}
                          </span>
                        </div>
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                          {task.title}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={task.link}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90 sm:w-auto"
                    >
                      {task.btnLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-10 text-center">
                <PartyPopper className="mx-auto mb-3 h-8 w-8 text-amber-500" />
                <p className="text-sm font-medium text-[var(--text-muted)]">
                  All caught up! No tasks awaiting attention today.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href} className="block">
                <Card className="group h-full p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                        {card.label}
                      </p>
                      <p className="mt-2 text-3xl font-black tracking-tight text-[var(--text-primary)]">
                        {card.value}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {card.desc}
                      </p>
                    </div>
                    <div className={`rounded-xl p-3 ${card.accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Forecast */}
      <Suspense fallback={<ForecastSkeleton />}>
        <ForecastIntelligenceSection />
      </Suspense>

      {/* Activity + Recent RFQs */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <ActivityFeed limit={10} />
        </div>

        <div className="xl:col-span-3">
          <TableContainer id="recent-solicitations" className="scroll-mt-24">
            <div className="border-b border-[var(--border)] px-6 py-4">
              <SectionHeader
                title="Recent Solicitations"
                action={
                  <span className="rounded-full bg-[var(--bg-dark)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
                    Last {rfqs.length} records
                  </span>
                }
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg-dark)]">
                    {["RFQ No.", "Title", "Budget (₱)", "Deadline", "Status"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map((rfq) => {
                    const deadline = rfq.deadlineDate ? new Date(rfq.deadlineDate) : null;
                    let remainingLabel = "—";
                    let remainingClass = "text-emerald-600";

                    if (deadline) {
                      const now = new Date();
                      const dDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
                      const nDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      const diffDays = Math.ceil((dDate.getTime() - nDate.getTime()) / (1000 * 60 * 60 * 24));

                      if (diffDays < 0) {
                        remainingLabel = "Expired";
                        remainingClass = "text-red-600";
                      } else if (diffDays === 0) {
                        remainingLabel = "Expiring Today";
                        remainingClass = "text-red-600";
                      } else if (diffDays === 1) {
                        remainingLabel = "1 Day Remaining";
                        remainingClass = "text-red-600";
                      } else if (diffDays <= 5) {
                        remainingLabel = `${diffDays} Days Remaining`;
                        remainingClass = "text-amber-600";
                      } else {
                        remainingLabel = `${diffDays} Days Remaining`;
                        remainingClass = "text-emerald-600";
                      }
                    }

                    return (
                      <tr
                        key={rfq.id}
                        className="border-b border-[var(--border)] transition hover:bg-[var(--surface-hover)]"
                      >
                        <td className="px-5 py-4 font-bold whitespace-nowrap">
                          <Link
                            href={`/dashboard/officer/rfq/${rfq.id}`}
                            className="text-[var(--accent)] hover:underline"
                          >
                            {rfq.rfqNumber}
                          </Link>
                        </td>
                        <td className="max-w-[280px] px-5 py-4 font-medium text-[var(--text-primary)]">
                          {rfq.title}
                        </td>
                        <td className="px-5 py-4 font-semibold whitespace-nowrap text-[var(--text-secondary)]">
                          ₱
                          {Number(rfq.approvedBudgetContract).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {deadline ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-[var(--text-secondary)]">
                                {deadline.toLocaleDateString("en-PH", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                              <span className={`text-xs font-extrabold ${remainingClass}`}>
                                {remainingLabel}
                              </span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={rfq.status} />
                        </td>
                      </tr>
                    );
                  })}

                  {rfqs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4">
                        <EmptyState
                          preset="rfq"
                          title="No Active Solicitations"
                          description="No requests for quotation have been created yet. Draft a new RFQ from the solicitation workspace."
                          action={{ label: "+ New RFQ", href: "/dashboard/officer/rfq/new" }}
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TableContainer>
        </div>
      </div>
    </div>
  );
}