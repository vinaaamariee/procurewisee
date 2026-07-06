"use client";

import React, { useState } from "react";
import { reviewPrAction, receivePrAction, updatePrItemAction, getPreCanvassingData } from "@/app/actions/pr";

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
  items: PurchaseRequestItem[];
}

interface PrAuditClientProps {
  initialPrs: PurchaseRequest[];
  officerId: string;
  budgets: Record<string, DepartmentBudget>;
}

export default function PrAuditClient({ initialPrs, officerId, budgets }: PrAuditClientProps) {
  const [prs, setPrs] = useState<PurchaseRequest[]>(initialPrs);
  const [selectedPrId, setSelectedPrId] = useState<number | null>(
    initialPrs.length > 0 ? initialPrs[0].id : null
  );

  // Audit checklist states
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

  const selectedPr = prs.find((pr) => pr.id === selectedPrId);

  // Initialize checklist for items when selected PR changes
  React.useEffect(() => {
    if (selectedPr) {
      const initialVerifications: typeof verifiedItems = {};
      selectedPr.items.forEach((item) => {
        initialVerifications[item.id] = { specs: false, qty: false };
      });
      setVerifiedItems(initialVerifications);
      setRevisionRemarks("");
      setErrorMsg(null);
      setSuccessMsg(null);
      setEditingItemId(null);
      setPreCanvassData(null);
      setIsPreCanvassOpen(false);
    }
  }, [selectedPrId]);

  const handleOpenPreCanvass = async () => {
    if (!selectedPr) return;
    setPreCanvassLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await getPreCanvassingData(selectedPr.id);
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
    if (!selectedPr) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await reviewPrAction(selectedPr.id, "UnderReview", "Started officer audit review.", officerId);
      if (res.success && res.pr) {
        setPrs(prev => prev.map(p => p.id === selectedPr.id ? { ...p, status: "UnderReview" } : p));
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
    if (!selectedPr) return;

    // Check checklist verification
    const unverified = selectedPr.items.some(item => {
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
      const res = await receivePrAction(selectedPr.id);
      if (res.success && res.pr) {
        setPrs(prev => prev.map(p => p.id === selectedPr.id ? { ...p, status: "Received", trackingNumber: res.pr.trackingNumber } : p));
        setSuccessMsg(`PR approved and received. Tracking number ${res.pr.trackingNumber} issued!`);
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
    if (!selectedPr) return;
    if (!revisionRemarks.trim()) {
      setErrorMsg("Please provide revision remarks describing what needs to be changed.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await reviewPrAction(selectedPr.id, "ReturnedForRevision", revisionRemarks, officerId);
      if (res.success && res.pr) {
        setPrs(prev => prev.map(p => p.id === selectedPr.id ? { ...p, status: "ReturnedForRevision", remarks: res.pr.remarks } : p));
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
    if (!selectedPr) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await updatePrItemAction(itemId, editFields);
      if (res.success && res.pr) {
        // Fetch updated item lists or update local state
        setPrs(prev => prev.map(p => {
          if (p.id === selectedPr.id) {
            const updatedItems = p.items.map(it => {
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
              ...p,
              items: updatedItems,
              totalCost: res.pr.totalCost,
              estimatedBudget: res.pr.estimatedBudget
            };
          }
          return p;
        }));
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

  const budgetInfo = selectedPr ? budgets[selectedPr.department] || { allocatedBudget: 0, spentBudget: 0 } : { allocatedBudget: 0, spentBudget: 0 };
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
      {/* Sidebar: Submitted PR List */}
      <div style={{
        background: theme.glassBg, backdropFilter: "blur(20px)",
        border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem",
        boxShadow: theme.shadow, height: "calc(100vh - 200px)", overflowY: "auto"
      }} className="lg:col-span-1">
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, marginBottom: "1rem" }}>Incoming Requisitions</h2>
        {prs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: theme.textMuted }}>
            No pending Purchase Requests to review.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {prs.map((pr) => {
              const active = pr.id === selectedPrId;
              const statusColors = getStatusColor(pr.status);
              return (
                <button
                  key={pr.id}
                  onClick={() => setSelectedPrId(pr.id)}
                  style={{
                    width: "100%", textAlign: "left", padding: "1rem", borderRadius: "0.75rem",
                    border: active ? `1px solid ${theme.crimson}` : "1px solid rgba(0,0,0,0.06)",
                    background: active ? "rgba(126, 25, 27, 0.04)" : "rgba(255,255,255,0.6)",
                    cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: "0.4rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <span style={{ fontWeight: 800, color: active ? theme.crimson : theme.textMain }}>{pr.prNumber}</span>
                    <span style={{
                      padding: "0.2rem 0.5rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700,
                      backgroundColor: statusColors.bg, color: statusColors.text
                    }}>
                      {pr.status}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: theme.textMain }}>
                    Dept: {pr.department}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: theme.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                    {pr.purpose}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: theme.textMuted, marginTop: "0.2rem" }}>
                    <span>{new Date(pr.requestDate).toLocaleDateString()}</span>
                    <span style={{ fontWeight: 600, color: theme.textMain }}>₱{Number(pr.totalCost).toLocaleString()}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main View: PR Audit Detail Panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} className="lg:col-span-2">
        {selectedPr ? (
          <>
            {/* PR Details and Action Box */}
            <div style={{
              background: theme.glassBg, backdropFilter: "blur(20px)",
              border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
              boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: theme.textMain, margin: 0 }}>{selectedPr.prNumber}</h2>
                    <span style={{
                      padding: "0.35rem 1rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 800,
                      backgroundColor: getStatusColor(selectedPr.status).bg, color: getStatusColor(selectedPr.status).text
                    }}>
                      {selectedPr.status}
                    </span>
                  </div>
                  <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: theme.textMuted }}>
                    Prepared by: <strong>{selectedPr.requestedBy?.fullName}</strong> ({selectedPr.requestedBy?.email})
                  </p>
                </div>

                {/* Audit primary triggers */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    onClick={handleOpenPreCanvass}
                    disabled={preCanvassLoading || isProcessing}
                    style={{
                      padding: "0.5rem 1rem", borderRadius: "0.75rem", border: "1px solid rgba(126, 25, 27, 0.15)",
                      background: "rgba(126, 25, 27, 0.04)", color: theme.crimson, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                      display: "inline-flex", alignItems: "center", gap: "0.3rem"
                    }}
                  >
                    📄 {preCanvassLoading ? "Generating..." : "Pre-Canvassing Form"}
                  </button>

                  {selectedPr.status === "Submitted" && (
                    <button
                      onClick={handleStartReview}
                      disabled={isProcessing}
                      style={{
                        padding: "0.5rem 1rem", borderRadius: "0.75rem", border: "1px solid rgba(0,0,0,0.1)",
                        background: "#fff", color: theme.textMain, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer"
                      }}
                    >
                      🔎 Start Audit Review
                    </button>
                  )}

                  {["Submitted", "UnderReview", "Under Review"].includes(selectedPr.status) && (
                    <button
                      onClick={handleApproveReceive}
                      disabled={isProcessing}
                      style={{
                        padding: "0.5rem 1.25rem", borderRadius: "0.75rem", border: "none",
                        background: `linear-gradient(90deg, #10b981, #059669)`, color: "#fff",
                        fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
                      }}
                    >
                      ✅ Approve & Receive
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

              {/* Budget Monitor Panel */}
              <div style={{
                padding: "1rem", borderRadius: "0.75rem", backgroundColor: "rgba(0,0,0,0.03)",
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem"
              }}>
                <div>
                  <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase" }}>Dept. Allocated Budget</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: theme.textMain }}>₱{Number(budgetInfo.allocatedBudget).toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase" }}>Budget Spent (Including this)</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: theme.crimson }}>₱{Number(budgetInfo.spentBudget).toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase" }}>Remaining Budget</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: budgetRemaining < 0 ? "#dc2626" : "#059669" }}>
                    ₱{budgetRemaining.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* General Metadata */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase" }}>Purpose</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{selectedPr.purpose}</span>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase" }}>Funding Source</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{selectedPr.fundingSource}</span>
                </div>
              </div>
            </div>

            {/* Official Requisition Form Wrapper */}
            <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-xl font-mono text-slate-800 space-y-4" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="border-b pb-3 flex justify-between items-center" style={{ borderBottomColor: "var(--border)" }}>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Official Requisition Form</h4>
                  <h3 className="text-sm font-bold text-slate-800" style={{ color: "var(--text-primary)" }}>PURCHASE REQUEST CHECKLIST</h3>
                </div>
                <span className="text-xs font-extrabold text-blue-800 bg-blue-50/50 px-3 py-1 rounded-full border border-blue-100/50" style={{ color: "var(--accent)", backgroundColor: "var(--accent-glass)", borderColor: "var(--border)" }}>
                  Total cost: ₱{Number(selectedPr.totalCost).toLocaleString()}
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
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
                    {selectedPr.items.map((item) => {
                      const isEditing = editingItemId === item.id;
                      const check = verifiedItems[item.id] || { specs: false, qty: false };
                      return (
                        <tr key={item.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                          {isEditing ? (
                            <>
                              {/* Edit Mode cells */}
                              <td style={{ padding: "0.75rem" }} colSpan={2}>
                                <input
                                  type="text"
                                  value={editFields.description}
                                  onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                                  placeholder="Description"
                                  style={{ width: "100%", padding: "0.4rem", borderRadius: "0.25rem", border: "1px solid #ccc", marginBottom: "0.25rem", fontSize: "0.8rem" }}
                                />
                                <input
                                  type="text"
                                  value={editFields.specification}
                                  onChange={(e) => setEditFields({ ...editFields, specification: e.target.value })}
                                  placeholder="Specs / Size Details"
                                  style={{ width: "100%", padding: "0.4rem", borderRadius: "0.25rem", border: "1px solid #ccc", fontSize: "0.8rem" }}
                                />
                              </td>
                              <td style={{ padding: "0.75rem", textAlign: "center" }}>
                                <input
                                  type="number"
                                  value={editFields.quantity}
                                  onChange={(e) => setEditFields({ ...editFields, quantity: parseInt(e.target.value) || 0 })}
                                  style={{ width: "60px", padding: "0.4rem", borderRadius: "0.25rem", border: "1px solid #ccc", fontSize: "0.8rem", textAlign: "center" }}
                                />
                                <input
                                  type="text"
                                  value={editFields.unit}
                                  onChange={(e) => setEditFields({ ...editFields, unit: e.target.value })}
                                  placeholder="UOM (e.g. mL)"
                                  style={{ width: "60px", padding: "0.4rem", borderRadius: "0.25rem", border: "1px solid #ccc", fontSize: "0.8rem", textAlign: "center", marginTop: "0.25rem" }}
                                />
                              </td>
                              <td style={{ padding: "0.75rem", textAlign: "right" }}>
                                <input
                                  type="number"
                                  value={editFields.estimatedUnitCost}
                                  onChange={(e) => setEditFields({ ...editFields, estimatedUnitCost: parseFloat(e.target.value) || 0 })}
                                  style={{ width: "80px", padding: "0.4rem", borderRadius: "0.25rem", border: "1px solid #ccc", fontSize: "0.8rem", textAlign: "right" }}
                                />
                              </td>
                              <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 700 }}>
                                ₱{(editFields.quantity * editFields.estimatedUnitCost).toLocaleString()}
                              </td>
                              <td style={{ padding: "0.75rem" }} />
                              <td style={{ padding: "0.75rem", textAlign: "center" }}>
                                <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                                  <button onClick={() => saveEdit(item.id)} style={{ padding: "0.3rem 0.6rem", borderRadius: "0.25rem", background: "#10b981", color: "#fff", border: "none", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Save</button>
                                  <button onClick={() => setEditingItemId(null)} style={{ padding: "0.3rem 0.6rem", borderRadius: "0.25rem", background: "#ef4444", color: "#fff", border: "none", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              {/* Display Mode cells */}
                              <td style={{ padding: "1rem" }}>
                                <div style={{ fontWeight: 700, color: theme.textMain }}>{item.description}</div>
                                {item.specification && (
                                  <div style={{ fontSize: "0.75rem", color: theme.textMuted }}>{item.specification}</div>
                                )}
                              </td>
                              <td style={{ padding: "1rem", textAlign: "center" }}>{item.brand || "—"}</td>
                              <td style={{ padding: "1rem", textAlign: "center", fontWeight: 600 }}>{item.quantity} {item.unit}</td>
                              <td style={{ padding: "1rem", textAlign: "right" }}>₱{Number(item.estimatedUnitCost).toLocaleString()}</td>
                              <td style={{ padding: "1rem", textAlign: "right", fontWeight: 700, color: theme.crimson }}>₱{Number(item.estimatedCost).toLocaleString()}</td>
                              
                              <td style={{ padding: "1rem", textAlign: "center" }}>
                                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                                  <button
                                    type="button"
                                    onClick={() => toggleCheck(item.id, "specs")}
                                    style={{
                                      padding: "0.2rem 0.5rem", borderRadius: "0.25rem", border: "none",
                                      background: check.specs ? "rgba(16,185,129,0.15)" : "rgba(0,0,0,0.05)",
                                      color: check.specs ? "#10b981" : theme.textMuted,
                                      fontWeight: 800, cursor: "pointer", fontSize: "0.7rem"
                                    }}
                                  >
                                    Specs {check.specs ? "✓" : "✗"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleCheck(item.id, "qty")}
                                    style={{
                                      padding: "0.2rem 0.5rem", borderRadius: "0.25rem", border: "none",
                                      background: check.qty ? "rgba(16,185,129,0.15)" : "rgba(0,0,0,0.05)",
                                      color: check.qty ? "#10b981" : theme.textMuted,
                                      fontWeight: 800, cursor: "pointer", fontSize: "0.7rem"
                                    }}
                                  >
                                    Qty {check.qty ? "✓" : "✗"}
                                  </button>
                                </div>
                              </td>
                              
                              <td style={{ padding: "1rem", textAlign: "center" }}>
                                {["Submitted", "UnderReview", "Under Review"].includes(selectedPr.status) && (
                                  <button
                                    onClick={() => startEditing(item)}
                                    style={{
                                      padding: "0.25rem 0.5rem", borderRadius: "0.35rem",
                                      background: "none", border: "1px solid rgba(0,0,0,0.1)",
                                      color: theme.crimson, fontWeight: 700, cursor: "pointer", fontSize: "0.7rem"
                                    }}
                                  >
                                    ✏️ Edit
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

            {/* Return for Revision Box */}
            {["Submitted", "UnderReview", "Under Review"].includes(selectedPr.status) && (
              <div style={{
                background: theme.glassBg, backdropFilter: "blur(20px)",
                border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
                boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1rem"
              }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: theme.textMain, margin: 0 }}>Return Request for Revision</h3>
                <p style={{ margin: 0, fontSize: "0.8rem", color: theme.textMuted }}>
                  Provide reasons or required adjustments if returning this PR to the requisitioner.
                </p>
                <textarea
                  value={revisionRemarks}
                  onChange={(e) => setRevisionRemarks(e.target.value)}
                  placeholder="Enter detailed feedback or reasons for correction..."
                  style={{
                    width: "100%", height: "90px", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid rgba(0,0,0,0.12)",
                    fontSize: "0.85rem", background: "rgba(255,255,255,0.8)", outline: "none", color: theme.textMain, fontFamily: "inherit"
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={handleReturnForRevision}
                    disabled={isProcessing}
                    style={{
                      padding: "0.6rem 1.5rem", borderRadius: "0.75rem", border: "none",
                      background: theme.crimson, color: "#fff", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(126, 25, 27, 0.15)"
                    }}
                  >
                    Returned to Requisitioner ↩
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{
            background: theme.glassBg, backdropFilter: "blur(20px)",
            border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "4rem",
            boxShadow: theme.shadow, textAlign: "center", color: theme.textMuted
          }}>
            Select a Purchase Request from the sidebar list to inspect details and perform audits.
          </div>
        )}
      </div>

      {/* ── Pre-Canvassing Form Modal ── */}
      {isPreCanvassOpen && preCanvassData && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, overflowY: "auto", padding: "2rem"
        }} className="no-print-overlay">
          <div style={{
            background: "#fff", width: "100%", maxWidth: "1000px", borderRadius: "1.25rem",
            padding: "2.5rem", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", gap: "2rem",
            maxHeight: "90vh", overflowY: "auto"
          }} id="preCanvassModal" className="print-modal-content">
            
            {/* Modal Header (Controls - Hidden on Print) */}
            <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: "1rem" }}>
              <span style={{ fontWeight: 800, color: theme.crimson, fontSize: "1.1rem" }}>📄 Pre-Canvassing Form (Appendix A Review)</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => typeof window !== "undefined" && window.print()}
                  style={{
                    padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none",
                    background: theme.crimson, color: "#fff", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer"
                  }}
                >
                  🖨️ Print Form
                </button>
                <button
                  onClick={() => setIsPreCanvassOpen(false)}
                  style={{
                    padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)",
                    background: "#fff", color: theme.textMain, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer"
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Official BSC Pre-Canvassing Form Layout */}
            <div className="printable-form" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", color: "#000" }}>
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  body * { visibility: hidden; }
                  .print-modal-content, .print-modal-content * { visibility: visible; }
                  .print-modal-content { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; padding: 0; max-height: none; overflow: visible; }
                  .no-print { display: none !important; }
                  .no-print-overlay { background: transparent !important; position: relative !important; padding: 0 !important; }
                }
              ` }} />
              
              {/* Official Header */}
              <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: "1rem" }}>
                <div style={{ fontWeight: 900, fontSize: "1.2rem" }}>BATANES STATE COLLEGE</div>
                <div style={{ fontSize: "0.8rem", textTransform: "uppercase" }}>Washington Ave., San Antonio, Basco, Batanes</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, marginTop: "0.2rem", color: theme.crimson }}>PROCUREMENT OFFICE</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, marginTop: "1rem", letterSpacing: "1px" }}>PRE-CANVASSING FORM</div>
              </div>

              {/* General Metadata */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem", borderBottom: "1px solid #ddd", paddingBottom: "1rem" }}>
                <div>
                  <div><strong>Purchase Request Ref:</strong> {preCanvassData.prNumber}</div>
                  <div><strong>Department:</strong> {preCanvassData.department}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div><strong>Date Generated:</strong> {new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  <div><strong>Estimated ABC:</strong> ₱{preCanvassData.totalCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>

              {/* Items Analysis Table */}
              <div>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 800, marginBottom: "0.5rem", borderLeft: `3px solid ${theme.crimson}`, paddingLeft: "0.5rem" }}>
                  Market Survey & Historical Pricing Analysis
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", border: "1px solid #000" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #000" }}>
                      <th style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "left" }}>Item & Specs</th>
                      <th style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "center", width: "60px" }}>Qty/UOM</th>
                      <th style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "right" }}>PR Est Cost</th>
                      <th style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "left" }}>Historical Quotes & Suppliers</th>
                      <th style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "left" }}>Previous PO Records</th>
                      <th style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "right" }}>Market Analysis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preCanvassData.items.map((item: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "0.5rem", border: "1px solid #000", verticalAlign: "top" }}>
                          <strong>{item.description}</strong>
                          {item.specification && <div style={{ fontSize: "0.68rem", color: "#6b7280" }}>{item.specification}</div>}
                        </td>
                        <td style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "center", verticalAlign: "top" }}>
                          {item.quantity} {item.unit}
                        </td>
                        <td style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "right", verticalAlign: "top", fontWeight: 700 }}>
                          ₱{item.estimatedUnitCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "0.5rem", border: "1px solid #000", verticalAlign: "top" }}>
                          {item.historicalQuotes.length === 0 ? (
                            <span style={{ color: "#6b7280" }}>No historical quotes</span>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                              {item.historicalQuotes.map((q: any, qidx: number) => (
                                <div key={qidx}>
                                  • {q.supplier}: <strong>₱{q.price.toLocaleString()}</strong> ({new Date(q.date).toLocaleDateString()})
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "0.5rem", border: "1px solid #000", verticalAlign: "top" }}>
                          {item.previousOrders.length === 0 ? (
                            <span style={{ color: "#6b7280" }}>No previous orders</span>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                              {item.previousOrders.map((o: any, oidx: number) => (
                                <div key={oidx}>
                                  • PO {o.poNumber} ({o.supplier}): <strong>₱{o.price.toLocaleString()}</strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "0.5rem", border: "1px solid #000", textAlign: "right", verticalAlign: "top" }}>
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

              {/* Supplier References & Market Recommendations */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
                <div style={{ border: "1px solid #000", padding: "1rem", borderRadius: "0.5rem", fontSize: "0.8rem" }}>
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
                <div style={{ border: "1px solid #000", padding: "1rem", borderRadius: "0.5rem", fontSize: "0.8rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem 0", fontWeight: 800 }}>Pre-Canvassing Recommendation:</h4>
                  <p style={{ margin: 0, lineHeight: 1.4 }}>
                    Based on market survey data and Batanes State College historical procurement database records, the estimated values are aligned. Recommended to proceed with creating a formal Request for Quotation (RFQ) for bidding.
                  </p>
                </div>
              </div>

              {/* Signatures Panel */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2rem", marginTop: "3rem", textAlign: "center", fontSize: "0.8rem" }}>
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
    </div>
  );
}
