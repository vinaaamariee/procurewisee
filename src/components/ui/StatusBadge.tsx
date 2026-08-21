import React from "react";
import { statusTone } from "@/lib/status-tone";

/**
 * Standard status badge. All colors derive from the centralized
 * Maroon/Gold/Neutral status system in @/lib/status-tone:
 *
 *   Draft / Cancelled / Closed      -> neutral gray
 *   Submitted / Pending / Review    -> gold fill
 *   RFQ / In-Procurement milestones -> gold outline
 *   Approved / Verified             -> maroon outline
 *   Returned (for revision)         -> light maroon tint
 *   Completed / Received            -> dark maroon fill
 *   Rejected                        -> deep maroon fill
 */
export default function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.trim();
  const { className } = statusTone(normalizedStatus);

  return (
    <span
      className={`inline-flex items-center rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border shadow-none transition-colors duration-100 ${className}`}
    >
      {normalizedStatus}
    </span>
  );
}
