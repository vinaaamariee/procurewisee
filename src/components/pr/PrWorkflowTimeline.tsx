"use client";

import React from "react";
import { CheckCircle2, Clock, RotateCcw, AlertTriangle, FileEdit } from "lucide-react";

export interface TimelineEntry {
  id?: number | string;
  status: string;
  actionTitle?: string;
  actorName?: string;
  actorRole?: string;
  timestamp: string;
  remarks?: string | null;
}

interface PrWorkflowTimelineProps {
  entries: TimelineEntry[];
  currentStatus: string;
  submittedAt?: string | null;
  approvedAt?: string | null;
  reviewedAt?: string | null;
}

export default function PrWorkflowTimeline({
  entries,
  currentStatus,
  submittedAt,
  approvedAt,
}: PrWorkflowTimelineProps) {

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return { label: "Draft", cls: "bg-[var(--surface-hover)] text-[var(--text-secondary)] border-[var(--border)]", icon: FileEdit };
      case "PendingProcurementReview":
      case "Pending Procurement Review":
      case "UnderReview":
      case "Under Review":
      case "Submitted":
        return { label: "Pending Procurement Verification", cls: "bg-[var(--secondary-dim)] text-[var(--secondary)] border-[var(--border-accent)]", icon: Clock };
      case "Returned":
      case "ReturnedForRevision":
      case "Returned for Revision":
        return { label: "Returned", cls: "bg-[var(--accent-glass)] text-[var(--accent)] border-[var(--border-accent)]", icon: AlertTriangle };
      case "Approved":
        return { label: "Verified", cls: "bg-[var(--accent-glass)] text-[var(--accent)] border-[var(--border-accent)]", icon: CheckCircle2 };
      case "ConvertedToRfq":
      case "Converted to RFQ":
        return { label: "Converted to RFQ", cls: "bg-[var(--secondary-dim)] text-[var(--secondary)] border-[var(--border-accent)]", icon: CheckCircle2 };
      default:
        return { label: status, cls: "bg-[var(--surface-hover)] text-[var(--text-secondary)] border-[var(--border)]", icon: Clock };
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
          Purchase Request Lifecycle & Review History
        </h3>
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadge(currentStatus).cls}`}>
          {getStatusBadge(currentStatus).label}
        </span>
      </div>

      {/* History Feed */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
        {entries.map((entry, idx) => {
          const badge = getStatusBadge(entry.status);
          const Icon = badge.icon;

          return (
            <div key={idx} className="relative flex items-start gap-4">
              {/* Connector Dot */}
              <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-xs">
                <Icon className="h-3 w-3 text-[var(--accent)]" />
              </div>

              <div className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)]/30 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {entry.actionTitle || badge.label}
                  </span>
                  <span className="text-[11px] font-medium text-[var(--text-muted)]">
                    {new Date(entry.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>

                {entry.actorName && (
                  <p className="text-xs text-[var(--text-muted)]">
                    <span className="font-semibold text-[var(--text-primary)]">{entry.actorName}</span>
                    {entry.actorRole && ` (${entry.actorRole === "Administrative Approver" ? "Procurement Officer II" : entry.actorRole === "Procurement Officer" ? "Procurement Staff" : entry.actorRole})`}
                  </p>
                )}

                {/* Preserved Return Comment or Remarks */}
                {entry.remarks && (
                  <div className="mt-2 rounded-lg border border-[var(--border-accent)] bg-[var(--accent-glass)] p-3 dark:border-[var(--border-accent)] dark:bg-[var(--accent-glass)] text-xs text-[var(--accent)] dark:text-[var(--accent)]">
                    <span className="font-bold block mb-0.5">Procurement Staff Reason / Return Remark:</span>
                    <p className="italic leading-relaxed whitespace-pre-wrap">{entry.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
