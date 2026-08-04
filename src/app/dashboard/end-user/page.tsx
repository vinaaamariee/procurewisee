import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { AlertTriangle, CheckCircle2, FileText, PlusCircle, CornerUpLeft } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

export const metadata = { title: "End User Dashboard — ProcureWise" };

function getStageLabel(status: string) {
  switch (status) {
    case "Draft":
      return "Draft";
    case "Submitted":
      return "Submitted";
    case "PendingProcurementReview":
    case "Pending Procurement Review":
    case "UnderReview":
    case "Under Review":
      return "Pending Verification";
    case "Returned":
    case "ReturnedForRevision":
    case "Returned for Revision":
      return "Returned";
    case "Approved":
      return "Verified";
    case "ConvertedToRfq":
    case "Converted to RFQ":
      return "Converted to RFQ";
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
    case "Submitted":
      return 2;
    case "PendingProcurementReview":
    case "Pending Procurement Review":
    case "UnderReview":
    case "Under Review":
      return 3;
    case "Returned":
    case "ReturnedForRevision":
    case "Returned for Revision":
      return 1;
    case "Approved":
      return 4;
    case "ConvertedToRfq":
    case "Converted to RFQ":
      return 7;
    default:
      return 1;
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 text-base-content">
      {/* Header */}
      <div className="border-b border-base-300 pb-5 space-y-2">
        <h1 className="text-xl font-bold tracking-tight text-primary font-display uppercase">
          Welcome back, {profile.fullName}!
        </h1>
        <p className="text-xs text-base-content/60">
          Requisitioner Portal &bull; Purchase Request Dashboard &amp; Workflow Tracker
        </p>
        
        {/* Live Summary Bullets */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-semibold text-base-content/75">
          <span>&bull; <strong className="text-base-content">{draftCount}</strong> Draft Purchase Requests</span>
          <span>&bull; <strong className="text-warning">{pendingCount}</strong> Pending Procurement Verification</span>
          <span>&bull; <strong className="text-error">{returnedCount}</strong> Returned</span>
          <span>&bull; <strong className="text-success">{approvedCount}</strong> Verified</span>
        </div>
      </div>

      {/* Prominent Banners Section */}
      <div className="space-y-4">
        {/* Returned PR Warning Banner (Action Required) */}
        {returnedPr && (
          <div className="rounded-md border border-error/40 bg-error/5 p-5 text-base-content space-y-3 shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-error shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-error">Action Required</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-error/20 text-error">
                      {returnedPr.prNumber}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-base-content/80">
                    Your Purchase Request has been returned by Procurement Officer II.
                  </p>
                </div>
              </div>

              <Link
                href={`/dashboard/end-user/pr?id=${returnedPr.id}`}
                className="btn btn-error btn-sm rounded-md text-white font-bold px-4 shrink-0"
              >
                <CornerUpLeft className="h-4 w-4 mr-1" />
                Edit &amp; Resubmit
              </Link>
            </div>

            <div className="text-xs grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-base-300/40">
              <div>
                <span className="font-bold text-[10px] uppercase text-base-content/60 block">Date Returned</span>
                <span className="font-semibold">{new Date(returnedPr.updatedAt).toLocaleDateString("en-PH", { dateStyle: "medium" })}</span>
              </div>
              <div>
                <span className="font-bold text-[10px] uppercase text-base-content/60 block">Returned By</span>
                <span className="font-semibold">Procurement Officer II</span>
              </div>
              <div className="sm:col-span-3 pt-1">
                <span className="font-bold text-[10px] uppercase text-base-content/60 block">Reason</span>
                <p className="italic font-medium leading-relaxed bg-base-200/50 p-2.5 rounded-md border border-base-300 mt-0.5">
                  &quot;{returnedPr.remarks || "Please review and revise line item details."}&quot;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Approved PR Banner */}
        {approvedPr && (
          <div className="rounded-md border border-success/40 bg-success/5 p-4 text-base-content flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-none">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-success">Purchase Request Verified</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-success/20 text-success">
                    {approvedPr.prNumber}
                  </span>
                </div>
                <p className="text-xs text-base-content/85 font-medium">
                  Your Purchase Request has successfully passed Procurement Verification and is now ready for recording to the Procurement Monitoring Register.
                </p>
              </div>
            </div>

            <span className="badge badge-success text-xs font-bold text-white px-3 py-2 shrink-0 rounded">
              Verified
            </span>
          </div>
        )}
      </div>

      {/* Purchase Request Stage Summary Bar */}
      <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-base-content/50">Purchase Requests Overview</h2>
        <div className={`grid grid-cols-2 ${rfqCount > 0 ? "sm:grid-cols-5" : "sm:grid-cols-4"} gap-3`}>
          <div className="p-3 rounded-md bg-base-200 border border-base-300 text-center space-y-1">
            <span className="text-2xl font-bold text-base-content tracking-tight block">{draftCount}</span>
            <span className="block text-[10px] font-bold text-base-content/60 uppercase">Draft</span>
          </div>
          <div className="p-3 rounded-md bg-warning/5 border border-warning/30 text-center space-y-1">
            <span className="text-2xl font-bold text-warning tracking-tight block">{pendingCount}</span>
            <span className="block text-[10px] font-bold text-warning/80 uppercase">Pending</span>
          </div>
          <div className="p-3 rounded-md bg-error/5 border border-error/30 text-center space-y-1">
            <span className="text-2xl font-bold text-error tracking-tight block">{returnedCount}</span>
            <span className="block text-[10px] font-bold text-error/80 uppercase">Returned</span>
          </div>
          <div className="p-3 rounded-md bg-success/5 border border-success/30 text-center space-y-1">
            <span className="text-2xl font-bold text-success tracking-tight block">{approvedCount}</span>
            <span className="block text-[10px] font-bold text-success/80 uppercase">Verified</span>
          </div>
          {rfqCount > 0 && (
            <div className="p-3 rounded-md bg-info/5 border border-info/30 text-center space-y-1">
              <span className="text-2xl font-bold text-info tracking-tight block">{rfqCount}</span>
              <span className="block text-[10px] font-bold text-info/80 uppercase">RFQ</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* My Purchase Requests Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-md border border-base-300 bg-base-100 shadow-none overflow-hidden">
            <div className="p-4 border-b border-base-300 flex items-center justify-between">
              <div className="text-left">
                <h2 className="text-sm font-bold text-base-content">My Purchase Requests</h2>
                <p className="text-xs text-base-content/50">Track status and lifecycle stage across all your institutional requisitions.</p>
              </div>
              <Link href="/dashboard/end-user/pr" className="text-xs font-bold text-primary hover:underline">
                View All &rarr;
              </Link>
            </div>

            {prs.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded bg-base-200 border border-base-300 flex items-center justify-center mx-auto text-base-content/50">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="text-sm font-bold text-base-content">No Purchase Requests Found</h3>
                  <p className="text-xs text-base-content/60 leading-relaxed">
                    You have not submitted any Purchase Requests. Create your first Purchase Request to begin the institutional procurement process.
                  </p>
                </div>
                <Link
                  href="/dashboard/end-user/pr/new"
                  className="btn btn-primary btn-sm rounded-md text-white font-bold px-5"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Create Purchase Request
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse min-w-[640px]">
                  <thead>
                    <tr className="border-b border-base-300 bg-base-200 text-base-content/85 uppercase text-[10px] font-bold">
                      <th className="py-2.5 px-4">PR Number</th>
                      <th className="py-2.5 px-4">Purpose</th>
                      <th className="py-2.5 px-4">Date Submitted</th>
                      <th className="py-2.5 px-4">Stage</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 px-4">Last Updated</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-200">
                    {prs.map((pr) => {
                      const stageLabel = getStageLabel(pr.status);
                      const step = getProgressStep(pr.status);
                      const isReturnedItem = ["Returned", "ReturnedForRevision", "Returned for Revision"].includes(pr.status);
                      const isDraftItem = pr.status === "Draft";

                      return (
                        <tr key={pr.id} className="hover:bg-base-200/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-primary">
                            <Link href={`/dashboard/end-user/pr?id=${pr.id}`} className="hover:underline">
                              {pr.prNumber}
                            </Link>
                          </td>
                          <td className="py-3 px-4 font-medium text-base-content max-w-[160px] truncate">
                            {pr.purpose}
                          </td>
                          <td className="py-3 px-4 text-base-content/70 font-medium">
                            {pr.submittedAt ? new Date(pr.submittedAt).toLocaleDateString("en-PH", { dateStyle: "short" }) : "—"}
                          </td>
                          <td className="py-3 px-4 space-y-0.5 text-left">
                            <div className="font-bold text-base-content/80">{stageLabel}</div>
                            {/* Visual Progress Steps */}
                            <div className="flex items-center gap-1 text-[9px] text-base-content/40">
                              <span className={step >= 1 ? "text-success font-bold" : ""}>Draft</span>
                              <span>&bull;</span>
                              <span className={step >= 2 ? "text-warning font-bold" : ""}>Review</span>
                              <span>&bull;</span>
                              <span className={step >= 3 ? "text-success font-bold" : ""}>Verified</span>
                              <span>&bull;</span>
                              <span className={step >= 4 ? "text-info font-bold" : ""}>RFQ</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <StatusBadge status={pr.status} />
                          </td>
                          <td className="py-3 px-4 text-base-content/60 font-medium">
                            {new Date(pr.updatedAt).toLocaleDateString("en-PH", { dateStyle: "short" })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isDraftItem ? (
                              <Link
                                href={`/dashboard/end-user/pr?id=${pr.id}`}
                                className="text-xs font-bold text-warning hover:underline"
                              >
                                Continue Editing
                              </Link>
                            ) : isReturnedItem ? (
                              <Link
                                href={`/dashboard/end-user/pr?id=${pr.id}`}
                                className="text-xs font-bold text-error hover:underline"
                              >
                                Edit &amp; Resubmit
                              </Link>
                            ) : (
                              <Link
                                href={`/dashboard/end-user/pr?id=${pr.id}`}
                                className="text-xs font-bold text-primary hover:underline"
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
          <div className="rounded-md border border-base-300 bg-base-100 p-4 shadow-none space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-base-content/50 text-left">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href="/dashboard/end-user/pr/new"
                className="w-full btn btn-primary rounded-md text-white font-bold text-xs flex items-center justify-center gap-2 py-2"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                New Purchase Request
              </Link>

              <Link
                href="/dashboard/end-user/pr"
                className="w-full btn btn-outline rounded-md font-bold text-xs flex items-center justify-center gap-2 py-2 border-base-300 text-base-content hover:bg-base-200"
              >
                <FileText className="h-4.5 w-4.5" />
                My Purchase Requests
              </Link>
            </div>
          </div>

          {/* Procurement Notifications */}
          <div className="rounded-md border border-base-300 bg-base-100 p-4 shadow-none space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-base-content/50 text-left">Procurement Notifications</h2>
            
            <div className="space-y-3">
              {returnedPr ? (
                <div className="p-3 rounded-md border border-error/30 bg-error/5 space-y-2 text-xs text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-error">Action Required</span>
                    <span className="badge badge-error text-[10px] font-bold text-white rounded">{returnedPr.prNumber}</span>
                  </div>
                  <p className="text-[11px] text-base-content/80 line-clamp-2">
                    {returnedPr.remarks || "Purchase Request returned by Procurement Office for revision."}
                  </p>
                  <Link
                    href={`/dashboard/end-user/pr?id=${returnedPr.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-error hover:underline pt-1"
                  >
                    Edit &amp; Resubmit &rarr;
                  </Link>
                </div>
              ) : draftPr ? (
                <div className="p-3 rounded-md border border-warning/30 bg-warning/5 space-y-2 text-xs text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-warning">Draft Requisition</span>
                    <span className="badge badge-warning text-[10px] font-bold text-white rounded">{draftPr.prNumber}</span>
                  </div>
                  <p className="text-[11px] text-base-content/80">
                    Draft PR is awaiting completion and submission.
                  </p>
                  <Link
                    href={`/dashboard/end-user/pr?id=${draftPr.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-warning hover:underline pt-1"
                  >
                    Continue Editing &rarr;
                  </Link>
                </div>
              ) : approvedPr ? (
                <div className="p-3 rounded-md border border-success/30 bg-success/5 space-y-2 text-xs text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-success">Request Approved</span>
                    <span className="badge badge-success text-[10px] font-bold text-white rounded">{approvedPr.prNumber}</span>
                  </div>
                  <p className="text-[11px] text-base-content/80">
                    Ready for Request for Quotation (RFQ).
                  </p>
                  <Link
                    href={`/dashboard/end-user/pr?id=${approvedPr.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-success hover:underline pt-1"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              ) : (
                <div className="p-4 rounded border border-base-200 text-center text-xs text-base-content/50 space-y-1 bg-base-50/50">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-success" />
                  <p className="font-medium">No pending notifications. All requests are up to date.</p>
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
