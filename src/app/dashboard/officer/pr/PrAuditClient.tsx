"use client";

import React, { useState } from "react";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";

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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Search & Filter Bar */}
      <div style={{
        background: theme.glassBg,
        border: `1px solid ${theme.glassBorder}`,
        borderRadius: "1rem",
        padding: "1rem 1.5rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: theme.shadow
      }}>
        <div style={{ display: "flex", gap: "0.75rem", flex: 1, minWidth: "280px" }}>
          <input
            type="text"
            placeholder="Search by PR number, department, or purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: "0.6rem 1rem",
              borderRadius: "0.75rem",
              border: `1px solid ${theme.glassBorder}`,
              background: "rgba(255,255,255,0.05)",
              color: theme.textMain,
              fontSize: "0.875rem",
              outline: "none"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: theme.textMuted, textTransform: "uppercase" }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "0.75rem",
              border: `1px solid ${theme.glassBorder}`,
              background: theme.glassBg,
              color: theme.textMain,
              fontSize: "0.875rem",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="UnderReview">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Received">Received</option>
          </select>
        </div>
      </div>

      {/* PR Cards Grid */}
      {filteredPrs.length === 0 ? (
        <EmptyState
          preset="purchase-requests"
          title="No Purchase Requests Found"
          description="There are no purchase requests matching your current search or filter criteria. Try adjusting your filters or wait for new submissions."
          action={{ label: '← Clear Filters', onClick: () => { setSearch(''); setStatusFilter('All'); } }}
        />
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.5rem"
        }}>
          {filteredPrs.map((pr) => {
            const statusColors = getStatusColor(pr.status);
            return (
              <Link
                href={`/dashboard/officer/pr/${pr.id}`}
                key={pr.id}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  padding: "1.5rem",
                  borderRadius: "1.25rem",
                  background: theme.glassBg,
                  border: `1px solid ${theme.glassBorder}`,
                  boxShadow: theme.shadow,
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  outline: "none",
                  position: "relative"
                }}
                className="hover:-translate-y-1 hover:shadow-lg hover:border-amber-500/40 focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, fontSize: "1.1rem", color: theme.crimson }}>{pr.prNumber}</span>
                  <span style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "999px",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    backgroundColor: statusColors.bg,
                    color: statusColors.text,
                    letterSpacing: "0.5px"
                  }}>
                    {pr.status}
                  </span>
                </div>

                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: theme.textMain }}>
                  {pr.department}
                </div>

                <p style={{
                  fontSize: "0.8rem",
                  color: theme.textMuted,
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: "1.4",
                  minHeight: "2.8rem"
                }}>
                  {pr.purpose}
                </p>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: `1px solid ${theme.glassBorder}`,
                  paddingTop: "0.75rem",
                  marginTop: "0.25rem",
                  fontSize: "0.75rem",
                  color: theme.textMuted
                }}>
                  <span>{new Date(pr.requestDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span style={{ fontWeight: 800, color: theme.textMain, fontSize: "0.9rem" }}>
                    ₱{Number(pr.totalCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
