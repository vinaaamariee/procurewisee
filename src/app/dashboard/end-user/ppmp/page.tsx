"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createPpmpAction, submitPpmpAction, getPpmpList } from "@/app/actions/ppmp";
import { PpmpStatus } from "@/generated/prisma/client";

interface PpmpItem {
  generalDescription: string;
  quantity: number;
  unit: string;
  estimatedUnitCost: number;
  schedule: string;
}

export default function PpmpPage() {
  const [ppmps, setPpmps] = useState<any[]>([]);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [ppmpNumber, setPpmpNumber] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [office, setOffice] = useState("");
  const [fundingSource, setFundingSource] = useState("GAA 2026");
  const [fiscalYear, setFiscalYear] = useState(2026);
  const [estimatedBudget, setEstimatedBudget] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<PpmpItem[]>([
    { generalDescription: "", quantity: 1, unit: "pcs", estimatedUnitCost: 0, schedule: "Q1" }
  ]);

  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadPpmps = async () => {
    try {
      const data = await getPpmpList();
      setPpmps(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPpmps();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { generalDescription: "", quantity: 1, unit: "pcs", estimatedUnitCost: 0, schedule: "Q1" }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, key: keyof PpmpItem, value: any) => {
    const updated = items.map((item, i) => {
      if (i === index) {
        return { ...item, [key]: value };
      }
      return item;
    });
    setItems(updated);

    // Recalculate total estimated budget
    const total = updated.reduce((sum, item) => sum + (item.quantity * item.estimatedUnitCost), 0);
    setEstimatedBudget(total);
  };

  const handleCreatePpmp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setMessage("");

    if (items.some(item => !item.generalDescription.trim() || item.estimatedUnitCost <= 0)) {
      setErrorMsg("All items must have a description and a positive unit cost.");
      return;
    }

    startTransition(async () => {
      const res = await createPpmpAction({
        ppmpNumber,
        projectTitle,
        department,
        office,
        fundingSource,
        fiscalYear,
        estimatedBudget,
        remarks,
        items,
      });

      if (res.success) {
        setMessage(`PPMP ${ppmpNumber} successfully created in Draft status.`);
        setIsNewOpen(false);
        // Reset form
        setPpmpNumber("");
        setProjectTitle("");
        setItems([{ generalDescription: "", quantity: 1, unit: "pcs", estimatedUnitCost: 0, schedule: "Q1" }]);
        setEstimatedBudget(0);
        loadPpmps();
      } else {
        setErrorMsg(res.error || "Failed to create PPMP.");
      }
    });
  };

  const handleSubmitPpmp = async (id: number, num: string) => {
    if (!confirm(`Are you sure you want to submit PPMP ${num} for review?`)) return;
    const res = await submitPpmpAction(id);
    if (res.success) {
      alert(`PPMP ${num} submitted successfully!`);
      loadPpmps();
    } else {
      alert(res.error || "Submission failed.");
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", fontFamily: '"Inter", sans-serif' }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>PPMP Management</h1>
          <p style={{ marginTop: "0.25rem", fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
            Create and track Project Procurement Management Plans (PPMPs) for Batanes State College.
          </p>
        </div>
        <button
          onClick={() => setIsNewOpen(true)}
          style={{
            padding: "0.6rem 1.4rem", borderRadius: "999px", border: "none", cursor: "pointer",
            background: "linear-gradient(90deg, #7e191b 0%, #b88a1b 100%)", color: "white",
            fontSize: "0.85rem", fontWeight: 700, boxShadow: "0 4px 12px rgba(184, 138, 27, 0.2)"
          }}
        >
          + Create New PPMP
        </button>
      </div>

      {message && (
        <div style={{ padding: "1rem", borderRadius: "0.75rem", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#059669", fontSize: "0.85rem", fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* List of PPMPs */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1.25rem",
        overflow: "hidden", boxShadow: "var(--shadow-card)"
      }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", backgroundColor: "rgba(255,255,255,0.02)" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Planning Logs</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                <th style={{ padding: "1rem 1.5rem", textAlign: "left" }}>PPMP Number</th>
                <th style={{ padding: "1rem 1.5rem", textAlign: "left" }}>Project Title</th>
                <th style={{ padding: "1rem 1.5rem", textAlign: "left" }}>Department</th>
                <th style={{ padding: "1rem 1.5rem", textAlign: "right" }}>Budget Limit</th>
                <th style={{ padding: "1rem 1.5rem", textAlign: "center" }}>Status</th>
                <th style={{ padding: "1rem 1.5rem", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ppmps.map(ppmp => (
                <tr key={ppmp.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem 1.5rem", fontWeight: 700, color: "var(--accent)" }}>{ppmp.ppmpNumber}</td>
                  <td style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>{ppmp.projectTitle}</td>
                  <td style={{ padding: "1rem 1.5rem" }}>{ppmp.department}</td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "right", fontWeight: 700 }}>₱{Number(ppmp.estimatedBudget).toLocaleString()}</td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                    <span style={{
                      padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700,
                      backgroundColor: ppmp.status === "Approved" ? "rgba(16, 185, 129, 0.1)" : ppmp.status === "Submitted" ? "rgba(220, 179, 83, 0.1)" : "rgba(107, 114, 128, 0.1)",
                      color: ppmp.status === "Approved" ? "#059669" : ppmp.status === "Submitted" ? "#b88a1b" : "var(--text-secondary)",
                    }}>
                      {ppmp.status}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                    {ppmp.status === "Draft" ? (
                      <button
                        onClick={() => handleSubmitPpmp(ppmp.id, ppmp.ppmpNumber)}
                        style={{
                          padding: "0.35rem 0.85rem", borderRadius: "8px", border: "1px solid var(--border)",
                          backgroundColor: "#7e191b", color: "#white", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700,
                          boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                        }}
                        className="bg-[#7e191b] text-white hover:brightness-110"
                      >
                        Submit Plan
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>No Actions</span>
                    )}
                  </td>
                </tr>
              ))}
              {ppmps.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                    No Project Procurement Management Plans registered. Click "Create New PPMP" to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isNewOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
        }}>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1.25rem",
            maxWidth: "700px", width: "100%", padding: "2rem", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.25rem" }}>Create Project Procurement Management Plan</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>Configure project metadata and schedule items.</p>

            {errorMsg && (
              <div style={{ padding: "0.75rem", borderRadius: "8px", background: "rgba(225, 29, 72, 0.1)", border: "1px solid rgba(225, 29, 72, 0.2)", color: "#e11d48", fontSize: "0.8rem", fontWeight: 600, marginBottom: "1rem" }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreatePpmp} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.8rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>PPMP Number *</label>
                  <input
                    type="text" required placeholder="E.g., PPMP-2026-ICT-001"
                    value={ppmpNumber} onChange={(e) => setPpmpNumber(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-deep)", color: "var(--text-primary)", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Project Title *</label>
                  <input
                    type="text" required placeholder="E.g., ICT Equipment Upgrades"
                    value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-deep)", color: "var(--text-primary)", outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Department / Unit *</label>
                  <input
                    type="text" required placeholder="E.g., ICT Department"
                    value={department} onChange={(e) => setDepartment(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-deep)", color: "var(--text-primary)", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Office *</label>
                  <input
                    type="text" required placeholder="E.g., ICTO"
                    value={office} onChange={(e) => setOffice(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-deep)", color: "var(--text-primary)", outline: "none" }}
                  />
                </div>
              </div>

              {/* Items list */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <label style={{ fontWeight: 800, color: "var(--text-primary)" }}>Procurement Requirements Table</label>
                  <button
                    type="button" onClick={handleAddItem}
                    style={{ padding: "0.3rem 0.8rem", borderRadius: "6px", border: "1px solid #ca8a04", background: "none", color: "#ca8a04", fontWeight: 700, cursor: "pointer", fontSize: "0.75rem" }}
                  >
                    + Add Item Row
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "250px", overflowY: "auto", paddingRight: "0.25rem" }}>
                  {items.map((item, index) => (
                    <div key={index} style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1.25fr 1fr auto", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                      <input
                        type="text" required placeholder="General Description"
                        value={item.generalDescription} onChange={(e) => handleItemChange(index, "generalDescription", e.target.value)}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-deep)", color: "var(--text-primary)", outline: "none" }}
                      />
                      <input
                        type="number" required placeholder="Qty" min="1"
                        value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-deep)", color: "var(--text-primary)", outline: "none" }}
                      />
                      <input
                        type="text" required placeholder="Unit"
                        value={item.unit} onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-deep)", color: "var(--text-primary)", outline: "none" }}
                      />
                      <input
                        type="number" required placeholder="Cost" min="0"
                        value={item.estimatedUnitCost} onChange={(e) => handleItemChange(index, "estimatedUnitCost", parseFloat(e.target.value) || 0)}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-deep)", color: "var(--text-primary)", outline: "none" }}
                      />
                      <select
                        value={item.schedule} onChange={(e) => handleItemChange(index, "schedule", e.target.value)}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-deep)", color: "var(--text-primary)", cursor: "pointer", outline: "none" }}
                      >
                        <option value="Q1">Q1</option>
                        <option value="Q2">Q2</option>
                        <option value="Q3">Q3</option>
                        <option value="Q4">Q4</option>
                      </select>
                      <button
                        type="button" onClick={() => handleRemoveItem(index)}
                        style={{ background: "none", border: "none", color: "#e11d48", fontWeight: 900, cursor: "pointer", fontSize: "1.1rem", padding: "0.25rem" }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem", fontWeight: 700, fontSize: "0.95rem" }}>
                  <span>Total Estimated Budget: <strong style={{ color: "#7e191b" }}>₱{estimatedBudget.toLocaleString()}</strong></span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1.25rem", marginTop: "0.5rem" }}>
                <button
                  type="button" onClick={() => setIsNewOpen(false)}
                  style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border)", background: "rgba(0,0,0,0.04)", color: "var(--text-primary)", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={isPending}
                  style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", border: "none", background: "#7e191b", color: "white", cursor: "pointer", fontWeight: 700 }}
                >
                  {isPending ? "Drafting..." : "Save PPMP Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
