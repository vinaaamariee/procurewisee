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
  CalendarDays,
  Plus,
  UsersRound,
  BarChart3,
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
  const { profile } = await requireRole('Procurement Officer');
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
      accent: "bg-[#74171B]/10 text-[#74171B] dark:bg-[#74171B]/30 dark:text-red-200",
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
      accent: "bg-[#D4A017]/15 text-[#A6761D] dark:bg-[#D4A017]/20 dark:text-[#F5D47A]",
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

  const formattedToday = new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(350px,0.95fr)]">
        <div className="space-y-6">
          <section className="relative min-h-[218px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-7 shadow-[var(--shadow-card)] sm:px-8">
            <div className="absolute inset-y-0 right-0 w-1/2 opacity-40" style={{ background: "radial-gradient(circle at 72% 50%, var(--accent-glass), transparent 67%)" }} />
            <div className="absolute -right-5 bottom-[-40px] select-none font-[family-name:var(--font-display)] text-[180px] font-bold leading-none text-[var(--accent)] opacity-[0.035]">BSC</div>
            <div className="relative max-w-xl">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-[#74171B]">Procurement workspace</p>
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[var(--text-primary)] sm:text-4xl">
                Good morning, {profile.fullName?.split(" ")[0] || "Officer"}.
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">
                Manage solicitations, evaluate supplier quotations, and keep every procurement workflow moving.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                <CalendarDays className="h-4 w-4 text-[#74171B]" />
                {formattedToday}
              </div>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-3">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.label} href={card.href} className="block">
                  <Card className="group h-full p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.11em] text-[var(--text-secondary)]">{card.label}</p>
                        <p className="mt-2 text-3xl font-black tracking-tight text-[var(--text-primary)]">{card.value}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{card.desc}</p>
                      </div>
                      <div className={`rounded-lg p-3 ${card.accent}`}><Icon className="h-5 w-5" /></div>
                    </div>
                    <div className="mt-5 h-1 overflow-hidden rounded-full bg-[var(--bg-dark)]"><div className="h-full w-2/3 rounded-full bg-[#74171B]" /></div>
                  </Card>
                </Link>
              );
            })}
          </div>

          <Card className="p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-6 py-4">
              <div className="flex items-center gap-2 text-[#74171B]"><Target className="h-4 w-4" /><span className="text-sm font-bold">Today&apos;s tasks</span></div>
              <span className="text-xs font-bold text-[#74171B]">Workflow queue <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></span>
            </div>
            <div className="p-4 sm:p-5">
              {tasks.length > 0 ? (
                <div className="space-y-1">
                  {tasks.map((task) => {
                    const Icon = taskIcon[task.type];
                    return (
                      <div key={task.id} className="group flex flex-col gap-3 rounded-lg px-3 py-3 transition hover:bg-[var(--surface-hover)] sm:flex-row sm:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-dark)] text-[#74171B]"><Icon className="h-4 w-4" /></div>
                          <div className="min-w-0">
                            <div className="mb-1 flex flex-wrap items-center gap-2"><span className={`rounded-md border px-2 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-wide ${taskAccent[task.type]}`}>{task.badge}</span><span className="text-[0.68rem] text-[var(--text-muted)]">Due {task.dueDate}</span></div>
                            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{task.title}</p>
                          </div>
                        </div>
                        <Link href={task.link} className="inline-flex items-center justify-center gap-1 rounded-md border border-[#74171B]/50 px-3 py-1.5 text-xs font-bold text-[#74171B] transition hover:bg-[#74171B] hover:text-white">{task.btnLabel}<ArrowRight className="h-3 w-3" /></Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center"><PartyPopper className="mx-auto mb-2 h-7 w-7 text-[#D4A017]" /><p className="text-sm font-medium text-[var(--text-muted)]">All caught up. No tasks are awaiting action.</p></div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <Link href="/dashboard/officer/rfq/new" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#74171B] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#5F0E12]"><Plus className="h-4 w-4" />New RFQ</Link>
            <Link href="/dashboard/supplier-profiles" className="inline-flex items-center justify-center gap-2 rounded-md border border-[#74171B]/40 bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[#74171B] transition hover:bg-[#74171B]/5"><UsersRound className="h-4 w-4" />Suppliers</Link>
            <Link href="/dashboard/officer/analytics" className="inline-flex items-center justify-center gap-2 rounded-md border border-[#74171B]/40 bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[#74171B] transition hover:bg-[#74171B]/5"><BarChart3 className="h-4 w-4" />Reports</Link>
          </div>

          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4"><div><h2 className="text-sm font-bold text-[#74171B]">BSC info center</h2><p className="mt-0.5 text-xs text-[var(--text-muted)]">Live procurement updates</p></div><span className="inline-flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-wide text-[var(--text-muted)]"><span className="h-2 w-2 rounded-full bg-emerald-500" />Live feed</span></div>
            <div className="flex gap-5 border-b border-[var(--border)] px-5 text-xs font-bold"><span className="border-b-2 border-[#74171B] py-3 text-[#74171B]">Active RFQs</span><span className="py-3 text-[var(--text-muted)]">Announcements</span><span className="py-3 text-[var(--text-muted)]">News</span></div>
            <div className="divide-y divide-[var(--border)] px-5">
              {rfqs.slice(0, 3).map((rfq) => <Link key={rfq.id} href={`/dashboard/officer/rfq/${rfq.id}`} className="flex items-center justify-between gap-3 py-3 transition hover:bg-[var(--surface-hover)]"><div className="min-w-0"><span className="mr-2 inline-flex rounded-md bg-[#D4A017]/15 px-2 py-1 text-[0.6rem] font-extrabold text-[#A6761D]">{rfq.rfqNumber}</span><span className="text-xs font-semibold text-[var(--text-primary)]">{rfq.title}</span></div><span className="shrink-0 text-[0.65rem] text-[var(--text-muted)]">{rfq.deadlineDate ? new Date(rfq.deadlineDate).toLocaleDateString("en-PH", { month: "short", day: "numeric" }) : "No deadline"}</span></Link>)}
              {rfqs.length === 0 && <p className="py-8 text-center text-sm text-[var(--text-muted)]">No RFQs are available yet.</p>}
            </div>
            <Link href="/dashboard/officer/rfq" className="flex items-center gap-1 border-t border-[var(--border)] px-5 py-3 text-xs font-bold text-[#74171B]">View all RFQs <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Card>

          <ActivityFeed limit={6} compact />
        </div>
      </div>

      <Suspense fallback={<ForecastSkeleton />}><ForecastIntelligenceSection /></Suspense>

      <TableContainer id="recent-solicitations" className="scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-6 py-4"><SectionHeader title="Recent RFQs" subtitle="Latest solicitation activity across the procurement workspace." /><Link href="/dashboard/officer/rfq" className="text-xs font-bold text-[#74171B]">View all RFQs <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[860px] border-collapse text-sm"><thead><tr className="border-b border-[var(--border)] bg-[var(--bg-dark)]">{["RFQ number", "Title", "Approved budget", "Deadline", "Status", "Action"].map((h) => <th key={h} className="px-5 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">{h}</th>)}</tr></thead><tbody>{rfqs.map((rfq) => { const deadline = rfq.deadlineDate ? new Date(rfq.deadlineDate) : null; return <tr key={rfq.id} className="border-b border-[var(--border)] transition hover:bg-[var(--surface-hover)]"><td className="px-5 py-4 font-bold text-[#74171B]">{rfq.rfqNumber}</td><td className="max-w-[320px] px-5 py-4 font-medium text-[var(--text-primary)]">{rfq.title}</td><td className="px-5 py-4 font-semibold text-[var(--text-secondary)]">₱{Number(rfq.approvedBudgetContract).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td><td className="px-5 py-4 text-[var(--text-secondary)]">{deadline ? deadline.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—"}</td><td className="px-5 py-4"><StatusBadge status={rfq.status} /></td><td className="px-5 py-4"><Link href={`/dashboard/officer/rfq/${rfq.id}`} className="inline-flex items-center gap-1 rounded-md border border-[#74171B]/40 px-3 py-1.5 text-xs font-bold text-[#74171B] hover:bg-[#74171B] hover:text-white">View RFQ <ArrowRight className="h-3 w-3" /></Link></td></tr>; })}{rfqs.length === 0 && <tr><td colSpan={6} className="p-4"><EmptyState preset="rfq" title="No Active Solicitations" description="No requests for quotation have been created yet. Draft a new RFQ from the solicitation workspace." action={{ label: "+ New RFQ", href: "/dashboard/officer/rfq/new" }} /></td></tr>}</tbody></table></div>
      </TableContainer>
    </div>
  );
}
