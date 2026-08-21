"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Building2,
  Phone,
  Mail,
  ClipboardList,
  Eye,
  EyeOff,
  Download,
  Star,
  AlertTriangle,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  createPreCanvassAction,
  selectPreCanvassSuppliersAction,
  sendPreCanvassAction,
  generatePreCanvassAbstractAction,
  closePreCanvassAction,
  getAvailableSuppliersAction,
  getPreCanvassAbstractDataAction,
} from "@/app/actions/pre-canvass";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Supplier {
  id: number;
  companyName: string;
  contactPerson: string | null;
  contactNumber: string | null;
  businessAddress: string;
  reliabilityRating: number | null;
  isVerified: boolean;
  historicalDeliveryDays: number;
  onTimeDeliveryRate: number | null;
}

interface PreCanvassSupplierData {
  id: number;
  supplierId: number;
  companyName: string;
  contactPerson: string | null;
  contactNumber: string | null;
  responseStatus: string;
  invitedAt: string | null;
  respondedAt: string | null;
  selectedBy: string | null;
  response: {
    id: number;
    quotationNumber: string | null;
    quotationDate: string | null;
    remarks: string | null;
    submittedAt: string | null;
    items: Array<{
      id: number;
      prItemId: number;
      unitPrice: number;
      quantityQuoted: number | null;
      quantityAvailable: number | null;
      isAvailable: boolean;
      deliveryDays: number | null;
      remarks: string | null;
    }>;
  } | null;
}

interface PreCanvassDetail {
  id: number;
  preCanvassNumber: string;
  status: string;
  createdAt: string;
  sentAt: string | null;
  closedAt: string | null;
  remarks: string | null;
  purchaseRequest: {
    id: number;
    prNumber: string;
    department: string;
    office: string;
    purpose: string;
    totalCost: number;
    status: string;
    requestedBy: string | null;
    items: Array<{
      id: number;
      itemNo: number;
      description: string;
      specification: string | null;
      quantity: number;
      unit: string;
      estimatedUnitCost: number;
      estimatedCost: number;
      productId: number | null;
    }>;
  };
  suppliers: PreCanvassSupplierData[];
  abstract: {
    id: number;
    status: string;
    generatedAt: string;
    remarks: string | null;
  } | null;
  createdBy: string;
  userProfileId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: any }> = {
    Draft: { bg: "bg-gray-100", text: "text-gray-700", icon: Clock },
    SuppliersSelected: { bg: "bg-[var(--secondary-dim)]", text: "text-[var(--secondary)]", icon: Users },
    Sent: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Send },
    PartiallyResponded: { bg: "bg-[var(--secondary-dim)]", text: "text-[var(--secondary)]", icon: Clock },
    FullyResponded: { bg: "bg-[var(--secondary-dim)]", text: "text-[var(--secondary)]", icon: CheckCircle2 },
    Closed: { bg: "bg-[var(--accent-glass)]", text: "text-[var(--accent)]", icon: CheckCircle2 },
    Cancelled: { bg: "bg-[var(--accent-glass)]", text: "text-[var(--accent)]", icon: XCircle },
  };

  const c = config[status] || config.Draft;
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}
    >
      <Icon className="h-3 w-3" />
      {status.replace(/([A-Z])/g, " $1").trim()}
    </span>
  );
}

function ResponseStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    Pending: { bg: "bg-gray-100", text: "text-gray-600" },
    Invited: { bg: "bg-[var(--secondary-dim)]", text: "text-[var(--secondary)]" },
    Submitted: { bg: "bg-[var(--secondary-dim)]", text: "text-[var(--secondary)]" },
    Declined: { bg: "bg-[var(--accent-glass)]", text: "text-[var(--accent)]" },
    NoResponse: { bg: "bg-[var(--secondary-dim)]", text: "text-[var(--secondary)]" },
  };

  const c = config[status] || config.Pending;

  return (
    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${c.bg} ${c.text}`}>
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function PreCanvassDetailClient({
  preCanvass,
}: {
  preCanvass: PreCanvassDetail;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Supplier selection state
  const [availableSuppliers, setAvailableSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<number[]>([]);
  const [showSupplierSelector, setShowSupplierSelector] = useState(false);

  // AOQ data state
  const [aoqData, setAoqData] = useState<any>(null);
  const [showAoq, setShowAoq] = useState(false);

  const canSelectSuppliers =
    preCanvass.status === "Draft" && preCanvass.suppliers.length === 0;
  const canSend =
    preCanvass.status === "SuppliersSelected" &&
    preCanvass.suppliers.length === 3;
  const canGenerateAoq =
    preCanvass.status === "FullyResponded" ||
    preCanvass.status === "PartiallyResponded";
  const canClose =
    preCanvass.status !== "Closed" && preCanvass.status !== "Cancelled";

  // ─────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  async function handleLoadSuppliers() {
    setLoading(true);
    setError(null);
    try {
      const result = await getAvailableSuppliersAction();
      if (result.success && result.suppliers) {
        // Convert Decimal to number for client-side state
        const suppliers = result.suppliers.map((s: any) => ({
          ...s,
          reliabilityRating: s.reliabilityRating ? Number(s.reliabilityRating) : null,
          onTimeDeliveryRate: s.onTimeDeliveryRate ? Number(s.onTimeDeliveryRate) : null,
        }));
        setAvailableSuppliers(suppliers);
        setShowSupplierSelector(true);
      } else {
        setError(result.error || "Failed to load suppliers.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectSuppliers() {
    if (selectedSupplierIds.length !== 3) {
      setError("Exactly 3 suppliers must be selected.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await selectPreCanvassSuppliersAction(preCanvass.id, [
        { supplierId: selectedSupplierIds[0] },
        { supplierId: selectedSupplierIds[1] },
        { supplierId: selectedSupplierIds[2] },
      ]);

      if (result.success) {
        setSuccess("Suppliers selected successfully!");
        setShowSupplierSelector(false);
        router.refresh();
      } else {
        setError(result.error || "Failed to select suppliers.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await sendPreCanvassAction(preCanvass.id);
      if (result.success) {
        setSuccess("Pre-canvass sent to suppliers successfully!");
        router.refresh();
      } else {
        setError(result.error || "Failed to send pre-canvass.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAoq() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const abstractResult = await generatePreCanvassAbstractAction(preCanvass.id);
      if (!abstractResult.success) {
        setError(abstractResult.error || "Failed to generate abstract.");
        return;
      }

      const dataResult = await getPreCanvassAbstractDataAction(preCanvass.id);
      if (dataResult.success) {
        setAoqData(dataResult);
        setShowAoq(true);
        setSuccess("Abstract of Quotation generated successfully!");
        router.refresh();
      } else {
        setError(dataResult.error || "Failed to fetch AOQ data.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleSupplierSelection(supplierId: number) {
    setSelectedSupplierIds((prev) => {
      if (prev.includes(supplierId)) {
        return prev.filter((id) => id !== supplierId);
      }
      if (prev.length >= 3) {
        setError("Maximum 3 suppliers can be selected.");
        return prev;
      }
      setError(null);
      return [...prev, supplierId];
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Back */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-base-content/50">
          <Link href="/dashboard" className="hover:text-base-content transition-colors">Dashboard</Link>
          <span>&gt;</span>
          <Link href="/dashboard/officer/pre-canvass" className="hover:text-base-content transition-colors">Pre-Canvass</Link>
          <span>&gt;</span>
          <span className="text-primary">{preCanvass.preCanvassNumber}</span>
        </div>
        <Link
          href="/dashboard/officer/pre-canvass"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Pre-Canvass List
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="btn btn-ghost btn-xs">Dismiss</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success text-sm">
          <CheckCircle2 className="h-4 w-4" />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="btn btn-ghost btn-xs">Dismiss</button>
        </div>
      )}

      {/* Header Card */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-base-content">
                {preCanvass.preCanvassNumber}
              </h1>
              <StatusBadge status={preCanvass.status} />
            </div>
            <p className="mt-1 text-sm text-base-content/60">
              Created by {preCanvass.createdBy} on {formatDate(preCanvass.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canSelectSuppliers && (
              <button
                onClick={handleLoadSuppliers}
                disabled={loading}
                className="btn btn-primary btn-sm gap-1"
              >
                <Users className="h-4 w-4" />
                Select 3 Suppliers
              </button>
            )}
            {canSend && (
              <button
                onClick={handleSend}
                disabled={loading}
                className="btn btn-warning btn-sm gap-1"
              >
                <Send className="h-4 w-4" />
                Send to Suppliers
              </button>
            )}
            {canGenerateAoq && (
              <button
                onClick={handleGenerateAoq}
                disabled={loading}
                className="btn btn-success btn-sm gap-1"
              >
                <FileText className="h-4 w-4" />
                Generate AOQ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PR Summary */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">
          Purchase Request Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-base-content/50">PR Number</div>
            <div className="font-bold text-sm">{preCanvass.purchaseRequest.prNumber}</div>
          </div>
          <div>
            <div className="text-xs text-base-content/50">Department</div>
            <div className="font-bold text-sm">{preCanvass.purchaseRequest.department}</div>
          </div>
          <div>
            <div className="text-xs text-base-content/50">Office</div>
            <div className="font-bold text-sm">{preCanvass.purchaseRequest.office}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs text-base-content/50">Purpose</div>
            <div className="text-sm">{preCanvass.purchaseRequest.purpose}</div>
          </div>
          <div>
            <div className="text-xs text-base-content/50">Estimated Budget</div>
            <div className="font-bold text-sm text-primary">
              {formatCurrency(preCanvass.purchaseRequest.totalCost)}
            </div>
          </div>
        </div>

        {/* PR Items */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-300">
                <th className="px-3 py-2 text-left text-xs font-bold text-base-content/50">#</th>
                <th className="px-3 py-2 text-left text-xs font-bold text-base-content/50">Description</th>
                <th className="px-3 py-2 text-center text-xs font-bold text-base-content/50">Qty</th>
                <th className="px-3 py-2 text-center text-xs font-bold text-base-content/50">Unit</th>
                <th className="px-3 py-2 text-right text-xs font-bold text-base-content/50">Est. Unit Cost</th>
                <th className="px-3 py-2 text-right text-xs font-bold text-base-content/50">Est. Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-300">
              {preCanvass.purchaseRequest.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 font-bold text-xs">{item.itemNo}</td>
                  <td className="px-3 py-2">
                    <div className="text-xs">{item.description}</div>
                    {item.specification && (
                      <div className="text-[10px] text-base-content/50">{item.specification}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center text-xs">{item.quantity}</td>
                  <td className="px-3 py-2 text-center text-xs">{item.unit}</td>
                  <td className="px-3 py-2 text-right text-xs tabular-nums">{formatCurrency(item.estimatedUnitCost)}</td>
                  <td className="px-3 py-2 text-right text-xs font-bold tabular-nums">{formatCurrency(item.estimatedCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suppliers Section */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/50">
            Selected Suppliers ({preCanvass.suppliers.length}/3)
          </h2>
          {preCanvass.suppliers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-base-content/50">
                {preCanvass.suppliers.filter((s) => s.responseStatus === "Submitted").length} responded
              </span>
            </div>
          )}
        </div>

        {preCanvass.suppliers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 opacity-20" />
            <p className="mt-2 text-sm text-base-content/50">
              No suppliers selected yet. Click "Select 3 Suppliers" to begin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {preCanvass.suppliers.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-base-300 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-bold text-sm">{s.companyName}</span>
                  </div>
                  <ResponseStatusBadge status={s.responseStatus} />
                </div>

                {s.contactPerson && (
                  <div className="flex items-center gap-1 text-xs text-base-content/60 mt-1">
                    <Phone className="h-3 w-3" />
                    {s.contactPerson}
                  </div>
                )}

                {s.response && (
                  <div className="mt-3 pt-3 border-t border-base-300">
                    <div className="text-[10px] font-bold uppercase text-base-content/50 mb-1">
                      Response
                    </div>
                    {s.response.quotationNumber && (
                      <div className="text-xs">
                        <span className="text-base-content/50">Quote #:</span> {s.response.quotationNumber}
                      </div>
                    )}
                    <div className="text-xs">
                      <span className="text-base-content/50">Submitted:</span>{" "}
                      {formatDate(s.response.submittedAt)}
                    </div>
                    {s.response.items.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {s.response.items.map((item) => {
                          const prItem = preCanvass.purchaseRequest.items.find(
                            (pi) => pi.id === item.prItemId
                          );
                          return (
                            <div key={item.id} className="flex justify-between text-[10px]">
                              <span className="text-base-content/60 truncate max-w-[120px]">
                                {prItem?.description || `Item ${item.prItemId}`}
                              </span>
                              <span className={`font-bold ${item.isAvailable ? "text-[var(--secondary)]" : "text-[var(--accent)]"}`}>
                                {item.isAvailable ? formatCurrency(item.unitPrice) : "N/A"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 text-[10px] text-base-content/40">
                  Selected by: {s.selectedBy || "System"}
                  {s.respondedAt && (
                    <span> · Responded: {formatDate(s.respondedAt)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supplier Selector Modal */}
      {showSupplierSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-base-100 rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-base-300">
              <h3 className="text-lg font-bold">Select Exactly 3 Suppliers</h3>
              <p className="text-sm text-base-content/60 mt-1">
                Selected: {selectedSupplierIds.length}/3
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {availableSuppliers.map((supplier) => {
                  const isSelected = selectedSupplierIds.includes(supplier.id);
                  const canSelect = isSelected || selectedSupplierIds.length < 3;

                  return (
                    <div
                      key={supplier.id}
                      onClick={() => canSelect && toggleSupplierSelection(supplier.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : canSelect
                          ? "border-base-300 hover:bg-base-200"
                          : "border-base-300 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected ? "border-primary bg-primary" : "border-base-300"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{supplier.companyName}</div>
                          <div className="text-xs text-base-content/50">
                            {supplier.contactPerson || "No contact"} · {supplier.businessAddress}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {supplier.reliabilityRating?.toFixed(1) || "N/A"}
                        </div>
                        {supplier.isVerified && (
                          <span className="text-[9px] text-[var(--secondary)] font-bold">Verified</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 border-t border-base-300 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSupplierSelector(false);
                  setSelectedSupplierIds([]);
                  setError(null);
                }}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSelectSuppliers}
                disabled={selectedSupplierIds.length !== 3 || loading}
                className="btn btn-primary btn-sm"
              >
                {loading ? "Saving..." : "Confirm Selection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AOQ Modal */}
      {showAoq && aoqData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-base-100 rounded-xl shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-base-300">
              <h3 className="text-lg font-bold">Abstract of Quotation (AOQ)</h3>
              <p className="text-sm text-base-content/60 mt-1">
                Pre-Canvass: {aoqData.preCanvassNumber} · PR: {aoqData.prNumber}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-base-300">
                      <th className="px-3 py-2 text-left text-xs font-bold text-base-content/50">Item</th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-base-content/50">Qty</th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-base-content/50">Unit</th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-base-content/50">Est. Cost</th>
                      {aoqData.comparisons[0]?.supplierPrices.map((sp: any) => (
                        <th key={sp.supplierId} className="px-3 py-2 text-right text-xs font-bold text-base-content/50">
                          {sp.supplierName}
                        </th>
                      ))}
                      <th className="px-3 py-2 text-right text-xs font-bold text-[var(--secondary)]">Lowest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-300">
                    {aoqData.comparisons.map((comp: any) => (
                      <tr key={comp.prItemId}>
                        <td className="px-3 py-2">
                          <div className="text-xs font-medium">{comp.description}</div>
                          {comp.specification && (
                            <div className="text-[10px] text-base-content/50">{comp.specification}</div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center text-xs">{comp.quantity}</td>
                        <td className="px-3 py-2 text-center text-xs">{comp.unit}</td>
                        <td className="px-3 py-2 text-right text-xs tabular-nums">
                          {formatCurrency(comp.estimatedUnitCost)}
                        </td>
                        {comp.supplierPrices.map((sp: any) => (
                          <td
                            key={sp.supplierId}
                            className={`px-3 py-2 text-right text-xs tabular-nums ${
                              !sp.responded
                                ? "text-base-content/30"
                                : sp.isAvailable
                                ? sp.unitPrice === comp.lowestPrice
                                  ? "text-[var(--secondary)] font-bold"
                                  : ""
                                : "text-[var(--accent)]"
                            }`}
                          >
                            {!sp.responded
                              ? "No Response"
                              : sp.isAvailable
                              ? formatCurrency(sp.unitPrice)
                              : "N/A"}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-right text-xs font-bold text-[var(--secondary)] tabular-nums">
                          {comp.lowestPrice ? formatCurrency(comp.lowestPrice) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-6 border-t border-base-300 flex justify-end gap-3">
              <button
                onClick={() => setShowAoq(false)}
                className="btn btn-ghost btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Timeline */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">
          Timeline
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="text-xs">
              <span className="font-bold">Created</span> on {formatDate(preCanvass.createdAt)}
              <span className="text-base-content/50"> by {preCanvass.createdBy}</span>
            </div>
          </div>
          {preCanvass.sentAt && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="text-xs">
                <span className="font-bold">Sent to Suppliers</span> on {formatDate(preCanvass.sentAt)}
              </div>
            </div>
          )}
          {preCanvass.suppliers
            .filter((s) => s.respondedAt)
            .map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--secondary)]" />
                <div className="text-xs">
                  <span className="font-bold">{s.companyName}</span> responded on{" "}
                  {formatDate(s.respondedAt)}
                </div>
              </div>
            ))}
          {preCanvass.abstract && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <div className="text-xs">
                <span className="font-bold">AOQ Generated</span> on{" "}
                {formatDate(preCanvass.abstract.generatedAt)}
              </div>
            </div>
          )}
          {preCanvass.closedAt && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <div className="text-xs">
                <span className="font-bold">Closed</span> on {formatDate(preCanvass.closedAt)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
