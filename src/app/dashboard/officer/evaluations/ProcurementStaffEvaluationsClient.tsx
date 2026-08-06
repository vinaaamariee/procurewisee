"use client";

import React, { useState, useEffect } from "react";
import { submitSupplierEvaluationAction, getSupplierScorecard } from "@/app/actions/evaluation";
import EmptyState from "@/components/ui/EmptyState";

enum EvaluationType {
  ProcurementOffice = "ProcurementOffice",
}

interface Supplier {
  id: number;
  companyName: string;
}

interface ProcurementStaffEvaluationsClientProps {
  suppliers: Supplier[];
  officerName: string;
}

// Official BSC Procurement Office Supplier Evaluation — 5 criteria
// Rating scale: 4=Strongly Agree, 3=Agree, 2=Disagree, 1=Strongly Disagree
const OFFICE_CRITERIA = [
  {
    key: "rfqResponsiveness",
    label: "The supplier responds to the RFQ/price canvass within the specified date.",
  },
  {
    key: "competitivePricing",
    label: "The supplier offers competitive pricing compared to other suppliers/bidders.",
  },
  {
    key: "specificationCompliance",
    label: "The supplier's offer conforms to the product sample or specification requirements.",
  },
  {
    key: "documentCompliance",
    label: "The supplier submits required documentary requirements (per RA 9184 IRR) within 1–2 days upon request.",
  },
  {
    key: "deliveryPerformance",
    label: "The supplier delivers goods per the delivery term stated in the PO/Contract.",
  },
] as const;

const RATING_OPTIONS = [
  { value: 4, label: "Strongly Agree" },
  { value: 3, label: "Agree" },
  { value: 2, label: "Disagree" },
  { value: 1, label: "Strongly Disagree" },
];

const defaultRatings = () => ({
  rfqResponsiveness: 4,
  competitivePricing: 4,
  specificationCompliance: 4,
  documentCompliance: 4,
  deliveryPerformance: 4,
});

export default function ProcurementStaffEvaluationsClient({ suppliers, officerName }: ProcurementStaffEvaluationsClientProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [scorecard, setScorecard] = useState<any>(null);

  // Header fields (Procurement Office variant)
  const [purchaseRequestNo, setPurchaseRequestNo] = useState("");
  const [poNo, setPoNo] = useState("");
  const [philGepsRn, setPhilGepsRn] = useState("");
  const [philGepsDateRegistered, setPhilGepsDateRegistered] = useState("");
  const [philGepsExpirationDate, setPhilGepsExpirationDate] = useState("");

  const [ratings, setRatings] = useState<Record<string, number>>(defaultRatings());
  const [comments, setComments] = useState("");
  const [evaluationDate, setEvaluationDate] = useState(new Date().toISOString().split("T")[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selectedSupplierId) {
      fetchScorecard(parseInt(selectedSupplierId));
    } else {
      setScorecard(null);
    }
  }, [selectedSupplierId]);

  const fetchScorecard = async (id: number) => {
    setIsFetching(true);
    try {
      const data = await getSupplierScorecard(id);
      setScorecard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleRating = (key: string, val: number) =>
    setRatings(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      setErrorMsg("Please select a supplier to evaluate.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await submitSupplierEvaluationAction({
        supplierId: parseInt(selectedSupplierId),
        evaluationType: EvaluationType.ProcurementOffice,
        evaluatorName: officerName,
        rfqResponsiveness: ratings.rfqResponsiveness,
        competitivePricing: ratings.competitivePricing,
        specificationCompliance: ratings.specificationCompliance,
        documentCompliance: ratings.documentCompliance,
        deliveryPerformance: ratings.deliveryPerformance,
        comments,
        // Pass header metadata
        purchaseRequestNo,
        poNo,
        philGepsRn,
        philGepsDateRegistered: philGepsDateRegistered || undefined,
        philGepsExpirationDate: philGepsExpirationDate || undefined,
      } as any);

      if (res.success) {
        setSuccessMsg("Evaluation submitted. Supplier metrics updated.");
        setComments("");
        setPurchaseRequestNo("");
        setPoNo("");
        setPhilGepsRn("");
        setPhilGepsDateRegistered("");
        setPhilGepsExpirationDate("");
        setRatings(defaultRatings());
        setSelectedSupplierId("");
        setScorecard(null);
      } else {
        setErrorMsg(res.error || "Failed to submit evaluation.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const theme = {
    crimson: "#7e191b",
    gold: "#dcb353",
    goldDark: "#b88a1b",
    textMain: "var(--text-primary, #1f2937)",
    textMuted: "var(--text-muted, #6b7280)",
    glassBg: "var(--surface, rgba(255,255,255,0.75))",
    glassBorder: "var(--border, rgba(255,255,255,0.95))",
    shadow: "var(--shadow-card, 0 10px 30px rgba(0,0,0,0.04))",
  };

  const cardStyle: React.CSSProperties = {
    background: theme.glassBg,
    border: `1px solid ${theme.glassBorder}`,
    borderRadius: "1.25rem",
    padding: "2rem",
    boxShadow: theme.shadow,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.72rem",
    fontWeight: 800,
    color: theme.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "0.35rem",
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.65rem 0.85rem",
    borderRadius: "0.65rem",
    border: "1px solid rgba(0,0,0,0.12)",
    fontSize: "0.85rem",
    background: "rgba(255,255,255,0.8)",
    outline: "none",
    color: theme.textMain,
  };

  if (suppliers.length === 0) {
    return (
      <EmptyState
        preset="suppliers"
        title="No Suppliers Found"
        description="There are no registered suppliers in the system yet. Add suppliers before evaluating."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {errorMsg && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", background: "rgba(239,68,68,0.1)", color: "#dc2626", fontSize: "0.85rem", fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", background: "rgba(16,185,129,0.1)", color: "#059669", fontSize: "0.85rem", fontWeight: 600 }}>
          ✅ {successMsg}
        </div>
      )}

      {/* ── Header Fields ── */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: theme.textMain, marginBottom: "1.5rem" }}>
          📋 Evaluation Header
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Name of Supplier</label>
            <select
              value={selectedSupplierId}
              onChange={e => setSelectedSupplierId(e.target.value)}
              style={inputStyle}
              required
            >
              <option value="">— Select Supplier —</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.companyName}</option>
              ))}
            </select>
          </div>

          {/* Scorecard mini-panel */}
          {isFetching && (
            <div style={{ gridColumn: "1 / -1", color: theme.textMuted, fontSize: "0.8rem" }}>
              Loading supplier scorecard…
            </div>
          )}
          {scorecard && !isFetching && (
            <div style={{
              gridColumn: "1 / -1",
              background: "rgba(126,25,27,0.04)",
              border: "1px solid rgba(126,25,27,0.12)",
              borderRadius: "0.75rem",
              padding: "1rem",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
              fontSize: "0.8rem",
            }}>
              <div>
                <div style={{ color: theme.textMuted, fontWeight: 700 }}>Reliability</div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", color: theme.crimson }}>
                  {Number(scorecard.reliabilityRating).toFixed(2)} / 5
                </div>
              </div>
              <div>
                <div style={{ color: theme.textMuted, fontWeight: 700 }}>Quality Compliance</div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", color: theme.crimson }}>
                  {Number(scorecard.qualityComplianceRate).toFixed(1)}%
                </div>
              </div>
              <div>
                <div style={{ color: theme.textMuted, fontWeight: 700 }}>On-Time Delivery</div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", color: theme.crimson }}>
                  {scorecard.onTimeDeliveryRate !== null ? `${Number(scorecard.onTimeDeliveryRate).toFixed(1)}%` : "—"}
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1", color: theme.textMuted, fontSize: "0.75rem" }}>
                Based on {scorecard.totalEvaluations} past evaluation(s)
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Purchase Request No.</label>
            <input type="text" value={purchaseRequestNo} onChange={e => setPurchaseRequestNo(e.target.value)}
              placeholder="e.g. PR-2026-0001" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>PO No.</label>
            <input type="text" value={poNo} onChange={e => setPoNo(e.target.value)}
              placeholder="e.g. PO-2026-0001" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>PhilGEPS Registration No.</label>
            <input type="text" value={philGepsRn} onChange={e => setPhilGepsRn(e.target.value)}
              placeholder="PhilGEPS RN" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Date Registered (PhilGEPS)</label>
            <input type="date" value={philGepsDateRegistered} onChange={e => setPhilGepsDateRegistered(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>PhilGEPS Expiration Date</label>
            <input type="date" value={philGepsExpirationDate} onChange={e => setPhilGepsExpirationDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Evaluation Date</label>
            <input type="date" value={evaluationDate} onChange={e => setEvaluationDate(e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* ── Rating Scale Legend ── */}
      <div style={{ ...cardStyle, padding: "1rem 2rem" }}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Scale:</span>
          {RATING_OPTIONS.map(o => (
            <span key={o.value} style={{ fontSize: "0.78rem", color: theme.textMain }}>
              <strong>{o.value}</strong> = {o.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Procurement Office Criteria ── */}
      <div style={cardStyle}>
        <div style={{
          fontSize: "0.95rem", fontWeight: 800, color: "#fff",
          background: `linear-gradient(90deg, ${theme.crimson}, ${theme.goldDark})`,
          padding: "0.5rem 1rem", borderRadius: "0.5rem",
          marginBottom: "1.5rem", display: "inline-block",
        }}>
          Procurement Office Evaluation Criteria
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {OFFICE_CRITERIA.map((c, idx) => (
            <div key={c.key} style={{
              paddingBottom: "1.5rem",
              borderBottom: idx < OFFICE_CRITERIA.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
            }}>
              <p style={{ fontSize: "0.85rem", color: theme.textMain, marginBottom: "0.75rem", fontWeight: 500 }}>
                <strong style={{ color: theme.crimson }}>{idx + 1}.</strong> {c.label}
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {RATING_OPTIONS.map(opt => {
                  const selected = ratings[c.key] === opt.value;
                  return (
                    <label
                      key={opt.value}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.35rem",
                        padding: "0.4rem 0.85rem", borderRadius: "2rem",
                        border: selected ? `2px solid ${theme.crimson}` : "1.5px solid rgba(0,0,0,0.1)",
                        background: selected ? `${theme.crimson}12` : "rgba(255,255,255,0.6)",
                        cursor: "pointer", fontSize: "0.8rem", fontWeight: selected ? 700 : 500,
                        color: selected ? theme.crimson : theme.textMuted,
                        transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="radio"
                        name={c.key}
                        value={opt.value}
                        checked={selected}
                        onChange={() => handleRating(c.key, opt.value)}
                        style={{ accentColor: theme.crimson }}
                      />
                      <span>{opt.value} – {opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Comments & Submit ── */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: theme.textMain, marginBottom: "1.5rem" }}>
          📝 Comments / Feedback
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder="Additional comments or corrective actions recommended..."
            rows={4}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: theme.textMuted }}>
              Evaluator: <strong>{officerName}</strong>
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "0.75rem 2rem", borderRadius: "0.75rem", border: "none",
                background: `linear-gradient(90deg, ${theme.crimson}, ${theme.goldDark})`,
                color: "#fff", fontWeight: 700, fontSize: "0.85rem",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: "0 4px 12px rgba(126,25,27,0.25)", transition: "all 0.2s",
              }}
            >
              {isSubmitting ? "Submitting…" : "✍️ Submit Evaluation"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
