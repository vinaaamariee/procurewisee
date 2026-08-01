"use client";

import React, { useState } from "react";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import { Search, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";

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
}

interface PrAuditClientProps {
  initialPrs: PurchaseRequest[];
}

export default function PrAuditClient({ initialPrs }: PrAuditClientProps) {
  const [prs] = useState<PurchaseRequest[]>(initialPrs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PendingProcurementReview":
      case "Pending Procurement Review":
      case "Submitted":
      case "UnderReview":
      case "Under Review":
        return { label: "Pending Procurement Review", cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300" };
      case "Returned":
      case "ReturnedForRevision":
      case "Returned for Revision":
        return { label: "Returned", cls: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300" };
      case "Approved":
        return { label: "Approved | Eligible for RFQ", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300" };
      default:
        return { label: status, cls: "bg-gray-100 text-gray-700 border-gray-300" };
    }
  };

  const filteredPrs = prs.filter((pr) => {
    const matchesSearch =
      pr.prNumber.toLowerCase().includes(search.toLowerCase()) ||
      pr.department.toLowerCase().includes(search.toLowerCase()) ||
      (pr.office && pr.office.toLowerCase().includes(search.toLowerCase())) ||
      (pr.requestorName && pr.requestorName.toLowerCase().includes(search.toLowerCase())) ||
      pr.purpose.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && ["pendingprocurementreview", "pending procurement review", "submitted", "underreview"].includes(pr.status.toLowerCase())) ||
      (statusFilter === "returned" && ["returned", "returnedforrevision", "returned for revision"].includes(pr.status.toLowerCase())) ||
      (statusFilter === "approved" && pr.status.toLowerCase() === "approved");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <Card className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by PR number, department, office, requestor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--text-primary)]"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
              Status Filter
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--text-primary)] font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Procurement Review</option>
              <option value="returned">Returned</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Grid Queue */}
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrs.map((pr) => {
            const badge = getStatusBadge(pr.status);

            return (
              <Card key={pr.id} className="p-6 transition hover:-translate-y-1 hover:shadow-lg hover:border-[var(--accent)] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-extrabold text-[var(--accent)]">
                      {pr.prNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Department & Office */}
                  <div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">
                      {pr.department}
                    </div>
                    {pr.office && (
                      <div className="text-xs text-[var(--text-muted)]">
                        Office: {pr.office}
                      </div>
                    )}
                  </div>

                  {/* Requestor */}
                  {pr.requestorName && (
                    <div className="text-xs text-[var(--text-muted)] font-medium">
                      Requestor: <span className="text-[var(--text-primary)] font-semibold">{pr.requestorName}</span>
                    </div>
                  )}

                  {/* Purpose */}
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {pr.purpose}
                  </p>
                </div>

                {/* Footer */}
                <div className="border-t border-[var(--border)] pt-3 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>
                      Submitted: {new Date(pr.submittedAt || pr.requestDate).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="font-bold text-[var(--text-primary)] text-sm">
                      ₱{Number(pr.totalCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/officer/pr/${pr.id}`}
                    className="w-full btn btn-outline btn-sm rounded-xl text-xs flex items-center justify-center gap-2 border-[var(--border)] hover:bg-[var(--accent)] hover:text-white transition-colors"
                  >
                    <span>Validate & Review</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}