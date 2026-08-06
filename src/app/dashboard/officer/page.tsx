import Link from "next/link";
import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import { startTimer } from "@/lib/performance-logger";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  ClipboardCheck,
  FileText,
  ClipboardList,
  ScrollText,
  ShoppingCart,
  Workflow,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const metadata = { title: "Procurement Staff Dashboard — ProcureWise" };

const DAY_MS = 1000 * 60 * 60 * 24;

type StageInfo = {
  stage: string;
  activity: string;
  action: string;
  href: string;
  tone: "blue" | "violet" | "amber" | "rose" | "emerald";
};

const stageTone: Record<StageInfo["tone"], string> = {
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  violet: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
};

type PipelineRow = {
  id: number;
  prNumber: string;
  office: string;
  status: string;
  dateReceived: string;
  daysPending: number;
} & StageInfo;

type PipelineCounts = {
  readyForPmr: number;
  rfqPrep: number;
  bacTransmittal: number;
  notices: number;
  purchaseOrders: number;
};

function deriveStage(
  prId: number,
  pmrId: number | null,
  rfq: { id: number; status: string } | null,
  po: { id: number; status: string } | null
): StageInfo {
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
      stage: "PMR Recording",
      activity: "Record to PMR",
      action: "Record to PMR",
      href: pmrId ? `/dashboard/officer/pmr/${pmrId}` : "/dashboard/officer/pmr",
      tone: "blue",
    };
  }

  switch (rfq.status) {
    case "Draft":
      return {
        stage: "RFQ Preparation",
        activity: "Prepare RFQ",
        action: "Prepare RFQ",
        href: `/dashboard/officer/rfq/${rfq.id}`,
        tone: "violet",
      };
    case "Published":
    case "Closed":
      return {
        stage: "BAC Transmittal",
        activity: "Forward to BAC",
        action: "Forward to BAC",
        href: "/dashboard/officer/transmittals",
        tone: "amber",
      };
    case "Evaluated":
      return {
        stage: "Letter of Notice",
        activity: "Prepare Letter of Notice",
        action: "Prepare Notice",
        href: "/dashboard/officer/notices",
        tone: "rose",
      };
    default:
      return {
        stage: "RFQ Preparation",
        activity: "Manage RFQ",
        action: "Open RFQ",
        href: `/dashboard/officer/rfq/${rfq.id}`,
        tone: "violet",
      };
  }
}

async function getStaffPipeline() {
  const timer = startTimer("getProcurementStaffPipeline");

  // Only verified Purchase Requests ever reach the Procurement Staff:
  // "Approved" (Officer II verification complete) or "Converted to RFQ".
  // Draft, Submitted, Pending Verification, Returned, and Rejected are excluded.
  const prs = await prisma.purchaseRequest.findMany({
    where: { status: { in: ["Approved", "ConvertedToRfq"] } },
    select: {
      id: true,
      prNumber: true,
      office: true,
      department: true,
      status: true,
      approvedAt: true,
      pmr: { select: { id: true, pmrNumber: true, dateReceived: true } },
      rfqs: {
        select: { id: true, rfqNumber: true, status: true, createdAt: true },
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

  const rows: PipelineRow[] = prs.map((pr) => {
    const rfq = pr.rfqs[0] ?? null;
    const po = rfq ? (poByRfq.get(rfq.id) ?? null) : null;
    const received = pr.pmr?.dateReceived ?? pr.approvedAt ?? new Date();
    const daysPending = Math.max(
      0,
      Math.floor((Date.now() - received.getTime()) / DAY_MS)
    );

    return {
      id: pr.id,
      prNumber: pr.prNumber,
      office: pr.office,
      status: pr.status,
      dateReceived: received.toISOString(),
      daysPending,
      ...deriveStage(pr.id, pr.pmr?.id ?? null, rfq, po),
    };
  });

  timer.end();
  return rows;
}

function summarize(rows: PipelineRow[]): PipelineCounts {
  const counts: PipelineCounts = {
    readyForPmr: 0,
    rfqPrep: 0,
    bacTransmittal: 0,
    notices: 0,
    purchaseOrders: 0,
  };
  for (const row of rows) {
    if (row.stage === "PMR Recording") counts.readyForPmr += 1;
    else if (row.stage === "RFQ Preparation") counts.rfqPrep += 1;
    else if (row.stage === "BAC Transmittal") counts.bacTransmittal += 1;
    else if (row.stage === "Letter of Notice") counts.notices += 1;
    else if (row.stage === "Purchase Order") counts.purchaseOrders += 1;
  }
  return counts;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

const pipelineSteps = [
  { label: "Verified PR", desc: "Recorded into PMR by Procurement Officer II" },
  { label: "Procurement Monitoring Record", desc: "PR logged with stage and status" },
  { label: "Request for Quotation", desc: "Solicitation prepared and published" },
  { label: "BAC Transmittal", desc: "Canvass documents forwarded to BAC" },
  { label: "Letter of Notice", desc: "Award notice to winning supplier" },
  { label: "Purchase Order", desc: "PO generated and forwarded to Procurement Officer I" },
];

export default async function ProcurementStaffDashboard() {
  const pageTimer = startTimer("ProcurementStaffDashboardPage");
  const { profile } = await requireRole("Procurement Officer");
  const rows = await getStaffPipeline();
  const counts = summarize(rows);
  pageTimer.end();

  const docCards = [
    {
      title: "Purchase Requests Ready for PMR",
      desc: "Verified Purchase Requests awaiting PMR recording",
      value: counts.readyForPmr,
      href: "/dashboard/officer/pmr",
      cta: "Record to PMR",
      Icon: ClipboardCheck,
      accent: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    },
    {
      title: "Request for Quotation",
      desc: "Solicitations to prepare and publish to suppliers",
      value: counts.rfqPrep,
      href: "/dashboard/officer/rfq",
      cta: "Prepare RFQ",
      Icon: FileText,
      accent: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300",
    },
    {
      title: "BAC Transmittals",
      desc: "Procurement packages to forward to the BAC",
      value: counts.bacTransmittal,
      href: "/dashboard/officer/transmittals",
      cta: "Transmit",
      Icon: ClipboardList,
      accent: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    },
    {
      title: "Letters of Notice",
      desc: "Award notices to prepare for winning suppliers",
      value: counts.notices,
      href: "/dashboard/officer/notices",
      cta: "Prepare Notice",
      Icon: ScrollText,
      accent: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
    },
    {
      title: "Purchase Orders",
      desc: "Purchase Orders to generate and forward to Procurement Officer I",
      value: counts.purchaseOrders,
      href: "/dashboard/officer/po",
      cta: "Generate PO",
      Icon: ShoppingCart,
      accent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    },
  ];

  return (
    <DashboardShell>
      <DashboardHeader profile={profile} displayRole="Procurement Staff" />

      {/* Intro */}
      <div className="mt-8 flex flex-col gap-1">
        <h2 className="text-xl font-black text-base-content">
          Document Preparation Workspace
        </h2>
        <p className="text-xs text-base-content/60 max-w-2xl">
          The Procurement Staff prepares procurement documents following the official
          procedure. Only verified Purchase Requests from the Procurement Officer II flow
          into this workspace — Draft, Pending Verification, Returned, and Rejected
          requests never appear here.
        </p>
      </div>

      {/* Six cards: five document-preparation cards + procurement pipeline */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 mt-6">
        {docCards.map((card) => (
          <div key={card.title} className="flex flex-col rounded-md border border-base-300 bg-base-100 p-5 shadow-none">
            <div className="flex items-start justify-between gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-md ${card.accent}`}>
                <card.Icon className="h-5 w-5" />
              </div>
              <span className="text-3xl font-black text-base-content tabular-nums">{card.value}</span>
            </div>
            <h3 className="mt-4 text-sm font-bold text-base-content leading-snug">{card.title}</h3>
            <p className="mt-1 text-xs text-base-content/60 flex-1">{card.desc}</p>
            <Link
              href={card.href}
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-md border border-primary bg-primary/5 px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/10"
            >
              {card.cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}

        {/* Procurement Pipeline */}
        <div className="flex flex-col rounded-md border border-base-300 bg-base-100 p-5 shadow-none">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Workflow className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">
              Procurement Pipeline
            </h3>
          </div>

          <ol className="mt-4 space-y-0 flex-1">
            {pipelineSteps.map((step, i) => (
              <li key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  {i < pipelineSteps.length - 1 && (
                    <span className="w-px flex-1 bg-base-300 my-1" />
                  )}
                </div>
                <div className={i < pipelineSteps.length - 1 ? "pb-3" : ""}>
                  <p className="text-xs font-bold text-base-content">{step.label}</p>
                  <p className="text-[10px] text-base-content/50 mt-0.5">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-3 rounded-md bg-base-200/60 px-3 py-2 text-[10px] font-semibold text-base-content/60">
            Final step: Purchase Order is forwarded to Procurement Officer I for issuance.
          </p>
        </div>
      </div>

      {/* Work Queue */}
      <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
        <div className="flex items-center justify-between border-b border-base-200 pb-3 text-left">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">
              Procurement Staff Work Queue
            </h3>
          </div>
          <Link href="/dashboard/officer/pr" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            View all Purchase Requests <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-base-300 bg-base-200 text-base-content/85 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">PR Number</th>
                <th className="py-2.5 px-3">Office</th>
                <th className="py-2.5 px-3">Current Stage</th>
                <th className="py-2.5 px-3">Assigned Activity</th>
                <th className="py-2.5 px-3">Date Received</th>
                <th className="py-2.5 px-3">Days Pending</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-base-200/30">
                  <td className="py-3 px-3">
                    <Link href={`/dashboard/officer/pr/${row.id}`} className="font-bold text-primary hover:underline">
                      {row.prNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-base-content/70">{row.office}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap ${stageTone[row.tone]}`}>
                      {row.stage}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-base-content/80 font-medium">{row.activity}</td>
                  <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">{fmtDate(row.dateReceived)}</td>
                  <td className="py-3 px-3 text-base-content/70 tabular-nums whitespace-nowrap">
                    {row.daysPending === 0 ? "Today" : `${row.daysPending} day${row.daysPending === 1 ? "" : "s"}`}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link
                        href={row.href}
                        className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[10px] font-bold text-white transition hover:opacity-90"
                      >
                        {row.action}
                      </Link>
                      <Link
                        href={`/dashboard/officer/pr/${row.id}`}
                        className="inline-flex items-center rounded-md border border-base-300 px-3 py-1.5 text-[10px] font-bold text-base-content/70 transition hover:bg-base-200"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-base-content/60">
                    No verified Purchase Requests yet. Once the Procurement Officer II verifies a
                    Purchase Request, it appears here with its assigned document-preparation activity.
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
