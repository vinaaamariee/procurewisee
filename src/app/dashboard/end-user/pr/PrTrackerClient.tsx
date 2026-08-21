"use client";

import React, { useState } from "react";
import { submitPrAction, resubmitPrAction, deletePrDraftAction } from "@/app/actions/pr";
import EmptyState from "@/components/ui/EmptyState";
import PrWorkflowTimeline, { TimelineEntry } from "@/components/pr/PrWorkflowTimeline";
import PrWorkflowTimelineStepper from "@/components/pr/PrWorkflowTimelineStepper";
import PRPrintDocument, { PRPrintData } from "@/components/pr/PRPrintDocument";
import { AlertTriangle, Lock, FileEdit, CheckCircle2, Send, Trash2, ArrowRight } from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  unitOfMeasure: string;
}

interface PurchaseRequestItem {
  id: number;
  description: string;
  brand: string | null;
  quantity: number;
  unit: string;
  estimatedUnitCost: number | string;
  estimatedCost: number | string;
  specification: string | null;
  product?: Product | null;
}

interface Ppmp {
  id: number;
  ppmpNumber: string;
  projectTitle: string;
}

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
}

interface StatusHistory {
  id: number;
  status: string;
  remarks: string | null;
  createdAt: string;
  changedBy: {
    fullName: string;
  } | null;
}

interface PurchaseRequest {
  id: number;
  prNumber: string;
  trackingNumber: string | null;
  requestDate: Date | string;
  submittedAt?: Date | string | null;
  approvedAt?: Date | string | null;
  department: string;
  office: string;
  purpose: string;
  fundingSource: string;
  ppmpId: number | null;
  ppmp: Ppmp | null;
  estimatedBudget: any;
  totalCost: any;
  remarks: string | null;
  status: string;
  assignedOfficer: UserProfile | null;
  requestedBy: UserProfile | null;
  items: PurchaseRequestItem[];
  statusHistory: StatusHistory[];
}

interface PrTrackerClientProps {
  initialPrs: PurchaseRequest[];
}

export default function PrTrackerClient({ initialPrs }: PrTrackerClientProps) {
  const [prs, setPrs] = useState<PurchaseRequest[]>(initialPrs);
  const [selectedPrId, setSelectedPrId] = useState<number | null>(
    initialPrs.length > 0 ? initialPrs[0].id : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit / Revision Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editableItems, setEditableItems] = useState<any[]>([]);

  const selectedPr = prs.find((pr) => pr.id === selectedPrId);

  const handleSubmit = async (id: number) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await submitPrAction(id);
      if (res.success && res.pr) {
        setPrs((prev) =>
          prev.map((pr) =>
            pr.id === id ? { ...pr, status: res.pr.status, submittedAt: res.pr.submittedAt } : pr
          )
        );
        setSuccessMessage("Purchase Request submitted successfully for Procurement Office review!");
      } else {
        setErrorMessage(res.error || "Failed to submit Purchase Request.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = () => {
    if (!selectedPr) return;
    setEditableItems(
      selectedPr.items.map((item) => ({
        id: item.id,
        description: item.description,
        brand: item.brand || "",
        quantity: item.quantity,
        unit: item.unit,
        estimatedUnitCost: Number(item.estimatedUnitCost),
        specification: item.specification || "",
      }))
    );
    setIsEditing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableItems([]);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setEditableItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleResubmit = async () => {
    if (!selectedPr) return;

    // Client validation
    const invalidItem = editableItems.some(
      (item) => !item.description.trim() || item.quantity <= 0 || item.estimatedUnitCost <= 0 || !item.unit.trim()
    );

    if (invalidItem) {
      setErrorMessage("Please ensure all line items have description, unit, quantity > 0, and unit cost > 0.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await resubmitPrAction(selectedPr.id, editableItems);
      if (res.success && res.pr) {
        setPrs((prev) =>
          prev.map((p) =>
            p.id === selectedPr.id
              ? {
                  ...p,
                  status: res.pr.status,
                  submittedAt: res.pr.submittedAt,
                  totalCost: res.pr.totalCost,
                  estimatedBudget: res.pr.estimatedBudget,
                  items: res.pr.items.map((it: any) => ({
                    ...it,
                    estimatedUnitCost: Number(it.estimatedUnitCost),
                    estimatedCost: Number(it.estimatedCost),
                    unit: it.unit?.abbreviation || it.unitText || "pcs",
                  })),
                }
              : p
          )
        );
        setIsEditing(false);
        setSuccessMessage("Purchase Request resubmitted successfully for Procurement Office review!");
      } else {
        setErrorMessage(res.error || "Failed to resubmit Purchase Request.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return { label: "Draft", cls: "bg-gray-100 text-gray-700 border-gray-300" };
      case "PendingProcurementReview":
      case "Pending Procurement Review":
      case "Submitted":
      case "UnderReview":
      case "Under Review":
        return { label: "Pending Procurement Verification", cls: "bg-[var(--secondary-dim)] text-[var(--secondary)] dark:bg-[var(--secondary-dim)] dark:text-[var(--secondary)] border-[var(--border-accent)]" };
      case "Returned":
      case "ReturnedForRevision":
      case "Returned for Revision":
        return { label: "Returned", cls: "bg-[var(--accent-glass)] text-[var(--accent)] dark:bg-[var(--accent-glass)] dark:text-[var(--accent)] border-[var(--border-accent)]" };
      case "Approved":
        return { label: "Verified", cls: "bg-[var(--accent-glass)] text-[var(--accent)] dark:bg-[var(--accent-glass)] dark:text-[var(--secondary)] border-[var(--border-accent)]" };
      default:
        return { label: status, cls: "bg-gray-100 text-gray-700 border-gray-300" };
    }
  };

  const isReturned = selectedPr && (selectedPr.status === "Returned" || selectedPr.status === "ReturnedForRevision" || selectedPr.status === "Returned for Revision");
  const isApproved = selectedPr && selectedPr.status === "Approved";

  // Reuse the selected PR data already loaded by the page — no refetch for printing.
  const printData: PRPrintData | null = selectedPr
    ? {
        id: selectedPr.id,
        prNumber: selectedPr.prNumber,
        requestDate: new Date(selectedPr.requestDate).toISOString(),
        department: selectedPr.department,
        office: selectedPr.office,
        purpose: selectedPr.purpose,
        fundingSource: selectedPr.fundingSource,
        totalCost: Number(selectedPr.totalCost),
        requesterName: selectedPr.requestedBy?.fullName || "BSC Requisitioner",
        officerName: selectedPr.assignedOfficer?.fullName || "Procurement Staff",
        items: selectedPr.items.map((item) => ({
          id: item.id,
          description: item.description,
          specification: item.specification,
          quantity: item.quantity,
          unit: item.unit || "pcs",
          estimatedUnitCost: Number(item.estimatedUnitCost),
          estimatedCost: Number(item.estimatedCost),
        })),
      }
    : null;

  // Build timeline entries
  const timelineEntries: TimelineEntry[] = selectedPr ? [
    {
      status: "Draft",
      actionTitle: "Purchase Request Created",
      actorName: selectedPr.requestedBy?.fullName || "Requisitioner",
      actorRole: "End User",
      timestamp: selectedPr.requestDate ? String(selectedPr.requestDate) : new Date().toISOString(),
    },
    ...(selectedPr.submittedAt ? [{
      status: "PendingProcurementReview",
      actionTitle: "Submitted for Procurement Review",
      actorName: selectedPr.requestedBy?.fullName || "Requisitioner",
      actorRole: "End User",
      timestamp: String(selectedPr.submittedAt),
    }] : []),
    ...(selectedPr.statusHistory || []).filter(h => h.status !== "Draft" && h.status !== "Submitted").map(h => ({
      status: h.status,
      actionTitle: h.status === "Approved" ? "Approved by Procurement Office" : h.status === "Returned" || h.status === "ReturnedForRevision" ? "Returned for Revision" : h.status,
      actorName: h.changedBy?.fullName || "Procurement Staff",
      actorRole: "Procurement Staff",
      timestamp: h.createdAt,
      remarks: h.remarks,
    }))
  ] : [];

  return (
    <div className="pr-print-root">
    <div className="no-print">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-[var(--text-primary)]">
      {/* Sidebar PR List */}
      <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
        <h2 className="text-base font-bold text-[var(--text-primary)]">My Purchase Requests</h2>
        {prs.length === 0 ? (
          <EmptyState
            preset="purchase-requests"
            title="No Purchase Requests Yet"
            description="Start by creating your official Appendix 60 Purchase Request."
            action={{ label: "+ New Request", href: "/dashboard/end-user/pr/new" }}
            compact
          />
        ) : (
          <div className="space-y-3">
            {prs.map((pr) => {
              const active = pr.id === selectedPrId;
              const badge = getStatusBadge(pr.status);

              return (
                <button
                  key={pr.id}
                  disabled={isEditing}
                  onClick={() => {
                    setSelectedPrId(pr.id);
                    setIsEditing(false);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all space-y-2 ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-glass)] shadow-xs"
                      : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]"
                  } ${isEditing && !active ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[var(--accent)] text-sm">{pr.prNumber}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] line-clamp-1">
                    {pr.purpose}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1">
                    <span>{new Date(pr.requestDate).toLocaleDateString()}</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      ₱{Number(pr.totalCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main PR Detail & Editing Area */}
      <div className="lg:col-span-2 space-y-6">
        {selectedPr ? (
          <>
            {/* Returned Banner Alert */}
            {isReturned && (
              <div className="rounded-2xl border border-[var(--border-accent)] bg-[var(--accent-glass)] p-5 dark:border-[var(--border-accent)] dark:bg-[var(--accent-glass)] text-[var(--accent)] dark:text-[var(--secondary)] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--accent)] dark:text-[var(--accent)] font-bold text-base">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span>Purchase Request Returned</span>
                  </div>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="btn btn-error btn-sm rounded-xl text-white font-bold px-4"
                    >
                      <FileEdit className="h-4 w-4 mr-1" />
                      Edit Purchase Request
                    </button>
                  )}
                </div>
                <div className="text-xs space-y-1">
                  <span className="font-bold block">Officer Reason for Return:</span>
                  <p className="italic leading-relaxed bg-white/80 dark:bg-black/30 p-3 rounded-xl border border-[var(--border-accent)] dark:border-[var(--border-accent)]">
                    "{selectedPr.remarks || selectedPr.statusHistory?.[0]?.remarks || "No remarks provided."}"
                  </p>
                </div>
              </div>
            )}

            {/* Approved Safeguard Banner */}
            {isApproved && (
              <div className="rounded-2xl border border-slate-300 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 flex items-start gap-3 text-xs">
                <Lock className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  This Purchase Request has already been approved. Further modifications are no longer permitted. If changes are required, contact the Procurement Office.
                </span>
              </div>
            )}

            {/* PR Header Card */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-extrabold text-[var(--accent)]">{selectedPr.prNumber}</h2>
                    <span className={`px-3 py-0.5 text-xs font-bold rounded-full border ${getStatusBadge(selectedPr.status).cls}`}>
                      {getStatusBadge(selectedPr.status).label}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                    Requested on {new Date(selectedPr.requestDate).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {selectedPr.status === "Draft" && !isEditing && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSubmit(selectedPr.id)}
                        disabled={isSubmitting}
                        className="btn btn-success btn-sm rounded-xl text-white font-bold px-4"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Submit Request
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm("Are you sure you want to delete this draft?")) return;
                          setIsSubmitting(true);
                          const res = await deletePrDraftAction(selectedPr.id);
                          if (res.success) {
                            const remaining = prs.filter((p) => p.id !== selectedPr.id);
                            setPrs(remaining);
                            setSelectedPrId(remaining.length > 0 ? remaining[0].id : null);
                          }
                          setIsSubmitting(false);
                        }}
                        disabled={isSubmitting}
                        className="btn btn-ghost btn-sm rounded-xl text-[var(--accent)]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {!isEditing && selectedPr && (
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="btn btn-ghost btn-sm rounded-xl text-xs font-bold border border-[var(--border)]"
                    >
                      Print PR
                    </button>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-xl bg-[var(--accent-glass)] p-3 text-xs font-semibold text-[var(--accent)] dark:bg-[var(--accent-glass)] dark:text-[var(--accent)]">
                  ⚠️ {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl bg-[var(--accent-glass)] p-3 text-xs font-semibold text-[var(--accent)] dark:bg-[var(--accent-glass)] dark:text-[var(--secondary)]">
                  ✅ {successMessage}
                </div>
              )}

              {/* Department & Purpose metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block font-bold uppercase tracking-wider text-[var(--text-muted)] text-[10px]">Department / Office</span>
                  <span className="font-bold text-[var(--text-primary)] text-sm">{selectedPr.department} ({selectedPr.office})</span>
                </div>
                <div>
                  <span className="block font-bold uppercase tracking-wider text-[var(--text-muted)] text-[10px]">Funding Source</span>
                  <span className="font-bold text-[var(--text-primary)] text-sm">{selectedPr.fundingSource}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block font-bold uppercase tracking-wider text-[var(--text-muted)] text-[10px]">Purpose / Justification</span>
                  <span className="font-medium text-[var(--text-primary)] leading-relaxed">{selectedPr.purpose}</span>
                </div>
              </div>
              <PrWorkflowTimelineStepper currentStatus={selectedPr.status} />
            </div>

            {/* Editing Form for Returned PR */}
            {isEditing ? (
              <div className="rounded-2xl border border-[var(--accent)] bg-[var(--surface)] p-6 shadow-md space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <h3 className="text-base font-bold text-[var(--accent)] flex items-center gap-2">
                    <FileEdit className="h-5 w-5" />
                    <span>Revise Line Items</span>
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn btn-ghost btn-sm rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleResubmit}
                      disabled={isSubmitting}
                      className="btn btn-success btn-sm rounded-xl text-white font-bold px-4"
                    >
                      {isSubmitting ? "Resubmitting..." : "Resubmit Purchase Request"}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {editableItems.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)]/40 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Item Description *</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Brand</label>
                          <input
                            type="text"
                            value={item.brand}
                            onChange={(e) => handleItemChange(idx, "brand", e.target.value)}
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Unit of Measure *</label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Quantity *</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, "quantity", parseInt(e.target.value) || 0)}
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Est. Unit Cost (₱) *</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.estimatedUnitCost}
                            onChange={(e) => handleItemChange(idx, "estimatedUnitCost", parseFloat(e.target.value) || 0)}
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Display Line Items Table */
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Itemized Requisition Items</h3>
                  <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-[var(--accent-glass)] text-[var(--accent)] border border-[var(--border-accent)]">
                    Total: ₱{Number(selectedPr.totalCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-[10px] font-bold">
                        <th className="py-2.5 px-3">Item Details</th>
                        <th className="py-2.5 px-3 text-center">Brand</th>
                        <th className="py-2.5 px-3 text-center">Qty / Unit</th>
                        <th className="py-2.5 px-3 text-right">Est. Unit Cost</th>
                        <th className="py-2.5 px-3 text-right">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {selectedPr.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 px-3">
                            <div className="font-bold text-[var(--text-primary)]">{item.description}</div>
                            {item.specification && (
                              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{item.specification}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center text-[var(--text-muted)] font-medium">
                            {item.brand || "—"}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-[var(--text-primary)]">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-3 px-3 text-right text-[var(--text-muted)] font-medium">
                            ₱{Number(item.estimatedUnitCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-[var(--text-primary)]">
                            ₱{Number(item.estimatedCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Workflow Timeline */}
            <PrWorkflowTimeline
              entries={timelineEntries}
              currentStatus={selectedPr.status}
              submittedAt={selectedPr.submittedAt ? String(selectedPr.submittedAt) : undefined}
              approvedAt={selectedPr.approvedAt ? String(selectedPr.approvedAt) : undefined}
            />
          </>
        ) : (
          <EmptyState
            preset="purchase-requests"
            title="Select a Purchase Request"
            description="Select a Purchase Request from the list to view details and review status."
          />
        )}
      </div>
    </div>
    </div>

    {/* Hidden official Appendix 60 document — printed via window.print() without leaving the page */}
    {printData && (
      <div id="prPrintArea-container" className="hidden print:block">
        <PRPrintDocument pr={printData} />
      </div>
    )}
    </div>
  );
}
