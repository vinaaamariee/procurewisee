"use client";

import React, { useState } from "react";
import { submitPrAction, resubmitPrAction } from "@/app/actions/pr";
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
            pr.id === id ? { ...pr, status: res.pr.status } : pr
          )
        );
        setSuccessMessage("Purchase Request submitted successfully!");
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
      setErrorMessage("Please fill in description, unit, positive quantity, and unit cost for all items.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = editableItems.map((item) => ({
        description: item.description.trim(),
        brand: item.brand.trim() || undefined,
        quantity: Number(item.quantity),
        unit: item.unit.trim(),
        estimatedUnitCost: Number(item.estimatedUnitCost),
        specification: item.specification.trim() || undefined,
      }));

      const res = await resubmitPrAction(selectedPr.id, payload);
      if (res.success && res.pr) {
        setPrs((prev) =>
          prev.map((p) =>
            p.id === selectedPr.id
              ? {
                  ...p,
                  status: res.pr.status,
                  totalCost: Number(res.pr.totalCost),
                  estimatedBudget: Number(res.pr.estimatedBudget),
                  items: (res.pr.items as any[]).map((item: any) => ({
                    id: item.id,
                    description: item.description,
                    brand: item.brand,
                    quantity: item.quantity,
                    unit: item.unit.abbreviation,
                    estimatedUnitCost: Number(item.estimatedUnitCost),
                    estimatedCost: Number(item.estimatedCost),
                    specification: item.specification,
                    product: item.product ? {
                      id: item.product.id,
                      name: item.product.name,
                      category: "",
                      unitOfMeasure: item.unit.abbreviation
                    } : null
                  })),
                  statusHistory: [
                    {
                      id: Date.now(),
                      status: "Submitted",
                      remarks: "Resubmitted for review.",
                      createdAt: new Date().toISOString(),
                      changedBy: { fullName: p.requestedBy?.fullName || "Requisitioner" },
                    },
                    ...p.statusHistory,
                  ],
                }
              : p
          )
        );
        setIsEditing(false);
        setSuccessMessage("Purchase Request resubmitted successfully for approval!");
      } else {
        setErrorMessage(res.error || "Failed to resubmit Purchase Request.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
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
      case "Rejected":
        return { bg: "rgba(127, 29, 29, 0.15)", text: "#7f1d1d" };
      default:
        return { bg: "rgba(0, 0, 0, 0.05)", text: "#000" };
    }
  };

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

  // Calculate current revised total cost
  const currentTotalCost = isEditing
    ? editableItems.reduce((sum, item) => sum + Number(item.quantity) * Number(item.estimatedUnitCost), 0)
    : selectedPr
    ? Number(selectedPr.totalCost)
    : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="lg:grid-cols-3">
      {/* Sidebar: PR List */}
      <div style={{
        background: theme.glassBg, backdropFilter: "blur(20px)",
        border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem",
        boxShadow: theme.shadow, height: "calc(100vh - 200px)", overflowY: "auto"
      }} className="lg:col-span-1">
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, marginBottom: "1rem" }}>My Purchase Requests</h2>
        {prs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: theme.textMuted }}>
            No Purchase Requests found.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {prs.map((pr) => {
              const active = pr.id === selectedPrId;
              const statusColors = getStatusColor(pr.status);
              return (
                <button
                  key={pr.id}
                  disabled={isEditing}
                  onClick={() => {
                    setSelectedPrId(pr.id);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  style={{
                    width: "100%", textAlign: "left", padding: "1rem", borderRadius: "0.75rem",
                    border: active ? `1px solid ${theme.crimson}` : "1px solid rgba(0,0,0,0.06)",
                    background: active ? "rgba(126, 25, 27, 0.04)" : "rgba(255,255,255,0.6)",
                    cursor: isEditing ? "not-allowed" : "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: "0.4rem",
                    opacity: isEditing && !active ? 0.5 : 1
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <span style={{ fontWeight: 800, color: active ? theme.crimson : theme.textMain }}>{pr.prNumber}</span>
                    <span style={{
                      padding: "0.2rem 0.5rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700,
                      backgroundColor: statusColors.bg, color: statusColors.text
                    }}>
                       {["ReturnedForRevision", "Returned for Revision"].includes(pr.status) ? "Returned for Revision" : pr.status}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: theme.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                    {pr.purpose}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: theme.textMuted, marginTop: "0.2rem" }}>
                    <span>{new Date(pr.requestDate).toLocaleDateString()}</span>
                    <span style={{ fontWeight: 600, color: theme.textMain }}>₱{Number(pr.totalCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main View: PR Detail Panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} className="lg:col-span-2">
        {selectedPr ? (
          <>
            {/* Approval Details Card (Section 6) */}
            {["Approved", "Received", "ReturnedForRevision", "Returned for Revision", "Rejected"].includes(selectedPr.status) && (
              <div style={{
                background: "rgba(255,255,255,0.9)",
                borderLeft: `5px solid ${
                  selectedPr.status === "Approved" || selectedPr.status === "Received" ? "#10b981" : "#ef4444"
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
                    backgroundColor: getStatusColor(selectedPr.status).bg,
                    color: getStatusColor(selectedPr.status).text
                  }}>
                    {["ReturnedForRevision", "Returned for Revision"].includes(selectedPr.status) ? "Returned for Revision" : selectedPr.status}
                  </span>
                </div>
                <div style={{ fontSize: "0.82rem", color: theme.textMain }}>
                  <strong>Remarks / Reasons:</strong>{" "}
                  <span className="italic font-semibold">
                    "{selectedPr.statusHistory?.[0]?.remarks 
                      || selectedPr.remarks 
                      || "No remarks provided."}"
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: theme.textMuted }}>
                  Reviewed by: {selectedPr.statusHistory?.[0]?.changedBy?.fullName || "Administrative Approver"} on {selectedPr.statusHistory?.[0]?.createdAt ? new Date(selectedPr.statusHistory[0].createdAt).toLocaleString() : "Date N/A"}
                </div>
              </div>
            )}

            {/* PR Status & Primary Actions Card */}
            <div style={{
              background: theme.glassBg, backdropFilter: "blur(20px)",
              border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
              boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: theme.textMain, margin: 0 }}>{selectedPr.prNumber}</h2>
                    {selectedPr.trackingNumber && (
                      <span style={{
                        padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 800,
                        backgroundColor: "rgba(79, 70, 229, 0.15)", color: "#4f46e5", border: "1px solid rgba(79, 70, 229, 0.2)"
                      }}>
                        {selectedPr.trackingNumber}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: theme.textMuted }}>
                    Requested on {new Date(selectedPr.requestDate).toLocaleString()}
                  </p>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{
                    padding: "0.35rem 1rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 800,
                    backgroundColor: getStatusColor(selectedPr.status).bg, color: getStatusColor(selectedPr.status).text
                  }}>
                    Status: {["ReturnedForRevision", "Returned for Revision"].includes(selectedPr.status) ? "Returned for Revision" : selectedPr.status}
                  </span>
                  
                  {!isEditing && (
                    <button
                      onClick={() => window.print()}
                      className="no-print"
                      style={{
                        padding: "0.5rem 1.25rem", borderRadius: "0.75rem", border: `1px solid ${theme.glassBorder}`,
                        background: "#fff", color: theme.textMain,
                        fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      🖨️ Print Request
                    </button>
                  )}

                  {selectedPr.status === "Draft" && !isEditing && (
                    <button
                      onClick={() => handleSubmit(selectedPr.id)}
                      disabled={isSubmitting}
                      style={{
                        padding: "0.5rem 1.25rem", borderRadius: "0.75rem", border: "none",
                        background: `linear-gradient(90deg, ${theme.crimson}, ${theme.goldDark})`, color: "#fff",
                        fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s",
                        boxShadow: "0 4px 12px rgba(126, 25, 27, 0.2)"
                      }}
                    >
                      {isSubmitting ? "Submitting..." : "🚀 Submit PR for Review"}
                    </button>
                  )}

                  {["ReturnedForRevision", "Returned for Revision"].includes(selectedPr.status) && !isEditing && (
                    <button
                      onClick={handleStartEdit}
                      style={{
                        padding: "0.5rem 1.25rem", borderRadius: "0.75rem", border: "none",
                        background: `linear-gradient(90deg, ${theme.crimson}, ${theme.goldDark})`, color: "#fff",
                        fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s",
                        boxShadow: "0 4px 12px rgba(126, 25, 27, 0.2)"
                      }}
                    >
                      📝 Edit & Resubmit
                    </button>
                  )}

                  {isEditing && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                        style={{
                          padding: "0.5rem 1.25rem", borderRadius: "0.75rem", border: `1px solid ${theme.glassBorder}`,
                          background: "#fff", color: theme.textMain,
                          fontWeight: 700, fontSize: "0.8rem", cursor: "pointer"
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleResubmit}
                        disabled={isSubmitting}
                        style={{
                          padding: "0.5rem 1.25rem", borderRadius: "0.75rem", border: "none",
                          background: "linear-gradient(90deg, #10b981, #059669)", color: "#fff",
                          fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
                        }}
                      >
                        {isSubmitting ? "Submitting..." : "💾 Submit Revision"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#dc2626", fontSize: "0.8rem", fontWeight: 600 }}>
                  ⚠️ {errorMessage}
                </div>
              )}

              {successMessage && (
                <div style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#059669", fontSize: "0.8rem", fontWeight: 600 }}>
                  ✅ {successMessage}
                </div>
              )}

              {/* Status workflow timeline visualization */}
              <div>
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "1rem" }}>Procurement Flow Progress</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", position: "relative", marginBottom: "1rem" }}>
                  {[
                    { label: "Draft", active: true, error: false, est: "Creation" },
                    { label: "Submitted", active: ["Submitted", "Received", "UnderReview", "Under Review", "ReturnedForRevision", "Returned for Revision", "Approved", "Rejected"].includes(selectedPr.status), error: false, est: "Within 24h" },
                    { label: "Received", active: ["Received", "UnderReview", "Under Review", "Approved"].includes(selectedPr.status) || selectedPr.trackingNumber !== null, error: false, est: "1-2 Days" },
                    { label: "Under Review", active: ["UnderReview", "Under Review", "Approved", "ReturnedForRevision", "Returned for Revision", "Rejected"].includes(selectedPr.status), error: false, est: "2-3 Days" },
                    { label: selectedPr.status === "ReturnedForRevision" || selectedPr.status === "Returned for Revision" ? "Returned for Revision" : selectedPr.status === "Rejected" ? "Rejected" : "Approved", active: ["Approved", "ReturnedForRevision", "Returned for Revision", "Rejected"].includes(selectedPr.status), error: ["ReturnedForRevision", "Returned for Revision", "Rejected"].includes(selectedPr.status), est: "3-5 Days" }
                  ].map((step, idx) => (
                    <div key={idx} style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: step.error ? "#ef4444" : step.active ? `linear-gradient(135deg, ${theme.crimson}, ${theme.gold})` : "rgba(0,0,0,0.06)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: step.active ? "#fff" : theme.textMuted, fontSize: "0.7rem", fontWeight: 800
                      }}>
                        {step.error ? "⚠️" : idx + 1}
                      </div>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: step.error ? "#ef4444" : step.active ? theme.textMain : theme.textMuted }}>
                        {step.label}
                      </span>
                      <span style={{ fontSize: "0.55rem", fontWeight: 600, color: theme.textMuted, marginTop: "-0.2rem" }}>
                        {step.est}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Estimated Turnaround Time (SLA) Guidance Banner */}
                <div style={{
                  padding: "0.875rem 1.25rem", borderRadius: "0.75rem",
                  backgroundColor: "var(--accent-glass)",
                  border: "1px solid var(--border-accent)",
                  marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.25rem"
                }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    ⏳ Estimated SLA Turnaround Timeline
                  </span>
                  <p style={{ fontSize: "0.68rem", color: theme.textMuted, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                    Standard processing durations: 
                    <strong> Submitted</strong> (Within 24 Hours) &bull;
                    <strong> Received</strong> (1-2 Working Days) &bull;
                    <strong> Under Review</strong> (2-3 Working Days) &bull;
                    <strong> Approved</strong> (3-5 Working Days). Total Target Cycle: 7-10 Working Days.
                  </p>
                </div>
              </div>

              {/* Status History Logs / Remarks */}
              {selectedPr.statusHistory && selectedPr.statusHistory.length > 0 && (
                <div style={{
                  padding: "1.25rem", borderRadius: "0.75rem",
                  backgroundColor: "rgba(0,0,0,0.01)",
                  border: `1px solid ${theme.glassBorder}`,
                  marginTop: "0.5rem"
                }}>
                  <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: theme.textMain, textTransform: "uppercase", marginBottom: "0.75rem", letterSpacing: "0.5px" }}>
                    Workflow Remarks & Feedback History
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {selectedPr.statusHistory.map((h, idx) => (
                      <div key={idx} style={{ fontSize: "0.8rem", borderBottom: idx < selectedPr.statusHistory.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none", paddingBottom: "0.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                          <span style={{ color: ['ReturnedForRevision', 'Returned for Revision'].includes(h.status) ? '#ef4444' : h.status === 'Rejected' ? '#7f1d1d' : theme.crimson }}>
                            {['ReturnedForRevision', 'Returned for Revision'].includes(h.status) ? 'Returned for Revision' : h.status === 'UnderReview' ? 'Under Review' : h.status}
                          </span>
                          <span style={{ color: theme.textMuted, fontSize: "0.7rem" }}>{new Date(h.createdAt).toLocaleString()}</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: theme.textMuted, marginTop: "0.15rem" }}>By: {h.changedBy?.fullName || "Administrative Approver"}</div>
                        {h.remarks && (
                          <div style={{
                            fontStyle: "italic", marginTop: "0.35rem", color: theme.textMain,
                            padding: "0.4rem 0.6rem", borderRadius: "0.35rem", backgroundColor: "rgba(0,0,0,0.02)",
                            borderLeft: `3px solid ${['ReturnedForRevision', 'Returned for Revision'].includes(h.status) ? '#ef4444' : h.status === 'Rejected' ? '#7f1d1d' : theme.goldDark}`
                          }}>
                            "{h.remarks}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Officer Assignment Info (if any) */}
            <div style={{
              background: theme.glassBg, backdropFilter: "blur(20px)",
              border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem",
              boxShadow: theme.shadow, display: "flex", alignItems: "center", gap: "1rem"
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 800, fontSize: "0.9rem"
              }}>
                {selectedPr.assignedOfficer ? selectedPr.assignedOfficer.fullName[0].toUpperCase() : "P"}
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>Assigned Procurement Officer</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: theme.textMain }}>
                  {selectedPr.assignedOfficer ? selectedPr.assignedOfficer.fullName : "Awaiting Assignment"}
                </span>
                {selectedPr.assignedOfficer && (
                  <span style={{ display: "block", fontSize: "0.75rem", color: theme.textMuted }}>
                    {selectedPr.assignedOfficer.email}
                  </span>
                )}
              </div>
            </div>

            {/* Reengineered Official Government Purchase Request (PR) Layout */}
            <DocumentLayout title="PURCHASE REQUEST" documentRef={selectedPr.prNumber} printAreaId="pr-print-document">
              <div className="bg-white border-2 border-slate-400 p-8 shadow-lg max-w-4xl mx-auto rounded-none font-mono text-slate-800 space-y-6" id="pr-print-document" style={{ color: '#000', backgroundColor: '#fff' }}>
                
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
                  <div>Office/Section: <span className="underline">{selectedPr.office || "Procurement Office"}</span></div>
                </div>
                <div className="p-2 space-y-1">
                  <div>PR No.: <span className="font-extrabold underline">{selectedPr.prNumber}</span></div>
                  <div>Date: <span className="underline">{new Date(selectedPr.requestDate).toLocaleDateString()}</span></div>
                  <div>Fund Cluster: <span className="underline">{selectedPr.fundingSource || "GAA"}</span></div>
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
                    {/* Editable Items vs Static View */}
                    {isEditing ? (
                      editableItems.map((item, idx) => (
                        <tr key={item.id || idx} className="border-b border-slate-400 divide-x divide-slate-800 font-semibold text-[10px]">
                          <td className="p-2 text-center">{idx + 1}</td>
                          <td className="p-1">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                              className="w-full p-1 border border-slate-300 font-mono text-[10px]"
                            />
                          </td>
                          <td className="p-1 space-y-1">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                              placeholder="Item description"
                              className="w-full p-1 border border-slate-300 font-mono font-bold text-[10px]"
                            />
                            <textarea
                              value={item.specification}
                              onChange={(e) => handleItemChange(idx, "specification", e.target.value)}
                              placeholder="Specifications"
                              rows={2}
                              className="w-full p-1 border border-slate-300 font-mono text-[9px]"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                              className="w-full p-1 border border-slate-300 font-mono text-center text-[10px]"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="number"
                              value={item.estimatedUnitCost}
                              onChange={(e) => handleItemChange(idx, "estimatedUnitCost", Number(e.target.value))}
                              className="w-full p-1 border border-slate-300 font-mono text-right text-[10px]"
                            />
                          </td>
                          <td className="p-2 text-right tabular-nums font-bold">
                            ₱{(item.quantity * item.estimatedUnitCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      selectedPr.items.map((item, idx) => (
                        <tr key={item.id} className="border-b border-slate-400 divide-x divide-slate-800 font-semibold">
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
                      ))
                    )}
                    {/* Purpose row */}
                    <tr className="border-t border-slate-800 font-extrabold text-[11px]">
                      <td colSpan={6} className="p-3 bg-slate-50 text-left border-b border-slate-800">
                        Purpose: <span className="underline normal-case italic font-bold">{selectedPr.purpose}</span>
                      </td>
                    </tr>
                    {/* Summary row */}
                    <tr className="font-black text-xs">
                      <td colSpan={5} className="p-2 text-right uppercase">Total Estimated Budget:</td>
                      <td className="p-2 text-right tabular-nums text-red-700">₱{currentTotalCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures block */}
              <div className="grid grid-cols-2 border border-slate-800 divide-x divide-slate-800 text-[11px] font-bold">
                <div className="p-4 space-y-4">
                  <span>Requested By:</span>
                  <div className="pt-6 text-center">
                    <span className="block font-black underline uppercase">{selectedPr.requestedBy?.fullName || "End-User planner"}</span>
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
          </>
        ) : (
          <div style={{
            background: theme.glassBg, backdropFilter: "blur(20px)",
            border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "4rem",
            boxShadow: theme.shadow, textAlign: "center", color: theme.textMuted
          }}>
            Select a Purchase Request from the sidebar to inspect its details and actions.
          </div>
        )}
      </div>
    </div>
  );
}
