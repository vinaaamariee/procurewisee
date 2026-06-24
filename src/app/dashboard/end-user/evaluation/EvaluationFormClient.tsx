"use client";

import React, { useState } from "react";
import { submitSupplierEvaluationAction } from "@/app/actions/evaluation";

enum EvaluationType {
  EndUser = "EndUser",
  ProcurementOffice = "ProcurementOffice"
}

interface Supplier {
  id: number;
  companyName: string;
  contactPerson: string | null;
}

interface EvaluationFormClientProps {
  suppliers: Supplier[];
  evaluatorName: string;
}

const CRITERIA = [
  { key: "productQuality", label: "Product Quality", description: "The durability, performance, and craftsmanship of the delivered goods." },
  { key: "deliveryCompliance", label: "Delivery Compliance", description: "Timeliness of deliveries and adherence to the agreed schedules." },
  { key: "accuracy", label: "Accuracy of Order", description: "Adherence of the delivered items to the requested specifications and counts." },
  { key: "responsiveness", label: "Responsiveness", description: "Speed and helpfulness in resolving questions, changes, or issues." },
  { key: "communication", label: "Communication Flow", description: "Clarity, availability, and professionalism in correspondence." },
  { key: "costEffectiveness", label: "Cost Effectiveness", description: "Value provided relative to market prices and competition." },
  { key: "overallSatisfaction", label: "Overall Satisfaction", description: "Your subjective satisfaction rating of the overall partnership." }
];

const RATING_LABELS = [
  { value: 1, label: "Poor", color: "#ef4444" },
  { value: 2, label: "Fair", color: "#f59e0b" },
  { value: 3, label: "Good", color: "#3b82f6" },
  { value: 4, label: "Excellent", color: "#10b981" }
];

export default function EvaluationFormClient({ suppliers, evaluatorName }: EvaluationFormClientProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [ratings, setRatings] = useState<Record<string, number>>({
    productQuality: 4,
    deliveryCompliance: 4,
    accuracy: 4,
    responsiveness: 4,
    communication: 4,
    costEffectiveness: 4,
    overallSatisfaction: 4
  });
  const [comments, setComments] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [signature, setSignature] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRatingChange = (key: string, val: number) => {
    setRatings(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      setErrorMsg("Please select a supplier to evaluate.");
      return;
    }
    if (!signature.trim()) {
      setErrorMsg("Please enter your name/signature block to authorize this evaluation.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await submitSupplierEvaluationAction({
        supplierId: parseInt(selectedSupplierId),
        evaluationType: EvaluationType.EndUser,
        evaluatorName,
        ...ratings,
        comments,
        recommendation,
        signature
      });

      if (res.success) {
        setSuccessMsg("Evaluation submitted successfully! Supplier metrics updated.");
        // Reset fields
        setComments("");
        setRecommendation("");
        setSignature("");
        setRatings({
          productQuality: 4,
          deliveryCompliance: 4,
          accuracy: 4,
          responsiveness: 4,
          communication: 4,
          costEffectiveness: 4,
          overallSatisfaction: 4
        });
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
    textMain: "#1f2937",
    textMuted: "#6b7280",
    glassBg: "rgba(255, 255, 255, 0.75)",
    glassBorder: "rgba(255, 255, 255, 0.95)",
    shadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {errorMsg && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#dc2626", fontSize: "0.85rem", fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#059669", fontSize: "0.85rem", fontWeight: 600 }}>
          ✅ {successMsg}
        </div>
      )}

      {/* Supplier Selection Panel */}
      <div style={{
        background: theme.glassBg, backdropFilter: "blur(20px)",
        border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem 2rem",
        boxShadow: theme.shadow
      }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, margin: "0 0 1.25rem 0" }}>Supplier Selection</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.75rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Select Supplier to Evaluate</label>
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
            style={{
              width: "100%", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid rgba(0,0,0,0.12)",
              fontSize: "0.85rem", background: "rgba(255,255,255,0.8)", outline: "none", color: theme.textMain
            }}
          >
            <option value="">-- Select Company --</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.companyName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ratings Panel */}
      <div style={{
        background: theme.glassBg, backdropFilter: "blur(20px)",
        border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
        boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "2rem"
      }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, margin: 0 }}>Supplier Rating sheet (1 - 4 Likert Scale)</h2>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: theme.textMuted }}>
            Evaluate the supplier's performance on the following criteria based on recent deliveries.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {CRITERIA.map((criterion) => {
            const currentRating = ratings[criterion.key];
            return (
              <div key={criterion.key} style={{
                paddingBottom: "1.5rem", borderBottom: "1px solid rgba(0,0,0,0.06)",
                display: "grid", gridTemplateColumns: "1fr", gap: "1rem"
              }} className="md:grid-cols-2">
                <div>
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: theme.textMain, margin: 0 }}>{criterion.label}</h3>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.75rem", color: theme.textMuted }}>{criterion.description}</p>
                </div>
                
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  {RATING_LABELS.map((opt) => {
                    const selected = currentRating === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleRatingChange(criterion.key, opt.value)}
                        style={{
                          flex: 1, padding: "0.5rem 0.25rem", borderRadius: "0.5rem",
                          border: selected ? `1.5px solid ${opt.color}` : "1.5px solid rgba(0,0,0,0.06)",
                          background: selected ? `${opt.color}15` : "rgba(255,255,255,0.6)",
                          color: selected ? opt.color : theme.textMuted,
                          fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", transition: "all 0.15s",
                          textAlign: "center"
                        }}
                      >
                        {opt.value} - {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comments and Authorization */}
      <div style={{
        background: theme.glassBg, backdropFilter: "blur(20px)",
        border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
        boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1.5rem"
      }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, margin: 0 }}>Comments & Recommendations</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="grid grid-cols-1 md:grid-cols-2">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Evaluation Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide comments regarding quality, speed, or other performance aspects..."
              style={{
                width: "100%", height: "100px", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid rgba(0,0,0,0.12)",
                fontSize: "0.85rem", background: "rgba(255,255,255,0.8)", outline: "none", color: theme.textMain, fontFamily: "inherit"
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Corrective Actions / Recommendations</label>
            <textarea
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Provide suggestions for improvement or recommend renewal/termination..."
              style={{
                width: "100%", height: "100px", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid rgba(0,0,0,0.12)",
                fontSize: "0.85rem", background: "rgba(255,255,255,0.8)", outline: "none", color: theme.textMain, fontFamily: "inherit"
              }}
            />
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }} className="md:grid-cols-2">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Evaluator Signature block</label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Type your full name as digital signature (e.g. Juan De Cruz)"
              style={{
                width: "100%", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid rgba(0,0,0,0.12)",
                fontSize: "0.85rem", background: "rgba(255,255,255,0.8)", outline: "none", color: theme.textMain
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%", padding: "0.75rem", borderRadius: "0.75rem", border: "none",
                background: `linear-gradient(90deg, ${theme.crimson}, ${theme.goldDark})`, color: "#fff",
                fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s",
                boxShadow: "0 4px 12px rgba(126, 25, 27, 0.2)"
              }}
            >
              {isSubmitting ? "Submitting Evaluation..." : "✍️ Submit Supplier Evaluation"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
