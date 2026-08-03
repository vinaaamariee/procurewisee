const styles: Record<string, string> = {
  Draft: "bg-slate-50 text-slate-600 border-slate-200/60 dark:bg-slate-900/40 dark:text-slate-350 dark:border-slate-800/60",
  Published: "bg-emerald-50/80 text-emerald-700 border-emerald-250/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
  Closed: "bg-slate-50 text-slate-600 border-slate-200/60 dark:bg-slate-900/40 dark:text-slate-350 dark:border-slate-800/60",
  Evaluated: "bg-amber-50/80 text-amber-700 border-amber-250/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
  Awarded: "bg-blue-50/80 text-blue-700 border-blue-250/50 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
  
  // PR Lifecycles
  Submitted: "bg-blue-50/80 text-blue-700 border-blue-250/50 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
  UnderReview: "bg-indigo-50/80 text-indigo-700 border-indigo-250/50 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50",
  Approved: "bg-emerald-50/80 text-emerald-700 border-emerald-250/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
  Verified: "bg-emerald-50/80 text-emerald-700 border-emerald-250/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
  Returned: "bg-rose-50/80 text-rose-700 border-rose-250/50 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50",
  ReturnedForRevision: "bg-rose-50/80 text-rose-700 border-rose-250/50 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50",
  "Converted to RFQ": "bg-teal-50/80 text-teal-700 border-teal-250/50 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/50",
  "Pending Procurement Review": "bg-amber-50/80 text-amber-700 border-amber-250/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
  "Pending Procurement Verification": "bg-amber-50/80 text-amber-700 border-amber-250/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
  
  // PO Lifecycles
  PendingApproval: "bg-amber-50/80 text-amber-700 border-amber-250/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
  "Pending Approval": "bg-amber-50/80 text-amber-700 border-amber-250/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
  SentToSupplier: "bg-sky-50/80 text-sky-700 border-sky-250/50 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50",
  "Sent to Supplier": "bg-sky-50/80 text-sky-700 border-sky-250/50 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50",
  PartiallyDelivered: "bg-orange-50/80 text-orange-750 border-orange-250/50 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50",
  Delivered: "bg-teal-50/80 text-teal-700 border-teal-250/50 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/50",
  Completed: "bg-emerald-50/80 text-emerald-700 border-emerald-250/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
  Cancelled: "bg-slate-50 text-slate-500 border-slate-200/60 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800/60",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors duration-150 ${
        styles[status] ?? styles[status.replace(/\s+/g, "")] ?? "bg-slate-50 text-slate-600 border-slate-200/60 dark:bg-slate-900/40 dark:text-slate-350"
      }`}
    >
      {status}
    </span>
  );
}