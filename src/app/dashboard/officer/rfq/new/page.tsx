import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import TableContainer from "@/components/ui/TableContainer";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { Plus } from "lucide-react";

export const metadata = { title: "RFQ Solicitations — ProcureWise" };

export default async function RfqListPage() {
  await requireRole("Procurement Officer");

  const rfqs = await prisma.requestForQuote.findMany({
    select: {
      id: true,
      rfqNumber: true,
      title: true,
      status: true,
      deadlineDate: true,
      approvedBudgetContract: true,
      createdAt: true,
      _count: {
        select: { quotes: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <SectionHeader
        title="RFQ Solicitations"
        action={
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--text-muted)]">
              {rfqs.length} {rfqs.length === 1 ? "record" : "records"}
            </span>
            <Link
              href="/dashboard/officer/rfq/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              New RFQ
            </Link>
          </div>
        }
      />

      {/* Table */}
      <TableContainer>
        <div className="overflow-x-auto">
          {rfqs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                preset="rfq"
                title="No RFQs Found"
                description="No Requests for Quotation have been created yet."
                action={{
                  label: "+ New RFQ",
                  href: "/dashboard/officer/rfq/new",
                }}
              />
            </div>
          ) : (
            <table className="w-full min-w-[800px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-dark)]">
                  {[
                    "RFQ No.",
                    "Title",
                    "Budget (₱)",
                    "Quotes",
                    "Deadline",
                    "Status",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rfqs.map((rfq) => {
                  const deadline = rfq.deadlineDate
                    ? new Date(rfq.deadlineDate)
                    : null;

                  let remainingLabel = "—";
                  let remainingClass = "text-emerald-600";

                  if (deadline) {
                    const now = new Date();
                    const diffDays = Math.ceil(
                      (new Date(
                        deadline.getFullYear(),
                        deadline.getMonth(),
                        deadline.getDate()
                      ).getTime() -
                        new Date(
                          now.getFullYear(),
                          now.getMonth(),
                          now.getDate()
                        ).getTime()) /
                        86400000
                    );

                    if (diffDays < 0) {
                      remainingLabel = "Expired";
                      remainingClass = "text-red-500";
                    } else if (diffDays === 0) {
                      remainingLabel = "Today";
                      remainingClass = "text-red-500";
                    } else if (diffDays <= 5) {
                      remainingLabel = `${diffDays}d left`;
                      remainingClass = "text-amber-500";
                    } else {
                      remainingLabel = `${diffDays}d left`;
                      remainingClass = "text-emerald-600";
                    }
                  }

                  return (
                    <tr
                      key={rfq.id}
                      className="border-b border-[var(--border)] transition hover:bg-[var(--surface-hover)]"
                    >
                      <td className="px-5 py-3 font-bold whitespace-nowrap">
                        <Link
                          href={`/dashboard/officer/rfq/${rfq.id}`}
                          className="text-[var(--accent)] hover:underline"
                        >
                          {rfq.rfqNumber}
                        </Link>
                      </td>

                      <td className="max-w-[260px] px-5 py-3 text-[var(--text-primary)]">
                        <span className="line-clamp-1">{rfq.title}</span>
                      </td>

                      <td className="px-5 py-3 font-semibold whitespace-nowrap text-[var(--text-secondary)]">
                        ₱{Number(rfq.approvedBudgetContract).toLocaleString(
                          "en-PH",
                          { minimumFractionDigits: 2 }
                        )}
                      </td>

                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-dark)] text-xs font-bold text-[var(--text-secondary)]">
                          {rfq._count.quotes}
                        </span>
                      </td>

                      <td className="px-5 py-3 whitespace-nowrap">
                        {deadline ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-[var(--text-secondary)]">
                              {deadline.toLocaleDateString("en-PH", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className={`text-[11px] font-bold ${remainingClass}`}>
                              {remainingLabel}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>

                      <td className="px-5 py-3">
                        <StatusBadge status={rfq.status} />
                      </td>

                      <td className="px-5 py-3">
                        <Link
                          href={`/dashboard/officer/rfq/${rfq.id}`}
                          className="inline-flex items-center rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </TableContainer>
    </div>
  );
}