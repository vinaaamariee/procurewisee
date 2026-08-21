import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, Star, FileText, ShoppingCart, ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import SectionHeader from "@/components/ui/SectionHeader";
import StatusBadge from "@/components/ui/StatusBadge";

export const metadata = {
  title: "Supplier Profile — ProcureWise",
};

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

const fmtMoney = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

type EvalCriteria = {
  evaluationType: string;
  evaluationDate: Date;
  evaluatorName: string;
  comments: string | null;
  philGepsRn: string | null;
  rfqResponsiveness: number | null;
  competitivePricing: number | null;
  specificationCompliance: number | null;
  documentCompliance: number | null;
  deliveryPerformance: number | null;
};

function evalAverage(ev: EvalCriteria): number | null {
  const values = [
    ev.rfqResponsiveness,
    ev.competitivePricing,
    ev.specificationCompliance,
    ev.documentCompliance,
    ev.deliveryPerformance,
  ].filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function supplierAvgScore(evals: EvalCriteria[]): { avg: number | null; label: string } {
  const officeEvs = evals.filter((e) => e.evaluationType === "ProcurementOffice");
  const avgs = officeEvs.map(evalAverage).filter((v): v is number => v !== null);
  if (avgs.length === 0) return { avg: null, label: "—" };
  const avg = avgs.reduce((a, b) => a + b, 0) / avgs.length;
  return { avg, label: `${avg.toFixed(2)} / 4` };
}

function lastEvaluationDate(evals: EvalCriteria[]): string {
  if (evals.length === 0) return "—";
  const latest = [...evals].sort(
    (a, b) => b.evaluationDate.getTime() - a.evaluationDate.getTime()
  )[0];
  return fmtDate(latest.evaluationDate);
}

function MiniStat({
  label,
  value,
  desc,
  Icon,
  accentClass,
}: {
  label: string;
  value: string | number;
  desc?: string;
  Icon: React.ComponentType<{ className?: string }>;
  accentClass?: string;
}) {
  return (
    <div className="flex flex-col justify-between h-full p-4 rounded-md border border-base-300 bg-base-100 shadow-none">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/65">
          {label}
        </span>
        <div
          className={`p-1.5 rounded bg-base-200 text-base-content/75 shrink-0 ${accentClass ?? ""}`}
        >
          <Icon className="h-4 w-4 shrink-0" />
        </div>
      </div>
      <div className="mt-3">
        <span className="text-2xl font-bold tracking-tight text-base-content">
          {value}
        </span>
        {desc && (
          <p className="text-[10px] text-base-content/50 mt-0.5 leading-snug">{desc}</p>
        )}
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SupplierDetailPage({ params }: PageProps) {
  await requireRole("Procurement Officer");
  const { id: rawId } = await params;

  const id = parseInt(rawId, 10);
  if (isNaN(id)) return notFound();

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      evaluations: {
        orderBy: { evaluationDate: "desc" },
      },
      purchaseOrders: {
        orderBy: { createdAt: "desc" },
        include: {
          pr: { select: { prNumber: true } },
        },
      },
      quotes: {
        orderBy: { submissionDate: "desc" },
        select: {
          id: true,
          rfqId: true,
          rfq: {
            select: {
              id: true,
              rfqNumber: true,
              title: true,
              status: true,
              deadlineDate: true,
            },
          },
        },
      },
      recommendations: {
        where: { approvalStatus: "Approved" },
        select: { id: true },
      },
    },
  });

  if (!supplier) return notFound();

  const score = supplierAvgScore(supplier.evaluations);
  const lastEval = lastEvaluationDate(supplier.evaluations);
  const awardsCount = supplier.recommendations.length;
  const qualityCompliance = Number(supplier.qualityComplianceRate).toFixed(2);

  const rfqById = new Map<number, (typeof supplier.quotes)[number]["rfq"]>();
  for (const quote of supplier.quotes) {
    rfqById.set(quote.rfqId, quote.rfq);
  }
  const rfqs = [...rfqById.values()];

  const evalsAsc = [...supplier.evaluations].sort(
    (a, b) => a.evaluationDate.getTime() - b.evaluationDate.getTime()
  );
  const scoresAsc = evalsAsc
    .map((ev) => ({ date: ev.evaluationDate, score: evalAverage(ev) }))
    .filter((x): x is { date: Date; score: number } => x.score !== null);
  const trend = scoresAsc.map((s, i) => {
    const prev = i > 0 ? scoresAsc[i - 1].score : null;
    let arrow = "—";
    let arrowClass = "text-base-content/40";
    if (prev !== null) {
      if (s.score > prev) {
        arrow = "▲";
        arrowClass = "text-[var(--accent)]";
      } else if (s.score < prev) {
        arrow = "▼";
        arrowClass = "text-rose-600";
      }
    }
    return { ...s, arrow, arrowClass };
  });

  const subtitle = [
    supplier.businessAddress,
    supplier.tin ? `TIN ${supplier.tin}` : null,
    supplier.contactPerson ? `Contact: ${supplier.contactPerson}` : null,
    supplier.contactNumber ? `(${supplier.contactNumber})` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/officer/suppliers"
        className="inline-flex items-center gap-2 rounded-md border border-base-300 px-3 py-1.5 text-xs font-bold text-base-content/70 transition hover:bg-base-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Supplier Directory
      </Link>

      <SectionHeader title={supplier.companyName} subtitle={subtitle} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat
          label="Average Evaluation Score"
          value={score.label}
          desc="Across all Procurement Office evaluations"
          Icon={Star}
          accentClass="bg-[var(--secondary-dim)] text-[var(--secondary)] dark:bg-[var(--secondary-dim)] dark:text-[var(--secondary)]"
        />
        <MiniStat
          label="Last Evaluation Date"
          value={lastEval}
          desc="Most recent supplier evaluation"
          Icon={FileText}
          accentClass="bg-[var(--secondary-dim)] text-[var(--secondary)] dark:bg-[var(--secondary-dim)] dark:text-[var(--secondary)]"
        />
        <MiniStat
          label="Number of Awards"
          value={awardsCount}
          desc="Approved recommendations"
          Icon={Building2}
          accentClass="bg-[var(--accent-glass)] text-[var(--accent)] dark:bg-[var(--accent-glass)] dark:text-[var(--secondary)]"
        />
        <MiniStat
          label="Quality Compliance"
          value={`${qualityCompliance}%`}
          desc="Historical quality compliance rate"
          Icon={ShoppingCart}
          accentClass="bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
            <div className="flex items-center gap-2 border-b border-base-200 pb-3">
              <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">
                Evaluation History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-base-300 bg-base-200 text-base-content/85 uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Score ( / 4 )</th>
                    <th className="py-2.5 px-3">Evaluator</th>
                    <th className="py-2.5 px-3">Comments</th>
                    <th className="py-2.5 px-3">PhilGEPS RN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200">
                  {supplier.evaluations.map((ev) => {
                    const evScore = evalAverage(ev);
                    return (
                      <tr key={ev.id} className="hover:bg-base-200/30">
                        <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                          {fmtDate(ev.evaluationDate)}
                        </td>
                        <td className="py-3 px-3 font-semibold tabular-nums whitespace-nowrap">
                          {evScore !== null ? `${evScore.toFixed(2)} / 4` : "—"}
                        </td>
                        <td className="py-3 px-3 text-base-content/80">
                          {ev.evaluatorName}
                        </td>
                        <td className="py-3 px-3 text-base-content/60 max-w-[260px]">
                          <span className="line-clamp-1">{ev.comments ?? "—"}</span>
                        </td>
                        <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                          {ev.philGepsRn ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                  {supplier.evaluations.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-10 text-center text-base-content/60"
                      >
                        No evaluations yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
            <div className="flex items-center gap-2 border-b border-base-200 pb-3">
              <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">
                Purchase History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-base-300 bg-base-200 text-base-content/85 uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-3">PO No.</th>
                    <th className="py-2.5 px-3">PR No.</th>
                    <th className="py-2.5 px-3">Amount (₱)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200">
                  {supplier.purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-base-200/30">
                      <td className="py-3 px-3">
                        <Link
                          href={`/dashboard/officer/po/${po.id}`}
                          className="font-bold text-primary hover:underline whitespace-nowrap"
                        >
                          {po.poNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                        {po.pr?.prNumber ?? "—"}
                      </td>
                      <td className="py-3 px-3 font-semibold tabular-nums whitespace-nowrap">
                        {fmtMoney(Number(po.totalCost))}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={po.status} />
                      </td>
                      <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                        {fmtDate(po.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {supplier.purchaseOrders.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-10 text-center text-base-content/60"
                      >
                        No purchase orders yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
            <div className="flex items-center gap-2 border-b border-base-200 pb-3">
              <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">
                Previous RFQs
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-base-300 bg-base-200 text-base-content/85 uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-3">RFQ No.</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200">
                  {rfqs.map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-base-200/30">
                      <td className="py-3 px-3">
                        <Link
                          href={`/dashboard/officer/rfq/${rfq.id}`}
                          className="font-bold text-primary hover:underline whitespace-nowrap"
                        >
                          {rfq.rfqNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-base-content/80 max-w-[320px]">
                        <span className="line-clamp-1">{rfq.title}</span>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={rfq.status} />
                      </td>
                      <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                        {fmtDate(rfq.deadlineDate)}
                      </td>
                    </tr>
                  ))}
                  {rfqs.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-10 text-center text-base-content/60"
                      >
                        No RFQ participation yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4 self-start">
          <div className="flex items-center gap-2 border-b border-base-200 pb-3">
            <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">
              Performance Trend
            </h3>
          </div>
          {trend.length === 0 ? (
            <p className="py-8 text-center text-xs text-base-content/60">
              No evaluation scores yet.
            </p>
          ) : (
            <ul className="divide-y divide-base-200">
              {trend.map((entry, i) => (
                <li
                  key={`${entry.date.toISOString()}-${i}`}
                  className="flex items-center justify-between py-2.5"
                >
                  <div>
                    <p className="text-xs font-bold text-base-content">
                      {fmtDate(entry.date)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-base-content/50 tabular-nums">
                      {entry.score.toFixed(2)} / 4
                    </p>
                  </div>
                  <span
                    className={`text-sm font-black tabular-nums ${entry.arrowClass}`}
                  >
                    {entry.arrow}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
