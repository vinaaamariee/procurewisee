"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import { Search, Download } from "lucide-react";

export interface VerificationRow {
  id: number;
  prNumber: string;
  office: string;
  department: string;
  fundingSource: string;
  purpose: string;
  totalCost: number;
  status: string;
  remarks: string | null;
  decisionDate: string | null;
  reviewedBy: string | null;
}

interface VerificationHistoryClientProps {
  initialPrs: VerificationRow[];
}

function downloadCsv(rows: VerificationRow[]) {
  const headers = [
    "PR Number",
    "Office",
    "Department",
    "Fund Source",
    "Purpose",
    "Total Cost",
    "Date Verified",
    "Status",
    "Action Taken",
    "Reviewed By",
    "Remarks",
  ];
  const getActionTaken = (status: string) => {
    const s = status.toLowerCase().replace(/[\s_]/g, "");
    if (s === "approved") return "Verified";
    if (s === "returnedforrevision" || s === "returned") return "Returned for Revision";
    if (s === "rejected") return "Rejected";
    if (s === "received") return "Received";
    if (s === "convertedforrfq" || s === "convertedforrfq") return "Converted to RFQ";
    return status;
  };
  const escape = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.prNumber,
        r.office,
        r.department,
        r.fundingSource,
        r.purpose,
        r.totalCost.toFixed(2),
        r.decisionDate ? new Date(r.decisionDate).toLocaleDateString("en-PH") : "",
        r.status,
        getActionTaken(r.status),
        r.reviewedBy,
        r.remarks,
      ].map(escape).join(",")
    ),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `verification-history-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function VerificationHistoryClient({ initialPrs }: VerificationHistoryClientProps) {
  const [search, setSearch] = useState("");
  const [officeFilter, setOfficeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fundFilter, setFundFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const offices = useMemo(() => Array.from(new Set(initialPrs.map((p) => p.office))).sort(), [initialPrs]);
  const fundSources = useMemo(() => Array.from(new Set(initialPrs.map((p) => p.fundingSource))).sort(), [initialPrs]);

  const filtered = useMemo(() => {
    return initialPrs.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.prNumber.toLowerCase().includes(q) ||
        p.office.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.fundingSource.toLowerCase().includes(q) ||
        p.purpose.toLowerCase().includes(q) ||
        (p.reviewedBy || "").toLowerCase().includes(q);

      const matchesOffice = officeFilter === "all" || p.office === officeFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesFund = fundFilter === "all" || p.fundingSource === fundFilter;

      let matchesDate = true;
      if (p.decisionDate) {
        const d = new Date(p.decisionDate).toISOString().slice(0, 10);
        if (dateFrom && d < dateFrom) matchesDate = false;
        if (dateTo && d > dateTo) matchesDate = false;
      }

      return matchesSearch && matchesOffice && matchesStatus && matchesFund && matchesDate;
    });
  }, [initialPrs, search, officeFilter, statusFilter, fundFilter, dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-base-content/40" />
              <input
                type="text"
                placeholder="Search PR number, office, fund source, purpose..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full input pl-9"
              />
            </div>
            <button
              type="button"
              onClick={() => downloadCsv(filtered)}
              disabled={filtered.length === 0}
              className="btn btn-sm btn-outline border-base-300 text-xs font-bold flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select value={officeFilter} onChange={(e) => setOfficeFilter(e.target.value)} className="select select-sm border-base-300 bg-base-100 font-medium">
              <option value="all">All Offices</option>
              {offices.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select select-sm border-base-300 bg-base-100 font-medium">
              <option value="all">All Statuses</option>
              <option value="Approved">Verified</option>
              <option value="Received">Received</option>
              <option value="ConvertedToRfq">Converted to RFQ</option>
              <option value="Returned">Returned</option>
              <option value="ReturnedForRevision">Returned for Revision</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select value={fundFilter} onChange={(e) => setFundFilter(e.target.value)} className="select select-sm border-base-300 bg-base-100 font-medium">
              <option value="all">All Fund Sources</option>
              {fundSources.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold uppercase tracking-wide text-base-content/60">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input input-sm input-bordered border-base-300 bg-base-100 font-medium"
              />
              <label className="text-xs font-bold uppercase tracking-wide text-base-content/60">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input input-sm input-bordered border-base-300 bg-base-100 font-medium"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* History Table */}
      {filtered.length === 0 ? (
        <EmptyState
          preset="purchase-requests"
          title="No Verification Records Found"
          description="No verification decisions match your filter criteria."
          action={{
            label: "Clear Filters",
            onClick: () => {
              setSearch("");
              setOfficeFilter("all");
              setStatusFilter("all");
              setFundFilter("all");
              setDateFrom("");
              setDateTo("");
            },
          }}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-base-300 bg-base-200 text-base-content/85 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3 whitespace-nowrap">PR No.</th>
                  <th className="py-2.5 px-3">Office</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Fund Source</th>
                  <th className="py-2.5 px-3">Purpose</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Date Verified</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Procurement Staff</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Action Taken</th>
                  <th className="py-2.5 px-3">Remarks</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {filtered.map((p) => {
                  const getActionTaken = (status: string) => {
                    const s = status.toLowerCase().replace(/[\s_]/g, "");
                    if (s === "approved") return "Verified";
                    if (s === "returnedforrevision" || s === "returned") return "Returned for Revision";
                    if (s === "rejected") return "Rejected";
                    if (s === "received") return "Received";
                    if (s === "convertedforrfq") return "Converted to RFQ";
                    return status;
                  };
                  return (
                  <tr key={p.id} className="hover:bg-base-200/30">
                    <td className="py-3 px-3 whitespace-nowrap">
                      <Link href={`/dashboard/officer/pr/${p.id}`} className="font-bold text-primary hover:underline">
                        {p.prNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-base-content/70">{p.office}</td>
                    <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">{p.fundingSource}</td>
                    <td className="py-3 px-3 text-base-content/70 line-clamp-1 max-w-[14rem]">{p.purpose}</td>
                    <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                      {p.decisionDate
                        ? new Date(p.decisionDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">{p.reviewedBy || "—"}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        getActionTaken(p.status) === "Verified"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                          : getActionTaken(p.status).startsWith("Returned")
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                          : getActionTaken(p.status) === "Rejected"
                          ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                          : "bg-base-200 text-base-content/70"
                      }`}>
                        {getActionTaken(p.status)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-base-content/60 max-w-[14rem]">
                      <div className="line-clamp-2 leading-relaxed text-[11px]">
                        {p.remarks || "—"}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-base-content whitespace-nowrap">
                      ₱{p.totalCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3"><StatusBadge status={p.status} /></td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
