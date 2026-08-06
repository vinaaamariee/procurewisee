import Link from "next/link";
import { PmrStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import { startTimer } from "@/lib/performance-logger";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  ClipboardCheck,
  FileText,
  ShoppingCart,
  Send,
  ArrowRight,
} from "lucide-react";

export const metadata = { title: "Procurement Staff Dashboard — ProcureWise" };

async function getProcurementStaffStats() {
  const timer = startTimer("getProcurementStaffStats");

  const [pmrCount, rfqCount, poDraftCount, poReleasedCount] = await Promise.all([
    prisma.procurementMonitoringRecord.count({ where: { status: PmrStatus.Active } }),
    prisma.requestForQuote.count(),
    prisma.purchaseOrder.count({
      where: { status: { in: ["Draft", "PendingApproval"] } },
    }),
    prisma.purchaseOrder.count({
      where: { status: { in: ["Approved", "SentToSupplier"] } },
    }),
  ]);
  timer.end();

  return {
    pmrCount,
    rfqCount,
    poDraftCount,
    poReleasedCount,
  };
}

async function getRecentWork() {
  const timer = startTimer("getProcurementStaffRecentWork");

  const [recentPmrs, recentRfqs, recentPos] = await Promise.all([
    prisma.procurementMonitoringRecord.findMany({
      where: { status: PmrStatus.Active },
      include: {
        pr: { select: { prNumber: true } },
        verifiedBy: { select: { fullName: true } },
      },
      orderBy: { dateReceived: "desc" },
      take: 5,
    }),
    prisma.requestForQuote.findMany({
      select: {
        id: true,
        rfqNumber: true,
        title: true,
        status: true,
        deadlineDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.purchaseOrder.findMany({
      select: {
        id: true,
        poNumber: true,
        status: true,
        totalCost: true,
        dateOfDelivery: true,
        createdAt: true,
        supplier: { select: { companyName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  timer.end();
  return { recentPmrs, recentRfqs, recentPos };
}

export default async function ProcurementStaffDashboard() {
  const pageTimer = startTimer("ProcurementStaffDashboardPage");
  const { profile } = await requireRole("Procurement Officer");
  const [stats, work] = await Promise.all([
    getProcurementStaffStats(),
    getRecentWork(),
  ]);
  pageTimer.end();

  const statCards = [
    {
      label: "Active PMR Records",
      value: stats.pmrCount,
      desc: "Procurement Monitoring Register entries",
      href: "/dashboard/officer/pmr",
      Icon: ClipboardCheck,
      accentClass: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    },
    {
      label: "RFQs Issued",
      value: stats.rfqCount,
      desc: "Solicitations distributed to suppliers",
      href: "/dashboard/officer/rfq",
      Icon: FileText,
      accentClass: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300",
    },
    {
      label: "POs Drafted",
      value: stats.poDraftCount,
      desc: "Purchase Orders in preparation",
      href: "/dashboard/officer/po",
      Icon: ShoppingCart,
      accentClass: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    },
    {
      label: "POs Released",
      value: stats.poReleasedCount,
      desc: "Approved and sent to suppliers",
      href: "/dashboard/officer/po",
      Icon: Send,
      accentClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    },
  ];

  return (
    <DashboardShell>
      <DashboardHeader profile={profile} displayRole="Procurement Staff" />

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent RFQ Distribution */}
        <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-base-200 pb-3 text-left">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-600" />
              <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">Recent RFQ Distribution</h3>
            </div>
            <Link href="/dashboard/officer/rfq" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              Open RFQ <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {work.recentRfqs.length === 0 && (
              <p className="text-xs text-base-content/60 py-4">No RFQs have been issued yet. Convert a verified Purchase Request to start canvassing.</p>
            )}
            {work.recentRfqs.map((rfq) => (
              <Link key={rfq.id} href={`/dashboard/officer/rfq/${rfq.id}`} className="block rounded-md border border-base-200 bg-base-200/40 p-3 hover:bg-base-200 transition-colors text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-primary">{rfq.rfqNumber}</span>
                  <StatusBadge status={rfq.status} />
                </div>
                <p className="text-xs text-base-content/70 mt-1 line-clamp-1">{rfq.title}</p>
                <p className="text-[10px] text-base-content/50 mt-0.5">
                  {rfq.deadlineDate
                    ? `Deadline ${new Date(rfq.deadlineDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}`
                    : `Created ${new Date(rfq.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}`}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Purchase Orders */}
        <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-base-200 pb-3 text-left">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-amber-600" />
              <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">Recent Purchase Orders</h3>
            </div>
            <Link href="/dashboard/officer/po" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              Open PO <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {work.recentPos.length === 0 && (
              <p className="text-xs text-base-content/60 py-4">No purchase orders yet. Draft a PO once the BAC award has been resolved.</p>
            )}
            {work.recentPos.map((po) => (
              <Link key={po.id} href={`/dashboard/officer/po/${po.id}`} className="block rounded-md border border-base-200 bg-base-200/40 p-3 hover:bg-base-200 transition-colors text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-primary">{po.poNumber}</span>
                  <StatusBadge status={po.status} />
                </div>
                <p className="text-xs text-base-content/70 mt-1">{po.supplier.companyName}</p>
                <p className="text-[10px] text-base-content/50 mt-0.5">
                  ₱{Number(po.totalCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
              </Link>
            ))}
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
              {work.recentPmrs.map((pmr: any) => (
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
              {work.recentPmrs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-base-content/60">
                    No PMR entries yet. Verified Purchase Requests are automatically recorded here by the Procurement Officer II.
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
