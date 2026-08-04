"use client";

import React, { useState, useEffect } from "react";
import { reviewPrAction, receivePrAction, updatePrItemAction, getPreCanvassingData, convertPrToRfqAction, approvePrByOfficerAction, returnPrByOfficerAction } from "@/app/actions/pr";
import { useRouter } from "next/navigation";
import DocumentLayout from "@/components/documents/DocumentLayout";
import ReviewPrModal from "@/components/pr/ReviewPrModal";
import PrValidationChecklist, { ValidationItem } from "@/components/pr/PrValidationChecklist";
import PrWorkflowTimeline, { TimelineEntry } from "@/components/pr/PrWorkflowTimeline";
import PrWorkflowTimelineStepper from "@/components/pr/PrWorkflowTimelineStepper";
import { ShieldCheck, Lock, ArrowLeft, Printer, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

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
          setSuccessMsg("Purchase Request verified! It is now ready for recording to the Procurement Monitoring Register.");
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
        return { label: "Pending Procurement Verification", cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300" };
      case "Returned":
      case "ReturnedForRevision":
      case "Returned for Revision":
        return { label: "Returned", cls: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300" };
      case "Approved":
        return { label: "Verified", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-350" };
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
          <div className="rounded-md border border-success/30 bg-success/5 p-4 text-base-content space-y-2 shadow-none">
            <div className="flex items-center gap-2 text-success font-bold text-base">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Verified</span>
            </div>
            <p className="text-xs text-base-content/80 leading-relaxed font-medium">
              This Purchase Request has successfully passed Procurement Verification and is now ready for recording to the Procurement Monitoring Register.
            </p>
          </div>
        )}

        {isLocked && (
          <div className="rounded-md border border-base-300 bg-base-200 p-4 text-base-content flex items-start gap-3 text-xs shadow-none">
            <Lock className="h-4 w-4 text-base-content/50 shrink-0 mt-0.5" />
            <span>
              This Purchase Request has already been approved. Further modifications are no longer permitted. If changes are required, contact the Procurement Office.
            </span>
          </div>
        )}

        {/* PR Master Details Card */}
        <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-200 pb-4 text-left">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-primary font-display">
                  {pr.prNumber}
                </h2>
                <StatusBadge status={pr.status} />
              </div>
              <p className="text-xs text-base-content/60 mt-1 font-medium">
                Requisitioned by: <span className="font-bold text-base-content">{pr.requestedBy?.fullName || pr.requesterName || "BSC Requisitioner"}</span> ({pr.requestedBy?.email || pr.requesterEmail || "department@bsc.edu.ph"})
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-ghost btn-sm rounded-md text-xs font-bold border border-base-300 text-base-content"
              >
                <Printer className="h-4 w-4 mr-1" />
                Print PR
              </button>
              <button
                type="button"
                onClick={handleOpenPreCanvass}
                disabled={preCanvassLoading}
                className="btn btn-outline btn-sm rounded-md text-xs font-bold border-primary text-primary hover:bg-primary/5"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left">
            <div>
              <span className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px]">Department / Office</span>
              <span className="font-bold text-base-content text-sm">{pr.department} ({pr.office})</span>
            </div>
            <div>
              <span className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px]">Funding Source</span>
              <span className="font-bold text-base-content text-sm">{pr.fundingSource}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px]">Purpose / Justification</span>
              <span className="font-medium text-base-content leading-relaxed">{pr.purpose}</span>
            </div>
          </div>
          <PrWorkflowTimelineStepper currentStatus={pr.status} />
        </div>

        {/* 5-Point Validation Checklist */}
        <PrValidationChecklist
          items={checklist}
          onToggle={handleToggleChecklist}
          isLocked={isLocked}
        />

        {/* Line Items Table */}
        <div className="rounded-md border border-base-300 bg-base-100 p-5 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-base-200 pb-3 text-left">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-base-content/50">Appendix 60 Requisition Items</span>
              <h3 className="text-base font-bold text-base-content">Itemized Specifications</h3>
            </div>
            <span className="px-3 py-0.5 text-xs font-bold rounded bg-primary/10 border border-primary/20 text-primary">
              Total ABC: ₱{Number(pr.totalCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-base-300 bg-base-200 text-base-content/85 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Item Details</th>
                  <th className="py-2.5 px-3 text-center">Brand</th>
                  <th className="py-2.5 px-3 text-center">Qty / Unit</th>
                  <th className="py-2.5 px-3 text-right">Est. Unit Cost</th>
                  <th className="py-2.5 px-3 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200 text-left">
                {pr.items.map((item) => (
                  <tr key={item.id} className="hover:bg-base-200/30">
                    <td className="py-3 px-3">
                      <div className="font-bold text-base-content">{item.description}</div>
                      {item.specification && (
                        <div className="text-[11px] text-base-content/60 mt-0.5">{item.specification}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center text-base-content/70 font-medium">
                      {item.brand || "—"}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-base-content">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-right text-base-content/70 font-medium">
                      ₱{Number(item.estimatedUnitCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-base-content">
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
          <div className="rounded-md border border-base-300 bg-base-100 p-4 shadow-none space-y-4">
            <div className="flex items-center gap-2 border-b border-base-200 pb-3 text-left">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">
                Officer Action Control
              </h3>
            </div>

            <p className="text-xs text-base-content/60 leading-relaxed text-left">
              Validate compliance, then select an action to authorize or return this Purchase Request.
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleOpenModal("approve")}
                disabled={isProcessing || !isAllChecklistPassed}
                className="w-full btn btn-success text-white font-bold flex items-center justify-center gap-2 rounded-md shadow-none disabled:opacity-50"
              >
                <CheckCircle2 className="h-4.5 w-4.5" />
                <span>Verify Purchase Request</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenModal("return")}
                disabled={isProcessing}
                className="w-full btn btn-error btn-outline rounded-md font-bold flex items-center justify-center gap-2"
              >
                <AlertTriangle className="h-4.5 w-4.5" />
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
          <div className="rounded-md border border-base-300 bg-base-100 p-4 shadow-none space-y-2 text-left">
            <span className="text-[10px] font-extrabold uppercase text-base-content/50 tracking-wider">Linked Planning Reference</span>
            <h4 className="text-xs font-bold text-base-content">📁 {pr.ppmp.projectTitle}</h4>
            <div className="text-xs text-base-content/60">PPMP Reference No: <span className="font-semibold text-base-content">{pr.ppmp.ppmpNumber}</span></div>
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
