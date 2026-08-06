"use client";

import React, { useState } from "react";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { Search, Eye, Printer } from "lucide-react";

interface PurchaseRequest {
  id: number;
  prNumber: string;
  department: string;
  office?: string;
  requestorName?: string;
  requestDate: Date | string;
  submittedAt?: Date | string;
  totalCost: any;
  status: string;
  purpose: string;
  fundingSource?: string;
}

interface PrAuditClientProps {
  initialPrs: PurchaseRequest[];
}

const fmtDate = (d: Date | string | undefined | null) =>
  d
    ? new Date(d).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const fmtMoney = (n: any) =>
  `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

export default function PrAuditClient({ initialPrs }: PrAuditClientProps) {
  const [prs] = useState<PurchaseRequest[]>(initialPrs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPrs = prs.filter((pr) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      pr.prNumber.toLowerCase().includes(q) ||
      pr.department.toLowerCase().includes(q) ||
      (pr.office && pr.office.toLowerCase().includes(q)) ||
      (pr.requestorName && pr.requestorName.toLowerCase().includes(q)) ||
      pr.purpose.toLowerCase().includes(q) ||
      (pr.fundingSource && pr.fundingSource.toLowerCase().includes(q));

    const st = pr.status.toLowerCase().replace(/[\s_]/g, "");
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" &&
        ["pendingprocurementreview", "submitted", "underreview"].includes(st)) ||
      (statusFilter === "returned" &&
        ["returned", "returnedforrevision"].includes(st)) ||
      (statusFilter === "approved" && st === "approved");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-base-content/40" />
            <input
              type="text"
              placeholder="Search by PR number, office, requestor, fund source, purpose…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full input pl-9"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wide text-base-content/60">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select select-sm border-base-300 bg-base-100 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Verification</option>
              <option value="returned">Returned</option>
              <option value="approved">Verified</option>
            </select>
            <span className="text-xs text-base-content/50">
              {filteredPrs.length} record{filteredPrs.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </Card>

      {/* Verification Queue Table */}
      {filteredPrs.length === 0 ? (
        <EmptyState
          preset="purchase-requests"
          title="No Purchase Requests Found"
          description="No requisitions match your search or status filter criteria."
          action={{
            label: "Clear Filters",
            onClick: () => {
              setSearch("");
              setStatusFilter("all");
            },
          }}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-base-300 bg-base-200 text-base-content/85 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3 whitespace-nowrap">PR Number</th>
                  <th className="py-3 px-3">Office</th>
                  <th className="py-3 px-3 whitespace-nowrap">Requestor</th>
                  <th className="py-3 px-3">Purpose</th>
                  <th className="py-3 px-3 whitespace-nowrap">Fund Source</th>
                  <th className="py-3 px-3 whitespace-nowrap">Date Submitted</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Est. Cost</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {filteredPrs.map((pr) => (
                  <tr key={pr.id} className="hover:bg-base-200/30 transition-colors">
                    {/* PR Number */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <Link
                        href={`/dashboard/officer/pr/${pr.id}`}
                        className="font-bold text-primary hover:underline"
                      >
                        {pr.prNumber}
                      </Link>
                    </td>

                    {/* Office / Department */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-base-content">
                        {pr.office || pr.department}
                      </div>
                      {pr.office && pr.department && pr.office !== pr.department && (
                        <div className="text-[10px] text-base-content/50 mt-0.5">
                          {pr.department}
                        </div>
                      )}
                    </td>

                    {/* Requestor */}
                    <td className="py-3 px-3 text-base-content/80 whitespace-nowrap">
                      {pr.requestorName || "—"}
                    </td>

                    {/* Purpose */}
                    <td className="py-3 px-3 text-base-content/70 max-w-[18rem]">
                      <div className="line-clamp-2 leading-relaxed">{pr.purpose}</div>
                    </td>

                    {/* Fund Source */}
                    <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                      {pr.fundingSource || "—"}
                    </td>

                    {/* Date Submitted */}
                    <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                      {fmtDate(pr.submittedAt || pr.requestDate)}
                    </td>

                    {/* Estimated Cost */}
                    <td className="py-3 px-3 text-right font-bold text-base-content whitespace-nowrap">
                      {fmtMoney(pr.totalCost)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <StatusBadge status={pr.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 justify-center">
                        <Link
                          href={`/dashboard/officer/pr/${pr.id}`}
                          title="View / Verify this PR"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors whitespace-nowrap"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Verify</span>
                        </Link>
                        <Link
                          href={`/dashboard/officer/pr/${pr.id}`}
                          title="Print this PR"
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded text-[11px] font-bold bg-base-200 text-base-content/70 hover:bg-base-300 transition-colors"
                        >
                          <Printer className="h-3.5 w-3.5" />
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
