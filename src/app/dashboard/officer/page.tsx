import Link from "next/link";
import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import { startTimer } from "@/lib/performance-logger";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import SolicitationBoardClient from "./SolicitationBoardClient";
import {
  ClipboardCheck,
  FileCheck2,
  FileText,
  ShoppingCart,
  Building2,
  Send,
  Lock,
  Award,
  Star,
  Truck,
  ArrowRight,
  Bell,
  ClipboardList,
  ScrollText,
  BarChart3,
  UserRound,
} from "lucide-react";

export const metadata = { title: "Procurement Staff Dashboard — ProcureWise" };

const DAY_MS = 1000 * 60 * 60 * 24;

type StageTone = "blue" | "violet" | "amber" | "rose" | "emerald";

const stageTone: Record<StageTone, string> = {
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  violet: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
};

type ActionItem = {
  id: number;
  prNumber: string;
  office: string;
  title: string;
  status: string;
  stage: string;
  activity: string;
  action: string;
  href: string;
  tone: StageTone;
  dateReceived: string;
  dueDate: string;
  daysPending: number;
};

function deriveStage(
  prId: number,
  pmrId: number | null,
  rfq: { id: number; status: string } | null,
  po: { id: number; status: string } | null
): { stage: string; activity: string; action: string; href: string; tone: StageTone } {
  if (po) {
    const drafting = po.status === "Draft" || po.status === "PendingApproval";
    return {
      stage: "Purchase Order",
      activity: drafting ? "Finalize Purchase Order" : "Manage Purchase Order",
      action: "View PO",
      href: `/dashboard/officer/po/${po.id}`,
      tone: "emerald",
    };
  }

  if (!rfq) {
    return {
      stage: "Ready for PMR Recording",
      activity: "Record the verified PR into the PMR register",
      action: "Record PMR",
      href: pmrId ? `/dashboard/officer/pmr/${pmrId}` : "/dashboard/officer/pmr",
      tone: "blue",
    };
  }

  switch (rfq.status) {
    case "Draft":
      return {
        stage: "Waiting for Distribution",
        activity: "Publish and distribute the RFQ to suppliers",
        action: "Distribute RFQ",
        href: `/dashboard/officer/rfq/${rfq.id}`,
        tone: "violet",
      };
    case "Published":
    case "Closed":
      return {
        stage: "BAC Resolution Ready",
        activity: "Forward the canvass documents to the BAC",
        action: "Transmit to BAC",
        href: "/dashboard/officer/transmittals",
        tone: "amber",
      };
    case "Evaluated":
      return {
        stage: "Award Approved",
        activity: "Generate the Purchase Order from the approved award",
        action: "Generate PO",
        href: "/dashboard/officer/po",
        tone: "emerald",
      };
    default:
      return {
        stage: "RFQ Preparation",
        activity: "Manage the RFQ document",
        action: "Open RFQ",
        href: `/dashboard/officer/rfq/${rfq.id}`,
        tone: "violet",
      };
  }
}

function priorityOf(days: number) {
  if (days >= 5) return { label: "High", cls: "text-rose-600 dark:text-rose-400" };
  if (days >= 2) return { label: "Medium", cls: "text-amber-600 dark:text-amber-400" };
  return { label: "Low", cls: "text-emerald-600 dark:text-emerald-400" };
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

const fmtRelative = (date: Date) => {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / DAY_MS);
  if (days < 7) return `${days}d ago`;
  return fmtDate(date.toISOString());
};

async function getActionItems() {
  const prs = await prisma.purchaseRequest.findMany({
    where: { status: { in: ["Approved", "ConvertedToRfq"] } },
    select: {
      id: true,
      prNumber: true,
      office: true,
      department: true,
      purpose: true,
      status: true,
      approvedAt: true,
      pmr: { select: { id: true, dateReceived: true } },
      rfqs: {
        select: { id: true, rfqNumber: true, status: true, deadlineDate: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { approvedAt: "desc" },
  });

  const rfqIds = prs
    .map((p) => p.rfqs[0]?.id)
    .filter((id): id is number => typeof id === "number");

  const pos = rfqIds.length
    ? await prisma.purchaseOrder.findMany({
        where: { rfqId: { in: rfqIds } },
        select: { id: true, rfqId: true, poNumber: true, status: true },
      })
    : [];
  const poByRfq = new Map(pos.map((po) => [po.rfqId, po]));

  const items: ActionItem[] = prs.map((pr) => {
    const rfq = pr.rfqs[0] ?? null;
    const po = rfq ? (poByRfq.get(rfq.id) ?? null) : null;
    const received = pr.pmr?.dateReceived ?? pr.approvedAt ?? new Date();
    const daysPending = Math.max(0, Math.floor((Date.now() - received.getTime()) / DAY_MS));
    const stage = deriveStage(pr.id, pr.pmr?.id ?? null, rfq, po);
    const due = rfq?.deadlineDate
      ? new Date(rfq.deadlineDate)
      : new Date(received.getTime() + 5 * DAY_MS);

    return {
      id: pr.id,
      prNumber: pr.prNumber,
      office: pr.office,
      title: pr.purpose || pr.department,
      status: pr.status,
      stage: stage.stage,
      activity: stage.activity,
      action: stage.action,
      href: stage.href,
      tone: stage.tone,
      dateReceived: received.toISOString(),
      dueDate: due.toISOString(),
      daysPending,
    };
  });

  return items;
}

async function getStats() {
  const [approvedPrs, openRfqs, approvedRecs, pos, supplierCount] = await Promise.all([
    prisma.purchaseRequest.count({ where: { status: "Approved" } }),
    prisma.requestForQuote.count({ where: { status: "Published" } }),
    prisma.recommendation.findMany({
      where: { approvalStatus: "Approved" },
      select: { id: true, supplierId: true, supplierQuote: { select: { rfqId: true } } },
    }),
    prisma.purchaseOrder.findMany({ select: { supplierId: true, rfqId: true } }),
    prisma.supplier.count(),
  ]);

  const poKeys = new Set(pos.map((p) => `${p.supplierId}:${p.rfqId}`));
  const pendingAwards = approvedRecs.filter((r) => {
    const rfqId = r.supplierQuote?.rfqId ?? null;
    return !poKeys.has(`${r.supplierId}:${rfqId}`);
  }).length;

  return { pendingPrs: approvedPrs, openRfqs, pendingAwards, supplierCount };
}

async function getNotifications() {
  const soon = new Date(Date.now() + 5 * DAY_MS);
  const [draftRfqs, evaluatedSuppliers, closingRfqs, supplierCount] = await Promise.all([
    prisma.requestForQuote.count({ where: { status: "Draft" } }),
    prisma.supplierEvaluation.findMany({ select: { supplierId: true }, distinct: ["supplierId"] }),
    prisma.requestForQuote.count({ where: { status: "Published", deadlineDate: { lte: soon } } }),
    prisma.supplier.count(),
  ]);

  return {
    draftRfqs,
    suppliersAwaitingEval: Math.max(0, supplierCount - evaluatedSuppliers.length),
    closingRfqs,
  };
}

const STAFF_ACTION_TYPES = [
  "CREATE_PMR",
  "UPDATE_PMR",
  "CREATE_RFQ",
  "CONVERT_PR_TO_RFQ",
  "PUBLISH_RFQ",
  "CLOSE_RFQ",
  "APPROVE_RECOMMENDATION",
  "SUBMIT_SUPPLIER_EVALUATION",
  "CREATE_PO",
  "UPDATE_PO",
  "STATUS_CHANGE_PO",
  "CREATE_RECEIPT",
];

const ACTIVITY_META: Record<string, { label: string; icon: any; tone: string }> = {
  CREATE_PMR: { label: "PMR Recorded", icon: ClipboardCheck, tone: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" },
  UPDATE_PMR: { label: "PMR Updated", icon: ClipboardCheck, tone: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" },
  CREATE_RFQ: { label: "RFQ Generated", icon: FileText, tone: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300" },
  CONVERT_PR_TO_RFQ: { label: "RFQ Generated", icon: FileText, tone: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300" },
  PUBLISH_RFQ: { label: "RFQ Distributed", icon: Send, tone: "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300" },
  CLOSE_RFQ: { label: "RFQ Closed", icon: Lock, tone: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  APPROVE_RECOMMENDATION: { label: "BAC Resolution Created", icon: Award, tone: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300" },
  SUBMIT_SUPPLIER_EVALUATION: { label: "Supplier Evaluation Submitted", icon: Star, tone: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300" },
  CREATE_PO: { label: "Purchase Order Generated", icon: ShoppingCart, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" },
  UPDATE_PO: { label: "Purchase Order Updated", icon: ShoppingCart, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" },
  STATUS_CHANGE_PO: { label: "Purchase Order Status Updated", icon: ShoppingCart, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" },
  CREATE_RECEIPT: { label: "Delivery Received", icon: Truck, tone: "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300" },
};

function extractRef(newState: unknown): string | null {
  if (!newState || typeof newState !== "object") return null;
  const s = newState as Record<string, unknown>;
  const candidate =
    s.prNumber ?? s.rfqNumber ?? s.poNumber ?? s.pmrNumber ?? s.receiptNumber ?? s.companyName ?? s.title;
  return candidate ? String(candidate) : null;
}

async function getRecentActivity() {
  const logs = await prisma.auditTrail.findMany({
    where: { actionType: { in: STAFF_ACTION_TYPES } },
    orderBy: { timestamp: "desc" },
    take: 12,
    include: { user: { select: { fullName: true } } },
  });

  return logs.map((log) => {
    const meta = ACTIVITY_META[log.actionType] ?? {
      label: log.actionType,
      icon: FileText,
      tone: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    };
    return {
      id: log.id,
      label: meta.label,
      Icon: meta.icon,
      tone: meta.tone,
      ref: extractRef(log.newState),
      user: log.user?.fullName ?? "System",
      time: fmtRelative(log.timestamp),
    };
  });
}

export default async function ProcurementStaffDashboard() {
  const pageTimer = startTimer("ProcurementStaffDashboardPage");
  const { profile } = await requireRole("Procurement Officer");

  const [actionItems, stats, notifications, rfqs, activity] = await Promise.all([
    getActionItems(),
    getStats(),
    getNotifications(),
    prisma.requestForQuote.findMany({
      select: {
        id: true,
        rfqNumber: true,
        title: true,
        status: true,
        approvedBudgetContract: true,
        deadlineDate: true,
        createdAt: true,
        pr: { select: { prNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    getRecentActivity(),
  ]);
  pageTimer.end();

  const nowMs = new Date().getTime();
  const closingSoonMs = nowMs + 5 * DAY_MS;
  const serializedRfqs = rfqs.map((rfq) => {
    const deadlineMs = rfq.deadlineDate ? rfq.deadlineDate.getTime() : null;
    return {
      id: rfq.id,
      rfqNumber: rfq.rfqNumber,
      title: rfq.title,
      status: rfq.status,
      budget: Number(rfq.approvedBudgetContract),
      deadlineDate: rfq.deadlineDate ? rfq.deadlineDate.toISOString() : null,
      createdAt: rfq.createdAt.toISOString(),
      prNumber: rfq.pr?.prNumber ?? null,
      isExpired:
        rfq.status === "Published" && deadlineMs !== null && deadlineMs < nowMs,
      closingSoon:
        rfq.status === "Published" && deadlineMs !== null && deadlineMs >= nowMs && deadlineMs <= closingSoonMs,
    };
  });

  const statCards = [
    {
      label: "Pending Purchase Requests",
      value: actionItems.filter((a) => a.stage === "Ready for PMR Recording").length,
      desc: "Verified PRs awaiting PMR recording",
      href: "/dashboard/officer/pr",
      Icon: FileCheck2,
      accentClass: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    },
    {
      label: "Open RFQs",
      value: stats.openRfqs,
      desc: "Solicitations currently published",
      href: "/dashboard/officer/rfq",
      Icon: FileText,
      accentClass: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300",
    },
    {
      label: "Pending Purchase Orders",
      value: stats.pendingAwards,
      desc: "Approved awards awaiting PO generation",
      href: "/dashboard/officer/po",
      Icon: ShoppingCart,
      accentClass: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    },
    {
      label: "Active Suppliers",
      value: stats.supplierCount,
      desc: "Registered suppliers",
      href: "/dashboard/officer/suppliers",
      Icon: Building2,
      accentClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    },
  ];

  const quickActions = [
    { label: "Procurement Monitoring Record", href: "/dashboard/officer/pmr", Icon: ClipboardCheck },
    { label: "Request for Quotation", href: "/dashboard/officer/rfq", Icon: FileText },
    { label: "Purchase Orders", href: "/dashboard/officer/po", Icon: ShoppingCart },
    { label: "Supplier Evaluation", href: "/dashboard/officer/evaluations", Icon: Star },
    { label: "Suppliers", href: "/dashboard/officer/suppliers", Icon: Building2 },
    { label: "Reports", href: "/dashboard/officer/reports", Icon: BarChart3 },
  ];

  const notificationRows = [
    { label: "Pending PMRs", value: actionItems.filter((a) => a.stage === "Ready for PMR Recording").length, href: "/dashboard/officer/pmr" },
    { label: "RFQs awaiting publication", value: notifications.draftRfqs, href: "/dashboard/officer/rfq" },
    { label: "Suppliers awaiting evaluation", value: notifications.suppliersAwaitingEval, href: "/dashboard/officer/evaluations" },
    { label: "Purchase Orders awaiting preparation", value: stats.pendingAwards, href: "/dashboard/officer/po" },
    { label: "Deadlines approaching", value: notifications.closingRfqs, href: "/dashboard/officer/rfq" },
  ];

  return (
    <DashboardShell>
      <DashboardHeader profile={profile} displayRole="Procurement Staff" />

      {/* Statistics row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 mt-8">
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

      {/* Action Items + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Action Items & Pending Workflows */}
        <div className="lg:col-span-2 rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-base-200 pb-3 text-left">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">
                Action Items & Pending Workflows
              </h3>
            </div>
            <Link href="/dashboard/officer/pr" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {actionItems.length === 0 && (
              <p className="text-xs text-base-content/60 py-6 text-center">
                No pending actions. Verified Purchase Requests will appear here once the
                Procurement Officer II completes verification.
              </p>
            )}
            {actionItems.map((item) => {
              const priority = priorityOf(item.daysPending);
              return (
                <div key={item.id} className="flex items-start justify-between gap-3 rounded-md border border-base-200 bg-base-200/40 p-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/dashboard/officer/pr/${item.id}`} className="text-xs font-bold text-primary hover:underline">
                        {item.prNumber}
                      </Link>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap ${stageTone[item.tone]}`}>
                        {item.stage}
                      </span>
                    </div>
                    <p className="text-xs text-base-content/80 font-medium mt-1 line-clamp-1">{item.title}</p>
                    <p className="text-[10px] text-base-content/50 mt-0.5">
                      {item.office} · Due {fmtDate(item.dueDate)} ·{" "}
                      <span className={`font-bold ${priority.cls}`}>{priority.label}</span> priority
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[10px] font-bold text-white transition hover:opacity-90"
                    >
                      {item.action}
                    </Link>
                    <Link
                      href={`/dashboard/officer/pr/${item.id}`}
                      className="inline-flex items-center rounded-md border border-base-300 px-3 py-1.5 text-[10px] font-bold text-base-content/70 transition hover:bg-base-200"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-base-200 pb-3 text-left">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-600" />
              <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">Notifications</h3>
            </div>
          </div>

          <div className="space-y-2">
            {notificationRows.map((row) => (
              <Link
                key={row.label}
                href={row.href}
                className="flex items-center justify-between gap-3 rounded-md border border-base-200 bg-base-200/40 px-3 py-2.5 transition hover:bg-base-200"
              >
                <span className="text-xs text-base-content/80 font-medium">{row.label}</span>
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-bold text-primary">
                  {row.value}
                </span>
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <Link href="/dashboard/officer/transmittals" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
              <ClipboardList className="h-3.5 w-3.5" /> BAC Transmittals
            </Link>
            <Link href="/dashboard/officer/notices" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
              <ScrollText className="h-3.5 w-3.5" /> Letters of Notice
            </Link>
          </div>
        </div>
      </div>

      {/* Solicitation Board */}
      <SolicitationBoardClient rfqs={serializedRfqs} />

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Procurement Activity */}
        <div className="lg:col-span-2 rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-base-200 pb-3 text-left">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">Recent Procurement Activity</h3>
            </div>
          </div>

          <ol className="space-y-0">
            {activity.map((a, i) => (
              <li key={a.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${a.tone}`}>
                    <a.Icon className="h-4 w-4" />
                  </span>
                  {i < activity.length - 1 && <span className="w-px flex-1 bg-base-300 my-1" />}
                </div>
                <div className={i < activity.length - 1 ? "pb-3" : ""}>
                  <p className="text-xs font-bold text-base-content">{a.label}</p>
                  <p className="text-[10px] text-base-content/50 mt-0.5">
                    {a.ref ? `${a.ref} · ` : ""}
                    {a.user} · {a.time}
                  </p>
                </div>
              </li>
            ))}
            {activity.length === 0 && (
              <li className="text-xs text-base-content/60 py-6 text-center">
                No procurement activity recorded yet.
              </li>
            )}
          </ol>
        </div>

        {/* Quick Actions */}
        <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
          <div className="border-b border-base-200 pb-3 text-left">
            <div className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">Quick Actions</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((qa) => (
              <Link
                key={qa.label}
                href={qa.href}
                className="flex flex-col items-center justify-center gap-2 rounded-md border border-base-200 bg-base-200/40 p-4 text-center transition hover:bg-base-200"
              >
                <qa.Icon className="h-5 w-5 text-primary" />
                <span className="text-[10px] font-bold text-base-content/80 leading-tight">{qa.label}</span>
              </Link>
            ))}
          </div>

          <div className="rounded-md bg-base-200/60 px-3 py-2.5">
            <p className="text-[10px] font-semibold text-base-content/60 leading-relaxed">
              Full pipeline: Verified PR → PMR → RFQ → Supplier Evaluation → BAC → Notice of
              Award → Purchase Order → Delivery.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
