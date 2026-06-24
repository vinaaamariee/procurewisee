"use client";

import React, { useState } from "react";
import { submitPrAction } from "@/app/actions/pr";

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
  items: PurchaseRequestItem[];
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

  const selectedPr = prs.find((pr) => pr.id === selectedPrId);

  const handleSubmit = async (id: number) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await submitPrAction(id);
      if (res.success && res.pr) {
        // Update local state status to Submitted
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
                  <div style={{ fontSize: "0.78rem", color: theme.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                    {pr.purpose}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: theme.textMuted, marginTop: "0.2rem" }}>
                    <span>{new Date(pr.requestDate).toLocaleDateString()}</span>
                    <span style={{ fontWeight: 600, color: theme.textMain }}>₱{Number(pr.totalCost).toLocaleString()}</span>
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
                    Status: {selectedPr.status}
                  </span>
                  
                  {selectedPr.status === "Draft" && (
                    <button
                      onClick={() => handleSubmit(selectedPr.id)}
                      disabled={isSubmitting}
                      style={{
                        padding: "0.5rem 1.25rem", borderRadius: "0.75rem", border: "none",
                        background: `linear-gradient(90deg, ${theme.crimson}, ${theme.goldDark})`, color: "#fff",
                        fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s",
                        boxShadow: "0 4px 12px rgba(126, 25, 27, 0.2)"
                      }}
                      className="hover:scale-105 duration-200"
                    >
                      {isSubmitting ? "Submitting..." : "🚀 Submit PR for Review"}
                    </button>
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", position: "relative" }}>
                  {[
                    { label: "Draft", active: true },
                    { label: "Submitted", active: ["Submitted", "UnderReview", "Under Review", "ReturnedForRevision", "Returned for Revision", "Approved", "Received"].includes(selectedPr.status) },
                    { label: "Audited & Approved", active: ["Approved", "Received"].includes(selectedPr.status) },
                    { label: "Received (PROC # Issued)", active: selectedPr.status === "Received" }
                  ].map((step, idx) => (
                    <div key={idx} style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: step.active ? `linear-gradient(135deg, ${theme.crimson}, ${theme.gold})` : "rgba(0,0,0,0.06)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: step.active ? "#fff" : theme.textMuted, fontSize: "0.7rem", fontWeight: 800
                      }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: step.active ? theme.textMain : theme.textMuted }}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>Purpose / Description</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: theme.textMain }}>{selectedPr.purpose}</span>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>Funding Source</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: theme.textMain }}>{selectedPr.fundingSource}</span>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>Department / Office</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: theme.textMain }}>{selectedPr.department} ({selectedPr.office})</span>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>Linked PPMP</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: theme.textMain }}>
                    {selectedPr.ppmp ? `${selectedPr.ppmp.ppmpNumber} - ${selectedPr.ppmp.projectTitle}` : "None"}
                  </span>
                </div>
              </div>

              {selectedPr.remarks && (
                <div style={{
                  padding: "1rem", borderRadius: "0.75rem",
                  backgroundColor: selectedPr.status.includes("Revision") ? "rgba(239, 68, 68, 0.05)" : "rgba(0,0,0,0.03)",
                  borderLeft: `4px solid ${selectedPr.status.includes("Revision") ? "#ef4444" : theme.gold}`,
                }}>
                  <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: selectedPr.status.includes("Revision") ? "#ef4444" : theme.textMain, textTransform: "uppercase", marginBottom: "0.25rem" }}>
                    Revision Logs & Remarks
                  </span>
                  <pre style={{ margin: 0, fontSize: "0.8rem", color: theme.textMain, fontFamily: "inherit", whiteSpace: "pre-wrap" }}>
                    {selectedPr.remarks}
                  </pre>
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

            {/* Line Items Card */}
            <div style={{
              background: theme.glassBg, backdropFilter: "blur(20px)",
              border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", overflow: "hidden",
              boxShadow: theme.shadow
            }}>
              <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: theme.textMain, margin: 0 }}>PR Requisition Items</h3>
                <span style={{ fontSize: "0.9rem", fontWeight: 800, color: theme.crimson }}>
                  Total Estimated: ₱{Number(selectedPr.totalCost).toLocaleString()}
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <th style={{ padding: "0.75rem 1.25rem", textAlign: "left", color: theme.textMuted }}>Product Description</th>
                      <th style={{ padding: "0.75rem 1.25rem", textAlign: "left", color: theme.textMuted }}>Brand</th>
                      <th style={{ padding: "0.75rem 1.25rem", textAlign: "center", color: theme.textMuted }}>Quantity</th>
                      <th style={{ padding: "0.75rem 1.25rem", textAlign: "center", color: theme.textMuted }}>Unit</th>
                      <th style={{ padding: "0.75rem 1.25rem", textAlign: "right", color: theme.textMuted }}>Unit Cost</th>
                      <th style={{ padding: "0.75rem 1.25rem", textAlign: "right", color: theme.textMuted }}>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPr.items.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                        <td style={{ padding: "1rem 1.25rem" }}>
                          <div style={{ fontWeight: 700, color: theme.textMain }}>{item.description}</div>
                          {item.specification && (
                            <div style={{ fontSize: "0.75rem", color: theme.textMuted, marginTop: "0.15rem" }}>{item.specification}</div>
                          )}
                        </td>
                        <td style={{ padding: "1rem 1.25rem", color: theme.textMain }}>{item.brand || "—"}</td>
                        <td style={{ padding: "1rem 1.25rem", textAlign: "center", fontWeight: 600 }}>{item.quantity}</td>
                        <td style={{ padding: "1rem 1.25rem", textAlign: "center", color: theme.textMuted }}>{item.unit}</td>
                        <td style={{ padding: "1rem 1.25rem", textAlign: "right", fontWeight: 500 }}>₱{Number(item.estimatedUnitCost).toLocaleString()}</td>
                        <td style={{ padding: "1rem 1.25rem", textAlign: "right", fontWeight: 700, color: theme.crimson }}>₱{Number(item.estimatedCost).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
