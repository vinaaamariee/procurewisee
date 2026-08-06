"use client";

import React, { useState } from "react";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import { Search, ArrowRight } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

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
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-base-content/40" />
            <input
              type="text"
              placeholder="Search by PR number, department, office, requestor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full input pl-9"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wide text-base-content/60">
              Status Filter
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
            return (
              <Card key={pr.id} className="p-5 flex flex-col justify-between space-y-4 shadow-none">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-primary font-display">
                      {pr.prNumber}
                    </span>
                    <StatusBadge status={pr.status} />
                  </div>

                  {/* Department & Office */}
                  <div className="text-left">
                    <div className="text-sm font-bold text-base-content">
                      {pr.department}
                    </div>
                    {pr.office && (
                      <div className="text-xs text-base-content/60 mt-0.5">
                        Office: {pr.office}
                      </div>
                    )}
                  </div>

                  {/* Requestor */}
                  {pr.requestorName && (
                    <div className="text-xs text-base-content/60 font-medium text-left">
                      Requestor: <span className="text-base-content font-semibold">{pr.requestorName}</span>
                    </div>
                  )}

                  {/* Purpose */}
                  <p className="text-xs text-base-content/75 line-clamp-2 leading-relaxed min-h-[2.5rem] text-left">
                    {pr.purpose}
                  </p>
                </div>

                {/* Footer */}
                <div className="border-t border-base-200 pt-3 space-y-3">
                  <div className="flex items-center justify-between text-xs text-base-content/50">
                    <span>
                      Submitted: {new Date(pr.submittedAt || pr.requestDate).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="font-bold text-base-content text-sm">
                      ₱{Number(pr.totalCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/officer/pr/${pr.id}`}
                    className="w-full btn btn-sm btn-outline border-base-300 text-xs flex items-center justify-center gap-2 rounded-md hover:bg-base-200"
                  >
                    <span>Verify Request</span>
                    <ArrowRight className="h-4 w-4" />
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