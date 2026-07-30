import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";

export interface RFQItem {
    id: string | number;
    rfqNumber?: string;
    title: string;
    status: string;
    deadlineDate?: Date | string | null;
    closingDate?: Date | string | null;
    approvedBudgetContract?: any;
    supplierCount?: number;
}

interface RecentRFQTableProps {
    rfqs: RFQItem[];
}

export default function RecentRFQTable({ rfqs }: RecentRFQTableProps) {
    return (
        <section
            id="recent-solicitations"
            className="overflow-hidden rounded-xl border border-base-200 scroll-mt-24 bg-base-100"
        >
            {/* Table Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-base-200 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-200 text-base-content/75">
                        <ClipboardList className="h-4.5 w-4.5" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-sm font-black text-base-content tracking-tight">
                            Recent Solicitations
                        </h2>
                        <p className="text-xs text-base-content/60">
                            Latest Requests for Quotation
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="badge badge-sm bg-base-200 text-base-content/70 font-semibold border-none rounded">
                        Last {rfqs.length} records
                    </span>
                    <Link
                        href="/dashboard/officer/rfq"
                        className="btn btn-xs btn-outline font-bold border-base-300 rounded-md flex items-center gap-1"
                    >
                        <span>View All</span>
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                    <thead>
                        <tr style={{ background: "var(--bg-deep)", borderBottom: "1px solid var(--border)" }}>
                            {["RFQ No.", "Title", "Budget (₱)", "Deadline", "Status"].map((h) => (
                                <th
                                    key={h}
                                    className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wide"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rfqs.map((rfq) => {
                            const rawDeadline = rfq.deadlineDate ?? rfq.closingDate;
                            const deadline = rawDeadline ? new Date(rawDeadline) : null;
                            let remainingLabel = "—";
                            let remainingClass = "text-emerald-600";

                            if (deadline && !isNaN(deadline.getTime())) {
                                const now = new Date();
                                const dDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
                                const nDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                const diffDays = Math.ceil((dDate.getTime() - nDate.getTime()) / (1000 * 60 * 60 * 24));

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

                            const rfqNum = rfq.rfqNumber || String(rfq.id).slice(0, 8);
                            const budgetVal = rfq.approvedBudgetContract != null ? Number(rfq.approvedBudgetContract) : null;

                            return (
                                <tr
                                    key={rfq.id}
                                    className="group border-b transition-colors duration-150"
                                    style={{ borderColor: "var(--border)" }}
                                >
                                    <td className="px-6 py-4 font-bold whitespace-nowrap">
                                        <Link
                                            href={`/dashboard/officer/rfq/${rfq.id}`}
                                            className="font-bold transition-colors duration-150 hover:underline"
                                            style={{ color: "var(--accent)" }}
                                        >
                                            {rfqNum}
                                        </Link>
                                    </td>
                                    <td
                                        className="max-w-[280px] px-6 py-4 font-medium"
                                        style={{ color: "var(--text-primary)" }}
                                    >
                                        {rfq.title}
                                    </td>
                                    <td
                                        className="px-6 py-4 font-semibold whitespace-nowrap"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        {budgetVal != null ? (
                                            `₱${budgetVal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                                        ) : rfq.supplierCount != null ? (
                                            `${rfq.supplierCount} Suppliers`
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {deadline && !isNaN(deadline.getTime()) ? (
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
                                                    {deadline.toLocaleDateString("en-PH", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                                <span className={`text-xs font-extrabold ${remainingClass}`}>
                                                    {remainingLabel}
                                                </span>
                                            </div>
                                        ) : (
                                            <span style={{ color: "var(--text-muted)" }}>—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={rfq.status} />
                                    </td>
                                </tr>
                            );
                        })}

                        {rfqs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-6">
                                    <EmptyState
                                        preset="rfq"
                                        title="No Active Solicitations"
                                        description="No requests for quotation have been created yet. Draft a new RFQ from the solicitation workspace."
                                        action={{ label: "+ New RFQ", href: "/dashboard/officer/rfq/new" }}
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}