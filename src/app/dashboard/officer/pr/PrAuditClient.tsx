"use client";

import React, { useState } from "react";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { Search } from "lucide-react";

interface PurchaseRequest {
  id: number;
  prNumber: string;
  department: string;
  requestDate: Date | string;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return { bg: "rgba(107, 114, 128, 0.1)", text: "#6b7280" };
      case "Submitted":
        return { bg: "rgba(59, 130, 246, 0.1)", text: "#3b82f6" };
      case "UnderReview":
      case "Under Review":
        return { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b" };
      case "ReturnedForRevision":
      case "Returned for Revision":
        return { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444" };
      case "Approved":
        return { bg: "rgba(16, 185, 129, 0.1)", text: "#10b981" };
      case "Received":
        return { bg: "rgba(79, 70, 229, 0.1)", text: "#4f46e5" };
      default:
        return { bg: "rgba(0, 0, 0, 0.05)", text: "#000" };
    }
  };

  const filteredPrs = prs.filter((pr) => {
    const matchesSearch =
      pr.prNumber.toLowerCase().includes(search.toLowerCase()) ||
      pr.department.toLowerCase().includes(search.toLowerCase()) ||
      pr.purpose.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || pr.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const theme = {
    crimson: "var(--accent)",
    glassBg: "var(--surface)",
    glassBorder: "var(--border)",
    textMain: "var(--text-primary)",
    textMuted: "var(--text-muted)",
    shadow: "var(--shadow-card)",
  };

  return (
  <div className="space-y-6">
    
    {/* Search & Filter */}
    <Card className="p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by PR number, department, or purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
            Status
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="all">All</option>
            <option value="Submitted">Submitted</option>
            <option value="UnderReview">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Received">Received</option>
          </select>
        </div>
      </div>
    </Card>

    {/* Grid */}
    {filteredPrs.length === 0 ? (
      <EmptyState
        preset="purchase-requests"
        title="No Purchase Requests Found"
        description="No requisitions match your search or filter criteria."
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
        {filteredPrs.map((pr) => (
          <Link
            key={pr.id}
            href={`/dashboard/officer/pr/${pr.id}`}
            className="group"
          >
            <Card className="p-6 transition hover:-translate-y-1 hover:shadow-lg hover:border-[var(--border-accent)]">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-[var(--accent)]">
                  {pr.prNumber}
                </span>
                <StatusBadge status={pr.status} />
              </div>

              {/* Department */}
              <div className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
                {pr.department}
              </div>

              {/* Purpose */}
              <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2 min-h-[2.5rem]">
                {pr.purpose}
              </p>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--text-muted)]">
                <span>
                  {new Date(pr.requestDate).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>

                <span className="font-bold text-[var(--text-primary)] text-sm">
                  ₱
                  {Number(pr.totalCost).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

            </Card>
          </Link>
        ))}
      </div>
    )}
  </div>
)}