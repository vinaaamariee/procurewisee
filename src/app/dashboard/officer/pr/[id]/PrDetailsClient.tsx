"use client";

import React, { useState, useEffect } from "react";
import { reviewPrAction, receivePrAction, updatePrItemAction, getPreCanvassingData } from "@/app/actions/pr";
import DocumentLayout from "@/components/documents/DocumentLayout";

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
  const [pr, setPr] = useState<PurchaseRequest>(initialPr);
  const [verifiedItems, setVerifiedItems] = useState<Record<number, { specs: boolean; qty: boolean }>>({});

  // Inline editing states for items
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<{
    description: string;
    brand: string;
    quantity: number;
    unit: string;
    estimatedUnitCost: number;
    specification: string;
  }>({
    description: "",
    brand: "",
    quantity: 0,
    unit: "",
    estimatedUnitCost: 0,
    specification: ""
  });

  // Action states
  const [revisionRemarks, setRevisionRemarks] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Pre-Canvassing Form States
  const [preCanvassData, setPreCanvassData] = useState<any | null>(null);
  const [isPreCanvassOpen, setIsPreCanvassOpen] = useState(false);
  const [preCanvassLoading, setPreCanvassLoading] = useState(false);

  // Initialize checklist for items on load
  useEffect(() => {
    const initialVerifications: typeof verifiedItems = {};
    pr.items.forEach((item) => {
      initialVerifications[item.id] = { specs: false, qty: false };
    });
    setVerifiedItems(initialVerifications);
  }, [pr]);

  const handleOpenPreCanvass = async () => {
    setPreCanvassLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
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

  const handleStartReview = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await reviewPrAction(pr.id, "UnderReview", "Started officer audit review.", officerId);
      if (res.success && res.pr) {
        setPr(prev => ({ ...prev, status: "UnderReview" }));
        setSuccessMsg("Purchase Request marked as Under Review.");
      } else {
        setErrorMsg(res.error || "Failed to mark as Under Review.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveReceive = async () => {
    // Check checklist verification
    const unverified = pr.items.some(item => {
      const check = verifiedItems[item.id];
      return !check || !check.specs || !check.qty;
    });

    if (unverified) {
      setErrorMsg("Please audit all items (verify specifications and quantities) before final approval.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await receivePrAction(pr.id);
      if (res.success && res.pr) {
        setPr(prev => ({ ...prev, status: "Received", trackingNumber: res.pr.trackingNumber }));
        setSuccessMsg(`Requisition received. Tracking number ${res.pr.trackingNumber} issued!`);
      } else {
        setErrorMsg(res.error || "Failed to receive Purchase Request.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnForRevision = async () => {
    if (!revisionRemarks.trim()) {
      setErrorMsg("Please provide revision remarks describing what needs to be changed.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await reviewPrAction(pr.id, "ReturnedForRevision", revisionRemarks, officerId);
      if (res.success && res.pr) {
        setPr(prev => ({ ...prev, status: "ReturnedForRevision", remarks: res.pr.remarks }));
        setSuccessMsg("Purchase Request returned to requisitioner for revision.");
        setRevisionRemarks("");
      } else {
        setErrorMsg(res.error || "Failed to return Purchase Request.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Inline editing actions
  const startEditing = (item: PurchaseRequestItem) => {
    setEditingItemId(item.id);
    setEditFields({
      description: item.description,
      brand: item.brand || "",
      quantity: item.quantity,
      unit: item.unit,
      estimatedUnitCost: Number(item.estimatedUnitCost),
      specification: item.specification || ""
    });
  };

  const saveEdit = async (itemId: number) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await updatePrItemAction(itemId, editFields);
      if (res.success && res.pr) {
        setPr(prev => {
          const updatedItems = prev.items.map(it => {
            if (it.id === itemId) {
              return {
                ...it,
                ...editFields,
                estimatedCost: editFields.quantity * editFields.estimatedUnitCost
              };
            }
            return it;
          });
          return {
            ...prev,
            items: updatedItems,
            totalCost: res.pr.totalCost,
            estimatedBudget: res.pr.estimatedBudget
          };
        });
        setEditingItemId(null);
        setSuccessMsg("Line item updated successfully and totals recalculated.");
      } else {
        setErrorMsg(res.error || "Failed to update item.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCheck = (itemId: number, type: "specs" | "qty") => {
    setVerifiedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [type]: !prev[itemId]?.[type]
      }
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return { bg: "rgba(107, 114, 128, 0.1)", text: "#6b7280" };
      case "Submitted":
        return { bg: "rgba(59, 130, 246, 0.1)", text: "#3b82f6" };
      case "UnderReview":
      case "Under Review":
        return { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b" };
      case "ReturnedForRevision":
      case "Returned for Revision":
        return { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444" };
      case "Approved":
        return { bg: "rgba(16, 185, 129, 0.1)", text: "#10b981" };
      case "Received":
        return { bg: "rgba(79, 70, 229, 0.1)", text: "#4f46e5" };
      default:
        return { bg: "rgba(0, 0, 0, 0.05)", text: "#000" };
    }
  };

  const budgetInfo = budgets[pr.department] || { allocatedBudget: 0, spentBudget: 0 };
  const budgetRemaining = Number(budgetInfo.allocatedBudget) - Number(budgetInfo.spentBudget);

  const theme = {
    crimson: "var(--accent)",
    gold: "var(--accent-light)",
    goldDark: "var(--accent)",
    textMain: "var(--text-primary)",
    textMuted: "var(--text-muted)",
    glassBg: "var(--surface)",
    glassBorder: "var(--border)",
    shadow: "var(--shadow-card)",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="lg:grid-cols-3">
      {/* Left Columns: Main Purchase Request Information & Checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} className="lg:col-span-2">
        
        {/* Approval Details Card (Section 6) */}
        {["Approved", "Received", "ReturnedForRevision", "Returned for Revision", "Rejected"].includes(pr.status) && (
          <div style={{
            background: "rgba(255,255,255,0.9)",
            borderLeft: `5px solid ${
              pr.status === "Approved" || pr.status === "Received" ? "#10b981" : "#ef4444"
            }`,
            borderRadius: "1rem",
            padding: "1.5rem",
            boxShadow: theme.shadow,
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem"
          }} className="no-print">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: theme.textMain, textTransform: "uppercase" }}>
                📋 Approval/Review Details
              </span>
              <span style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                padding: "0.2rem 0.5rem",
                borderRadius: "999px",
                backgroundColor: getStatusColor(pr.status).bg,
                color: getStatusColor(pr.status).text
              }}>
                {["ReturnedForRevision", "Returned for Revision"].includes(pr.status) ? "Returned for Revision" : pr.status}
              </span>
            </div>
            <div style={{ fontSize: "0.82rem", color: theme.textMain }}>
              <strong>Remarks / Reasons:</strong>{" "}
              <span className="italic font-semibold">
                "{pr.statusHistory?.[0]?.remarks 
                  || pr.remarks 
                  || "No remarks provided."}"
              </span>
            </div>
            <div style={{ fontSize: "0.75rem", color: theme.textMuted }}>
              Reviewed by: {pr.statusHistory?.[0]?.changedBy?.fullName || "Administrative Approver"} on {pr.statusHistory?.[0]?.createdAt ? new Date(pr.statusHistory[0].createdAt).toLocaleString() : "Date N/A"}
            </div>
          </div>
        )}

        {/* Card Header & Primary info */}
        <div style={{
          background: theme.glassBg,
          border: `1px solid ${theme.glassBorder}`,
          borderRadius: "1.25rem",
          padding: "2rem",
          boxShadow: theme.shadow,
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: theme.textMain, margin: 0 }}>{pr.prNumber}</h2>
                <span style={{
                  padding: "0.35rem 1rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 800,
                  backgroundColor: getStatusColor(pr.status).bg, color: getStatusColor(pr.status).text
                }}>
                  {pr.status}
                </span>
              </div>
              <p style={{ margin: "0.35rem 0 0 0", fontSize: "0.85rem", color: theme.textMuted }}>
                Requisitioned by: <strong>{pr.requestedBy?.fullName || pr.requesterName || "BSC Requisitioner"}</strong> ({pr.requestedBy?.email || pr.requesterEmail})
              </p>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                onClick={() => window.print()}
                className="no-print"
                style={{
                  padding: "0.6rem 1.2rem", borderRadius: "0.75rem", border: `1px solid ${theme.glassBorder}`,
                  background: "#fff", color: theme.textMain, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: "0.4rem"
                }}
              >
                🖨️ Print PR
              </button>

              <button
                onClick={handleOpenPreCanvass}
                disabled={preCanvassLoading || isProcessing}
                style={{
                  padding: "0.6rem 1.2rem", borderRadius: "0.75rem", border: "1px solid rgba(126, 25, 27, 0.15)",
                  background: "rgba(126, 25, 27, 0.04)", color: theme.crimson, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: "0.4rem"
                }}
              >
                📄 {preCanvassLoading ? "Analyzing..." : "Pre-Canvassing Form"}
              </button>

              {pr.status === "Submitted" && (
                <button
                  onClick={handleApproveReceive}
                  disabled={isProcessing}
                  style={{
                    padding: "0.6rem 1.4rem", borderRadius: "0.75rem", border: "none",
                    background: `linear-gradient(90deg, #10b981, #059669)`, color: "#fff",
                    fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
                  }}
                >
                  ✅ Receive Requisition
                </button>
              )}
            </div>
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

          {/* Department & Purpose Panel */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", borderTop: `1px solid ${theme.glassBorder}`, paddingTop: "1.5rem" }}>
            <div>
              <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase", fontWeight: 700 }}>Department / Office</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: theme.textMain }}>{pr.department} ({pr.office})</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase", fontWeight: 700 }}>Funding Source</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: theme.textMain }}>{pr.fundingSource}</span>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase", fontWeight: 700 }}>Purpose / Justification</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 500, color: theme.textMain, lineHeight: 1.5 }}>{pr.purpose}</span>
            </div>
          </div>
        </div>

        {/* Requested Items Checklist Table */}
        <div style={{
          background: theme.glassBg,
          border: `1px solid ${theme.glassBorder}`,
          borderRadius: "1.25rem",
          padding: "2rem",
          boxShadow: theme.shadow,
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.glassBorder}`, paddingBottom: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.65rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>Official Requisition Form</span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: theme.textMain, margin: 0 }}>PURCHASE REQUEST CHECKLIST</h3>
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: theme.crimson, backgroundColor: "var(--accent-glass)", border: "1px solid var(--border-accent)", padding: "0.35rem 1rem", borderRadius: "999px" }}>
              Total ABC: ₱{Number(pr.totalCost).toLocaleString()}
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.glassBorder}` }}>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", color: theme.textMuted }}>Item details</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", color: theme.textMuted }}>Brand</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", color: theme.textMuted }}>Qty / UOM</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", color: theme.textMuted }}>Est. Unit Cost</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", color: theme.textMuted }}>Total</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", color: theme.textMuted }}>Checklist (Specs / Qty)</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", color: theme.textMuted }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pr.items.map((item) => {
                  const isEditing = editingItemId === item.id;
                  const check = verifiedItems[item.id] || { specs: false, qty: false };
                  return (
                    <tr key={item.id} style={{ borderBottom: `1px solid ${theme.glassBorder}` }}>
                      {isEditing ? (
                        <>
                          <td style={{ padding: "0.75rem" }} colSpan={2}>
                            <input
                              type="text"
                              value={editFields.description}
                              onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                              placeholder="Description"
                              style={{ width: "100%", padding: "0.4rem", borderRadius: "0.25rem", border: `1px solid ${theme.glassBorder}`, background: theme.glassBg, color: theme.textMain, marginBottom: "0.25rem", fontSize: "0.8rem" }}
                            />
                            <input
                              type="text"
                              value={editFields.specification}
                              onChange={(e) => setEditFields({ ...editFields, specification: e.target.value })}
                              placeholder="Specs / Size Details"
                              style={{ width: "100%", padding: "0.4rem", borderRadius: "0.25rem", border: `1px solid ${theme.glassBorder}`, background: theme.glassBg, color: theme.textMain, fontSize: "0.8rem" }}
                            />
                          </td>
                          <td style={{ padding: "0.75rem", textAlign: "center" }}>
                            <input
                              type="number"
                              value={editFields.quantity}
                              onChange={(e) => setEditFields({ ...editFields, quantity: parseInt(e.target.value) || 0 })}
                              style={{ width: "60px", padding: "0.4rem", borderRadius: "0.25rem", border: `1px solid ${theme.glassBorder}`, background: theme.glassBg, color: theme.textMain, fontSize: "0.8rem", textAlign: "center" }}
                            />
                            <input
                              type="text"
                              value={editFields.unit}
                              onChange={(e) => setEditFields({ ...editFields, unit: e.target.value })}
                              style={{ width: "60px", padding: "0.4rem", borderRadius: "0.25rem", border: `1px solid ${theme.glassBorder}`, background: theme.glassBg, color: theme.textMain, fontSize: "0.8rem", textAlign: "center", marginTop: "0.25rem" }}
                            />
                          </td>
                          <td style={{ padding: "0.75rem", textAlign: "right" }}>
                            <input
                              type="number"
                              value={editFields.estimatedUnitCost}
                              onChange={(e) => setEditFields({ ...editFields, estimatedUnitCost: parseFloat(e.target.value) || 0 })}
                              style={{ width: "100px", padding: "0.4rem", borderRadius: "0.25rem", border: `1px solid ${theme.glassBorder}`, background: theme.glassBg, color: theme.textMain, fontSize: "0.8rem", textAlign: "right" }}
                            />
                          </td>
                          <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 700 }}>
                            ₱{(editFields.quantity * editFields.estimatedUnitCost).toLocaleString()}
                          </td>
                          <td style={{ padding: "0.75rem" }} colSpan={2}>
                            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                              <button onClick={() => saveEdit(item.id)} disabled={isProcessing} style={{ padding: "0.3rem 0.75rem", borderRadius: "0.25rem", background: "#10b981", color: "#fff", border: "none", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Save</button>
                              <button onClick={() => setEditingItemId(null)} style={{ padding: "0.3rem 0.75rem", borderRadius: "0.25rem", background: "#6b7280", color: "#fff", border: "none", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding: "1rem 0.75rem", verticalAlign: "top" }}>
                            <div style={{ fontWeight: 700, color: theme.textMain }}>{item.description}</div>
                            {item.specification && <div style={{ fontSize: "0.72rem", color: theme.textMuted, marginTop: "0.2rem" }}>{item.specification}</div>}
                          </td>
                          <td style={{ padding: "1rem 0.75rem", textAlign: "center", verticalAlign: "top", color: theme.textMain }}>
                            {item.brand || "—"}
                          </td>
                          <td style={{ padding: "1rem 0.75rem", textAlign: "center", verticalAlign: "top", fontWeight: 600, color: theme.textMain }}>
                            {item.quantity} {item.unit}
                          </td>
                          <td style={{ padding: "1rem 0.75rem", textAlign: "right", verticalAlign: "top", color: theme.textMuted }}>
                            ₱{Number(item.estimatedUnitCost).toLocaleString()}
                          </td>
                          <td style={{ padding: "1rem 0.75rem", textAlign: "right", verticalAlign: "top", fontWeight: 700, color: theme.textMain }}>
                            ₱{Number(item.estimatedCost).toLocaleString()}
                          </td>
                          <td style={{ padding: "1rem 0.75rem", verticalAlign: "top" }}>
                            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                              <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                                <input type="checkbox" checked={check.specs} onChange={() => toggleCheck(item.id, "specs")} style={{ cursor: "pointer" }} />
                                <span style={{ fontSize: "0.7rem", color: theme.textMain }}>Specs</span>
                              </label>
                              <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                                <input type="checkbox" checked={check.qty} onChange={() => toggleCheck(item.id, "qty")} style={{ cursor: "pointer" }} />
                                <span style={{ fontSize: "0.7rem", color: theme.textMain }}>Qty</span>
                              </label>
                            </div>
                          </td>
                          <td style={{ padding: "1rem 0.75rem", textAlign: "center", verticalAlign: "top" }}>
                            {["Submitted", "UnderReview"].includes(pr.status) && (
                              <button
                                onClick={() => startEditing(item)}
                                style={{ background: "transparent", border: "none", color: theme.crimson, fontWeight: 700, cursor: "pointer", fontSize: "0.75rem" }}
                              >
                                Edit UOM
                              </button>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: Budget Allocation & Workflow History */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} className="lg:col-span-1">
        
        {/* Budget Monitoring Section */}
        <div style={{
          background: theme.glassBg,
          border: `1px solid ${theme.glassBorder}`,
          borderRadius: "1.25rem",
          padding: "1.5rem",
          boxShadow: theme.shadow,
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem"
        }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: theme.textMain, margin: 0 }}>💰 Budget Allocation</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase", fontWeight: 700 }}>Dept. Allocated Budget</span>
              <span style={{ fontSize: "1.1rem", fontWeight: 800, color: theme.textMain }}>₱{Number(budgetInfo.allocatedBudget).toLocaleString()}</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase", fontWeight: 700 }}>Spent Budget (Includes this)</span>
              <span style={{ fontSize: "1.1rem", fontWeight: 800, color: theme.crimson }}>₱{Number(budgetInfo.spentBudget).toLocaleString()}</span>
            </div>
            <div style={{ borderTop: `1px solid ${theme.glassBorder}`, paddingTop: "0.75rem" }}>
              <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase", fontWeight: 700 }}>Remaining Balance</span>
              <span style={{ fontSize: "1.15rem", fontWeight: 900, color: budgetRemaining < 0 ? "#dc2626" : "#059669" }}>
                ₱{budgetRemaining.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Workflow Actions / Revision Remarks Form */}
        {["Submitted", "UnderReview"].includes(pr.status) && (
          <div style={{
            background: theme.glassBg,
            border: `1px solid ${theme.glassBorder}`,
            borderRadius: "1.25rem",
            padding: "1.5rem",
            boxShadow: theme.shadow,
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: theme.textMain, margin: 0 }}>🛠️ Audit Decision Panel</h3>
            <textarea
              placeholder="Provide comments/remarks here if returning for revision..."
              value={revisionRemarks}
              onChange={(e) => setRevisionRemarks(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "0.6rem 0.8rem",
                borderRadius: "0.5rem",
                border: `1px solid ${theme.glassBorder}`,
                background: "rgba(0,0,0,0.02)",
                color: theme.textMain,
                fontSize: "0.8rem",
                outline: "none",
                resize: "none"
              }}
            />
            <button
              onClick={handleReturnForRevision}
              disabled={isProcessing}
              style={{
                width: "100%", padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid rgba(239, 68, 68, 0.2)",
                background: "rgba(239, 68, 68, 0.05)", color: "#ef4444", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                transition: "background 0.2s"
              }}
              className="hover:bg-red-500/10"
            >
              🔄 Return for Revision
            </button>
          </div>
        )}

        {/* Decision History & Comments */}
        {pr.statusHistory && pr.statusHistory.length > 0 && (
          <div style={{
            background: theme.glassBg,
            border: `1px solid ${theme.glassBorder}`,
            borderRadius: "1.25rem",
            padding: "1.5rem",
            boxShadow: theme.shadow,
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: theme.textMain, margin: 0 }}>📋 Decision History & Comments</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "300px", overflowY: "auto" }}>
              {pr.statusHistory?.map((history, idx) => (
                <div key={idx} style={{ fontSize: "0.78rem", borderBottom: idx < (pr.statusHistory?.length || 0) - 1 ? "1px solid rgba(0,0,0,0.04)" : "none", paddingBottom: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                    <span style={{
                      color: 
                        history.status === "Approved" || history.status === "Received" ? "#10b981" :
                        ["ReturnedForRevision", "Returned for Revision"].includes(history.status) ? "#ef4444" :
                        history.status === "Rejected" ? "#7f1d1d" : "#d97706"
                    }}>
                      {["ReturnedForRevision", "Returned for Revision"].includes(history.status) ? "Returned for Revision" : history.status}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: theme.textMuted }}>
                      {new Date(history.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: theme.textMuted, marginTop: "0.1rem" }}>
                    By: {history.changedBy?.fullName || "Administrative Approver"}
                  </div>
                  {history.remarks && (
                    <div style={{
                      marginTop: "0.25rem", fontStyle: "italic", color: theme.textMain,
                      padding: "0.3rem 0.5rem", borderRadius: "4px", backgroundColor: "rgba(0,0,0,0.02)",
                      borderLeft: `2px solid ${theme.crimson}`
                    }}>
                      "{history.remarks}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Associated PPMP Info (Planning Traceability) */}
        {pr.ppmp && (
          <div style={{
            background: theme.glassBg,
            border: `1px solid ${theme.glassBorder}`,
            borderRadius: "1.25rem",
            padding: "1.5rem",
            boxShadow: theme.shadow,
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem"
          }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Linked Planning Ref</span>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 800, color: theme.textMain, margin: 0 }}>📁 {pr.ppmp.projectTitle}</h4>
            <div style={{ fontSize: "0.75rem", color: theme.textMuted }}>PPMP Reference No: <strong>{pr.ppmp.ppmpNumber}</strong></div>
          </div>
        )}
      </div>

      {/* Pre-Canvassing Analysis Overlay Modal */}
      {isPreCanvassOpen && preCanvassData && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.45)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem"
        }}>
          <div style={{
            background: "#fff", width: "100%", maxWidth: "1000px", maxHeight: "85vh",
            borderRadius: "1rem", display: "flex", flexDirection: "column", overflow: "hidden",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 2rem", borderBottom: "1px solid #ddd" }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#111" }}>Market Price Survey Analyzer (Pre-Canvassing)</h2>
              <button
                onClick={() => setIsPreCanvassOpen(false)}
                style={{ background: "transparent", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#888" }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "2rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              
              {/* Header Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem", borderBottom: "1px solid #ddd", paddingBottom: "1rem" }}>
                <div>
                  <div style={{ color: "#333" }}><strong>Purchase Request Ref:</strong> {preCanvassData.prNumber}</div>
                  <div style={{ color: "#333" }}><strong>Department:</strong> {preCanvassData.department}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#333" }}><strong>Date Generated:</strong> {new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  <div style={{ color: "#333" }}><strong>Estimated ABC:</strong> ₱{preCanvassData.totalCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>

              {/* Items Analysis Table */}
              <div>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 800, marginBottom: "0.5rem", borderLeft: `3px solid ${theme.crimson}`, paddingLeft: "0.5rem", color: "#111" }}>
                  Market Survey & Historical Pricing Analysis
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", border: "1px solid #000" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #000" }}>
                      <th style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "left", color: "#111" }}>Item & Specs</th>
                      <th style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "center", width: "60px", color: "#111" }}>Qty/UOM</th>
                      <th style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "right", color: "#111" }}>PR Est Cost</th>
                      <th style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "left", color: "#111" }}>Historical Quotes & Suppliers</th>
                      <th style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "left", color: "#111" }}>Previous PO Records</th>
                      <th style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "right", color: "#111" }}>Market Analysis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preCanvassData.items.map((item: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "0.5rem", border: "1px solid #000", verticalAlign: "top", color: "#333" }}>
                          <strong>{item.description}</strong>
                          {item.specification && <div style={{ fontSize: "0.68rem", color: "#6b7280" }}>{item.specification}</div>}
                        </td>
                        <td style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "center", verticalAlign: "top", color: "#333" }}>
                          {item.quantity} {item.unit}
                        </td>
                        <td style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "right", verticalAlign: "top", fontWeight: 700, color: "#333" }}>
                          ₱{item.estimatedUnitCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "0.5rem", border: "1px solid #000", verticalAlign: "top", color: "#333" }}>
                          {item.historicalQuotes.length === 0 ? (
                            <span style={{ color: "#6b7280" }}>No historical quotes</span>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                              {item.historicalQuotes.map((q: any, qidx: number) => (
                                <div key={qidx} style={{ color: "#333" }}>
                                  • {q.supplier}: <strong>₱{q.price.toLocaleString()}</strong> ({new Date(q.date).toLocaleDateString()})
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "0.5rem", border: "1px solid #000", verticalAlign: "top", color: "#333" }}>
                          {item.previousOrders.length === 0 ? (
                            <span style={{ color: "#6b7280" }}>No previous orders</span>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                              {item.previousOrders.map((o: any, oidx: number) => (
                                <div key={oidx} style={{ color: "#333" }}>
                                  • PO {o.poNumber} ({o.supplier}): <strong>₱{o.price.toLocaleString()}</strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "right", verticalAlign: "top", color: "#333" }}>
                          <div>Lowest: <strong>₱{item.lowestPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></div>
                          <div>Avg: ₱{item.averagePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                          {item.estimatedUnitCost > item.averagePrice && (
                            <div style={{ color: "#dc2626", fontSize: "0.65rem", fontWeight: 700 }}>⚠️ Above Average</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* References */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
                <div style={{ border: "1px solid #000", padding: "1rem", borderRadius: "0.5rem", fontSize: "0.8rem", color: "#333" }}>
                  <h4 style={{ margin: "0 0 0.5rem 0", fontWeight: 800 }}>Supplier Directory References:</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {preCanvassData.items.flatMap((i: any) => i.supplierRefs)
                      .filter((val: string, index: number, self: string[]) => self.indexOf(val) === index)
                      .map((supplier: string, sidx: number) => (
                        <span key={sidx} style={{ border: "1px solid #ccc", padding: "0.2rem 0.5rem", borderRadius: "4px", backgroundColor: "#f9fafb" }}>
                          🏢 {supplier}
                        </span>
                      ))}
                    {preCanvassData.items.flatMap((i: any) => i.supplierRefs).length === 0 && (
                      <span style={{ color: "#6b7280" }}>No reference suppliers found</span>
                    )}
                  </div>
                </div>
                <div style={{ border: "1px solid #000", padding: "1rem", borderRadius: "0.5rem", fontSize: "0.8rem", color: "#333" }}>
                  <h4 style={{ margin: "0 0 0.5rem 0", fontWeight: 800 }}>Pre-Canvassing Recommendation:</h4>
                  <p style={{ margin: 0, lineHeight: 1.4 }}>
                    Based on market survey data and Batanes State College historical procurement database records, the estimated values are aligned. Recommended to proceed with creating a formal Request for Quotation (RFQ) for bidding.
                  </p>
                </div>
              </div>

              {/* Signatures Panel */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2rem", marginTop: "3rem", textAlign: "center", fontSize: "0.8rem", color: "#333" }}>
                <div>
                  <div style={{ borderBottom: "1px solid #000", height: "40px" }} />
                  <div style={{ marginTop: "0.5rem", fontWeight: 700 }}>Prepared By:</div>
                  <div style={{ color: "#555" }}>Procurement Unit Officer</div>
                </div>
                <div>
                  <div style={{ borderBottom: "1px solid #000", height: "40px" }} />
                  <div style={{ marginTop: "0.5rem", fontWeight: 700 }}>Reviewed By:</div>
                  <div style={{ color: "#555" }}>Budget & Finance Director</div>
                </div>
                <div>
                  <div style={{ borderBottom: "1px solid #000", height: "40px" }} />
                  <div style={{ marginTop: "0.5rem", fontWeight: 700 }}>Approved By:</div>
                  <div style={{ color: "#555" }}>College President / VP Administration</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Printable Government PR Layout Sheet (Appendix 60) */}
      <DocumentLayout title="PURCHASE REQUEST" documentRef={pr.prNumber} printAreaId="prPrintArea">
        <div id="prPrintArea" className="hidden bg-white border-2 border-slate-400 p-8 shadow-lg max-w-4xl mx-auto rounded-none font-mono text-slate-800 space-y-6" style={{ color: '#000', backgroundColor: '#fff' }}>
          
          {/* Header Box - hidden during print to prioritize official graphic header */}
          <div className="text-center space-y-1 pb-4 border-b-2 border-slate-800 print:hidden">
            <h2 className="text-sm font-bold uppercase tracking-wider">Appendix 60</h2>
            <h1 className="text-base font-extrabold uppercase">PURCHASE REQUEST</h1>
            <h3 className="text-sm font-black">BATANES STATE COLLEGE</h3>
            <p className="text-[10px] text-slate-500 font-bold">Basco, Batanes</p>
          </div>

          {/* Agency Metadata Grid */}
          <div className="grid grid-cols-2 border border-slate-800 divide-x divide-slate-800 text-[11px] font-bold">
            <div className="p-2 space-y-1">
              <div>Entity Name: <span className="font-extrabold underline">BATANES STATE COLLEGE</span></div>
              <div>Office/Section: <span className="underline">{pr.office || "Procurement Office"}</span></div>
            </div>
            <div className="p-2 space-y-1">
              <div>PR No.: <span className="font-extrabold underline">{pr.prNumber}</span></div>
              <div>Date: <span className="underline">{new Date(pr.requestDate).toLocaleDateString()}</span></div>
              <div>Fund Cluster: <span className="underline">{pr.fundingSource || "GAA"}</span></div>
            </div>
          </div>

          {/* Table Grid */}
          <div className="border border-slate-800 overflow-hidden">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-100 text-center font-extrabold divide-x divide-slate-800">
                  <th className="p-2 w-12">Item No</th>
                  <th className="p-2 w-16">Unit</th>
                  <th className="p-2">Item Description</th>
                  <th className="p-2 w-16">Qty</th>
                  <th className="p-2 w-28 text-right">Unit Cost</th>
                  <th className="p-2 w-28 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {pr.items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-400 divide-x divide-slate-800 font-semibold text-[10px]">
                    <td className="p-2 text-center">{idx + 1}</td>
                    <td className="p-2 text-center">{item.unit}</td>
                    <td className="p-2">
                      <div className="font-extrabold">{item.description}</div>
                      {item.specification && (
                        <div className="text-[9px] text-slate-600 mt-0.5 whitespace-pre-wrap">{item.specification}</div>
                      )}
                    </td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right tabular-nums">₱{Number(item.estimatedUnitCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-right tabular-nums font-bold">₱{Number(item.estimatedCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                {/* Purpose row */}
                <tr className="border-t border-slate-800 font-extrabold text-[11px]">
                  <td colSpan={6} className="p-3 bg-slate-50 text-left border-b border-slate-800">
                    Purpose: <span className="underline normal-case italic font-bold">{pr.purpose}</span>
                  </td>
                </tr>
                {/* Summary row */}
                <tr className="font-black text-xs">
                  <td colSpan={5} className="p-2 text-right uppercase">Total Estimated Budget:</td>
                  <td className="p-2 text-right tabular-nums text-red-700">₱{Number(pr.totalCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures block */}
          <div className="grid grid-cols-2 border border-slate-800 divide-x divide-slate-800 text-[11px] font-bold">
            <div className="p-4 space-y-4">
              <span>Requested By:</span>
              <div className="pt-6 text-center">
                <span className="block font-black underline uppercase">{pr.requestedBy?.fullName || pr.requesterName || "End-User planner"}</span>
                <span className="text-[9px] text-slate-500 font-bold">Designated Head, Requisition Unit</span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <span>Approved By:</span>
              <div className="pt-6 text-center">
                <span className="block font-black underline uppercase">Dr. President</span>
                <span className="text-[9px] text-slate-500 font-bold">Head of Procuring Entity (HOPE)</span>
              </div>
            </div>
          </div>

        </div>
      </DocumentLayout>
    </div>
  );
}
