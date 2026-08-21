"use client";

import React, { useState } from "react";
import { submitSupplierPerformanceEvaluationAction } from "@/app/actions/evaluation";

enum EvaluationType {
  EndUser = "EndUser",
}

interface Supplier {
  id: number;
  companyName: string;
  contactPerson: string | null;
}

interface EvaluationFormClientProps {
  suppliers: Supplier[];
  evaluatorName: string;
  evaluatorOffice?: string;
}

// Official BSC End-User Supplier Evaluation — 4 categories, 9 criteria
// Rating scale: 4=Strongly Agree, 3=Agree, 2=Disagree, 1=Strongly Disagree
const CATEGORIES = [
  {
    label: "Quality",
    criteria: [
      {
        key: "productQuality",
        label: "The supplier/dealer met the quality standards of the products/services received.",
      },
      {
        key: "deliveryCompliance",
        label: "The products/services were delivered as per the specified delivery term.",
      },
      {
        key: "accuracy",
        label: "The delivered products/services were accurate and complete as per specifications.",
      },
    ],
  },
  {
    label: "Communication",
    criteria: [
      {
        key: "responsiveness",
        label: "The supplier was responsive to inquiries and concerns during the transaction.",
      },
      {
        key: "communication",
        label: "The supplier was willing and able to address issues or defects encountered.",
      },
      {
        key: "clearCommunication",
        label: "Communication with the supplier was clear throughout the ordering process.",
      },
    ],
  },
  {
    label: "Cost",
    criteria: [
      {
        key: "costEffectiveness",
        label: "The pricing offered is competitive compared to market rates.",
      },
      {
        key: "valueForMoney",
        label: "The products/services justify the cost paid (value for money).",
      },
    ],
  },
  {
    label: "Overall",
    criteria: [
      {
        key: "wouldRecommend",
        label: "I would recommend this supplier for future procurement transactions.",
      },
    ],
  },
] as const;

const RATING_OPTIONS = [
  { value: 4, label: "Strongly Agree" },
  { value: 3, label: "Agree" },
  { value: 2, label: "Disagree" },
  { value: 1, label: "Strongly Disagree" },
];

const defaultRatings = () => ({
  productQuality: 4,
  deliveryCompliance: 4,
  accuracy: 4,
  responsiveness: 4,
  communication: 4,
  clearCommunication: 4,
  costEffectiveness: 4,
  valueForMoney: 4,
  wouldRecommend: 4,
});

export default function EvaluationFormClient({
  suppliers,
  evaluatorName,
  evaluatorOffice = "",
}: EvaluationFormClientProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [typeOfGoods, setTypeOfGoods] = useState("");
  const [officeUnit, setOfficeUnit] = useState(evaluatorOffice);
  const [poNo, setPoNo] = useState("");

  const [ratings, setRatings] = useState<Record<string, number>>(defaultRatings());
  const [comments, setComments] = useState("");
  const [respondentName, setRespondentName] = useState(evaluatorName);
  const [evaluationDate, setEvaluationDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRating = (key: string, val: number) =>
    setRatings(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      setErrorMsg("Please select a supplier to evaluate.");
      return;
    }
    if (!respondentName.trim()) {
      setErrorMsg("Please enter your name in the signature block.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await submitSupplierPerformanceEvaluationAction({
        supplierId: parseInt(selectedSupplierId),
        evaluationType: EvaluationType.EndUser,
        evaluatorName: respondentName,
        productQuality: ratings.productQuality,
        deliveryCompliance: ratings.deliveryCompliance,
        accuracy: ratings.accuracy,
        responsiveness: ratings.responsiveness,
        communication: ratings.communication,
        // clearCommunication, valueForMoney, wouldRecommend map to extended fields
        clearCommunication: ratings.clearCommunication,
        costEffectiveness: ratings.costEffectiveness,
        valueForMoney: ratings.valueForMoney,
        wouldRecommend: ratings.wouldRecommend,
        comments,
        // Pass header metadata
        typeOfGoodsServices: typeOfGoods,
        officeUnit,
        poNo,
        respondentName,
      } as any);

      if (res.success) {
        setSuccessMsg("Evaluation submitted successfully! Thank you for your feedback.");
        setComments("");
        setPoNo("");
        setTypeOfGoods("");
        setRatings(defaultRatings());
        setSelectedSupplierId("");
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
    crimson: "#7B1E1E",
    gold: "#A6761D",
    goldDark: "#A6761D",
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

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {errorMsg && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", background: "rgba(123, 30, 30, 0.1)", color: "var(--accent)", fontSize: "0.85rem", fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", background: "rgba(123, 30, 30, 0.1)", color: "var(--secondary)", fontSize: "0.85rem", fontWeight: 600 }}>
          ✅ {successMsg}
        </div>
      )}

      {/* ── Header Fields ── */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: theme.textMain, marginBottom: "1.5rem" }}>
          📋 Evaluation Details
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
          <div>
            <label style={labelStyle}>Type of Goods / Services Provided</label>
            <input
              type="text"
              value={typeOfGoods}
              onChange={e => setTypeOfGoods(e.target.value)}
              placeholder="e.g. Office Supplies, Hardware, Repairs"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Office / Unit</label>
            <input
              type="text"
              value={officeUnit}
              onChange={e => setOfficeUnit(e.target.value)}
              placeholder="e.g. Registrar's Office"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>PO No.</label>
            <input
              type="text"
              value={poNo}
              onChange={e => setPoNo(e.target.value)}
              placeholder="e.g. PO-2026-0001"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              value={evaluationDate}
              onChange={e => setEvaluationDate(e.target.value)}
              style={inputStyle}
            />
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

      {/* ── Criteria by Category ── */}
      {CATEGORIES.map(category => (
        <div key={category.label} style={cardStyle}>
          <h2 style={{
            fontSize: "0.95rem", fontWeight: 800, color: "#fff",
            background: `linear-gradient(90deg, ${theme.crimson}, ${theme.goldDark})`,
            padding: "0.5rem 1rem", borderRadius: "0.5rem",
            marginBottom: "1.5rem", display: "inline-block",
          }}>
            {category.label}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {category.criteria.map((c, idx) => (
              <div key={c.key} style={{
                paddingBottom: "1.25rem",
                borderBottom: idx < category.criteria.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
              }}>
                {/* Row number + criterion label */}
                <p style={{ fontSize: "0.85rem", color: theme.textMain, marginBottom: "0.75rem", fontWeight: 500 }}>
                  {c.label}
                </p>

                {/* Radio buttons */}
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
      ))}

      {/* ── Comments & Signature ── */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: theme.textMain, marginBottom: "1.5rem" }}>
          📝 Comments &amp; Signature
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Additional Comments / Suggestions</label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="Optional: additional remarks on the supplier's performance..."
              rows={4}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: "1rem" }}>
            <div>
              <label style={labelStyle}>Name of Respondent</label>
              <input
                type="text"
                value={respondentName}
                onChange={e => setRespondentName(e.target.value)}
                placeholder="Full name of the evaluator"
                style={inputStyle}
                required
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%", padding: "0.75rem", borderRadius: "0.75rem", border: "none",
                  background: `linear-gradient(90deg, ${theme.crimson}, ${theme.goldDark})`,
                  color: "#fff", fontWeight: 700, fontSize: "0.85rem",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                  boxShadow: "0 4px 12px rgba(123, 30, 30, 0.25)", transition: "all 0.2s",
                }}
              >
                {isSubmitting ? "Submitting…" : "✍️ Submit Evaluation"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
