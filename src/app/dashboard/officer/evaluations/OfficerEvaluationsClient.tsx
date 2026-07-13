"use client";

import React, { useState, useEffect } from "react";
import { submitSupplierEvaluationAction, getSupplierScorecard } from "@/app/actions/evaluation";
import EmptyState from "@/components/ui/EmptyState";

enum EvaluationType {
  EndUser = "EndUser",
  ProcurementOffice = "ProcurementOffice"
}

interface Supplier {
  id: number;
  companyName: string;
}

interface OfficerEvaluationsClientProps {
  suppliers: Supplier[];
  officerName: string;
}

const OFFICE_CRITERIA = [
  { key: "rfqResponsiveness", label: "RFQ Responsiveness", description: "Timeliness and completeness of bid quotes submitted in response to RFQs." },
  { key: "competitivePricing", label: "Competitive Pricing", description: "Pricing competitiveness compared to general market rates and canvasses." },
  { key: "specificationCompliance", label: "Specification Compliance", description: "Supplier's adherence to the precise specs and standards requested." },
  { key: "documentCompliance", label: "Document Compliance", description: "Prompt submission of required government documents (Mayor's Permit, PhilGEPS, TIN, etc.)." },
  { key: "deliveryPerformance", label: "Delivery Performance", description: "Consistency in meeting lead times and handling partial/delayed deliveries." }
];

const RATING_LABELS = [
  { value: 1, label: "Poor", color: "#ef4444" },
  { value: 2, label: "Fair", color: "#f59e0b" },
  { value: 3, label: "Good", color: "#3b82f6" },
  { value: 4, label: "Excellent", color: "#10b981" }
];

export default function OfficerEvaluationsClient({ suppliers, officerName }: OfficerEvaluationsClientProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [scorecard, setScorecard] = useState<any>(null);
  
  // Rating states
  const [ratings, setRatings] = useState<Record<string, number>>({
    rfqResponsiveness: 4,
    competitivePricing: 4,
    specificationCompliance: 4,
    documentCompliance: 4,
    deliveryPerformance: 4
  });
  const [comments, setComments] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [signature, setSignature] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch scorecard when supplier is selected
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
      setErrorMsg("Please type your name/signature block to authorize this evaluation.");
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
        ...ratings,
        comments,
        recommendation,
        signature
      });

      if (res.success) {
        setSuccessMsg("Procurement Office evaluation recorded successfully!");
        setComments("");
        setRecommendation("");
        setSignature("");
        setRatings({
          rfqResponsiveness: 4,
          competitivePricing: 4,
          specificationCompliance: 4,
          documentCompliance: 4,
          deliveryPerformance: 4
        });
        // Reload scorecard
        fetchScorecard(parseInt(selectedSupplierId));
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
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Selection Box */}
      <div style={{
        background: theme.glassBg, backdropFilter: "blur(20px)",
        border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem 2rem",
        boxShadow: theme.shadow
      }}>
        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Select Supplier for Performance Scorecard
        </label>
        <select
          value={selectedSupplierId}
          onChange={(e) => setSelectedSupplierId(e.target.value)}
          style={{
            width: "100%", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid rgba(0,0,0,0.12)",
            fontSize: "0.85rem", background: "#fff", outline: "none", color: theme.textMain, fontWeight: 600
          }}
        >
          <option value="">-- Select Company to View --</option>
          {suppliers.map(s => (
            <option key={s.id} value={s.id}>{s.companyName}</option>
          ))}
        </select>
      </div>

      {isFetching && (
        <div style={{ textAlign: "center", padding: "2rem", color: theme.textMuted, fontWeight: 600 }}>
          🔄 Loading Supplier Performance Scorecard...
        </div>
      )}

      {selectedSupplierId && scorecard && !isFetching && (
        <>
          {/* Scorecard Analytics Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }} className="md:grid-cols-3">
            {/* Reliability Card */}
            <div style={{
              background: theme.glassBg, backdropFilter: "blur(20px)",
              border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem",
              boxShadow: theme.shadow, textAlign: "center"
            }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Overall Reliability</span>
              <div style={{ fontSize: "2.25rem", fontWeight: 900, color: theme.crimson, margin: "0.5rem 0" }}>
                {scorecard.reliabilityRating.toFixed(2)} <span style={{ fontSize: "1rem", color: theme.textMuted }}>/ 5.0</span>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "0.25rem" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ color: i < Math.round(scorecard.reliabilityRating) ? theme.gold : "rgba(0,0,0,0.1)", fontSize: "1.1rem" }}>★</span>
                ))}
              </div>
            </div>

            {/* Quality Compliance Card */}
            <div style={{
              background: theme.glassBg, backdropFilter: "blur(20px)",
              border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem",
              boxShadow: theme.shadow, textAlign: "center"
            }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Quality Compliance Rate</span>
              <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#10b981", margin: "0.5rem 0" }}>
                {scorecard.qualityComplianceRate.toFixed(1)}%
              </div>
              <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: `${scorecard.qualityComplianceRate}%`, height: "100%", background: "#10b981" }} />
              </div>
            </div>

            {/* Delivery Performance Card */}
            <div style={{
              background: theme.glassBg, backdropFilter: "blur(20px)",
              border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem",
              boxShadow: theme.shadow, textAlign: "center"
            }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>On-Time Delivery Rate</span>
              <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#3b82f6", margin: "0.5rem 0" }}>
                {scorecard.onTimeDeliveryRate.toFixed(1)}%
              </div>
              <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: `${scorecard.onTimeDeliveryRate}%`, height: "100%", background: "#3b82f6" }} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="lg:grid-cols-2">
            {/* Left Column: Historical Evaluation Logs */}
            <div style={{
              background: theme.glassBg, backdropFilter: "blur(20px)",
              border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
              boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1.5rem"
            }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, margin: 0 }}>Evaluation Audit History</h3>
                <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: theme.textMuted }}>
                  Total of {scorecard.totalEvaluations} evaluations filed by Requisitioners and Officers.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "400px", overflowY: "auto", paddingRight: "0.5rem" }}>
                {scorecard.evaluations.map((ev: any) => (
                  <div key={ev.id} style={{
                    padding: "1rem", borderRadius: "0.75rem", border: "1px solid rgba(0,0,0,0.06)",
                    background: ev.evaluationType === "EndUser" ? "rgba(126, 25, 27, 0.02)" : "rgba(59, 130, 246, 0.02)",
                    display: "flex", flexDirection: "column", gap: "0.4rem"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{
                        padding: "0.2rem 0.5rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 800,
                        backgroundColor: ev.evaluationType === "EndUser" ? "rgba(126, 25, 27, 0.1)" : "rgba(59, 130, 246, 0.1)",
                        color: ev.evaluationType === "EndUser" ? theme.crimson : "#3b82f6"
                      }}>
                        {ev.evaluationType === "EndUser" ? "End User" : "Procurement"}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: theme.textMuted }}>{new Date(ev.evaluationDate).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: theme.textMain }}>
                      Evaluator: {ev.evaluatorName}
                    </div>
                    {ev.comments && (
                      <div style={{ fontSize: "0.8rem", color: theme.textMain, fontStyle: "italic", marginTop: "0.2rem" }}>
                        "{ev.comments}"
                      </div>
                    )}
                    {ev.recommendation && (
                      <div style={{ fontSize: "0.78rem", color: theme.textMuted }}>
                        <strong>Rec:</strong> {ev.recommendation}
                      </div>
                    )}
                  </div>
                ))}
                {scorecard.evaluations.length === 0 && (
                  <EmptyState
                    preset="evaluations"
                    title="No Evaluations Filed Yet"
                    description="No performance evaluations have been submitted for this supplier yet. Be the first to evaluate their delivery, quality, and responsiveness."
                    compact
                  />
                )}
              </div>
            </div>

            {/* Right Column: Submit Officer Rating Form */}
            <div style={{
              background: theme.glassBg, backdropFilter: "blur(20px)",
              border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
              boxShadow: theme.shadow
            }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, marginBottom: "1.5rem" }}>File Procurement Office Evaluation</h3>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {errorMsg && (
                  <div style={{ padding: "0.75rem 1.25rem", borderRadius: "0.5rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#dc2626", fontSize: "0.8rem", fontWeight: 600 }}>
                    ⚠️ {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div style={{ padding: "0.75rem 1.25rem", borderRadius: "0.5rem", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#059669", fontSize: "0.8rem", fontWeight: 600 }}>
                    ✅ {successMsg}
                  </div>
                )}

                {/* Ratings Checklist */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {OFFICE_CRITERIA.map((criterion) => {
                    const currentRating = ratings[criterion.key];
                    return (
                      <div key={criterion.key} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: theme.textMain }}>{criterion.label}</span>
                          <span style={{ fontSize: "0.75rem", color: theme.textMuted }}>{criterion.description}</span>
                        </div>
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          {RATING_LABELS.map((opt) => {
                            const selected = currentRating === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleRatingChange(criterion.key, opt.value)}
                                style={{
                                  flex: 1, padding: "0.4rem 0.2rem", borderRadius: "0.35rem",
                                  border: selected ? `1px solid ${opt.color}` : "1px solid rgba(0,0,0,0.06)",
                                  background: selected ? `${opt.color}15` : "rgba(255,255,255,0.6)",
                                  color: selected ? opt.color : theme.textMuted,
                                  fontWeight: 700, fontSize: "0.72rem", cursor: "pointer", transition: "all 0.15s"
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

                {/* Comments / Recommendations */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.72rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Comments</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Enter audit/performance notes..."
                    style={{
                      width: "100%", height: "60px", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)",
                      fontSize: "0.82rem", outline: "none", color: theme.textMain, fontFamily: "inherit"
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.72rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Recommendations</label>
                  <textarea
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    placeholder="Renewal, blacklisting, or corrections..."
                    style={{
                      width: "100%", height: "60px", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)",
                      fontSize: "0.82rem", outline: "none", color: theme.textMain, fontFamily: "inherit"
                    }}
                  />
                </div>

                {/* Signature and Submit */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <label style={{ fontSize: "0.72rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Officer Signature</label>
                    <input
                      type="text"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="Type name to sign"
                      style={{
                        width: "100%", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)",
                        fontSize: "0.82rem", outline: "none", color: theme.textMain
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        width: "100%", padding: "0.6rem", borderRadius: "0.5rem", border: "none",
                        background: `linear-gradient(90deg, ${theme.crimson}, ${theme.goldDark})`, color: "#fff",
                        fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(126, 25, 27, 0.2)"
                      }}
                    >
                      {isSubmitting ? "Filing..." : "✍️ File Evaluation"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {!selectedSupplierId && (
        <div style={{
          background: theme.glassBg, backdropFilter: "blur(20px)",
          border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "4rem",
          boxShadow: theme.shadow, textAlign: "center", color: theme.textMuted
        }}>
          Select a supplier from the dropdown above to load their aggregated scorecard, view historical evaluations, and file official performance reviews.
        </div>
      )}
    </div>
  );
}
