"use client";

import React, { useState } from "react";
import { createPoFromAwardAction, updatePoAction, approvePoAction } from "@/app/actions/po";

interface Supplier {
  id: number;
  companyName: string;
  businessAddress: string;
  tin: string | null;
}

interface Rfq {
  id: number;
  rfqNumber: string;
  title: string;
}

interface Canvas {
  id: number;
  rfqId: number;
  rfq: Rfq;
}

interface Quote {
  id: number;
  totalQuotedAmount: any;
}

interface Recommendation {
  id: number;
  supplierId: number;
  supplier: Supplier;
  supplierQuote: Quote;
  canvas: Canvas;
  compositeMcdmScore: any;
  rankPosition: number;
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
}

interface PoDraftingClientProps {
  pendingAwards: Recommendation[];
  initialPos: PurchaseOrder[];
}

export default function PoDraftingClient({ pendingAwards, initialPos }: PoDraftingClientProps) {
  const [pos, setPos] = useState<PurchaseOrder[]>(initialPos);
  const [awards, setAwards] = useState<Recommendation[]>(pendingAwards);
  const [selectedPoId, setSelectedPoId] = useState<number | null>(
    initialPos.length > 0 ? initialPos[0].id : null
  );

  const [activeTab, setActiveTab] = useState<"registry" | "queue">("registry");

  // Editing terms states
  const [deliveryTerms, setDeliveryTerms] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");

  // Processing indicators
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedPo = pos.find((p) => p.id === selectedPoId);

  // Sync edit fields when selected PO changes
  React.useEffect(() => {
    if (selectedPo) {
      setDeliveryTerms(selectedPo.deliveryTerms || "");
      setPaymentTerms(selectedPo.paymentTerms || "");
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [selectedPoId, selectedPo]);

  const handleDraftPo = async (recId: number) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await createPoFromAwardAction(recId);
      if (res.success && res.po) {
        const newPo = res.po as unknown as PurchaseOrder;
        // Check if it's already in the list
        if (!pos.some(p => p.id === newPo.id)) {
          setPos(prev => [newPo, ...prev]);
        }
        setSelectedPoId(newPo.id);
        setAwards(prev => prev.filter(a => a.id !== recId));
        setActiveTab("registry");
        setSuccessMsg(`Draft Purchase Order ${newPo.poNumber} created successfully.`);
      } else {
        setErrorMsg(res.error || "Failed to create Purchase Order.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTerms = async () => {
    if (!selectedPo) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await updatePoAction(selectedPo.id, { deliveryTerms, paymentTerms });
      if (res.success && res.po) {
        setPos(prev => prev.map(p => p.id === selectedPo.id ? { ...p, deliveryTerms, paymentTerms } : p));
        setSuccessMsg("Delivery and Payment terms saved.");
      } else {
        setErrorMsg(res.error || "Failed to save terms.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprovePo = async () => {
    if (!selectedPo) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await approvePoAction(selectedPo.id);
      if (res.success && res.po) {
        setPos(prev => prev.map(p => p.id === selectedPo.id ? { ...p, status: "Approved" } : p));
        setSuccessMsg("Purchase Order approved and signed digitally!");
      } else {
        setErrorMsg(res.error || "Failed to approve Purchase Order.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
            background: #fff !important;
            color: #000 !important;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            border: none !important;
            box-shadow: none !important;
          }
          header, footer, nav, button, .no-print {
            display: none !important;
          }
        }
      ` }} />

      {/* Tabs Menu */}
      <div className="no-print" style={{ display: "flex", gap: "1rem", borderBottom: "1px solid rgba(0,0,0,0.1)", paddingBottom: "0.5rem" }}>
        <button
          onClick={() => setActiveTab("registry")}
          style={{
            padding: "0.5rem 1.25rem", borderRadius: "0.5rem", border: "none",
            background: activeTab === "registry" ? theme.crimson : "transparent",
            color: activeTab === "registry" ? "#fff" : theme.textMuted,
            fontWeight: 700, fontSize: "0.85rem", cursor: "pointer"
          }}
        >
          📄 Purchase Orders Registry ({pos.length})
        </button>
        <button
          onClick={() => setActiveTab("queue")}
          style={{
            padding: "0.5rem 1.25rem", borderRadius: "0.5rem", border: "none",
            background: activeTab === "queue" ? theme.crimson : "transparent",
            color: activeTab === "queue" ? "#fff" : theme.textMuted,
            fontWeight: 700, fontSize: "0.85rem", cursor: "pointer"
          }}
        >
          ⏳ Approved Awards Queue ({awards.length})
        </button>
      </div>

      {activeTab === "queue" ? (
        /* queue Tab */
        <div className="no-print" style={{
          background: theme.glassBg, backdropFilter: "blur(20px)",
          border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
          boxShadow: theme.shadow
        }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, marginBottom: "1.5rem" }}>Awarded RFQ Bids (Pending PO drafting)</h2>
          {awards.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: theme.textMuted }}>
              No pending awarded RFQs. Ensure that the Administrative Approver has reviewed and approved the canvas recommendations first.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }} className="md:grid-cols-2 lg:grid-cols-3">
              {awards.map((award) => (
                <div
                  key={award.id}
                  style={{
                    padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid rgba(0,0,0,0.08)",
                    backgroundColor: "rgba(255,255,255,0.6)", display: "flex", flexDirection: "column", gap: "0.75rem"
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase" }}>RFQ Number</span>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: theme.textMain, margin: 0 }}>{award.canvas.rfq.rfqNumber}</h3>
                    <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: theme.textMuted }}>{award.canvas.rfq.title}</p>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.04)", paddingTop: "0.5rem" }}>
                    <span style={{ fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase" }}>Awarded Supplier</span>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: theme.crimson }}>{award.supplier.companyName}</div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", borderTop: "1px solid rgba(0,0,0,0.04)", paddingTop: "0.75rem" }}>
                    <div>
                      <span style={{ display: "block", fontSize: "0.7rem", color: theme.textMuted }}>Bid Total</span>
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, color: theme.textMain }}>₱{Number(award.supplierQuote.totalQuotedAmount).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleDraftPo(award.id)}
                      disabled={isProcessing}
                      style={{
                        padding: "0.45rem 1rem", borderRadius: "0.5rem", border: "none",
                        background: `linear-gradient(90deg, ${theme.crimson}, ${theme.goldDark})`, color: "#fff",
                        fontWeight: 700, fontSize: "0.75rem", cursor: "pointer"
                      }}
                    >
                      ✏️ Draft PO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* registry Tab */
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="lg:grid-cols-3">
          {/* PO List */}
          <div className="no-print lg:col-span-1" style={{
            background: theme.glassBg, backdropFilter: "blur(20px)",
            border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem",
            boxShadow: theme.shadow, height: "calc(100vh - 250px)", overflowY: "auto"
          }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, marginBottom: "1rem" }}>Purchase Orders</h2>
            {pos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: theme.textMuted }}>
                No Purchase Orders drafted yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {pos.map((po) => {
                  const active = po.id === selectedPoId;
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
                          backgroundColor: po.status === "Approved" ? "rgba(16, 185, 129, 0.1)" : "rgba(107, 114, 128, 0.1)",
                          color: po.status === "Approved" ? "#10b981" : "#6b7280"
                        }}>
                          {po.status}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: theme.textMain }}>
                        {po.supplier.companyName}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: theme.textMuted }}>
                        <span>RFQ: {po.rfq?.rfqNumber}</span>
                        <span style={{ fontWeight: 600, color: theme.textMain }}>₱{Number(po.totalCost).toLocaleString()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* PO Details & Form Layout (Government PO Appendix 61) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} className="lg:col-span-2">
            {selectedPo ? (
              <>
                {/* Control Panel (no-print) */}
                <div className="no-print" style={{
                  background: theme.glassBg, backdropFilter: "blur(20px)",
                  border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem",
                  boxShadow: theme.shadow, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem"
                }}>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      onClick={handlePrint}
                      style={{
                        padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)",
                        background: "#fff", color: theme.textMain, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer"
                      }}
                    >
                      🖨️ Print Purchase Order
                    </button>
                    {selectedPo.status === "Draft" && (
                      <button
                        onClick={handleApprovePo}
                        disabled={isProcessing}
                        style={{
                          padding: "0.5rem 1.25rem", borderRadius: "0.5rem", border: "none",
                          background: `linear-gradient(90deg, #10b981, #059669)`, color: "#fff",
                          fontWeight: 700, fontSize: "0.8rem", cursor: "pointer"
                        }}
                      >
                        ✍️ Approve & Sign PO
                      </button>
                    )}
                  </div>
                  <span style={{
                    padding: "0.35rem 1rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 800,
                    backgroundColor: selectedPo.status === "Approved" ? "rgba(16, 185, 129, 0.15)" : "rgba(107,114,128,0.15)",
                    color: selectedPo.status === "Approved" ? "#10b981" : "#6b7280"
                  }}>
                    Status: {selectedPo.status}
                  </span>
                </div>

                {errorMsg && (
                  <div className="no-print" style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#dc2626", fontSize: "0.8rem", fontWeight: 600 }}>
                    ⚠️ {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="no-print" style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#059669", fontSize: "0.8rem", fontWeight: 600 }}>
                    ✅ {successMsg}
                  </div>
                )}

                {/* Edit Terms Panel (no-print) */}
                {selectedPo.status === "Draft" && (
                  <div className="no-print" style={{
                    background: theme.glassBg, backdropFilter: "blur(20px)",
                    border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem 2rem",
                    boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1rem"
                  }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: theme.textMain, margin: 0 }}>Configure Contract Terms</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <label style={{ fontSize: "0.7rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Delivery Terms</label>
                        <input
                          type="text"
                          value={deliveryTerms}
                          onChange={(e) => setDeliveryTerms(e.target.value)}
                          placeholder="e.g. FOB Destination, 7 calendar days"
                          style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem" }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <label style={{ fontSize: "0.7rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Payment Terms</label>
                        <input
                          type="text"
                          value={paymentTerms}
                          onChange={(e) => setPaymentTerms(e.target.value)}
                          placeholder="e.g. Charge Account, 30 days"
                          style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        onClick={handleSaveTerms}
                        disabled={isProcessing}
                        style={{
                          padding: "0.45rem 1rem", borderRadius: "0.5rem", border: "none",
                          background: theme.crimson, color: "#fff", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer"
                        }}
                      >
                        💾 Save Terms
                      </button>
                    </div>
                  </div>
                )}

                {/* Print Section (High-fidelity Gov Form) */}
                <div className="print-section" style={{
                  background: "#fff", color: "#000", border: "2px solid #000",
                  padding: "2rem", fontFamily: "'Courier New', Courier, monospace", fontSize: "0.85rem",
                  boxShadow: theme.shadow, borderRadius: "0.5rem"
                }}>
                  <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>BSC-PMS Appendix 61</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: "bold", margin: "0.25rem 0" }}>PURCHASE ORDER</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", letterSpacing: "1px" }}>BATANES STATE COLLEGE</div>
                    <div style={{ fontSize: "0.8rem", fontStyle: "italic" }}>Basco, Batanes, Philippines</div>
                  </div>

                  {/* Header details block */}
                  <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", marginBottom: "1rem" }}>
                    <tbody>
                      <tr>
                        <td style={{ border: "1px solid #000", padding: "0.5rem", width: "50%" }}>
                          <strong>Supplier:</strong> {selectedPo.supplier.companyName}<br />
                          <strong>Address:</strong> {selectedPo.supplier.businessAddress}<br />
                          <strong>TIN:</strong> {selectedPo.supplier.tin || "N/A"}
                        </td>
                        <td style={{ border: "1px solid #000", padding: "0.5rem", width: "50%" }}>
                          <strong>P.O. No:</strong> {selectedPo.poNumber}<br />
                          <strong>Date:</strong> {new Date(selectedPo.createdAt).toLocaleDateString()}<br />
                          <strong>Mode of Procurement:</strong> Small Value Procurement
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p style={{ margin: "1rem 0", fontSize: "0.8rem" }}>
                    Gentlemen:<br />
                    Please furnish this Office the following articles subject to the terms and conditions contained herein:
                  </p>

                  {/* Terms block */}
                  <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", marginBottom: "1.5rem" }}>
                    <tbody>
                      <tr>
                        <td style={{ border: "1px solid #000", padding: "0.5rem", width: "50%" }}>
                          <strong>Place of Delivery:</strong> BSC Supply Office, Basco, Batanes
                        </td>
                        <td style={{ border: "1px solid #000", padding: "0.5rem", width: "50%" }}>
                          <strong>Delivery Term:</strong> {selectedPo.deliveryTerms || "FOB Destination"}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: "1px solid #000", padding: "0.5rem", width: "50%" }}>
                          <strong>Date of Delivery:</strong> Within 7 calendar days upon receipt of PO
                        </td>
                        <td style={{ border: "1px solid #000", padding: "0.5rem", width: "50%" }}>
                          <strong>Payment Term:</strong> {selectedPo.paymentTerms || "Charge Account"}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Item List Table */}
                  <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", marginBottom: "1.5rem" }}>
                    <thead>
                      <tr>
                        <th style={{ border: "1px solid #000", padding: "0.5rem", textAlign: "center", width: "10%" }}>Item No.</th>
                        <th style={{ border: "1px solid #000", padding: "0.5rem", textAlign: "left", width: "50%" }}>Description</th>
                        <th style={{ border: "1px solid #000", padding: "0.5rem", textAlign: "center", width: "10%" }}>Qty</th>
                        <th style={{ border: "1px solid #000", padding: "0.5rem", textAlign: "right", width: "15%" }}>Unit Cost</th>
                        <th style={{ border: "1px solid #000", padding: "0.5rem", textAlign: "right", width: "15%" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPo.items.map((item, index) => (
                        <tr key={item.id}>
                          <td style={{ border: "1px solid #000", padding: "0.5rem", textAlign: "center" }}>{index + 1}</td>
                          <td style={{ border: "1px solid #000", padding: "0.5rem" }}>{item.description}</td>
                          <td style={{ border: "1px solid #000", padding: "0.5rem", textAlign: "center" }}>{item.quantity}</td>
                          <td style={{ border: "1px solid #000", padding: "0.5rem", textAlign: "right" }}>₱{Number(item.unitPrice).toLocaleString()}</td>
                          <td style={{ border: "1px solid #000", padding: "0.5rem", textAlign: "right" }}>₱{Number(item.totalCost).toLocaleString()}</td>
                        </tr>
                      ))}
                      {/* Total row */}
                      <tr>
                        <td colSpan={4} style={{ border: "1px solid #000", padding: "0.5rem", textAlign: "right", fontWeight: "bold" }}>TOTAL AMOUNT</td>
                        <td style={{ border: "1px solid #000", padding: "0.5rem", textAlign: "right", fontWeight: "bold", color: "#000" }}>
                          ₱{Number(selectedPo.totalCost).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Legal Terms Penalty Clause */}
                  <p style={{ fontSize: "0.72rem", lineHeight: 1.4, margin: "1rem 0" }}>
                    In case of failure to make the full delivery within the time specified above, a penalty of one-tenth (1/10) of one percent for every day of delay shall be imposed on the undelivered item/s.
                  </p>

                  {/* Signatures Conforme Block */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "2rem" }}>
                    <div>
                      <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.8rem" }}>Conforme:</p>
                      <div style={{ borderBottom: "1.5px solid #000", width: "80%", height: "20px" }}></div>
                      <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.78rem" }}>Signature over Printed Name of Supplier</p>
                      <div style={{ borderBottom: "1.5px solid #000", width: "80%", height: "20px", marginTop: "1rem" }}></div>
                      <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.78rem" }}>Date</p>
                    </div>

                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.8rem", width: "80%", textAlign: "left" }}>Very truly yours,</p>
                      {selectedPo.status === "Approved" ? (
                        <div style={{ fontStyle: "italic", fontSize: "1.1rem", fontWeight: "bold", color: theme.crimson, width: "80%", textAlign: "left", fontFamily: "cursive", height: "20px" }}>
                          ✓ Digitally Signed
                        </div>
                      ) : (
                        <div style={{ height: "20px" }}></div>
                      )}
                      <div style={{ borderBottom: "1.5px solid #000", width: "80%", marginTop: "0.5rem" }}></div>
                      <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.78rem", width: "80%", textAlign: "left" }}>
                        <strong>DR. ELIZABETH T. CHIARRE</strong><br />
                        College President, Batanes State College
                      </p>
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
                Select a Purchase Order from the registry to view or configure terms.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
