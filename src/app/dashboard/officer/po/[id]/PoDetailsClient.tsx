"use client";

import React, { useState, useEffect } from "react";
import { updatePoAction, approvePoAction } from "@/app/actions/po";

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

interface PoDetailsClientProps {
  initialPo: PurchaseOrder;
}

export default function PoDetailsClient({ initialPo }: PoDetailsClientProps) {
  const [po, setPo] = useState<PurchaseOrder>(initialPo);

  // Terms states
  const [deliveryTerms, setDeliveryTerms] = useState(initialPo.deliveryTerms || "");
  const [paymentTerms, setPaymentTerms] = useState(initialPo.paymentTerms || "");

  // Processing indicators
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state if initialPo changes
  useEffect(() => {
    setPo(initialPo);
    setDeliveryTerms(initialPo.deliveryTerms || "");
    setPaymentTerms(initialPo.paymentTerms || "");
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [initialPo]);

  const handleSaveTerms = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await updatePoAction(po.id, { deliveryTerms, paymentTerms });
      if (res.success && res.po) {
        setPo(prev => ({ ...prev, deliveryTerms, paymentTerms }));
        setSuccessMsg("Delivery and Payment terms saved successfully.");
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
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await approvePoAction(po.id);
      if (res.success && res.po) {
        setPo(prev => ({ ...prev, status: "Approved" }));
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
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="lg:grid-cols-3">
      {/* Print custom override styles */}
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

      {/* Main PO Government Layout (Appendix 61) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} className="lg:col-span-2">
        {/* Control and feedback panel */}
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

        {/* Appendix 61 Government PO Layout Sheet */}
        <div
          className="print-section"
          style={{
            background: "#fff",
            color: "#000",
            border: "2px solid #000",
            borderRadius: "0.25rem",
            padding: "2.5rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            fontFamily: "Arial, sans-serif",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Header block */}
          <div style={{ textAlign: "center", marginBottom: "1.5rem", borderBottom: "2px double #000", paddingBottom: "1rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", display: "block" }}>Appendix 61</span>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", margin: "0.5rem 0 0.1rem 0" }}>PURCHASE ORDER</h2>
            <div style={{ fontSize: "1.1rem", fontWeight: "bold", letterSpacing: "1px" }}>BATANES STATE COLLEGE</div>
            <div style={{ fontSize: "0.8rem", fontStyle: "italic" }}>Basco, Batanes, Philippines</div>
          </div>

          {/* PO metadata fields */}
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", marginBottom: "1rem" }}>
            <tbody>
              <tr>
                <td style={{ border: "1px solid #000", padding: "0.6rem", width: "50%", fontSize: "0.85rem", verticalAlign: "top" }}>
                  <strong>Supplier:</strong> {po.supplier.companyName}<br />
                  <strong>Address:</strong> {po.supplier.businessAddress}<br />
                  <strong>TIN:</strong> {po.supplier.tin || "N/A"}
                </td>
                <td style={{ border: "1px solid #000", padding: "0.6rem", width: "50%", fontSize: "0.85rem", verticalAlign: "top" }}>
                  <strong>P.O. No:</strong> {po.poNumber}<br />
                  <strong>Date:</strong> {new Date(po.createdAt).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}<br />
                  <strong>Mode of Procurement:</strong> Small Value Procurement
                </td>
              </tr>
            </tbody>
          </table>

          <p style={{ margin: "1rem 0", fontSize: "0.8rem" }}>
            Gentlemen:<br />
            Please furnish this Office the following articles subject to the terms and conditions contained herein:
          </p>

          {/* Delivery terms block */}
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", marginBottom: "1.5rem" }}>
            <tbody>
              <tr>
                <td style={{ border: "1px solid #000", padding: "0.6rem", width: "50%", fontSize: "0.85rem" }}>
                  <strong>Place of Delivery:</strong> BSC Supply Office, Basco, Batanes
                </td>
                <td style={{ border: "1px solid #000", padding: "0.6rem", width: "50%", fontSize: "0.85rem" }}>
                  <strong>Delivery Term:</strong> {po.deliveryTerms || "FOB Destination"}
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "0.6rem", width: "50%", fontSize: "0.85rem" }}>
                  <strong>Date of Delivery:</strong> Within 7 calendar days upon receipt of PO
                </td>
                <td style={{ border: "1px solid #000", padding: "0.6rem", width: "50%", fontSize: "0.85rem" }}>
                  <strong>Payment Term:</strong> {po.paymentTerms || "Charge Account"}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Item List Breakdown */}
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", marginBottom: "1.5rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <th style={{ border: "1px solid #000", padding: "0.6rem", textAlign: "center", width: "10%", fontSize: "0.8rem", fontWeight: "bold" }}>Item No.</th>
                <th style={{ border: "1px solid #000", padding: "0.6rem", textAlign: "left", width: "50%", fontSize: "0.8rem", fontWeight: "bold" }}>Description</th>
                <th style={{ border: "1px solid #000", padding: "0.6rem", textAlign: "center", width: "10%", fontSize: "0.8rem", fontWeight: "bold" }}>Qty</th>
                <th style={{ border: "1px solid #000", padding: "0.6rem", textAlign: "right", width: "15%", fontSize: "0.8rem", fontWeight: "bold" }}>Unit Cost</th>
                <th style={{ border: "1px solid #000", padding: "0.6rem", textAlign: "right", width: "15%", fontSize: "0.8rem", fontWeight: "bold" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {po.items.map((item, index) => (
                <tr key={item.id}>
                  <td style={{ border: "1px solid #000", padding: "0.6rem", textAlign: "center", fontSize: "0.8rem" }}>{index + 1}</td>
                  <td style={{ border: "1px solid #000", padding: "0.6rem", fontSize: "0.8rem" }}>{item.description}</td>
                  <td style={{ border: "1px solid #000", padding: "0.6rem", textAlign: "center", fontSize: "0.8rem" }}>{item.quantity}</td>
                  <td style={{ border: "1px solid #000", padding: "0.6rem", textAlign: "right", fontSize: "0.8rem" }}>₱{Number(item.unitPrice).toLocaleString()}</td>
                  <td style={{ border: "1px solid #000", padding: "0.6rem", textAlign: "right", fontSize: "0.8rem" }}>₱{Number(item.totalCost).toLocaleString()}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} style={{ border: "1px solid #000", padding: "0.6rem", textAlign: "right", fontWeight: "bold", fontSize: "0.8rem" }}>TOTAL AMOUNT</td>
                <td style={{ border: "1px solid #000", padding: "0.6rem", textAlign: "right", fontWeight: "bold", fontSize: "0.85rem" }}>
                  ₱{Number(po.totalCost).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Legal penalty notice */}
          <p style={{ fontSize: "0.7rem", lineHeight: 1.4, margin: "1rem 0" }}>
            In case of failure to make the full delivery within the time specified above, a penalty of one-tenth (1/10) of one percent for every day of delay shall be imposed on the undelivered item/s.
          </p>

          {/* Signatures conforme blocks */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "2rem" }}>
            <div>
              <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.8rem" }}>Conforme:</p>
              <div style={{ borderBottom: "1.5px solid #000", width: "80%", height: "20px" }}></div>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.75rem", color: "#333" }}>Signature over Printed Name of Supplier</p>
              <div style={{ borderBottom: "1.5px solid #000", width: "80%", height: "20px", marginTop: "1rem" }}></div>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.75rem", color: "#333" }}>Date</p>
            </div>

            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.8rem", width: "80%", textAlign: "left" }}>Very truly yours,</p>
              {po.status === "Approved" ? (
                <div style={{ fontStyle: "italic", fontSize: "1rem", fontWeight: "bold", color: "#7e191b", width: "80%", textAlign: "left", fontFamily: "cursive", height: "20px" }}>
                  ✓ Digitally Signed
                </div>
              ) : (
                <div style={{ height: "20px" }}></div>
              )}
              <div style={{ borderBottom: "1.5px solid #000", width: "80%", marginTop: "0.5rem" }}></div>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.75rem", width: "80%", textAlign: "left" }}>
                <strong>DR. ELIZABETH T. CHIARRE</strong><br />
                College President, Batanes State College
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: PO Configuration, Edit Terms & Document Timeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} className="lg:col-span-1 no-print">
        
        {/* Configuration Actions */}
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
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: theme.textMain, margin: 0 }}>⚙️ Document Controls</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button
              onClick={handlePrint}
              style={{
                width: "100%", padding: "0.65rem", borderRadius: "0.5rem", border: `1px solid ${theme.glassBorder}`,
                background: "transparent", color: theme.textMain, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px"
              }}
            >
              🖨️ Print Purchase Order
            </button>

            {po.status === "Draft" && (
              <button
                onClick={handleApprovePo}
                disabled={isProcessing}
                style={{
                  width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "none",
                  background: `linear-gradient(90deg, ${theme.crimson}, ${theme.goldDark})`, color: "#fff",
                  fontWeight: 800, fontSize: "0.8rem", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  boxShadow: "0 4px 12px rgba(126, 25, 27, 0.2)"
                }}
              >
                ✍️ Approve & Sign digitally
              </button>
            )}
          </div>
        </div>

        {/* Edit Delivery and Payment Terms */}
        {po.status === "Draft" && (
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
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: theme.textMain, margin: 0 }}>✏️ Configure PO Terms</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", color: theme.textMuted, fontWeight: 700, textTransform: "uppercase", marginBottom: "0.35rem" }}>Delivery Terms</label>
                <input
                  type="text"
                  placeholder="e.g. FOB Destination"
                  value={deliveryTerms}
                  onChange={(e) => setDeliveryTerms(e.target.value)}
                  style={{
                    width: "100%", padding: "0.55rem 0.75rem", borderRadius: "0.5rem",
                    border: `1px solid ${theme.glassBorder}`, background: "rgba(0,0,0,0.02)",
                    color: theme.textMain, fontSize: "0.85rem", outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.72rem", color: theme.textMuted, fontWeight: 700, textTransform: "uppercase", marginBottom: "0.35rem" }}>Payment Terms</label>
                <input
                  type="text"
                  placeholder="e.g. Charge Account"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  style={{
                    width: "100%", padding: "0.55rem 0.75rem", borderRadius: "0.5rem",
                    border: `1px solid ${theme.glassBorder}`, background: "rgba(0,0,0,0.02)",
                    color: theme.textMain, fontSize: "0.85rem", outline: "none"
                  }}
                />
              </div>

              <button
                onClick={handleSaveTerms}
                disabled={isProcessing}
                style={{
                  width: "100%", padding: "0.6rem", borderRadius: "0.5rem", border: "none",
                  background: "#10b981", color: "#fff", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                  transition: "opacity 0.2s"
                }}
                className="hover:opacity-90"
              >
                Save Terms & Conditions
              </button>
            </div>
          </div>
        )}

        {/* Timeline audit tracker */}
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
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: theme.textMain, margin: 0 }}>📁 Traceability Timeline</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.78rem" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "start" }}>
              <span style={{ color: "#10b981", marginTop: "2px" }}>✓</span>
              <div>
                <div style={{ fontWeight: 700, color: theme.textMain }}>Purchase Order Created</div>
                <div style={{ color: theme.textMuted }}>{new Date(po.createdAt).toLocaleString()}</div>
              </div>
            </div>
            {po.status === "Approved" && (
              <div style={{ display: "flex", gap: "8px", alignItems: "start" }}>
                <span style={{ color: "#10b981", marginTop: "2px" }}>✓</span>
                <div>
                  <div style={{ fontWeight: 700, color: theme.textMain }}>Approved & Digitally Signed</div>
                  <div style={{ color: theme.textMuted }}>Verification log stored securely.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
