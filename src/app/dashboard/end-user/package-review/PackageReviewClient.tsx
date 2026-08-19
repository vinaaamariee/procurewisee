"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  FileText,
  ShoppingCart,
  ClipboardList,
  Building2,
  Send,
  ArrowRight,
  AlertTriangle,
  Package,
} from "lucide-react";
import { submitPrAction } from "@/app/actions/pr";

interface PrItem {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  estimatedUnitCost: number;
  estimatedCost: number;
}

interface PpmpInfo {
  id: number;
  ppmpNumber: string;
  projectTitle: string;
  status: string;
  documentUrl: string | null;
  documentName: string | null;
  documentSize: number | null;
  documentUploadedAt: string | null;
}

interface PreCanvassSupplier {
  id: number;
  supplierName: string;
  responseStatus: string;
  hasResponse: boolean;
}

interface PreCanvassInfo {
  id: number;
  preCanvassNumber: string;
  status: string;
  suppliers: PreCanvassSupplier[];
}

interface PurchaseRequest {
  id: number;
  prNumber: string;
  department: string;
  office: string;
  purpose: string;
  fundingSource: string;
  totalCost: number;
  status: string;
  submittedAt: string | null;
  updatedAt: string;
  ppmp: PpmpInfo | null;
  items: PrItem[];
  preCanvass: PreCanvassInfo | null;
  assignedOfficer: { fullName: string } | null;
}

interface PackageReviewClientProps {
  prs: PurchaseRequest[];
}

function getChecklist(pr: PurchaseRequest) {
  const hasPpmp = !!pr.ppmp;
  const hasPr = true;
  const hasItems = pr.items.length > 0;
  const hasPreCanvass = !!pr.preCanvass;
  const respondingSuppliers = pr.preCanvass?.suppliers.filter((s) => s.hasResponse) || [];
  const has3Quotations = respondingSuppliers.length >= 3;

  const issues: string[] = [];
  if (!hasPpmp) issues.push("No PPMP linked to this Purchase Request");
  if (!hasItems) issues.push("No procurement items added");
  if (!hasPreCanvass) issues.push("Pre-Canvass not yet initiated");
  if (hasPreCanvass && !has3Quotations) {
    issues.push(`Only ${respondingSuppliers.length} of 3 required supplier quotations received`);
  }

  const isComplete = hasPpmp && hasItems && hasPreCanvass && has3Quotations;
  const canSubmit = isComplete && (pr.status === "Draft" || pr.status === "Submitted" || pr.status === "PendingProcurementReview" || pr.status === "Pending Procurement Review");

  return {
    hasPpmp,
    hasPr,
    hasItems,
    hasPreCanvass,
    respondingSuppliers: respondingSuppliers.length,
    has3Quotations,
    isComplete,
    canSubmit,
    issues,
  };
}

export default function PackageReviewClient({ prs }: PackageReviewClientProps) {
  const [selectedPrId, setSelectedPrId] = useState<number | null>(
    prs.length > 0 ? prs[0].id : null
  );
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedPr = prs.find((pr) => pr.id === selectedPrId);
  const checklist = selectedPr ? getChecklist(selectedPr) : null;

  const handleSubmit = async () => {
    if (!selectedPr) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await submitPrAction(selectedPr.id);
      if (res.success) {
        setMessage("Procurement package submitted successfully to the Procurement Office!");
      } else {
        setError(res.error || "Failed to submit package.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* PR List */}
      <div className="lg:col-span-1 space-y-3">
        <h2 className="text-sm font-bold text-base-content uppercase tracking-wider">Procurement Packages</h2>
        {prs.length === 0 ? (
          <div className="text-center py-12 bg-base-100 rounded-2xl border border-base-300">
            <Package className="h-10 w-10 mx-auto text-base-content/20 mb-3" />
            <p className="text-sm text-base-content/60">No procurement packages to review.</p>
          </div>
        ) : (
          prs.map((pr) => {
            const cl = getChecklist(pr);
            return (
              <button
                key={pr.id}
                onClick={() => { setSelectedPrId(pr.id); setMessage(null); setError(null); }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedPrId === pr.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-base-300 bg-base-100 hover:bg-base-200/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-primary">{pr.prNumber}</span>
                  {cl.isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                </div>
                <p className="text-xs text-base-content/60 line-clamp-1">{pr.purpose}</p>
                <p className="text-xs font-bold text-base-content mt-1">
                  ₱{pr.totalCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
              </button>
            );
          })
        )}
      </div>

      {/* Package Detail */}
      <div className="lg:col-span-2 space-y-5">
        {selectedPr && checklist ? (
          <>
            {message && (
              <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-success text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                {message}
              </div>
            )}
            {error && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm font-bold flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            <div className="bg-base-100 border border-base-300 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-base-300 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-primary">{selectedPr.prNumber}</h2>
                  <p className="text-xs text-base-content/60 mt-1">{selectedPr.department} &bull; {selectedPr.office}</p>
                </div>
                {checklist.canSubmit && (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Submitting..." : "Submit to Procurement Office"}
                  </button>
                )}
              </div>

              {/* Checklist */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50">Package Checklist</h3>
                
                <ChecklistItem
                  icon={<ClipboardList className="h-4 w-4" />}
                  label="PPMP"
                  detail={selectedPr.ppmp ? `${selectedPr.ppmp.ppmpNumber} — ${selectedPr.ppmp.projectTitle}` : "Not linked"}
                  complete={checklist.hasPpmp}
                />
                {selectedPr.ppmp && (
                  <div className="ml-7 flex items-center gap-2 py-1">
                    <FileText className="h-3.5 w-3.5 text-base-content/40" />
                    {selectedPr.ppmp.documentUrl ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-base-content/60 truncate max-w-[180px]" title={selectedPr.ppmp.documentName || ""}>
                          {selectedPr.ppmp.documentName || "PPMP Document"}
                        </span>
                        <a
                          href={selectedPr.ppmp.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          View
                        </a>
                        <a
                          href={selectedPr.ppmp.documentUrl}
                          download={selectedPr.ppmp.documentName || "ppmp-document"}
                          className="text-xs text-primary hover:underline"
                        >
                          Download
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-warning">No document uploaded</span>
                    )}
                  </div>
                )}
                <ChecklistItem
                  icon={<FileText className="h-4 w-4" />}
                  label="Purchase Request"
                  detail={`${selectedPr.prNumber} — ${selectedPr.purpose}`}
                  complete={checklist.hasPr}
                />
                <ChecklistItem
                  icon={<Package className="h-4 w-4" />}
                  label="Procurement Items"
                  detail={`${selectedPr.items.length} item(s) — Total: ₱${selectedPr.totalCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
                  complete={checklist.hasItems}
                />
                <ChecklistItem
                  icon={<Building2 className="h-4 w-4" />}
                  label="Supplier Quotations (AOQ)"
                  detail={
                    checklist.hasPreCanvass
                      ? `${checklist.respondingSuppliers} of 3 quotations received (${selectedPr.preCanvass!.preCanvassNumber})`
                      : "Pre-Canvass not yet initiated"
                  }
                  complete={checklist.has3Quotations}
                />
                <ChecklistItem
                  icon={<ClipboardList className="h-4 w-4" />}
                  label="Requesting Office"
                  detail={`${selectedPr.department} — ${selectedPr.fundingSource}`}
                  complete={true}
                />
              </div>

              {/* Issues */}
              {checklist.issues.length > 0 && (
                <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 space-y-2">
                  <p className="text-xs font-bold text-warning uppercase flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Not Ready for Submission
                  </p>
                  {checklist.issues.map((issue, i) => (
                    <p key={i} className="text-xs text-base-content/70 flex items-start gap-2">
                      <XCircle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                      {issue}
                    </p>
                  ))}
                </div>
              )}

              {/* Items Table */}
              {selectedPr.items.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-3">Procurement Items</h3>
                  <div className="overflow-x-auto border border-base-300 rounded-xl">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-base-200 border-b border-base-300 text-base-content/70 uppercase text-[10px] font-bold">
                          <th className="p-3 text-left">Item Description</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-center">Unit</th>
                          <th className="p-3 text-right">Unit Cost</th>
                          <th className="p-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-base-200">
                        {selectedPr.items.map((item) => (
                          <tr key={item.id} className="hover:bg-base-200/30">
                            <td className="p-3 font-medium text-base-content">{item.description}</td>
                            <td className="p-3 text-center font-bold">{item.quantity}</td>
                            <td className="p-3 text-center text-base-content/70">{item.unit}</td>
                            <td className="p-3 text-right text-base-content/70">
                              ₱{item.estimatedUnitCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 text-right font-bold">
                              ₱{item.estimatedCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Quotation Status */}
              {selectedPr.preCanvass && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-3">Supplier Quotation Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedPr.preCanvass.suppliers.map((supplier) => (
                      <div
                        key={supplier.id}
                        className={`p-3 rounded-xl border text-center ${
                          supplier.hasResponse
                            ? "border-success/30 bg-success/5"
                            : "border-warning/30 bg-warning/5"
                        }`}
                      >
                        {supplier.hasResponse ? (
                          <CheckCircle2 className="h-5 w-5 text-success mx-auto mb-1" />
                        ) : (
                          <XCircle className="h-5 w-5 text-warning mx-auto mb-1" />
                        )}
                        <p className="text-xs font-bold text-base-content">{supplier.supplierName}</p>
                        <p className={`text-[10px] font-semibold ${supplier.hasResponse ? "text-success" : "text-warning"}`}>
                          {supplier.hasResponse ? "Quotation Received" : "Awaiting Response"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-base-100 rounded-2xl border border-base-300">
            <Package className="h-12 w-12 mx-auto text-base-content/20 mb-3" />
            <p className="text-sm font-medium text-base-content/60">Select a procurement package to review.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChecklistItem({
  icon,
  label,
  detail,
  complete,
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
  complete: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${complete ? "border-success/20 bg-success/5" : "border-warning/20 bg-warning/5"}`}>
      <div className={`mt-0.5 ${complete ? "text-success" : "text-warning"}`}>
        {complete ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base-content">{icon}</span>
          <span className="text-xs font-bold text-base-content">{label}</span>
        </div>
        <p className="text-[11px] text-base-content/60 mt-0.5 truncate">{detail}</p>
      </div>
    </div>
  );
}
