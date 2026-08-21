"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { FileText } from "lucide-react";

export interface SolicitationRfq {
  id: number;
  rfqNumber: string;
  title: string;
  status: string;
  budget: number;
  deadlineDate: string | null;
  createdAt: string;
  prNumber: string | null;
  isExpired: boolean;
  closingSoon: boolean;
}

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
    : "—";

export default function SolicitationBoardClient({ rfqs }: { rfqs: SolicitationRfq[] }) {
  const [tab, setTab] = useState("Published");

  const { tabs, expiredIds } = useMemo(() => {
    const published = rfqs.filter((r) => r.status === "Published");
    const drafts = rfqs.filter((r) => r.status === "Draft");
    const closingSoon = rfqs.filter((r) => r.closingSoon);
    const closed = rfqs.filter((r) => r.status === "Closed" || r.status === "Evaluated");

    const expired = new Set(rfqs.filter((r) => r.isExpired).map((r) => r.id));

    return {
      tabs: [
        { key: "Published", label: "Published", rows: published },
        { key: "Drafts", label: "Drafts", rows: drafts },
        { key: "Closing Soon", label: "Closing Soon", rows: closingSoon },
        { key: "Closed", label: "Closed", rows: closed },
      ],
      expiredIds: expired,
    };
  }, [rfqs]);

  const active = tabs.find((t) => t.key === tab) ?? tabs[0];

  return (
    <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
      <div className="flex items-center justify-between border-b border-base-200 pb-3 text-left">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[var(--accent)]" />
          <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">Solicitation Board</h3>
        </div>
        <Link href="/dashboard/officer/rfq/new" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
          + Create RFQ
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-base-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 -mb-px ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-base-content/60 hover:text-base-content"
            }`}
          >
            {t.label}
            <span className="ml-1.5 rounded-full bg-base-200 px-2 py-0.5 text-[10px]">{t.rows.length}</span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-base-300 bg-base-200 text-base-content/85 uppercase text-[10px] font-bold">
              <th className="py-2.5 px-3">Reference Number</th>
              <th className="py-2.5 px-3">Title</th>
              <th className="py-2.5 px-3">Budget</th>
              <th className="py-2.5 px-3">Deadline</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200">
            {active.rows.map((rfq) => (
              <tr key={rfq.id} className="hover:bg-base-200/30">
                <td className="py-3 px-3">
                  <Link href={`/dashboard/officer/rfq/${rfq.id}`} className="font-bold text-primary hover:underline">
                    {rfq.rfqNumber}
                  </Link>
                  {rfq.prNumber && <div className="text-[10px] text-base-content/50 mt-0.5">PR {rfq.prNumber}</div>}
                </td>
                <td className="py-3 px-3 max-w-[260px]">
                  <span className="line-clamp-1 font-medium text-base-content">{rfq.title}</span>
                </td>
                <td className="py-3 px-3 whitespace-nowrap text-base-content/70">
                  ₱{rfq.budget.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 whitespace-nowrap text-base-content/70">{fmtDate(rfq.deadlineDate)}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={rfq.status} />
                    {expiredIds.has(rfq.id) && (
                      <span className="inline-flex items-center rounded-full bg-[var(--accent-glass)] px-2.5 py-1 text-[10px] font-bold text-[var(--accent)] dark:bg-[var(--accent-glass)] dark:text-[var(--secondary)]">
                        Expired
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <Link
                    href={`/dashboard/officer/rfq/${rfq.id}`}
                    className="inline-flex items-center rounded-md border border-base-300 px-3 py-1.5 text-[10px] font-bold text-base-content/70 transition hover:bg-base-200"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {active.rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-base-content/60">
                  No solicitations in this board yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
