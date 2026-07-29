"use client";

import React, { useState, useEffect, useCallback } from "react";
import { updatePoAction, approvePoAction, logPoPrintedAction, updatePoStatusAction } from "@/app/actions/po";
import PODocument, { PODocumentData } from "@/components/po/PODocument";

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
  unit?: string | null;
  stockNo?: string | null;
  brand?: string | null;
  specification?: string | null;
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
  entityName?: string | null;
  modeOfProcurement?: string | null;
  placeOfDelivery?: string | null;
  dateOfDelivery?: Date | string | null;
  fundCluster?: string | null;
  orsBursNumber?: string | null;
  fundsAvailable?: any;
  dateOfOrsBurs?: Date | string | null;
  chiefAccountantName?: string | null;
  authorizedOfficialName?: string | null;
}

interface PoDetailsClientProps {
  initialPo: PurchaseOrder;
}

// Status workflow: what button appears next for each status
const STATUS_TRANSITIONS: Record<string, { label: string; nextStatus: string; color: string }> = {
  Draft: { label: "Submit for Approval", nextStatus: "Pending Approval", color: "#2563eb" },
  "Pending Approval": { label: "Approve & Sign", nextStatus: "Approved", color: "#059669" },
  Approved: { label: "Mark as Sent to Supplier", nextStatus: "Sent to Supplier", color: "#7c3aed" },
  "Sent to Supplier": { label: "Mark as Delivered", nextStatus: "Delivered", color: "#0891b2" },
  Delivered: { label: "Mark as Completed", nextStatus: "Completed", color: "#059669" },
};

const STATUS_COLORS: Record<string, string> = {
  Draft: "#6b7280",
  "Pending Approval": "#d97706",
  Approved: "#059669",
  "Sent to Supplier": "#7c3aed",
  "Partially Delivered": "#0891b2",
  Delivered: "#0891b2",
  Completed: "#059669",
  Closed: "#374151",
  Cancelled: "#ef4444",
};

export default function PoDetailsClient({ initialPo }: PoDetailsClientProps) {
  const [po, setPo] = useState<PurchaseOrder>(initialPo);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setPo(initialPo);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [initialPo]);

  const handleSavePoFields = async (data: Partial<PODocumentData>) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await updatePoAction(po.id, {
        deliveryTerms: data.deliveryTerms ?? undefined,
        paymentTerms: data.paymentTerms ?? undefined,
        entityName: data.entityName,
        modeOfProcurement: data.modeOfProcurement,
        placeOfDelivery: data.placeOfDelivery,
        dateOfDelivery: data.dateOfDelivery ?? null,
        fundCluster: data.fundCluster,
        orsBursNumber: data.orsBursNumber,
        fundsAvailable: data.fundsAvailable !== undefined ? Number(data.fundsAvailable) : null,
        dateOfOrsBurs: data.dateOfOrsBurs ?? null,
        chiefAccountantName: data.chiefAccountantName,
        authorizedOfficialName: data.authorizedOfficialName,
      });
      if (res.success) {
        return { success: true };
      } else {
        setErrorMsg(res.error || "Failed to save PO.");
        return { success: false, error: res.error };
      }
    } catch (err: any) {
      const msg = err.message || "An error occurred.";
      setErrorMsg(msg);
      return { success: false, error: msg };
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusTransition = async (nextStatus: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      let res: any;
      if (nextStatus === "Approved") {
        res = await approvePoAction(po.id);
      } else {
        res = await updatePoStatusAction(po.id, nextStatus as any);
      }
      if (res.success) {
        setPo(prev => ({ ...prev, status: nextStatus }));
        setSuccessMsg(`Status updated to: ${nextStatus}`);
      } else {
        setErrorMsg(res.error || "Failed to update status.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this Purchase Order? This action cannot be undone.")) return;
    setIsProcessing(true);
    const res = await updatePoStatusAction(po.id, "Cancelled" as any);
    setIsProcessing(false);
    if (res.success) {
      setPo(prev => ({ ...prev, status: "Cancelled" }));
      setSuccessMsg("Purchase Order cancelled.");
    } else {
      setErrorMsg(res.error || "Failed to cancel PO.");
    }
  };

  const handlePrint = async () => {
    try { await logPoPrintedAction(po.id); } catch { /* non-fatal */ }
    window.print();
  };

  const handleDownloadPdf = useCallback(async () => {
    // Dynamically import html2pdf.js (browser only)
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("po-document");
      if (!element) {
        alert("Could not find PO document to export.");
        return;
      }
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `PO_${po.poNumber}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err: any) {
      alert("PDF generation failed: " + err.message);
    }
  }, [po.poNumber]);

  const theme = {
    textMain: "var(--text-primary)",
    textMuted: "var(--text-muted)",
    glassBg: "var(--surface)",
    glassBorder: "var(--border)",
    shadow: "var(--shadow-card)",
    accent: "var(--accent)",
  };

  const poDocData: PODocumentData = {
    id: po.id,
    poNumber: po.poNumber,
    createdAt: po.createdAt,
    status: po.status,
    supplierId: po.supplierId,
    supplierName: po.supplier.companyName,
    supplierAddress: po.supplier.businessAddress,
    supplierTin: po.supplier.tin,
    entityName: po.entityName,
    modeOfProcurement: po.modeOfProcurement,
    placeOfDelivery: po.placeOfDelivery,
    dateOfDelivery: po.dateOfDelivery ? new Date(po.dateOfDelivery).toISOString().split("T")[0] : null,
    deliveryTerms: po.deliveryTerms,
    paymentTerms: po.paymentTerms,
    fundCluster: po.fundCluster,
    orsBursNumber: po.orsBursNumber,
    fundsAvailable: po.fundsAvailable !== null && po.fundsAvailable !== undefined
      ? Number(po.fundsAvailable) : null,
    dateOfOrsBurs: po.dateOfOrsBurs ? new Date(po.dateOfOrsBurs).toISOString().split("T")[0] : null,
    chiefAccountantName: po.chiefAccountantName,
    authorizedOfficialName: po.authorizedOfficialName,
    totalCost: Number(po.totalCost),
    items: po.items.map((item, idx) => ({
      id: item.id,
      stockNo: item.stockNo || String(idx + 1),
      unit: item.unit || "unit",
      description: item.description,
      brand: item.brand ?? null,
      specification: item.specification ?? null,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalCost: Number(item.totalCost),
    })),
  };

  const isDraft = po.status === "Draft";
  const nextTransition = STATUS_TRANSITIONS[po.status];
  const statusColor = STATUS_COLORS[po.status] || "#6b7280";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="lg:grid-cols-3">
      {/* Main document — 2/3 width */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} className="lg:col-span-2">
        {errorMsg && (
          <div className="no-print p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="no-print p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            ✅ {successMsg}
          </div>
        )}
        <PODocument
          initialPo={poDocData}
          isReadOnly={!isDraft}
          onSave={isDraft ? handleSavePoFields : undefined}
        />
      </div>

      {/* Right panel — controls + traceability */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} className="lg:col-span-1 no-print">

        {/* Status badge */}
        <div style={{
          background: theme.glassBg,
          border: `1px solid ${theme.glassBorder}`,
          borderRadius: "1.25rem",
          padding: "1.25rem",
          boxShadow: theme.shadow,
        }}>
          <div style={{ fontSize: "0.72rem", color: theme.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
            Current Status
          </div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            background: `${statusColor}18`,
            color: statusColor,
            border: `1px solid ${statusColor}40`,
            borderRadius: "2rem",
            padding: "0.35rem 0.9rem",
            fontSize: "0.78rem",
            fontWeight: 800,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor, display: "inline-block" }} />
            {po.status}
          </div>
        </div>

        {/* Document Controls */}
        <div style={{
          background: theme.glassBg,
          border: `1px solid ${theme.glassBorder}`,
          borderRadius: "1.25rem",
          padding: "1.5rem",
          boxShadow: theme.shadow,
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: theme.textMain, margin: 0 }}>
            ⚙️ Document Controls
          </h3>

          {/* Print */}
          <button
            onClick={handlePrint}
            style={{
              width: "100%", padding: "0.65rem", borderRadius: "0.5rem",
              border: `1px solid ${theme.glassBorder}`, background: "transparent",
              color: theme.textMain, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
            }}
          >
            🖨️ Print Purchase Order
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            style={{
              width: "100%", padding: "0.65rem", borderRadius: "0.5rem",
              border: `1px solid #7c3aed40`, background: "#7c3aed10",
              color: "#7c3aed", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
            }}
          >
            📄 Download PDF
          </button>

          {/* Status transition */}
          {nextTransition && po.status !== "Cancelled" && po.status !== "Completed" && po.status !== "Closed" && (
            <button
              onClick={() => handleStatusTransition(nextTransition.nextStatus)}
              disabled={isProcessing}
              style={{
                width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "none",
                background: nextTransition.color, color: "#fff",
                fontWeight: 800, fontSize: "0.8rem", cursor: "pointer",
                opacity: isProcessing ? 0.6 : 1,
              }}
            >
              {isProcessing ? "Processing…" : `✅ ${nextTransition.label}`}
            </button>
          )}

          {/* Cancel (only if not already terminal) */}
          {!["Cancelled", "Completed", "Closed", "Delivered"].includes(po.status) && (
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              style={{
                width: "100%", padding: "0.55rem", borderRadius: "0.5rem",
                border: "1px solid #ef444440", background: "transparent",
                color: "#ef4444", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer",
                opacity: isProcessing ? 0.6 : 1,
              }}
            >
              🚫 Cancel PO
            </button>
          )}
        </div>

        {/* Traceability */}
        <div style={{
          background: theme.glassBg,
          border: `1px solid ${theme.glassBorder}`,
          borderRadius: "1.25rem",
          padding: "1.5rem",
          boxShadow: theme.shadow,
        }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: theme.textMain, margin: "0 0 1rem 0" }}>
            📁 Traceability
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.78rem" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ color: "#10b981" }}>✓</span>
              <div>
                <div style={{ fontWeight: 700, color: theme.textMain }}>PO Created</div>
                <div style={{ color: theme.textMuted }}>{new Date(po.createdAt).toLocaleString()}</div>
              </div>
            </div>
            {po.rfq && (
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "#10b981" }}>✓</span>
                <div>
                  <div style={{ fontWeight: 700, color: theme.textMain }}>From RFQ</div>
                  <div style={{ color: theme.textMuted }}>{po.rfq.rfqNumber} — {po.rfq.title}</div>
                </div>
              </div>
            )}
            {po.status !== "Draft" && (
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "#10b981" }}>✓</span>
                <div>
                  <div style={{ fontWeight: 700, color: theme.textMain }}>Status: {po.status}</div>
                  <div style={{ color: theme.textMuted }}>Workflow updated.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary stats */}
        <div style={{
          background: theme.glassBg,
          border: `1px solid ${theme.glassBorder}`,
          borderRadius: "1.25rem",
          padding: "1.25rem",
          boxShadow: theme.shadow,
        }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: theme.textMain, margin: "0 0 0.75rem 0" }}>
            📋 PO Summary
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.78rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: theme.textMuted }}>PO Number</span>
              <span style={{ fontWeight: 700, color: theme.accent, fontFamily: "monospace" }}>{po.poNumber}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: theme.textMuted }}>Supplier</span>
              <span style={{ fontWeight: 600 }}>{po.supplier.companyName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: theme.textMuted }}>Line Items</span>
              <span style={{ fontWeight: 600 }}>{po.items.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${theme.glassBorder}`, paddingTop: "0.5rem", marginTop: "0.25rem" }}>
              <span style={{ color: theme.textMuted, fontWeight: 700 }}>Total Amount</span>
              <span style={{ fontWeight: 800, color: theme.accent, fontSize: "0.9rem" }}>
                ₱{Number(po.totalCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
