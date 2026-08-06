import Link from "next/link";
import { PrStatus, PmrStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import { startTimer } from "@/lib/performance-logger";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import SectionHeader from "@/components/ui/SectionHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  FileCheck2,
  Undo2,
  CalendarCheck2,
  ClipboardCheck,
  Truck,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export const metadata = { title: "Procurement Officer Dashboard — ProcureWise" };

async function getOfficerStats() {
  const timer = startTimer("getOfficerStats");
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    pendingPrs,
    returnedPrs,
    verifiedToday,
    pmrCount,
    pendingDeliveries,
    partialDeliveries,
    deliveredCount,
  ] = await Promise.all([
    prisma.purchaseRequest.count({
      where: {
        status: { in: [PrStatus.Submitted, PrStatus.UnderReview, (PrStatus as any).PendingProcurementReview || "Submitted"] as any[] },
      },
    }),
    prisma.purchaseRequest.count({
      where: {
        status: { in: [(PrStatus as any).Returned || "ReturnedForRevision", PrStatus.ReturnedForRevision] as any[] },
      },
    }),
    prisma.purchaseRequest.count({
      where: { status: PrStatus.Approved, approvedAt: { gte: startOfDay } },
    }),
    prisma.procurementMonitoringRecord.count({ where: { status: PmrStatus.Active } }),
    prisma.purchaseOrder.count({
      where: { status: { in: ["Draft", "PendingApproval", "Approved", "SentToSupplier"] } },
    }),
    prisma.purchaseOrder.count({ where: { status: "PartiallyDelivered" } }),
    prisma.purchaseOrder.count({ where: { status: { in: ["Delivered", "Completed"] } } }),
  ]);
  timer.end();

  return {
    pendingPrs,
    returnedPrs,
    verifiedToday,
    pmrCount,
    pendingDeliveries,
    partialDeliveries,
    deliveredCount,
  };
}

async function getProcurementAlerts() {
  const timer = startTimer("getProcurementAlerts");

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const stalePrs = await prisma.purchaseRequest.findMany({
    where: {
      status: { in: [PrStatus.Submitted, PrStatus.UnderReview, (PrStatus as any).PendingProcurementReview || "Submitted"] as any[] },
      submittedAt: { lte: threeDaysAgo },
    },
    select: {
      id: true,
      prNumber: true,
      department: true,
      office: true,
      purpose: true,
      submittedAt: true,
    },
    orderBy: { submittedAt: "asc" },
    take: 5,
  });

  const overdueDeliveries = await prisma.purchaseOrder.findMany({
    where: {
      status: { in: ["Approved", "SentToSupplier"] },
      dateOfDelivery: { not: null, lte: threeDaysAgo },
    },
    select: {
      id: true,
      poNumber: true,
      supplier: { select: { companyName: true } },
      dateOfDelivery: true,
      totalCost: true,
    },
    orderBy: { dateOfDelivery: "asc" },
    take: 5,
  });

  const now = new Date();
  const stalePrsWithAge = stalePrs.map((pr) => ({
    ...pr,
    daysPending: Math.ceil((now.getTime() - (pr.submittedAt ? pr.submittedAt.getTime() : now.getTime())) / (1000 * 60 * 60 * 24)),
  }));

  timer.end();
  return { stalePrs: stalePrsWithAge, overdueDeliveries };
}

async function getRecentActivity() {
  const timer = startTimer("getRecentActivity");

  const [recentlyVerified, recentPmrs] = await Promise.all([
    prisma.purchaseRequest.findMany({
      where: { status: PrStatus.Approved },
      select: {
        id: true,
        prNumber: true,
        department: true,
        office: true,
        approvedAt: true,
        reviewedBy: { select: { fullName: true } },
      },
      orderBy: { approvedAt: "desc" },
      take: 5,
    }),
    prisma.procurementMonitoringRecord.findMany({
      where: { status: PmrStatus.Active },
      include: {
        pr: { select: { prNumber: true } },
        verifiedBy: { select: { fullName: true } },
      },
      orderBy: { dateReceived: "desc" },
      take: 5,
    }),
  ]);

  timer.end();
  return { recentlyVerified, recentPmrs };
}

export default async function OfficerDashboard() {
  const pageTimer = startTimer("OfficerDashboardPage");
  const { profile } = await requireRole("Procurement Officer");
  const [stats, alerts, activity] = await Promise.all([
    getOfficerStats(),
    getProcurementAlerts(),
    getRecentActivity(),
  ]);
  pageTimer.end();

  const statCards = [
    {
      label: "Pending Verification",
      value: stats.pendingPrs,
      desc: "PRs awaiting compliance verification",
      href: "/dashboard/officer/pr",
      Icon: FileCheck2,
      accentClass: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    },
    {
      label: "Returned for Compliance",
      value: stats.returnedPrs,
      desc: "Sent back for corrections",
      href: "/dashboard/officer/history",
      Icon: Undo2,
      accentClass: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    },
    {
      label: "Verified Today",
      value: stats.verifiedToday,
      desc: "Approved by Procurement Office",
      href: "/dashboard/officer/history",
      Icon: CalendarCheck2,
      accentClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    },
    {
      label: "PMR Entries Created",
      value: stats.pmrCount,
      desc: "Active monitoring records",
      href: "/dashboard/officer/pmr",
      Icon: ClipboardCheck,
      accentClass: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    },
  ];

  return (
    <DashboardShell>
      <DashboardHeader profile={profile} displayRole="Procurement Officer" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            desc={card.desc}
            href={card.href}
            Icon={card.Icon}
            accentClass={card.accentClass}
          />
        ))}
      </div>

      {/* Delivery Monitoring Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            label: "Pending Delivery",
            value: stats.pendingDeliveries,
            desc: "POs not yet delivered",
            accent: "border-amber-300/60 text-amber-700 dark:text-amber-300",
          },
          {
            label: "Partial Deliveries",
            value: stats.partialDeliveries,
            desc: "POs with partial receipt",
            accent: "border-blue-300/60 text-blue-700 dark:text-blue-300",
          },
          {
            label: "Delivered",
            value: stats.deliveredCount,
            desc: "Completed deliveries",
            accent: "border-emerald-300/60 text-emerald-700 dark:text-emerald-300",
          },
        ].map((d) => (
          <Link
            key={d.label}
            href="/dashboard/officer/deliveries"
            className="rounded-md border border-base-300 bg-base-100 p-4 flex items-center justify-between hover:bg-base-200/50 transition-colors"
          >
            <div className="text-left">
              <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/65">{d.label}</div>
              <div className={`text-2xl font-bold font-display ${d.accent}`}>{d.value}</div>
              <div className="text-[10px] text-base-content/50">{d.desc}</div>
            </div>
            <Truck className={`h-8 w-8 shrink-0 ${d.accent}`} />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Procurement Alerts */}
        <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-base-200 pb-3 text-left">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">Procurement Alerts</h3>
            </div>
            <Link href="/dashboard/officer/pr" className="text-xs font-bold text-primary hover:underline">
              View Queue
            </Link>
          </div>

          <div className="space-y-3">
            {alerts.stalePrs.length === 0 && alerts.overdueDeliveries.length === 0 && (
              <p className="text-xs text-base-content/60 py-4">No pending alerts. All verification and delivery targets are on track.</p>
            )}
            {alerts.stalePrs.map((pr) => (
              <Link key={pr.id} href={`/dashboard/officer/pr/${pr.id}`} className="block rounded-md border border-base-200 bg-base-200/40 p-3 hover:bg-base-200 transition-colors text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-primary">{pr.prNumber}</span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                    {pr.daysPending}d pending
                  </span>
                </div>
                <p className="text-xs text-base-content/70 mt-1 line-clamp-1">{pr.purpose}</p>
                <p className="text-[10px] text-base-content/50 mt-0.5">{pr.department} · {pr.office}</p>
              </Link>
            ))}
            {alerts.overdueDeliveries.map((po) => (
              <Link key={po.id} href="/dashboard/officer/deliveries" className="block rounded-md border border-base-200 bg-base-200/40 p-3 hover:bg-base-200 transition-colors text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-primary">{po.poNumber}</span>
                  <span className="text-[10px] font-bold text-red-700 dark:text-red-300">Overdue delivery</span>
                </div>
                <p className="text-xs text-base-content/70 mt-1">{po.supplier.companyName}</p>
                <p className="text-[10px] text-base-content/50 mt-0.5">
                  Due {po.dateOfDelivery ? new Date(po.dateOfDelivery).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Verification Activity */}
        <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-base-200 pb-3 text-left">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">Recent Verification Activity</h3>
            </div>
            <Link href="/dashboard/officer/history" className="text-xs font-bold text-primary hover:underline">
              View History
            </Link>
          </div>

          <div className="space-y-3">
            {activity.recentlyVerified.map((pr: any) => (
              <Link key={pr.id} href={`/dashboard/officer/pmr`} className="block rounded-md border border-base-200 bg-base-200/40 p-3 hover:bg-base-200 transition-colors text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-primary">{pr.prNumber}</span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    {pr.approvedAt ? new Date(pr.approvedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </span>
                </div>
                <p className="text-xs text-base-content/70 mt-1">{pr.department} · {pr.office}</p>
                <p className="text-[10px] text-base-content/50 mt-0.5">Verified by {pr.reviewedBy?.fullName || "Procurement Office"}</p>
              </Link>
            ))}
            {activity.recentlyVerified.length === 0 && (
              <p className="text-xs text-base-content/60 py-4">No verified Purchase Requests yet this period.</p>
            )}
          </div>
        </div>
      </div>

      {/* Latest PMR Entries */}
      <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
        <div className="flex items-center justify-between border-b border-base-200 pb-3 text-left">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">Latest PMR Entries</h3>
          </div>
          <Link href="/dashboard/officer/pmr" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            Open Register <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-base-300 bg-base-200 text-base-content/85 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">PMR No.</th>
                <th className="py-2.5 px-3">PR No.</th>
                <th className="py-2.5 px-3">Office</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3">Date Received</th>
                <th className="py-2.5 px-3">Verified By</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200">
              {activity.recentPmrs.map((pmr: any) => (
                <tr key={pmr.id} className="hover:bg-base-200/30">
                  <td className="py-3 px-3">
                    <Link href={`/dashboard/officer/pmr/${pmr.id}`} className="font-bold text-primary hover:underline">
                      {pmr.pmrNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-3 font-medium text-base-content">{pmr.pr?.prNumber}</td>
                  <td className="py-3 px-3 text-base-content/70">{pmr.office}</td>
                  <td className="py-3 px-3 text-base-content/70">{pmr.stage}</td>
                  <td className="py-3 px-3 text-base-content/70">
                    {new Date(pmr.dateReceived).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-3 px-3 text-base-content/70">{pmr.verifiedBy?.fullName || "—"}</td>
                  <td className="py-3 px-3"><StatusBadge status={pmr.status} /></td>
                </tr>
              ))}
              {activity.recentPmrs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-base-content/60">
                    No PMR entries yet. Verify a Purchase Request to auto-create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
