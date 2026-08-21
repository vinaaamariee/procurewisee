"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  Truck,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { submitPreCanvassResponseAction } from "@/app/actions/pre-canvass";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface PreCanvassItem {
  id: number;
  preCanvassId: number;
  responseStatus: string;
  invitedAt: string | null;
  respondedAt: string | null;
  preCanvass: {
    id: number;
    preCanvassNumber: string;
    status: string;
    sentAt: string | null;
    purchaseRequest: {
      prNumber: string;
      department: string;
      office: string;
      purpose: string;
      totalCost: number;
      items: Array<{
        id: number;
        itemNo: number;
        description: string;
        specification: string | null;
        quantity: number;
        unit: string;
        estimatedUnitCost: number;
      }>;
    };
  };
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

interface ResponseItemForm {
  prItemId: number;
  unitPrice: number;
  quantityAvailable: number;
  isAvailable: boolean;
  deliveryDays: number;
  remarks: string;
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
  const config: Record<string, { bg: string; text: string }> = {
    Draft: { bg: "bg-[var(--surface-hover)]", text: "text-[var(--text-secondary)]" },
    SuppliersSelected: { bg: "bg-[var(--secondary-dim)]", text: "text-[var(--secondary)]" },
    Sent: { bg: "bg-[var(--secondary-dim)]", text: "text-[var(--secondary)]" },
    PartiallyResponded: { bg: "bg-[var(--secondary-dim)]", text: "text-[var(--secondary)]" },
    FullyResponded: { bg: "bg-[var(--accent-glass)]", text: "text-[var(--accent)]" },
    Closed: { bg: "bg-[var(--accent-glass)]", text: "text-[var(--accent)]" },
    Cancelled: { bg: "bg-[var(--accent-glass)]", text: "text-[var(--accent)]" },
  };

  const c = config[status] || config.Draft;

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
      {status.replace(/([A-Z])/g, " $1").trim()}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function SupplierPreCanvassClient({
  preCanvassSuppliers,
  supplierId,
  supplierName,
}: {
  preCanvassSuppliers: PreCanvassItem[];
  supplierId: number;
  supplierName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activePreCanvass, setActivePreCanvass] = useState<PreCanvassItem | null>(null);
  const [responseForm, setResponseForm] = useState<{
    quotationNumber: string;
    quotationDate: string;
    items: ResponseItemForm[];
    remarks: string;
  }>({
    quotationNumber: "",
    quotationDate: new Date().toISOString().split("T")[0],
    items: [],
    remarks: "",
  });

  // Filter to only show pre-canvasses that are open for response
  const pendingResponses = preCanvassSuppliers.filter(
    (pcs) =>
      pcs.responseStatus === "Invited" || pcs.responseStatus === "Pending"
  );
  const submittedResponses = preCanvassSuppliers.filter(
    (pcs) => pcs.responseStatus === "Submitted"
  );

  function startResponse(pcs: PreCanvassItem) {
    setActivePreCanvass(pcs);

    // Initialize form with PR items
    const items: ResponseItemForm[] = pcs.preCanvass.purchaseRequest.items.map(
      (item) => ({
        prItemId: item.id,
        unitPrice: 0,
        quantityAvailable: item.quantity,
        isAvailable: true,
        deliveryDays: 7,
        remarks: "",
      })
    );

    setResponseForm({
      quotationNumber: "",
      quotationDate: new Date().toISOString().split("T")[0],
      items,
      remarks: "",
    });
  }

  async function handleSubmitResponse() {
    if (!activePreCanvass) return;

    // Validate at least one item has a price
    const validItems = responseForm.items.filter(
      (item) => item.isAvailable && item.unitPrice > 0
    );
    if (validItems.length === 0) {
      setError("Please provide pricing for at least one item.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await submitPreCanvassResponseAction({
        preCanvassId: activePreCanvass.id,
        quotationNumber: responseForm.quotationNumber || undefined,
        quotationDate: responseForm.quotationDate || undefined,
        items: responseForm.items.map((item) => ({
          prItemId: item.prItemId,
          unitPrice: item.unitPrice,
          quantityAvailable: item.quantityAvailable,
          isAvailable: item.isAvailable,
          deliveryDays: item.deliveryDays,
          remarks: item.remarks || undefined,
        })),
        remarks: responseForm.remarks || undefined,
      });

      if (result.success) {
        setSuccess("Your quotation has been submitted successfully!");
        setActivePreCanvass(null);
        router.refresh();
      } else {
        setError(result.error || "Failed to submit response.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function updateItemForm(
    index: number,
    field: keyof ResponseItemForm,
    value: any
  ) {
    setResponseForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          Pre-Canvass Quotations
        </h1>
        <p className="mt-1 text-sm text-base-content/60">
          {supplierName} — Submit your quotations for pre-canvass requests
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="btn btn-ghost btn-xs">
            Dismiss
          </button>
        </div>
      )}
      {success && (
        <div className="alert alert-success text-sm">
          <CheckCircle2 className="h-4 w-4" />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="btn btn-ghost btn-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Pending Responses */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">
          Pending Responses ({pendingResponses.length})
        </h2>
        {pendingResponses.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--accent)]" />
            <p className="mt-2 text-sm text-base-content/50">
              No pending pre-canvass requests
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingResponses.map((pcs) => (
              <div
                key={pcs.id}
                className="rounded-lg border border-base-300 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-bold text-sm">
                      {pcs.preCanvass.preCanvassNumber}
                    </div>
                    <div className="text-xs text-base-content/50">
                      PR: {pcs.preCanvass.purchaseRequest.prNumber} ·{" "}
                      {pcs.preCanvass.purchaseRequest.department}
                    </div>
                  </div>
                  <StatusBadge status={pcs.preCanvass.status} />
                </div>
                <div className="text-xs text-base-content/60 mb-3">
                  {pcs.preCanvass.purchaseRequest.purpose}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-base-content/50">
                    {pcs.preCanvass.purchaseRequest.items.length} items ·{" "}
                    {formatCurrency(pcs.preCanvass.purchaseRequest.totalCost)}
                  </div>
                  <button
                    onClick={() => startResponse(pcs)}
                    className="btn btn-primary btn-sm gap-1"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Submit Quotation
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submitted Responses */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">
          Submitted Responses ({submittedResponses.length})
        </h2>
        {submittedResponses.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 opacity-20" />
            <p className="mt-2 text-sm text-base-content/50">
              No submitted responses yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {submittedResponses.map((pcs) => (
              <div
                key={pcs.id}
                className="rounded-lg border border-[var(--border-accent)] bg-[var(--accent-glass)] p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-bold text-sm">
                      {pcs.preCanvass.preCanvassNumber}
                    </div>
                    <div className="text-xs text-base-content/50">
                      PR: {pcs.preCanvass.purchaseRequest.prNumber}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-glass)] text-[var(--accent)] px-2.5 py-1 text-[10px] font-bold uppercase">
                    <CheckCircle2 className="h-3 w-3" />
                    Submitted
                  </span>
                </div>
                {pcs.response && (
                  <div className="text-xs text-base-content/60">
                    Submitted on {formatDate(pcs.response.submittedAt)}
                    {pcs.response.quotationNumber && (
                      <span> · Quote #: {pcs.response.quotationNumber}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {activePreCanvass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-base-100 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-base-300">
              <h3 className="text-lg font-bold">
                Submit Quotation — {activePreCanvass.preCanvass.preCanvassNumber}
              </h3>
              <p className="text-sm text-base-content/60 mt-1">
                PR: {activePreCanvass.preCanvass.purchaseRequest.prNumber} ·{" "}
                {activePreCanvass.preCanvass.purchaseRequest.department}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Quotation Header */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-base-content/60 block mb-1">
                    Quotation Number (optional)
                  </label>
                  <input
                    type="text"
                    className="input input-bordered input-sm w-full"
                    placeholder="e.g., QUO-2026-001"
                    value={responseForm.quotationNumber}
                    onChange={(e) =>
                      setResponseForm((prev) => ({
                        ...prev,
                        quotationNumber: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-base-content/60 block mb-1">
                    Quotation Date
                  </label>
                  <input
                    type="date"
                    className="input input-bordered input-sm w-full"
                    value={responseForm.quotationDate}
                    onChange={(e) =>
                      setResponseForm((prev) => ({
                        ...prev,
                        quotationDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-base-300">
                      <th className="px-3 py-2 text-left text-xs font-bold text-base-content/50">
                        Item
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-base-content/50">
                        Requested Qty
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-base-content/50">
                        Available?
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-base-content/50">
                        Unit Price (₱)
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-base-content/50">
                        Qty Available
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-base-content/50">
                        Delivery Days
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-base-content/50">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-300">
                    {activePreCanvass.preCanvass.purchaseRequest.items.map(
                      (prItem, idx) => {
                        const formItem = responseForm.items[idx];
                        return (
                          <tr
                            key={prItem.id}
                            className={
                              formItem?.isAvailable ? "" : "bg-[var(--accent-glass)]"
                            }
                          >
                            <td className="px-3 py-2">
                              <div className="text-xs font-medium">
                                {prItem.description}
                              </div>
                              {prItem.specification && (
                                <div className="text-[10px] text-base-content/50">
                                  {prItem.specification}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center text-xs">
                              {prItem.quantity} {prItem.unit}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-sm checkbox-primary"
                                checked={formItem?.isAvailable ?? true}
                                onChange={(e) =>
                                  updateItemForm(
                                    idx,
                                    "isAvailable",
                                    e.target.checked
                                  )
                                }
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                className="input input-bordered input-xs w-28 text-right"
                                step="0.01"
                                min="0"
                                value={formItem?.unitPrice ?? 0}
                                disabled={!formItem?.isAvailable}
                                onChange={(e) =>
                                  updateItemForm(
                                    idx,
                                    "unitPrice",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                className="input input-bordered input-xs w-20 text-center"
                                min="0"
                                value={formItem?.quantityAvailable ?? prItem.quantity}
                                disabled={!formItem?.isAvailable}
                                onChange={(e) =>
                                  updateItemForm(
                                    idx,
                                    "quantityAvailable",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                className="input input-bordered input-xs w-16 text-center"
                                min="1"
                                value={formItem?.deliveryDays ?? 7}
                                disabled={!formItem?.isAvailable}
                                onChange={(e) =>
                                  updateItemForm(
                                    idx,
                                    "deliveryDays",
                                    parseInt(e.target.value) || 7
                                  )
                                }
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                className="input input-bordered input-xs w-full"
                                placeholder="Optional"
                                value={formItem?.remarks ?? ""}
                                onChange={(e) =>
                                  updateItemForm(idx, "remarks", e.target.value)
                                }
                              />
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* General Remarks */}
              <div>
                <label className="text-xs font-bold text-base-content/60 block mb-1">
                  General Remarks (optional)
                </label>
                <textarea
                  className="textarea textarea-bordered w-full text-sm"
                  rows={2}
                  placeholder="Any additional notes or conditions..."
                  value={responseForm.remarks}
                  onChange={(e) =>
                    setResponseForm((prev) => ({
                      ...prev,
                      remarks: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="p-6 border-t border-base-300 flex justify-end gap-3">
              <button
                onClick={() => {
                  setActivePreCanvass(null);
                  setError(null);
                }}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitResponse}
                disabled={loading}
                className="btn btn-primary btn-sm gap-1"
              >
                {loading ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Submit Quotation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
