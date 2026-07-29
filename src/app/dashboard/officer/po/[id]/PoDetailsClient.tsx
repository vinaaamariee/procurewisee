"use client";

import React, { useState, useEffect } from "react";
import { updatePoAction, approvePoAction, logPoPrintedAction } from "@/app/actions/po";
import PODocument, { PODocumentData, POItemRow } from "@/components/po/PODocument";

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
  // Appendix 61 fields
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

  const handlePrint = async () => {
    try { await logPoPrintedAction(po.id); } catch (e) { /* non-fatal */ }
    window.print();
  };

  const theme = {
    textMain: "var(--text-primary)",
    textMuted: "var(--text-muted)",
    glassBg: "var(--surface)",
    glassBorder: "var(--border)",
    shadow: "var(--shadow-card)",
    accent: "var(--accent)",
  };

  // Shape po into PODocumentData
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
      stockNo: item.stockNo || String(idx + 1).padStart(3, "0"),
      unit: item.unit || "unit",
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalCost: Number(item.totalCost),
    })),
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="lg:grid-cols-3">
      {/* Main Appendix 61 PO Document — 2/3 width */}
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
          isReadOnly={po.status !== "Draft"}
          onSave={po.status === "Draft" ? handleSavePoFields : undefined}
        />
      </div>

      {/* Right Column: Controls & Timeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} className="lg:col-span-1 no-print">

        {/* Document Controls */}
        <div style={{
          background: theme.glassBg, border: `1px solid ${theme.glassBorder}`,
          borderRadius: "1.25rem", padding: "1.5rem", boxShadow: theme.shadow,
          display: "flex", flexDirection: "column", gap: "1rem"
        }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: theme.textMain, margin: 0 }}>
            ⚙️ Document Controls
          </h3>

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

          {po.status === "Draft" && (
            <button
              onClick={handleApprovePo}
              disabled={isProcessing}
              style={{
                width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "none",
                background: `linear-gradient(90deg, var(--accent), #b88a1b)`, color: "#fff",
                fontWeight: 800, fontSize: "0.8rem", cursor: "pointer",
                boxShadow: "0 4px 12px rgba(126,25,27,0.2)",
              }}
            >
              ✍️ Approve &amp; Sign Digitally
            </button>
          )}

          {po.status === "Approved" && (
            <div style={{ textAlign: "center", color: "#059669", fontWeight: 700, fontSize: "0.8rem" }}>
              ✅ Approved &amp; Signed
            </div>
          )}
        </div>

        {/* Traceability */}
        <div style={{
          background: theme.glassBg, border: `1px solid ${theme.glassBorder}`,
          borderRadius: "1.25rem", padding: "1.5rem", boxShadow: theme.shadow,
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
            {po.status === "Approved" && (
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "#10b981" }}>✓</span>
                <div>
                  <div style={{ fontWeight: 700, color: theme.textMain }}>Approved &amp; Signed</div>
                  <div style={{ color: theme.textMuted }}>Verification log stored.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
