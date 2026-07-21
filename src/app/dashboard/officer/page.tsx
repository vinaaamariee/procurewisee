import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import ForecastIntelligenceSection from './ForecastIntelligenceSection';
import ForecastSkeleton from './ForecastSkeleton';
import { startTimer } from '@/lib/performance-logger';
import EmptyState from '@/components/ui/EmptyState';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import BSCInfoCenter from '@/components/dashboard/BSCInfoCenter';
import HeroSection from '@/components/dashboard/HeroSection';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardShell from '@/components/dashboard/DashboardShell';
import Footer from '@/components/dashboard/Footer';
import StatCard from '@/components/dashboard/StatCard';
import RecentRFQTable from '@/components/dashboard/RecentRFQTable';
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
  Sparkles,
  TrendingUp,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

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
      desc: "All solicitations issued",
      href: "#recent-solicitations",
      icon: ClipboardList,
      accentClass: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    },
    {
      label: "Open / Active",
      value: stats.openRfqs,
      desc: "Awaiting supplier quotes",
      href: "#recent-solicitations",
      icon: CircleDot,
      accentClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    },
    {
      label: "Registered Suppliers",
      value: stats.totalSuppliers,
      desc: "Verified vendor registry",
      href: "/dashboard/supplier-profiles",
      icon: Building2,
      accentClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300",
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
    <DashboardShell>

      {/* ── Page Header ─────────────────────────────────────── */}
      <DashboardHeader />

      {/* ── Hero Banner ─────────────────────────────────────── */}
      <Suspense fallback={
        <div className="h-40 rounded-3xl animate-pulse" style={{ background: "var(--surface)" }} />
      }>
        <HeroSection />
      </Suspense>

      {/* ── KPI Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            desc={card.desc}
            href={card.href}
            Icon={card.icon}
            accentClass={card.accentClass}
          />
        ))}
      </div>

      {/* ── Tasks + Activity ────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">

        {/* Today's Tasks */}
        <div className="xl:col-span-3">
          <div
            className="h-full overflow-hidden rounded-3xl border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {/* Card header */}
            <div
              className="flex items-center justify-between gap-4 border-b px-6 py-5"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "var(--accent-glass)", color: "var(--accent)" }}
                >
                  <Target className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                    Today&apos;s Tasks
                  </h2>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Urgent workflows awaiting your action
                  </p>
                </div>
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  background: "var(--accent-glass)",
                  color: "var(--accent)",
                  border: "1px solid var(--border-accent)",
                }}
              >
                {tasks.length} pending
              </span>
            </div>

            {/* Tasks list */}
            <div className="p-4 space-y-3">
              {tasks.length > 0 ? (
                tasks.map((task) => {
                  const Icon = taskIcon[task.type];
                  return (
                    <div
                      key={task.id}
                      className="group flex flex-col gap-4 rounded-2xl border p-4 transition-all duration-200 hover:border-[var(--border-accent)] hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      style={{
                        background: "var(--bg-deep)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm"
                          style={{ background: "var(--surface)", color: "var(--accent)" }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${taskAccent[task.type]}`}
                            >
                              {task.badge}
                            </span>
                            <span
                              className="text-xs font-medium"
                              style={{ color: "var(--text-muted)" }}
                            >
                              Due: {task.dueDate}
                            </span>
                          </div>
                          <p
                            className="truncate text-sm font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {task.title}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={task.link}
                        className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 sm:shrink-0"
                        style={{ background: "var(--accent)" }}
                      >
                        {task.btnLabel}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div
                  className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center"
                  style={{ borderColor: "var(--border)" }}
                >
                  <PartyPopper className="h-10 w-10 text-amber-500" />
                  <div>
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      All caught up!
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      No pending tasks require your attention today.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BSC Info Center */}
        <div className="xl:col-span-2">
          <BSCInfoCenter />
        </div>
      </div>

      {/* ── Activity Timeline ───────────────────────────────── */}
      <ActivityTimeline limit={10} />

      {/* ── Forecast Intelligence ────────────────────────────── */}
      <div
        className="overflow-hidden rounded-3xl border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Forecast header */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-5"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "rgba(166,118,29,0.1)", color: "var(--secondary)" }}
            >
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                Forecast Intelligence
              </h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                ARIMA-powered price prediction for smarter procurement timing
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            style={{
              background: "rgba(166,118,29,0.1)",
              color: "var(--secondary)",
              border: "1px solid rgba(166,118,29,0.2)",
            }}
          >
            <TrendingUp className="h-3 w-3" />
            AI-Powered
          </div>
        </div>

        <div className="p-6">
          <Suspense fallback={<ForecastSkeleton />}>
            <ForecastIntelligenceSection />
          </Suspense>
        </div>
      </div>

      {/* ── Recent Solicitations Table ───────────────────────── */}
      <RecentRFQTable rfqs={rfqs} />

      {/* ── Footer ──────────────────────────────────────────── */}
      <Footer />

    </DashboardShell>
  );
}