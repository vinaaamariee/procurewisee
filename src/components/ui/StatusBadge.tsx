import React from "react";

// Standard status mappings matching Flat Enterprise specifications:
// - Draft: Gray
// - Pending: Amber
// - Returned: Red
// - Approved/Completed: Green
// - RFQ: Blue
// - Cancelled: Slate
const statusStyleMap: Record<string, string> = {
  // RFQ states
  Draft: "bg-base-200 border-base-300 text-base-content/80",
  Published: "bg-info/10 border-info/30 text-info-content",
  Closed: "bg-base-300 border-base-400 text-base-content/60",
  Evaluated: "bg-warning/10 border-warning/30 text-warning-content",
  Awarded: "bg-success/10 border-success/30 text-success-content",

  // PR Lifecycles
  Submitted: "bg-warning/10 border-warning/30 text-warning-content",
  UnderReview: "bg-warning/10 border-warning/30 text-warning-content",
  Approved: "bg-success/10 border-success/30 text-success-content",
  Verified: "bg-success/10 border-success/30 text-success-content",
  Returned: "bg-error/10 border-error/30 text-error-content",
  ReturnedForRevision: "bg-error/10 border-error/30 text-error-content",
  "Converted to RFQ": "bg-info/10 border-info/30 text-info-content",
  "Pending Procurement Review": "bg-warning/10 border-warning/30 text-warning-content",
  "Pending Procurement Verification": "bg-warning/10 border-warning/30 text-warning-content",

  // PO Lifecycles
  PendingApproval: "bg-warning/10 border-warning/30 text-warning-content",
  "Pending Approval": "bg-warning/10 border-warning/30 text-warning-content",
  SentToSupplier: "bg-info/10 border-info/30 text-info-content",
  "Sent to Supplier": "bg-info/10 border-info/30 text-info-content",
  PartiallyDelivered: "bg-warning/10 border-warning/30 text-warning-content",
  Delivered: "bg-success/10 border-success/30 text-success-content",
  Completed: "bg-success/10 border-success/30 text-success-content",
  Cancelled: "bg-base-300 border-base-400 text-base-content/60",
};

export default function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.trim();
  const matchedStyle =
    statusStyleMap[normalizedStatus] ??
    statusStyleMap[normalizedStatus.replace(/\s+/g, "")] ??
    "bg-base-200 border-base-300 text-base-content/80";

  return (
    <span
      className={`inline-flex items-center rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border shadow-none transition-colors duration-100 ${matchedStyle}`}
    >
      {normalizedStatus}
    </span>
  );
}