import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";
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
        select: {
          quotes: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <SectionHeader
        title="RFQ Solicitations"
        subtitle="Manage and monitor all Requests for Quotation issued to registered suppliers."
        action={
          <Link
            href="/dashboard/officer/rfq/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New RFQ
          </Link>
        }
      />

      <TableContainer>
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            All Solicitations
          </h2>
          <span className="rounded-full bg-[var(--bg-dark)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
            {rfqs.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          {rfqs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                preset="rfq"
                title="No RFQs Found"
                description="No Requests for Quotation have been created yet. Start by drafting a new RFQ."
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
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
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
                    const dDate = new Date(
                      deadline.getFullYear(),
                      deadline.getMonth(),
                      deadline.getDate()
                    );
                    const nDate = new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate()
                    );
                    const diffDays = Math.ceil(
                      (dDate.getTime() - nDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    if (diffDays < 0) {
                      remainingLabel = "Expired";
                      remainingClass = "text-red-600";
                    } else if (diffDays === 0) {
                      remainingLabel = "Expiring Today";
                      remainingClass = "text-red-600";
                    } else if (diffDays === 1) {
                      remainingLabel = "1 Day Remaining";
                      remainingClass = "text-red-600";
                    } else if (diffDays <= 5) {
                      remainingLabel = `${diffDays} Days Remaining`;
                      remainingClass = "text-amber-600";
                    } else {
                      remainingLabel = `${diffDays} Days Remaining`;
                      remainingClass = "text-emerald-600";
                    }
                  }

                  return (
                    <tr
                      key={rfq.id}
                      className="border-b border-[var(--border)] transition hover:bg-[var(--surface-hover)]"
                    >
                      <td className="px-5 py-4 font-bold whitespace-nowrap">
                        <Link
                          href={`/dashboard/officer/rfq/${rfq.id}`}
                          className="text-[var(--accent)] hover:underline"
                        >
                          {rfq.rfqNumber}
                        </Link>
                      </td>

                      <td className="max-w-[260px] px-5 py-4 font-medium text-[var(--text-primary)]">
                        <span className="line-clamp-1">{rfq.title}</span>
                      </td>

                      <td className="px-5 py-4 font-semibold whitespace-nowrap text-[var(--text-secondary)]">
                        ₱
                        {Number(rfq.approvedBudgetContract).toLocaleString(
                          "en-PH",
                          { minimumFractionDigits: 2 }
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-[var(--bg-dark)] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
                          {rfq._count.quotes}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {deadline ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-[var(--text-secondary)]">
                              {deadline.toLocaleDateString("en-PH", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span
                              className={`text-xs font-bold ${remainingClass}`}
                            >
                              {remainingLabel}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={rfq.status} />
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <Link
                          href={`/dashboard/officer/rfq/${rfq.id}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
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