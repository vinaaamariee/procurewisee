"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Users,
  Eye,
} from "lucide-react";

interface PreCanvassItem {
  id: number;
  preCanvassNumber: string;
  status: string;
  createdAt: string;
  sentAt: string | null;
  closedAt: string | null;
  remarks: string | null;
  purchaseRequest: {
    prNumber: string;
    department: string;
    office: string;
    purpose: string;
    totalCost: number;
    status: string;
  };
  suppliers: Array<{
    companyName: string;
    responseStatus: string;
  }>;
  createdBy: string;
  supplierCount: number;
  respondedCount: number;
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: any }> = {
    Draft: { bg: "bg-gray-100", text: "text-gray-700", icon: Clock },
    SuppliersSelected: { bg: "bg-[var(--secondary-dim)]", text: "text-[var(--secondary)]", icon: Users },
    Sent: { bg: "bg-[var(--secondary-dim)]", text: "text-[var(--secondary)]", icon: Send },
    PartiallyResponded: { bg: "bg-[var(--secondary-dim)]", text: "text-[var(--secondary)]", icon: Clock },
    FullyResponded: { bg: "bg-[var(--secondary-dim)]", text: "text-[var(--secondary)]", icon: CheckCircle2 },
    Closed: { bg: "bg-[var(--accent-glass)]", text: "text-[var(--accent)]", icon: CheckCircle2 },
    Cancelled: { bg: "bg-[var(--accent-glass)]", text: "text-[var(--accent)]", icon: XCircle },
  };

  const c = config[status] || config.Draft;
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}
    >
      <Icon className="h-3 w-3" />
      {status.replace(/([A-Z])/g, " $1").trim()}
    </span>
  );
}

export default function PreCanvassListClient({
  preCanvasses,
}: {
  preCanvasses: PreCanvassItem[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const statuses = [
    "All",
    "Draft",
    "SuppliersSelected",
    "Sent",
    "PartiallyResponded",
    "FullyResponded",
    "Closed",
    "Cancelled",
  ];

  const filtered = preCanvasses.filter((pc) => {
    const matchesSearch =
      search === "" ||
      pc.preCanvassNumber.toLowerCase().includes(search.toLowerCase()) ||
      pc.purchaseRequest.prNumber.toLowerCase().includes(search.toLowerCase()) ||
      pc.purchaseRequest.department.toLowerCase().includes(search.toLowerCase()) ||
      pc.purchaseRequest.purpose.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || pc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Pre-Canvassing
          </h1>
          <p className="mt-1 text-sm text-base-content/60">
            Manage pre-canvassing activities for approved Purchase Requests
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Search by PC number, PR number, department..."
            className="input input-bordered w-full pl-10 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select select-bordered text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All Statuses" : s.replace(/([A-Z])/g, " $1").trim()}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: preCanvasses.length, color: "text-base-content" },
          { label: "Draft", value: preCanvasses.filter((p) => p.status === "Draft").length, color: "text-gray-600" },
          { label: "Sent", value: preCanvasses.filter((p) => p.status === "Sent" || p.status === "PartiallyResponded" || p.status === "FullyResponded").length, color: "text-[var(--secondary)]" },
          { label: "Completed", value: preCanvasses.filter((p) => p.status === "Closed").length, color: "text-[var(--secondary)]" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-base-300 bg-base-100 p-4"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-base-content/50">
              {stat.label}
            </div>
            <div className={`mt-1 text-2xl font-black ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-base-300 bg-base-200/50">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-base-content/60">
                Pre-Canvass
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-base-content/60">
                Purchase Request
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-base-content/60">
                Department
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-base-content/60">
                Suppliers
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-base-content/60">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-base-content/60">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-base-content/60">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-300">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <ClipboardList className="mx-auto h-12 w-12 opacity-20" />
                  <p className="mt-2 text-sm font-medium text-base-content/50">
                    No pre-canvass records found
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((pc) => (
                <tr
                  key={pc.id}
                  className="hover:bg-base-200/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-primary text-xs">
                      {pc.preCanvassNumber}
                    </div>
                    <div className="text-[10px] text-base-content/50 mt-0.5">
                      by {pc.createdBy}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-xs">
                      {pc.purchaseRequest.prNumber}
                    </div>
                    <div className="text-[10px] text-base-content/50 mt-0.5 line-clamp-1">
                      {pc.purchaseRequest.purpose}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs">{pc.purchaseRequest.department}</div>
                    <div className="text-[10px] text-base-content/50">
                      {pc.purchaseRequest.office}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-xs font-bold">
                      {pc.respondedCount}/{pc.supplierCount}
                    </div>
                    <div className="text-[10px] text-base-content/50">
                      responded
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={pc.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs tabular-nums">
                      {formatDate(pc.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/officer/pre-canvass/${pc.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
