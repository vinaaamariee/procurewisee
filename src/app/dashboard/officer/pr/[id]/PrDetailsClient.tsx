"use client";

import React, { useState, useEffect } from "react";
import { reviewPrAction, receivePrAction, updatePrItemAction, getPreCanvassingData, convertPrToRfqAction, approvePrByOfficerAction, returnPrByOfficerAction } from "@/app/actions/pr";
import { useRouter } from "next/navigation";
import DocumentLayout from "@/components/documents/DocumentLayout";
import ReviewPrModal from "@/components/pr/ReviewPrModal";
import PrValidationChecklist, { ValidationItem } from "@/components/pr/PrValidationChecklist";
import PrWorkflowTimeline, { TimelineEntry } from "@/components/pr/PrWorkflowTimeline";
import { ShieldCheck, Lock, ArrowLeft, Printer, FileText, CheckCircle2, AlertTriangle } from "lucide-react";

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

interface DepartmentBudget {
  allocatedBudget: number;
  spentBudget: number;
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
  requesterName?: string | null;
  requesterEmail?: string | null;
  items: PurchaseRequestItem[];
  statusHistory?: StatusHistory[];
}

interface PrDetailsClientProps {
  initialPr: PurchaseRequest;
  budgets: Record<string, DepartmentBudget>;
  officerId: string;
}

export default function PrDetailsClient({ initialPr, budgets, officerId }: PrDetailsClientProps) {
  const router = useRouter();
  const [pr, setPr] = useState<PurchaseRequest>(initialPr);
  
  // Validation checklist state
  const [checklist, setChecklist] = useState<ValidationItem[]>([
    {
      id: "ppmp",
      label: "PPMP Attached & Verified",
      description: "Requisition items align with the department's approved Project Procurement Management Plan.",
      checked: !!initialPr.ppmpId || initialPr.status === "Approved",
    },
    {
      id: "fields",
      label: "Required Fields Complete",
      description: "Department, Office, Purpose, and Funding Source are clearly documented.",
      checked: !!(initialPr.department && initialPr.office && initialPr.purpose && initialPr.fundingSource),
    },
    {
      id: "specs",
      label: "Item Specifications Complete",
      description: "Line item descriptions and specifications provide sufficient detail for canvassing.",
      checked: initialPr.items.every((i) => i.description.trim().length > 0),
    },
    {
      id: "budget",
      label: "Department Budget Available",
      description: "Total estimated budget requirement does not exceed remaining department allocation.",
      checked: true,
    },
    {
      id: "quantities",
      label: "Quantities & Unit Costs Verified",
      description: "Quantities, units of measure, and estimated unit costs have been audited.",
      checked: initialPr.items.every((i) => i.quantity > 0 && Number(i.estimatedUnitCost) >= 0),
    },
  ]);

  const isAllChecklistPassed = checklist.every((c) => c.checked);
  const isApproved = pr.status === "Approved";
  const isLocked = isApproved || pr.status === "ConvertedToRfq" || pr.status === "Converted to RFQ";

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "approve" | "return";
  }>({
    isOpen: false,
    mode: "approve",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Pre-Canvassing Form States
  const [preCanvassData, setPreCanvassData] = useState<any | null>(null);
  const [isPreCanvassOpen, setIsPreCanvassOpen] = useState(false);
  const [preCanvassLoading, setPreCanvassLoading] = useState(false);

  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleOpenModal = (mode: "approve" | "return") => {
    if (mode === "approve" && !isAllChecklistPassed) {
      setErrorMsg("All 5 compliance validation checklist items must pass before approving.");
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setModalState({ isOpen: true, mode });
  };

  const handleConfirmReview = async (remarks?: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (modalState.mode === "approve") {
        const res = await approvePrByOfficerAction(pr.id);
        if (res.success && res.pr) {
          setPr((prev) => ({
            ...prev,
            status: "Approved",
            approvedAt: new Date().toISOString(),
          }));
          setSuccessMsg("Purchase Request approved! It is now eligible for RFQ generation.");
          setModalState({ isOpen: false, mode: "approve" });
        } else {
          setErrorMsg(res.error || "Failed to approve Purchase Request.");
        }
      } else {
        const res = await returnPrByOfficerAction(pr.id, remarks || "");
        if (res.success && res.pr) {
          setPr((prev) => ({
            ...prev,
            status: "Returned",
            remarks: remarks || res.pr.remarks,
          }));
          setSuccessMsg("Purchase Request returned to requisitioner with reason comment.");
          setModalState({ isOpen: false, mode: "return" });
        } else {
          setErrorMsg(res.error || "Failed to return Purchase Request.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenPreCanvass = async () => {
    setPreCanvassLoading(true);
    setErrorMsg(null);
    try {
      const res = await getPreCanvassingData(pr.id);
      if (res.success) {
        setPreCanvassData(res);
        setIsPreCanvassOpen(true);
      } else {
        setErrorMsg(res.error || "Failed to load pre-canvassing data.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load pre-canvassing data.");
    } finally {
      setPreCanvassLoading(false);
    }
  };

  // Construct Timeline Entries from Status History & Timestamps
  const timelineEntries: TimelineEntry[] = [];
  
  timelineEntries.push({
    status: "Draft",
    actionTitle: "Purchase Request Created",
    actorName: pr.requestedBy?.fullName || pr.requesterName || "Requisitioner",
    actorRole: "End User",
    timestamp: pr.requestDate ? String(pr.requestDate) : new Date().toISOString(),
  });

  if (pr.submittedAt) {
    timelineEntries.push({
      status: "PendingProcurementReview",
      actionTitle: "Submitted for Procurement Review",
      actorName: pr.requestedBy?.fullName || pr.requesterName || "Requisitioner",
      actorRole: "End User",
      timestamp: String(pr.submittedAt),
    });
  }

  if (pr.statusHistory && pr.statusHistory.length > 0) {
    pr.statusHistory.forEach((h) => {
      if (h.status !== "Draft" && h.status !== "Submitted") {
        timelineEntries.push({
          status: h.status,
          actionTitle:
            h.status === "Approved"
              ? "Approved by Procurement Office"
              : h.status === "Returned" || h.status === "ReturnedForRevision"
              ? "Returned for Revision"
              : h.status,
          actorName: h.changedBy?.fullName || "Procurement Officer",
          actorRole: "Procurement Officer",
          timestamp: h.createdAt,
          remarks: h.remarks,
        });
      }
    });
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return { label: "Draft", cls: "bg-gray-100 text-gray-700 border-gray-300" };
      case "PendingProcurementReview":
      case "Pending Procurement Review":
      case "Submitted":
      case "UnderReview":
      case "Under Review":
        return { label: "Pending Procurement Review", cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300" };
      case "Returned":
      case "ReturnedForRevision":
      case "Returned for Revision":
        return { label: "Returned", cls: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300" };
      case "Approved":
        return { label: "Approved | Eligible for RFQ", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300" };
      default:
        return { label: status, cls: "bg-gray-100 text-gray-700 border-gray-300" };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-[var(--text-primary)]">
      {/* Left Column: PR Information, Checklist & Line Items */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Status & Banner Alerts */}
        {isApproved && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-base">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Approved</span>
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
              This Purchase Request has passed Procurement Office validation and is now eligible for RFQ generation.
            </p>
          </div>
        )}

        {isLocked && (
          <div className="rounded-2xl border border-slate-300 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 flex items-start gap-3 text-xs">
            <Lock className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              This Purchase Request has already been approved. Further modifications are no longer permitted. If changes are required, contact the Procurement Office.
            </span>
          </div>
        )}

        {/* PR Master Details Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-[var(--accent)]">
                  {pr.prNumber}
                </h2>
                <span className={`px-3 py-0.5 text-xs font-bold rounded-full border ${getStatusBadge(pr.status).cls}`}>
                  {getStatusBadge(pr.status).label}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                Requisitioned by: <span className="font-bold text-[var(--text-primary)]">{pr.requestedBy?.fullName || pr.requesterName || "BSC Requisitioner"}</span> ({pr.requestedBy?.email || pr.requesterEmail || "department@bsc.edu.ph"})
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-ghost btn-sm rounded-xl text-xs font-bold border border-[var(--border)] text-[var(--text-primary)]"
              >
                <Printer className="h-4 w-4 mr-1" />
                Print PR
              </button>
              <button
                type="button"
                onClick={handleOpenPreCanvass}
                disabled={preCanvassLoading}
                className="btn btn-outline btn-sm rounded-xl text-xs font-bold border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
              >
                <FileText className="h-4 w-4 mr-1" />
                {preCanvassLoading ? "Analyzing..." : "Pre-Canvassing"}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              ✅ {successMsg}
            </div>
          )}

          {/* Department, Office, Purpose metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="block font-bold uppercase tracking-wider text-[var(--text-muted)] text-[10px]">Department / Office</span>
              <span className="font-bold text-[var(--text-primary)] text-sm">{pr.department} ({pr.office})</span>
            </div>
            <div>
              <span className="block font-bold uppercase tracking-wider text-[var(--text-muted)] text-[10px]">Funding Source</span>
              <span className="font-bold text-[var(--text-primary)] text-sm">{pr.fundingSource}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="block font-bold uppercase tracking-wider text-[var(--text-muted)] text-[10px]">Purpose / Justification</span>
              <span className="font-medium text-[var(--text-primary)] leading-relaxed">{pr.purpose}</span>
            </div>
          </div>
        </div>

        {/* 5-Point Validation Checklist */}
        <PrValidationChecklist
          items={checklist}
          onToggle={handleToggleChecklist}
          isLocked={isLocked}
        />

        {/* Line Items Table */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Appendix 60 Requisition Items</span>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Itemized Specifications</h3>
            </div>
            <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-[var(--accent-glass)] border border-[var(--border-accent)] text-[var(--accent)]">
              Total ABC: ₱{Number(pr.totalCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
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
                {pr.items.map((item) => (
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

      </div>

      {/* Right Column: Review Action Panel & Timeline */}
      <div className="space-y-6">
        
        {/* Officer Review Actions */}
        {!isLocked && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <ShieldCheck className="h-5 w-5 text-[var(--accent)]" />
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Officer Action Control
              </h3>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Validate compliance, then select an action to authorize or return this Purchase Request.
            </p>

            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => handleOpenModal("approve")}
                disabled={isProcessing || !isAllChecklistPassed}
                className="w-full btn btn-success btn-md rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve Purchase Request</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenModal("return")}
                disabled={isProcessing}
                className="w-full btn btn-error btn-outline btn-md rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Return with Comment</span>
              </button>
            </div>
          </div>
        )}

        {/* Workflow Timeline */}
        <PrWorkflowTimeline
          entries={timelineEntries}
          currentStatus={pr.status}
          submittedAt={pr.submittedAt ? String(pr.submittedAt) : undefined}
          approvedAt={pr.approvedAt ? String(pr.approvedAt) : undefined}
        />

        {/* Linked PPMP Card if available */}
        {pr.ppmp && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">Linked Planning Reference</span>
            <h4 className="text-xs font-bold text-[var(--text-primary)]">📁 {pr.ppmp.projectTitle}</h4>
            <div className="text-xs text-[var(--text-muted)]">PPMP Reference No: <span className="font-semibold text-[var(--text-primary)]">{pr.ppmp.ppmpNumber}</span></div>
          </div>
        )}

      </div>

      {/* Review Modal */}
      <ReviewPrModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        mode={modalState.mode}
        onConfirm={handleConfirmReview}
        isProcessing={isProcessing}
        prNumber={pr.prNumber}
      />
    </div>
  );
}
