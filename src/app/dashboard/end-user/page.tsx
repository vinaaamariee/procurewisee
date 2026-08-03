import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { AlertTriangle, CheckCircle2, FileText, PlusCircle, Calendar, CornerUpLeft } from "lucide-react";

export const metadata = { title: "End User Dashboard — ProcureWise" };

function getStageLabel(status: string) {
  switch (status) {
    case "Draft":
      return "Drafting";
    case "PendingProcurementReview":
    case "Pending Procurement Review":
    case "Submitted":
    case "UnderReview":
    case "Under Review":
      return "Procurement Review";
    case "Returned":
    case "ReturnedForRevision":
    case "Returned for Revision":
      return "For Revision";
    case "Approved":
      return "Ready for RFQ";
    case "ConvertedToRfq":
    case "Converted to RFQ":
      return "RFQ Processing";
    case "Cancelled":
      return "Closed";
    default:
      return status;
  }
}

function getProgressStep(status: string) {
  switch (status) {
    case "Draft":
      return 1;
    case "PendingProcurementReview":
    case "Pending Procurement Review":
    case "Submitted":
    case "UnderReview":
    case "Under Review":
      return 2;
    case "Returned":
    case "ReturnedForRevision":
    case "Returned for Revision":
      return 1;
    case "Approved":
      return 3;
    case "ConvertedToRfq":
    case "Converted to RFQ":
      return 4;
    default:
      return 1;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "Draft":
      return { label: "Draft", cls: "badge-neutral" };
    case "PendingProcurementReview":
    case "Pending Procurement Review":
    case "Submitted":
    case "UnderReview":
    case "Under Review":
      return { label: "Pending Procurement Review", cls: "badge-warning" };
    case "Returned":
    case "ReturnedForRevision":
    case "Returned for Revision":
      return { label: "Returned", cls: "badge-error" };
    case "Approved":
      return { label: "Approved", cls: "badge-success" };
    case "ConvertedToRfq":
    case "Converted to RFQ":
      return { label: "Converted to RFQ", cls: "badge-info" };
    case "Cancelled":
      return { label: "Cancelled", cls: "badge-neutral" };
    default:
      return { label: status, cls: "badge-neutral" };
  }
}

export default async function EndUserDashboard() {
  const { profile } = await requireRole("End User");

  // Fetch all Purchase Requests for authenticated user
  const prs = await prisma.purchaseRequest.findMany({
    where: { requestedById: profile.id },
    orderBy: { updatedAt: "desc" },
    include: {
      assignedOfficer: {
        select: { fullName: true }
      }
    }
  });

  // Calculate lifecycle counts
  const draftCount = prs.filter((p) => p.status === "Draft").length;
  const pendingCount = prs.filter((p) =>
    ["PendingProcurementReview", "Pending Procurement Review", "Submitted", "UnderReview"].includes(p.status)
  ).length;
  const returnedCount = prs.filter((p) =>
    ["Returned", "ReturnedForRevision", "Returned for Revision"].includes(p.status)
  ).length;
  const approvedCount = prs.filter((p) => p.status === "Approved").length;
  const rfqCount = prs.filter((p) =>
    ["ConvertedToRfq", "Converted to RFQ"].includes(p.status)
  ).length;

  // Active returned & approved PRs for alerts/banners
  const returnedPr = prs.find((p) =>
    ["Returned", "ReturnedForRevision", "Returned for Revision"].includes(p.status)
  );
  const approvedPr = prs.find((p) => p.status === "Approved");
  const draftPr = prs.find((p) => p.status === "Draft");

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 text-[var(--text-primary)]">
      {/* Header */}
      <div className="border-b border-[var(--border)] pb-5 space-y-2">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
          Welcome back, {profile.fullName}!
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Requisitioner Portal &bull; Purchase Request Dashboard &amp; Workflow Tracker
        </p>
        
        {/* Live Summary Bullets */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-semibold text-[var(--text-secondary)]">
          <span>&bull; <strong className="text-[var(--text-primary)]">{draftCount}</strong> Draft Purchase Requests</span>
          <span>&bull; <strong className="text-amber-600 dark:text-amber-400">{pendingCount}</strong> Pending Procurement Review</span>
          <span>&bull; <strong className="text-red-600 dark:text-red-400">{returnedCount}</strong> Returned</span>
          <span>&bull; <strong className="text-emerald-600 dark:text-emerald-400">{approvedCount}</strong> Approved</span>
        </div>
      </div>

      {/* Prominent Banners Section */}
      <div className="space-y-4">
        {/* Returned PR Warning Banner (Action Required) */}
        {returnedPr && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-5 dark:border-red-900/60 dark:bg-red-950/40 text-red-950 dark:text-red-100 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-red-700 dark:text-red-300">Action Required</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200">
                      {returnedPr.prNumber}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-red-900 dark:text-red-200">
                    Your Purchase Request has been returned by the Procurement Office.
                  </p>
                </div>
              </div>

              <Link
                href={`/dashboard/end-user/pr?id=${returnedPr.id}`}
                className="btn btn-error btn-sm rounded-xl text-white font-bold px-4 shrink-0"
              >
                <CornerUpLeft className="h-4 w-4 mr-1" />
                Edit &amp; Resubmit
              </Link>
            </div>

            <div className="text-xs grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-red-200 dark:border-red-900/50">
              <div>
                <span className="font-bold text-[10px] uppercase text-red-700 dark:text-red-400 block">Date Returned</span>
                <span className="font-semibold">{new Date(returnedPr.updatedAt).toLocaleDateString("en-PH", { dateStyle: "medium" })}</span>
              </div>
              <div>
                <span className="font-bold text-[10px] uppercase text-red-700 dark:text-red-400 block">Returned By</span>
                <span className="font-semibold">{returnedPr.assignedOfficer?.fullName || "Procurement Officer"}</span>
              </div>
              <div className="sm:col-span-3 pt-1">
                <span className="font-bold text-[10px] uppercase text-red-700 dark:text-red-400 block">Reason</span>
                <p className="italic font-medium leading-relaxed bg-white/80 dark:bg-black/30 p-2.5 rounded-xl border border-red-200 dark:border-red-900/50 mt-0.5">
                  &quot;{returnedPr.remarks || "Please review and revise line item details."}&quot;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Approved PR Banner */}
        {approvedPr && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Approved Purchase Requests</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    {approvedPr.prNumber}
                  </span>
                </div>
                <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                  Ready for Request for Quotation (RFQ)
                </p>
              </div>
            </div>

            <span className="badge badge-success text-xs font-bold text-white px-3 py-2 shrink-0">
              Approved
            </span>
          </div>
        )}
      </div>

      {/* Purchase Request Stage Summary Bar */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Purchase Requests Overview</h2>
        <div className={`grid grid-cols-2 ${rfqCount > 0 ? "sm:grid-cols-5" : "sm:grid-cols-4"} gap-3`}>
          <div className="p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] text-center space-y-1">
            <span className="text-2xl font-black text-[var(--text-primary)]">{draftCount}</span>
            <span className="block text-[11px] font-bold text-[var(--text-secondary)]">Draft</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-center space-y-1">
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400">{pendingCount}</span>
            <span className="block text-[11px] font-bold text-amber-800 dark:text-amber-300">Pending</span>
          </div>
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-center space-y-1">
            <span className="text-2xl font-black text-red-700 dark:text-red-400">{returnedCount}</span>
            <span className="block text-[11px] font-bold text-red-800 dark:text-red-300">Returned</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-center space-y-1">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{approvedCount}</span>
            <span className="block text-[11px] font-bold text-emerald-800 dark:text-emerald-300">Approved</span>
          </div>
          {rfqCount > 0 && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-center space-y-1">
              <span className="text-2xl font-black text-blue-700 dark:text-blue-400">{rfqCount}</span>
              <span className="block text-[11px] font-bold text-blue-800 dark:text-blue-300">RFQ</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* My Purchase Requests Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">My Purchase Requests</h2>
                <p className="text-xs text-[var(--text-muted)]">Track status and lifecycle stage across all your institutional requisitions.</p>
              </div>
              <Link href="/dashboard/end-user/pr" className="text-xs font-bold text-[var(--accent)] hover:underline">
                View All &rarr;
              </Link>
            </div>

            {prs.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)]">No Purchase Requests Found</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    You have not submitted any Purchase Requests. Create your first Purchase Request to begin the institutional procurement process.
                  </p>
                </div>
                <Link
                  href="/dashboard/end-user/pr/new"
                  className="btn btn-primary btn-sm rounded-xl text-white font-bold px-5"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Create Purchase Request
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-hover)]/50 text-[var(--text-muted)] uppercase text-[10px] font-bold">
                      <th className="py-3 px-4">PR Number</th>
                      <th className="py-3 px-4">Purpose</th>
                      <th className="py-3 px-4">Date Submitted</th>
                      <th className="py-3 px-4">Stage</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Last Updated</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {prs.map((pr) => {
                      const badge = getStatusBadge(pr.status);
                      const stageLabel = getStageLabel(pr.status);
                      const step = getProgressStep(pr.status);
                      const isReturnedItem = ["Returned", "ReturnedForRevision", "Returned for Revision"].includes(pr.status);
                      const isDraftItem = pr.status === "Draft";

                      return (
                        <tr key={pr.id} className="hover:bg-[var(--surface-hover)]/30 transition-colors">
                          <td className="py-3.5 px-4 font-extrabold text-[var(--accent)]">
                            <Link href={`/dashboard/end-user/pr?id=${pr.id}`} className="hover:underline">
                              {pr.prNumber}
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-[var(--text-primary)] max-w-[160px] truncate">
                            {pr.purpose}
                          </td>
                          <td className="py-3.5 px-4 text-[var(--text-muted)] font-medium">
                            {pr.submittedAt ? new Date(pr.submittedAt).toLocaleDateString("en-PH", { dateStyle: "short" }) : "—"}
                          </td>
                          <td className="py-3.5 px-4 space-y-1">
                            <div className="font-bold text-[var(--text-secondary)]">{stageLabel}</div>
                            {/* Visual Progress Steps */}
                            <div className="flex items-center gap-1 text-[9px]">
                              <span className={step >= 1 ? "text-emerald-600 font-bold" : "opacity-30"}>Draft</span>
                              <span className="opacity-30">&bull;</span>
                              <span className={step >= 2 ? "text-amber-600 font-bold" : "opacity-30"}>Review</span>
                              <span className="opacity-30">&bull;</span>
                              <span className={step >= 3 ? "text-emerald-600 font-bold" : "opacity-30"}>Approved</span>
                              <span className="opacity-30">&bull;</span>
                              <span className={step >= 4 ? "text-blue-600 font-bold" : "opacity-30"}>RFQ</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`badge ${badge.cls} text-[10px] font-bold`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[var(--text-muted)] font-medium">
                            {new Date(pr.updatedAt).toLocaleDateString("en-PH", { dateStyle: "short" })}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isDraftItem ? (
                              <Link
                                href={`/dashboard/end-user/pr?id=${pr.id}`}
                                className="text-xs font-bold text-amber-700 hover:underline"
                              >
                                Continue Editing
                              </Link>
                            ) : isReturnedItem ? (
                              <Link
                                href={`/dashboard/end-user/pr?id=${pr.id}`}
                                className="text-xs font-bold text-red-600 hover:underline"
                              >
                                Edit &amp; Resubmit
                              </Link>
                            ) : (
                              <Link
                                href={`/dashboard/end-user/pr?id=${pr.id}`}
                                className="text-xs font-bold text-[var(--accent)] hover:underline"
                              >
                                View Details
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          
          {/* Quick Actions (2 buttons only) */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Quick Actions</h2>
            <div className="space-y-2.5">
              <Link
                href="/dashboard/end-user/pr/new"
                className="w-full btn btn-primary rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 py-2.5"
              >
                <PlusCircle className="h-4 w-4" />
                New Purchase Request
              </Link>

              <Link
                href="/dashboard/end-user/pr"
                className="w-full btn btn-outline rounded-xl font-bold text-xs flex items-center justify-center gap-2 py-2.5 border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              >
                <FileText className="h-4 w-4" />
                My Purchase Requests
              </Link>
            </div>
          </div>

          {/* Procurement Notifications */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Procurement Notifications</h2>
            
            <div className="space-y-3">
              {returnedPr ? (
                <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-red-700 dark:text-red-300">Action Required</span>
                    <span className="badge badge-error text-[10px] font-bold">{returnedPr.prNumber}</span>
                  </div>
                  <p className="text-[11px] text-red-900 dark:text-red-200 line-clamp-2">
                    {returnedPr.remarks || "Purchase Request returned by Procurement Office for revision."}
                  </p>
                  <Link
                    href={`/dashboard/end-user/pr?id=${returnedPr.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 hover:underline pt-1"
                  >
                    Edit &amp; Resubmit &rarr;
                  </Link>
                </div>
              ) : draftPr ? (
                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-700 dark:text-amber-300">Draft Requisition</span>
                    <span className="badge badge-warning text-[10px] font-bold">{draftPr.prNumber}</span>
                  </div>
                  <p className="text-[11px] text-amber-900 dark:text-amber-200">
                    Draft PR is awaiting completion and submission.
                  </p>
                  <Link
                    href={`/dashboard/end-user/pr?id=${draftPr.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:underline pt-1"
                  >
                    Continue Editing &rarr;
                  </Link>
                </div>
              ) : approvedPr ? (
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-300">Request Approved</span>
                    <span className="badge badge-success text-[10px] font-bold text-white">{approvedPr.prNumber}</span>
                  </div>
                  <p className="text-[11px] text-emerald-900 dark:text-emerald-200">
                    Ready for Request for Quotation (RFQ).
                  </p>
                  <Link
                    href={`/dashboard/end-user/pr?id=${approvedPr.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline pt-1"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-[var(--border)] text-center text-xs text-[var(--text-muted)] space-y-1">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-emerald-600" />
                  <p className="font-medium">No pending notifications. All Purchase Requests are up to date.</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <ActivityFeed limit={5} compact />

        </div>

      </div>
    </div>
  );
}
