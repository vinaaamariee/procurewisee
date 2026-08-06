import Link from "next/link";
import { Building2 } from "lucide-react";
import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata = {
  title: "Supplier Directory — ProcureWise",
};

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

const philGepsTone: Record<string, string> = {
  Registered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  Expired: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
  "Not Registered": "bg-base-200 text-base-content/60 dark:bg-base-300/50",
};

type EvalCriteria = {
  rfqResponsiveness: number | null;
  competitivePricing: number | null;
  specificationCompliance: number | null;
  documentCompliance: number | null;
  deliveryPerformance: number | null;
};

type EvalForStatus = {
  evaluationDate: Date;
  philGepsRn: string | null;
  philGepsDateRegistered: Date | null;
  philGepsExpirationDate: Date | null;
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

function latestEvaluation(evals: EvalForStatus[]): EvalForStatus | null {
  if (evals.length === 0) return null;
  return [...evals].sort(
    (a, b) => b.evaluationDate.getTime() - a.evaluationDate.getTime()
  )[0];
}

function philGepsStatus(evals: EvalForStatus[]): { label: string; tone: string } {
  const latest = latestEvaluation(evals);
  if (!latest) return { label: "Not Registered", tone: philGepsTone["Not Registered"] };

  if (latest.philGepsRn) return { label: "Registered", tone: philGepsTone.Registered };

  if (latest.philGepsExpirationDate) {
    const exp = latest.philGepsExpirationDate;
    const expDate = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate());
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (expDate.getTime() < todayStart.getTime()) {
      return { label: "Expired", tone: philGepsTone.Expired };
    }
  }

  return { label: "Not Registered", tone: philGepsTone["Not Registered"] };
}

function supplierAvgScore(
  evals: (EvalCriteria & { evaluationType: string })[]
): { avg: number | null; label: string } {
  const officeEvs = evals.filter((e) => e.evaluationType === "ProcurementOffice");
  const avgs = officeEvs.map(evalAverage).filter((v): v is number => v !== null);
  if (avgs.length === 0) return { avg: null, label: "—" };
  const avg = avgs.reduce((a, b) => a + b, 0) / avgs.length;
  return { avg, label: `${avg.toFixed(2)} / 4` };
}

function lastEvaluationDate(evals: { evaluationDate: Date }[]): string {
  if (evals.length === 0) return "—";
  const latest = [...evals].sort(
    (a, b) => b.evaluationDate.getTime() - a.evaluationDate.getTime()
  )[0];
  return fmtDate(latest.evaluationDate);
}

export default async function SuppliersPage() {
  await requireRole("Procurement Officer");

  const suppliers = await prisma.supplier.findMany({
    include: {
      evaluations: {
        select: {
          id: true,
          evaluationType: true,
          evaluationDate: true,
          rfqResponsiveness: true,
          competitivePricing: true,
          specificationCompliance: true,
          documentCompliance: true,
          deliveryPerformance: true,
          philGepsRn: true,
          philGepsDateRegistered: true,
          philGepsExpirationDate: true,
        },
      },
      recommendations: {
        where: { approvalStatus: "Approved" },
        select: { id: true },
      },
    },
    orderBy: { companyName: "asc" },
  });

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Supplier Directory"
        subtitle="Registered suppliers with PhilGEPS status, evaluation scores, and award counts. Click a supplier to open their profile."
      />

      <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
        <div className="flex items-center justify-between border-b border-base-200 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">
              Registered Suppliers
            </h3>
          </div>
          <span className="rounded-full bg-base-200 px-3 py-1 text-[10px] font-bold text-base-content/70">
            {suppliers.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-base-300 bg-base-200 text-base-content/85 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Supplier Name</th>
                <th className="py-2.5 px-3">PhilGEPS Status</th>
                <th className="py-2.5 px-3">Registration</th>
                <th className="py-2.5 px-3">Evaluation Score</th>
                <th className="py-2.5 px-3">Last Evaluation Date</th>
                <th className="py-2.5 px-3">Number of Awards</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200">
              {suppliers.map((supplier) => {
                const status = philGepsStatus(supplier.evaluations);
                const score = supplierAvgScore(supplier.evaluations);
                const latestReg = latestEvaluation(supplier.evaluations);
                const awards = supplier.recommendations.length;

                return (
                  <tr key={supplier.id} className="hover:bg-base-200/30">
                    <td className="py-3 px-3">
                      <Link
                        href={`/dashboard/officer/suppliers/${supplier.id}`}
                        className="font-bold text-primary hover:underline"
                      >
                        {supplier.companyName}
                      </Link>
                      {supplier.tin && (
                        <p className="mt-0.5 text-[10px] text-base-content/50">
                          TIN {supplier.tin}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap ${status.tone}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                      {latestReg?.philGepsDateRegistered
                        ? fmtDate(latestReg.philGepsDateRegistered)
                        : "—"}
                    </td>
                    <td className="py-3 px-3 text-base-content/80 font-semibold tabular-nums whitespace-nowrap">
                      {score.label}
                    </td>
                    <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                      {lastEvaluationDate(supplier.evaluations)}
                    </td>
                    <td className="py-3 px-3 text-base-content/80 font-bold tabular-nums">
                      {awards}
                    </td>
                    <td className="py-3 px-3">
                      {supplier.isVerified ? (
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold bg-base-200 text-base-content/60 dark:bg-base-300/50">
                          Unverified
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {suppliers.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-base-content/60"
                  >
                    No suppliers are registered yet. Once suppliers are added to
                    the registry, they will appear here with their PhilGEPS status,
                    evaluation scores, and award counts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
