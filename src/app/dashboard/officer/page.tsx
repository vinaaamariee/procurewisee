import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import ForecastIntelligenceSection from './ForecastIntelligenceSection';
import ForecastSkeleton from './ForecastSkeleton';
import { startTimer } from '@/lib/performance-logger';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import BSCInfoCenter from '@/components/dashboard/BSCInfoCenter';
import HeroSection from '@/components/dashboard/HeroSection';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardShell from '@/components/dashboard/DashboardShell';
import Footer from '@/components/dashboard/Footer';
import StatCard from '@/components/dashboard/StatCard';
import RecentRFQTable from '@/components/dashboard/RecentRFQTable';
import TodayTasks, { DashboardTask } from '@/components/dashboard/TodayTasks';
import {
  ClipboardList,
  CircleDot,
  Building2,
  Sparkles,
  TrendingUp,
} from "lucide-react";

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
          <TodayTasks tasks={tasks} />
        </div>

        {/* BSC Info Center */}
        <div className="xl:col-span-2">
          <BSCInfoCenter activeRfqs={stats.openRfqs} />
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