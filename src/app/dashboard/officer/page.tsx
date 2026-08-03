import { PrStatus } from '@prisma/client';
import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import { startTimer } from '@/lib/performance-logger';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardShell from '@/components/dashboard/DashboardShell';
import StatCard from '@/components/dashboard/StatCard';
import RecentRFQTable from '@/components/dashboard/RecentRFQTable';
import TodayTasks, { DashboardTask } from '@/components/dashboard/TodayTasks';
import {
  FileText,
  ClipboardList,
  ShoppingCart,
  Users,
} from "lucide-react";

export const metadata = { title: 'Officer Dashboard — ProcureWise' };

async function getOfficerStats() {
  const timer = startTimer('getOfficerStats');
  const [pendingPrs, openRfqs, pendingPos, activeSuppliers] = await Promise.all([
    prisma.purchaseRequest.count({
      where: { status: { in: [PrStatus.Submitted, PrStatus.UnderReview, (PrStatus as any).PendingProcurementReview || "Submitted"] as any[] } }
    }),
    prisma.requestForQuote.count({
      where: { status: 'Published' }
    }),
    prisma.purchaseOrder.count({
      where: { status: { in: ['Draft', 'PendingApproval', 'Approved'] } }
    }),
    prisma.supplier.count(),
  ]);
  timer.end();
  return {
    pendingPrs,
    openRfqs,
    pendingPos,
    activeSuppliers,
  };
}

async function getOfficerTasks(): Promise<DashboardTask[]> {
  const timer = startTimer('getOfficerTasks');
  
  const [prs, rfqs, pos, quotes] = await Promise.all([
    prisma.purchaseRequest.findMany({
      where: { status: { in: [PrStatus.Submitted, PrStatus.UnderReview, (PrStatus as any).PendingProcurementReview || "Submitted"] as any[] } },
      select: { id: true, prNumber: true, purpose: true, requestDate: true, department: true, office: true, estimatedBudget: true },
      orderBy: { requestDate: 'asc' },
      take: 5
    }),
    prisma.requestForQuote.findMany({
      where: { status: 'Published' },
      select: { id: true, rfqNumber: true, title: true, deadlineDate: true },
      orderBy: { deadlineDate: 'asc' },
      take: 2
    }),
    prisma.purchaseOrder.findMany({
      where: { status: { in: ['Draft', 'Approved'] } },
      select: { id: true, poNumber: true, createdAt: true, pr: { select: { department: true, office: true } } },
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
    const budgetVal = Number(pr.estimatedBudget);
    taskList.push({
      id: `pr-${pr.id}`,
      type: 'pr',
      title: `${pr.prNumber}: ${pr.purpose}`,
      badge: 'PR Audit',
      dueDate: new Date(pr.requestDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
      link: `/dashboard/officer/pr/${pr.id}`,
      btnLabel: 'Audit PR',
      originator: pr.office || pr.department || 'Procurement Office',
      priority: budgetVal > 50000 ? 'High' : 'Medium'
    });
  });

  rfqs.forEach(rfq => {
    taskList.push({
      id: `rfq-${rfq.id}`,
      type: 'rfq',
      title: `${rfq.rfqNumber}: ${rfq.title}`,
      badge: 'RFQ Solicitation',
      dueDate: new Date(rfq.deadlineDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
      link: `/dashboard/officer/rfq/${rfq.id}`,
      btnLabel: 'View RFQ',
      originator: 'Procurement Office',
      priority: 'Medium'
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
      btnLabel: 'Print PO',
      originator: po.pr?.office || po.pr?.department || 'Procurement Office',
      priority: 'Medium'
    });
  });

  quotes.forEach(q => {
    if (q.supplier && q.rfq) {
      taskList.push({
        id: `quote-${q.id}`,
        type: 'quote',
        title: `Quote from ${q.supplier.companyName} for ${q.rfq.rfqNumber}`,
        badge: 'Quote Review',
        dueDate: new Date(q.submissionDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
        link: `/dashboard/officer/rfq/${q.rfq.id}`,
        btnLabel: 'Review Quote',
        originator: q.supplier.companyName,
        priority: 'High'
      });
    }
  });

  return taskList;
}

async function getDashboardRfqs() {
  const timer = startTimer('getDashboardRfqs');
  
  const [draft, published, closed] = await Promise.all([
    prisma.requestForQuote.findMany({
      where: { status: 'Draft' },
      select: {
        id: true,
        rfqNumber: true,
        title: true,
        status: true,
        deadlineDate: true,
        approvedBudgetContract: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.requestForQuote.findMany({
      where: { status: 'Published' },
      select: {
        id: true,
        rfqNumber: true,
        title: true,
        status: true,
        deadlineDate: true,
        approvedBudgetContract: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.requestForQuote.findMany({
      where: { status: { in: ['Closed', 'Evaluated'] } },
      select: {
        id: true,
        rfqNumber: true,
        title: true,
        status: true,
        deadlineDate: true,
        approvedBudgetContract: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);
  
  // Closing Soon: Published RFQs with deadline expiring in <= 5 days
  const now = new Date();
  const fiveDaysFromNow = new Date();
  fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
  
  const closingSoon = await prisma.requestForQuote.findMany({
    where: {
      status: 'Published',
      deadlineDate: {
        gte: now,
        lte: fiveDaysFromNow,
      },
    },
    select: {
      id: true,
      rfqNumber: true,
      title: true,
      status: true,
      deadlineDate: true,
      approvedBudgetContract: true,
    },
    orderBy: { deadlineDate: 'asc' },
    take: 10,
  });

  timer.end();

  return {
    draft,
    published,
    closingSoon,
    closed,
  };
}

export default async function OfficerDashboard() {
  const pageTimer = startTimer('OfficerDashboardPage');
  const { profile } = await requireRole('Procurement Officer');
  const [stats, rfqData, tasks] = await Promise.all([
    getOfficerStats(),
    getDashboardRfqs(),
    getOfficerTasks(),
  ]);
  pageTimer.end();

  const statCards = [
    {
      label: "Pending Purchase Requests",
      value: stats.pendingPrs,
      desc: "Awaiting review & PR conversion",
      href: "/dashboard/officer/pr",
      icon: FileText,
      accentClass: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    },
    {
      label: "Open RFQs",
      value: stats.openRfqs,
      desc: "Active solicitations on portal",
      href: "/dashboard/officer/rfq",
      icon: ClipboardList,
      accentClass: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    },
    {
      label: "Pending Purchase Orders",
      value: stats.pendingPos,
      desc: "POs awaiting approval & dispatch",
      href: "/dashboard/officer/po",
      icon: ShoppingCart,
      accentClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    },
    {
      label: "Active Suppliers",
      value: stats.activeSuppliers,
      desc: "Registered vendor directory",
      href: "/dashboard/supplier-profiles",
      icon: Users,
      accentClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300",
    },
  ];

  return (
    <DashboardShell>
      {/* Page Header */}
      <DashboardHeader profile={profile} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
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

      {/* Primary Section: Today's Tasks */}
      <div className="w-full">
        <TodayTasks tasks={tasks} />
      </div>

      {/* Recent Solicitations Table */}
      <div id="recent-solicitations" className="scroll-mt-24">
        <RecentRFQTable
          published={rfqData.published}
          draft={rfqData.draft}
          closingSoon={rfqData.closingSoon}
          closed={rfqData.closed}
        />
      </div>
    </DashboardShell>
  );
}
