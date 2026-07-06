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
  requestedBy: UserProfile | null;
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
                     {/* Reengineered Official Government Purchase Request (PR) Layout */}
            <div className="bg-white border-2 border-slate-400 p-8 shadow-lg max-w-4xl mx-auto rounded-none font-mono text-slate-800 space-y-6" id="pr-print-document" style={{ color: '#000', backgroundColor: '#fff' }}>
              
              {/* Header Box */}
              <div className="text-center space-y-1 pb-4 border-b-2 border-slate-800">
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
                    {selectedPr.items.map((item, idx) => (
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
                        <td className="p-2 text-right tabular-nums">₱{Number(item.estimatedUnitCost).toLocaleString()}</td>
                        <td className="p-2 text-right tabular-nums font-bold">₱{Number(item.estimatedCost).toLocaleString()}</td>
                      </tr>
                    ))}
                    {/* Purpose row */}
                    <tr className="border-t border-slate-800 font-extrabold text-[11px]">
                      <td colSpan={6} className="p-3 bg-slate-50 text-left border-b border-slate-800">
                        Purpose: <span className="underline normal-case italic font-bold">{selectedPr.purpose}</span>
                      </td>
                    </tr>
                    {/* Summary row */}
                    <tr className="font-black text-xs">
                      <td colSpan={5} className="p-2 text-right uppercase">Total Estimated Budget:</td>
                      <td className="p-2 text-right tabular-nums text-red-700">₱{Number(selectedPr.totalCost).toLocaleString()}</td>
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
