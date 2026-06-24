"use client";

import React, { useState } from "react";
import { createReceiptAction } from "@/app/actions/receipt";
enum DeliveryStatus {
  PartialDelivery = "PartialDelivery",
  CompleteDelivery = "CompleteDelivery",
  RejectedDelivery = "RejectedDelivery",
  ReturnedDelivery = "ReturnedDelivery",
  ReplacementDelivery = "ReplacementDelivery"
}

interface Supplier {
  id: number;
  companyName: string;
}

interface Rfq {
  id: number;
  rfqNumber: string;
}

interface PoItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: any;
  totalCost: any;
}

interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplier: Supplier;
  rfqId: number | null;
  rfq: Rfq | null;
  totalCost: any;
  deliveryTerms: string | null;
  paymentTerms: string | null;
  status: string;
  createdAt: Date | string;
  items: PoItem[];
  acknowledgementReceipts?: Array<{
    id: number;
    receiptNumber: string;
    receivedBy: string;
    dateReceived: Date | string;
    deliveryStatus: string;
    remarks: string | null;
  }>;
}

interface SupplierPoClientProps {
  initialPos: PurchaseOrder[];
  supplierId: number;
}

export default function SupplierPoClient({ initialPos, supplierId }: SupplierPoClientProps) {
  const [pos, setPos] = useState<PurchaseOrder[]>(initialPos);
  const [selectedPoId, setSelectedPoId] = useState<number | null>(
    initialPos.length > 0 ? initialPos[0].id : null
  );

  // Form states for Acknowledgement Receipt
  const [receivedBy, setReceivedBy] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(DeliveryStatus.CompleteDelivery);
  const [remarks, setRemarks] = useState("");
  const [signature, setSignature] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedPo = pos.find((p) => p.id === selectedPoId);

  React.useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setReceivedBy("");
    setRemarks("");
    setSignature("");
  }, [selectedPoId]);

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPo) return;
    if (!receivedBy.trim()) {
      setErrorMsg("Please provide the name of the person who received/delivered the items.");
      return;
    }
    if (!signature.trim()) {
      setErrorMsg("Please authorize this receipt with your digital signature.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await createReceiptAction({
        poId: selectedPo.id,
        receivedBy,
        deliveryStatus,
        remarks,
        signatures: signature
      });

      if (res.success && res.receipt) {
        // Update local PO state status to Delivered/Updated
        setPos(prev => prev.map(p => {
          if (p.id === selectedPo.id) {
            const updatedPo = {
              ...p,
              status: deliveryStatus === DeliveryStatus.CompleteDelivery ? "Delivered" : p.status,
              acknowledgementReceipts: [
                ...(p.acknowledgementReceipts || []),
                {
                  id: res.receipt.id,
                  receiptNumber: res.receipt.receiptNumber,
                  receivedBy: res.receipt.receivedBy,
                  dateReceived: res.receipt.dateReceived,
                  deliveryStatus: res.receipt.deliveryStatus,
                  remarks: res.receipt.remarks
                }
              ]
            };
            return updatedPo;
          }
          return p;
        }));
        setSuccessMsg(`Acknowledgement receipt ${res.receipt.receiptNumber} submitted successfully.`);
      } else {
        setErrorMsg(res.error || "Failed to file acknowledgement receipt.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return { bg: "rgba(107, 114, 128, 0.1)", text: "#6b7280" };
      case "Approved":
        return { bg: "rgba(59, 130, 246, 0.1)", text: "#3b82f6" };
      case "Delivered":
        return { bg: "rgba(16, 185, 129, 0.1)", text: "#10b981" };
      case "Closed":
        return { bg: "rgba(79, 70, 229, 0.1)", text: "#4f46e5" };
      default:
        return { bg: "rgba(0, 0, 0, 0.05)", text: "#000" };
    }
  };

  const theme = {
    crimson: "#7e191b",
    gold: "#dcb353",
    goldDark: "#b88a1b",
    textMain: "#1f2937",
    textMuted: "#6b7280",
    glassBg: "rgba(255, 255, 255, 0.75)",
    glassBorder: "rgba(255, 255, 255, 0.95)",
    shadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="lg:grid-cols-3">
      {/* Sidebar: PO List */}
      <div style={{
        background: theme.glassBg, backdropFilter: "blur(20px)",
        border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem",
        boxShadow: theme.shadow, height: "calc(100vh - 200px)", overflowY: "auto"
      }} className="lg:col-span-1">
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, marginBottom: "1rem" }}>My Purchase Orders</h2>
        {pos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: theme.textMuted }}>
            No Purchase Orders awarded yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {pos.map((po) => {
              const active = po.id === selectedPoId;
              const statusColors = getStatusColor(po.status);
              return (
                <button
                  key={po.id}
                  onClick={() => setSelectedPoId(po.id)}
                  style={{
                    width: "100%", textAlign: "left", padding: "1rem", borderRadius: "0.75rem",
                    border: active ? `1px solid ${theme.crimson}` : "1px solid rgba(0,0,0,0.06)",
                    background: active ? "rgba(126, 25, 27, 0.04)" : "rgba(255,255,255,0.6)",
                    cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: "0.4rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <span style={{ fontWeight: 800, color: active ? theme.crimson : theme.textMain }}>{po.poNumber}</span>
                    <span style={{
                      padding: "0.2rem 0.5rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700,
                      backgroundColor: statusColors.bg, color: statusColors.text
                    }}>
                      {po.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: theme.textMuted, marginTop: "0.2rem" }}>
                    <span>{new Date(po.createdAt).toLocaleDateString()}</span>
                    <span style={{ fontWeight: 600, color: theme.textMain }}>₱{Number(po.totalCost).toLocaleString()}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Panel: PO details, Print, and Acknowledgement */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} className="lg:col-span-2">
        {selectedPo ? (
          <>
            {/* Header / Contract Panel */}
            <div style={{
              background: theme.glassBg, backdropFilter: "blur(20px)",
              border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
              boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: theme.textMain, margin: 0 }}>{selectedPo.poNumber}</h2>
                  <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: theme.textMuted }}>
                    Issued on {new Date(selectedPo.createdAt).toLocaleString()}
                  </p>
                </div>
                
                <span style={{
                  padding: "0.35rem 1rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 800,
                  backgroundColor: getStatusColor(selectedPo.status).bg, color: getStatusColor(selectedPo.status).text
                }}>
                  Status: {selectedPo.status}
                </span>
              </div>

              {errorMsg && (
                <div style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#dc2626", fontSize: "0.8rem", fontWeight: 600 }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              {successMsg && (
                <div style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#059669", fontSize: "0.8rem", fontWeight: 600 }}>
                  ✅ {successMsg}
                </div>
              )}

              {/* Delivery Terms */}
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase" }}>Delivery Terms</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: theme.textMain }}>{selectedPo.deliveryTerms || "FOB Destination"}</span>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase" }}>Payment Terms</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: theme.textMain }}>{selectedPo.paymentTerms || "Charge Account"}</span>
                </div>
              </div>
            </div>

            {/* Line Items Card */}
            <div style={{
              background: theme.glassBg, backdropFilter: "blur(20px)",
              border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", overflow: "hidden",
              boxShadow: theme.shadow
            }}>
              <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyBetween: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: theme.textMain, margin: 0 }}>Contract Line Items</h3>
                <span style={{ fontSize: "1rem", fontWeight: 800, color: theme.crimson }}>
                  Total: ₱{Number(selectedPo.totalCost).toLocaleString()}
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <th style={{ padding: "0.75rem 1.25rem", textAlign: "left", color: theme.textMuted }}>Product / Description</th>
                      <th style={{ padding: "0.75rem 1.25rem", textAlign: "center", color: theme.textMuted }}>Quantity</th>
                      <th style={{ padding: "0.75rem 1.25rem", textAlign: "right", color: theme.textMuted }}>Unit Price</th>
                      <th style={{ padding: "0.75rem 1.25rem", textAlign: "right", color: theme.textMuted }}>Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPo.items.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                        <td style={{ padding: "1rem 1.25rem", fontWeight: 700, color: theme.textMain }}>{item.description}</td>
                        <td style={{ padding: "1rem 1.25rem", textAlign: "center", fontWeight: 600 }}>{item.quantity}</td>
                        <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>₱{Number(item.unitPrice).toLocaleString()}</td>
                        <td style={{ padding: "1rem 1.25rem", textAlign: "right", fontWeight: 700, color: theme.crimson }}>₱{Number(item.totalCost).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Acknowledgment Receipts history */}
            {selectedPo.acknowledgementReceipts && selectedPo.acknowledgementReceipts.length > 0 && (
              <div style={{
                background: theme.glassBg, backdropFilter: "blur(20px)",
                border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem 2rem",
                boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1rem"
              }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: theme.textMain, margin: 0 }}>Acknowledgement Receipts Filed</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {selectedPo.acknowledgementReceipts.map((receipt) => (
                    <div key={receipt.id} style={{
                      padding: "1rem", borderRadius: "0.75rem", border: "1px solid rgba(0,0,0,0.05)",
                      backgroundColor: "rgba(255,255,255,0.4)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                        <strong>{receipt.receiptNumber}</strong>
                        <span style={{ color: "#10b981", fontWeight: 700 }}>{receipt.deliveryStatus}</span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: theme.textMuted }}>
                        Received by: <strong>{receipt.receivedBy}</strong> on {new Date(receipt.dateReceived).toLocaleDateString()}
                      </div>
                      {receipt.remarks && (
                        <div style={{ fontSize: "0.78rem", color: theme.textMain, marginTop: "0.25rem", fontStyle: "italic" }}>
                          Remarks: "{receipt.remarks}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Receipt Acknowledgment Form */}
            {selectedPo.status === "Approved" && (
              <div style={{
                background: theme.glassBg, backdropFilter: "blur(20px)",
                border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
                boxShadow: theme.shadow
              }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, marginBottom: "1.25rem" }}>Acknowledge Delivery Shipment</h3>
                <form onSubmit={handleSubmitReceipt} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="grid grid-cols-1 md:grid-cols-2">
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <label style={{ fontSize: "0.72rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Delivered / Received By</label>
                      <input
                        type="text"
                        value={receivedBy}
                        onChange={(e) => setReceivedBy(e.target.value)}
                        placeholder="Name of receiving officer or courier driver"
                        style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem" }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <label style={{ fontSize: "0.72rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Delivery Status</label>
                      <select
                        value={deliveryStatus}
                        onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}
                        style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem", background: "#fff" }}
                      >
                        <option value={DeliveryStatus.CompleteDelivery}>Complete Delivery</option>
                        <option value={DeliveryStatus.PartialDelivery}>Partial Delivery</option>
                        <option value={DeliveryStatus.RejectedDelivery}>Rejected Delivery</option>
                        <option value={DeliveryStatus.ReturnedDelivery}>Returned Delivery</option>
                        <option value={DeliveryStatus.ReplacementDelivery}>Replacement Delivery</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <label style={{ fontSize: "0.72rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Shipment Remarks</label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add notes about inspection, condition of items, missing count, etc..."
                      style={{
                        width: "100%", height: "80px", padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)",
                        fontSize: "0.85rem", outline: "none", color: theme.textMain, fontFamily: "inherit"
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="grid grid-cols-1 md:grid-cols-2">
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <label style={{ fontSize: "0.72rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Authorized Conforme Signature</label>
                      <input
                        type="text"
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        placeholder="Type full company/representative name to sign conforme"
                        style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem" }}
                      />
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          width: "100%", padding: "0.7rem", borderRadius: "0.5rem", border: "none",
                          background: `linear-gradient(90deg, ${theme.crimson}, ${theme.goldDark})`, color: "#fff",
                          fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(126, 25, 27, 0.2)"
                        }}
                      >
                        {isSubmitting ? "Submitting..." : "🚛 File Acknowledgement Receipt"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          <div style={{
            background: theme.glassBg, backdropFilter: "blur(20px)",
            border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "4rem",
            boxShadow: theme.shadow, textAlign: "center", color: theme.textMuted
          }}>
            Select a Purchase Order from the sidebar to inspect contract terms and upload delivery receipts.
          </div>
        )}
      </div>
    </div>
  );
}
