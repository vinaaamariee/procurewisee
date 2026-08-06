"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updatePmrAction, archivePmrAction } from "@/app/actions/pmr";
import StatusBadge from "@/components/ui/StatusBadge";
import Card from "@/components/ui/Card";
import {
  ArrowLeft,
  Printer,
  Save,
  Archive,
  FileText,
  ClipboardCheck,
} from "lucide-react";

interface PmrItem {
  id: number;
  description: string;
  specification: string | null;
  quantity: number;
  unit: string;
  estimatedUnitCost: number;
  estimatedCost: number;
}

interface PmrPrRef {
  prNumber: string;
  department: string;
  office: string;
  purpose: string;
  fundingSource: string;
  requestDate: string;
  requesterName: string;
  items: PmrItem[];
}

export interface PmrDetailData {
  id: number;
  pmrNumber: string;
  prId: number;
  office: string;
  department: string | null;
  fundSource: string | null;
  purpose: string | null;
  totalCost: number;
  dateReceived: string;
  verificationDate: string | null;
  verifiedBy: string | null;
  stage: string;
  status: string;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  pr: PmrPrRef | null;
}

const STAGE_OPTIONS = [
  "PR Verified",
  "Forwarded to RFQ",
  "RFQ Issued",
  "Under Evaluation",
  "PO Issued",
  "Delivered",
  "Completed",
];

const STATUS_OPTIONS = ["Active", "Archived", "Cancelled"];

export default function PmrDetailClient({ pmr }: { pmr: PmrDetailData }) {
  const router = useRouter();
  const [stage, setStage] = useState(pmr.stage);
  const [status, setStatus] = useState(pmr.status);
  const [remarks, setRemarks] = useState(pmr.remarks || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    setIsProcessing(true);
    setMsg(null);
    try {
      const res = await updatePmrAction(pmr.id, {
        stage,
        status: status as any,
        remarks: remarks.trim() || undefined,
      });
      if (res.success) {
        setMsg({ type: "success", text: "PMR record updated successfully." });
        router.refresh();
      } else {
        setMsg({ type: "error", text: res.error || "Failed to update PMR record." });
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchive = async () => {
    setIsProcessing(true);
    setMsg(null);
    try {
      const res = await archivePmrAction(pmr.id);
      if (res.success) {
        setStatus("Archived");
        setMsg({ type: "success", text: "PMR record archived." });
        router.refresh();
      } else {
        setMsg({ type: "error", text: res.error || "Failed to archive PMR record." });
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/officer/pmr" className="btn btn-ghost btn-sm rounded-md text-xs font-bold border border-base-300">
          <ArrowLeft className="h-4 w-4" />
          Back to Register
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.open(`/print/pmr/${pmr.id}`, "_blank")}
            className="btn btn-ghost btn-sm rounded-md text-xs font-bold border border-base-300"
          >
            <Printer className="h-4 w-4 mr-1" />
            Print PMR
          </button>
          {status !== "Archived" && (
            <button
              type="button"
              onClick={handleArchive}
              disabled={isProcessing}
              className="btn btn-outline btn-sm rounded-md text-xs font-bold border-base-300"
            >
              <Archive className="h-4 w-4 mr-1" />
              Archive
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className="btn btn-primary btn-sm rounded-md text-xs font-bold text-white"
          >
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`rounded-md border p-3 text-xs font-semibold ${
            msg.type === "success"
              ? "border-success/30 bg-success/5 text-success"
              : "border-error/30 bg-error/5 text-error"
          }`}
        >
          {msg.type === "success" ? "✅ " : "⚠️ "}
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PMR Details */}
        <Card className="p-5 space-y-5 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-base-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-primary/10 text-primary">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary font-display">{pmr.pmrNumber}</h3>
                <p className="text-xs text-base-content/60 font-medium">Procurement Monitoring Record</p>
              </div>
            </div>
            <StatusBadge status={pmr.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left">
            <div>
              <span className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px]">PR Reference</span>
              <span className="font-bold text-base-content text-sm">{pmr.pr?.prNumber || `PR #${pmr.prId}`}</span>
            </div>
            <div>
              <span className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px]">Office</span>
              <span className="font-bold text-base-content text-sm">{pmr.office}</span>
            </div>
            <div>
              <span className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px]">Department</span>
              <span className="font-medium text-base-content text-sm">{pmr.department || "—"}</span>
            </div>
            <div>
              <span className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px]">Fund Source</span>
              <span className="font-medium text-base-content text-sm">{pmr.fundSource || "—"}</span>
            </div>
            <div>
              <span className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px]">Date Received</span>
              <span className="font-medium text-base-content text-sm">
                {new Date(pmr.dateReceived).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div>
              <span className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px]">Verification Date</span>
              <span className="font-medium text-base-content text-sm">
                {pmr.verificationDate
                  ? new Date(pmr.verificationDate).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
                  : "—"}
              </span>
            </div>
            <div>
              <span className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px]">Verified By</span>
              <span className="font-medium text-base-content text-sm">{pmr.verifiedBy || "—"}</span>
            </div>
            <div>
              <span className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px]">Total Cost</span>
              <span className="font-bold text-primary text-sm">
                ₱{pmr.totalCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px]">Purpose</span>
              <span className="font-medium text-base-content leading-relaxed">{pmr.purpose || "—"}</span>
            </div>
          </div>

          {/* Update form */}
          <div className="border-t border-base-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px] mb-1.5">Procurement Stage</label>
              <select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full select select-sm border-base-300 bg-base-100 font-medium">
                {STAGE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px] mb-1.5">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full select select-sm border-base-300 bg-base-100 font-medium">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px] mb-1.5">Remarks</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add notes on this monitoring record..."
                className="w-full textarea textarea-bordered textarea-sm border-base-300 bg-base-100 font-medium"
              />
            </div>
          </div>
        </Card>

        {/* Linked PR Summary */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-base-200 pb-3">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">Linked Purchase Request</h3>
          </div>

          {pmr.pr ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px]">PR Number</span>
                <Link href={`/dashboard/officer/pr/${pmr.prId}`} className="font-bold text-primary hover:underline text-sm">
                  {pmr.pr.prNumber}
                </Link>
              </div>
              <div>
                <span className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px]">Requisitioner</span>
                <span className="font-medium text-base-content">{pmr.pr.requesterName}</span>
              </div>
              <div>
                <span className="block font-bold uppercase tracking-wider text-base-content/50 text-[10px]">Request Date</span>
                <span className="font-medium text-base-content">
                  {new Date(pmr.pr.requestDate).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="border-t border-base-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-base-content/50 text-[10px]">Line Items</span>
                  <span className="font-bold text-base-content">{pmr.pr.items.length}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold uppercase tracking-wider text-base-content/50 text-[10px]">Total ABC</span>
                  <span className="font-bold text-primary">
                    ₱{pmr.totalCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-base-content/60">No linked Purchase Request found.</p>
          )}
        </Card>
      </div>

      {/* Line Items */}
      {pmr.pr && pmr.pr.items.length > 0 && (
        <Card className="p-5 space-y-4">
          <div className="border-b border-base-200 pb-3">
            <h3 className="text-base font-bold text-base-content">Itemized Specifications</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-base-300 bg-base-200 text-base-content/85 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Item Details</th>
                  <th className="py-2.5 px-3 text-center">Qty / Unit</th>
                  <th className="py-2.5 px-3 text-right">Est. Unit Cost</th>
                  <th className="py-2.5 px-3 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {pmr.pr.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-3">
                      <div className="font-bold text-base-content">{item.description}</div>
                      {item.specification && (
                        <div className="text-[11px] text-base-content/60 mt-0.5">{item.specification}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-base-content">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-right text-base-content/70 font-medium">
                      ₱{item.estimatedUnitCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-base-content">
                      ₱{item.estimatedCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
