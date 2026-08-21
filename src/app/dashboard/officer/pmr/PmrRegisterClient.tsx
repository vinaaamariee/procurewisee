"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import { Search, Download, Printer, ArrowRight } from "lucide-react";

export interface PmrRow {
  id: number;
  pmrNumber: string;
  prId: number;
  prNumber: string | null;
  office: string;
  department: string | null;
  fundSource: string | null;
  purpose: string | null;
  totalCost: number;
  dateReceived: string;
  verificationDate: string | null;
  verifiedBy: string | null;
  stage: string;
  status: string;
  remarks: string | null;
}

interface PmrRegisterClientProps {
  initialPmrs: PmrRow[];
  offices: string[];
}

function downloadCsv(rows: PmrRow[]) {
  const headers = [
    "PMR Number",
    "PR Number",
    "Office",
    "Department",
    "Fund Source",
    "Total Cost",
    "Date Received",
    "Verification Date",
    "Verified By",
    "Stage",
    "Status",
    "Remarks",
  ];
  const escape = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.pmrNumber,
        r.prNumber,
        r.office,
        r.department,
        r.fundSource,
        r.totalCost.toFixed(2),
        new Date(r.dateReceived).toLocaleDateString("en-PH"),
        r.verificationDate ? new Date(r.verificationDate).toLocaleDateString("en-PH") : "",
        r.verifiedBy,
        r.stage,
        r.status,
        r.remarks,
      ].map(escape).join(",")
    ),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pmr-register-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function PmrRegisterClient({ initialPmrs, offices }: PmrRegisterClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [officeFilter, setOfficeFilter] = useState("all");

  const stages = useMemo(
    () => Array.from(new Set(initialPmrs.map((p) => p.stage))).sort(),
    [initialPmrs]
  );

  const filtered = useMemo(() => {
    return initialPmrs.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.pmrNumber.toLowerCase().includes(q) ||
        (p.prNumber || "").toLowerCase().includes(q) ||
        p.office.toLowerCase().includes(q) ||
        (p.fundSource || "").toLowerCase().includes(q) ||
        (p.purpose || "").toLowerCase().includes(q) ||
        (p.verifiedBy || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesStage = stageFilter === "all" || p.stage === stageFilter;
      const matchesOffice = officeFilter === "all" || p.office === officeFilter;
      return matchesSearch && matchesStatus && matchesStage && matchesOffice;
    });
  }, [initialPmrs, search, statusFilter, stageFilter, officeFilter]);

  const counts = useMemo(() => {
    return {
      Active: initialPmrs.filter((p) => p.status === "Active").length,
      Archived: initialPmrs.filter((p) => p.status === "Archived").length,
      Cancelled: initialPmrs.filter((p) => p.status === "Cancelled").length,
    };
  }, [initialPmrs]);

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(
          [
            { label: "Active Records", value: counts.Active, cls: "text-[var(--accent)] dark:text-[var(--secondary)]" },
            { label: "Archived", value: counts.Archived, cls: "text-base-content/70" },
            { label: "Cancelled", value: counts.Cancelled, cls: "text-[var(--accent)] dark:text-[var(--accent)]" },
          ] as const
        ).map((s) => (
          <div key={s.label} className="rounded-md border border-base-300 bg-base-100 p-4 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/65">{s.label}</span>
            <span className={`text-2xl font-bold font-display ${s.cls}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="relative w-full xl:max-w-sm">
            <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-base-content/40" />
            <input
              type="text"
              placeholder="Search PMR #, PR #, office, fund source, verified by..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full input pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select select-sm border-base-300 bg-base-100 font-medium">
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="select select-sm border-base-300 bg-base-100 font-medium">
              <option value="all">All Stages</option>
              {stages.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select value={officeFilter} onChange={(e) => setOfficeFilter(e.target.value)} className="select select-sm border-base-300 bg-base-100 font-medium">
              <option value="all">All Offices</option>
              {offices.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>

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
        </div>
      </Card>

      {/* Register Table */}
      {filtered.length === 0 ? (
        <EmptyState
          preset="purchase-requests"
          title="No PMR Records Found"
          description="No procurement monitoring records match your search or filter criteria."
          action={{
            label: "Clear Filters",
            onClick: () => {
              setSearch("");
              setStatusFilter("all");
              setStageFilter("all");
              setOfficeFilter("all");
            },
          }}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-base-300 bg-base-200 text-base-content/85 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">PMR No.</th>
                  <th className="py-2.5 px-3">PR No.</th>
                  <th className="py-2.5 px-3">Office</th>
                  <th className="py-2.5 px-3">Fund Source</th>
                  <th className="py-2.5 px-3">Date Received</th>
                  <th className="py-2.5 px-3">Verification Date</th>
                  <th className="py-2.5 px-3">Verified By</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-base-200/30">
                    <td className="py-3 px-3">
                      <Link href={`/dashboard/officer/pmr/${p.id}`} className="font-bold text-primary hover:underline">
                        {p.pmrNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-3 font-medium text-base-content">{p.prNumber || "—"}</td>
                    <td className="py-3 px-3 text-base-content/70">{p.office}</td>
                    <td className="py-3 px-3 text-base-content/70">{p.fundSource || "—"}</td>
                    <td className="py-3 px-3 text-base-content/70">
                      {new Date(p.dateReceived).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-3 px-3 text-base-content/70">
                      {p.verificationDate
                        ? new Date(p.verificationDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="py-3 px-3 text-base-content/70">{p.verifiedBy || "—"}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold">
                        {p.stage}
                      </span>
                    </td>
                    <td className="py-3 px-3"><StatusBadge status={p.status} /></td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => window.open(`/print/pmr/${p.id}`, "_blank")}
                          className="btn btn-ghost btn-xs rounded-md text-xs font-bold"
                          title="Print PMR"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                        <Link
                          href={`/dashboard/officer/pmr/${p.id}`}
                          className="btn btn-outline btn-xs border-base-300 rounded-md text-xs font-bold flex items-center gap-1"
                        >
                          View <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
