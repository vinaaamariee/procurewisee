import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import { getSupplierScorecard } from "@/app/actions/evaluation";

export const metadata = { title: "My Performance Scorecard — ProcureWise" };

export default async function SupplierScorecardPage() {
  const { profile } = await requireRole("Supplier");

  // Resolve supplierId based on companyName or contactPerson match (same as dashboard/supplier/page.tsx)
  let supplier = await prisma.supplier.findFirst({
    where: {
      OR: [
        { companyName: profile.fullName },
        { contactPerson: profile.fullName }
      ]
    },
    select: { id: true }
  });

  if (!supplier) {
    // Fallback to first supplier in dev mode
    supplier = await prisma.supplier.findFirst({
      orderBy: { id: "asc" },
      select: { id: true }
    });
  }

  const supplierId = supplier?.id ?? 1;

  // Retrieve scorecard metrics
  const scorecard = await getSupplierScorecard(supplierId);

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

  if (!scorecard) {
    return (
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem", textAlign: "center", color: theme.textMuted }}>
        No scorecard metrics found for your account. Please wait for evaluations to be filed.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2.5rem", fontFamily: '"Inter", sans-serif' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: theme.textMain, margin: 0, letterSpacing: "-0.5px" }}>
          Supplier Performance Scorecard
        </h1>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: theme.textMuted, margin: "0.5rem 0 0 0" }}>
          Track your institutional grading, delivery quality metrics, and requisitioner feedback logs.
        </p>
      </div>

      {/* Main Aggregated Scores */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        
        {/* Overall Reliability */}
        <div style={{
          background: theme.glassBg, backdropFilter: "blur(20px)",
          border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
          boxShadow: theme.shadow, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center"
        }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>Institutional Reliability index</span>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: theme.crimson, margin: "0.5rem 0" }}>
            {scorecard.reliabilityRating.toFixed(2)} <span style={{ fontSize: "1.1rem", color: theme.textMuted }}>/ 5.0</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.25rem", marginBottom: "0.5rem" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ color: i < Math.round(scorecard.reliabilityRating) ? theme.gold : "rgba(0,0,0,0.1)", fontSize: "1.25rem" }}>★</span>
            ))}
          </div>
          <span style={{ fontSize: "0.75rem", color: theme.textMuted }}>Weight-based composite rating</span>
        </div>

        {/* Quality Compliance Rate */}
        <div style={{
          background: theme.glassBg, backdropFilter: "blur(20px)",
          border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
          boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1rem"
        }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>Quality Compliance Rate</span>
          <div>
            <div style={{ fontSize: "3rem", fontWeight: 900, color: "#10b981", lineHeight: 1 }}>
              {scorecard.qualityComplianceRate.toFixed(1)}%
            </div>
            <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.06)", borderRadius: "999px", overflow: "hidden", marginTop: "1rem" }}>
              <div style={{ width: `${scorecard.qualityComplianceRate}%`, height: "100%", background: "#10b981", borderRadius: "999px" }} />
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", color: theme.textMuted }}>Adherence to required goods specifications</span>
        </div>

        {/* On-Time Delivery Rate */}
        <div style={{
          background: theme.glassBg, backdropFilter: "blur(20px)",
          border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
          boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1rem"
        }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>On-Time Delivery Rate</span>
          <div>
            <div style={{ fontSize: "3rem", fontWeight: 900, color: "#3b82f6", lineHeight: 1 }}>
              {scorecard.onTimeDeliveryRate.toFixed(1)}%
            </div>
            <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.06)", borderRadius: "999px", overflow: "hidden", marginTop: "1rem" }}>
              <div style={{ width: `${scorecard.onTimeDeliveryRate}%`, height: "100%", background: "#3b82f6", borderRadius: "999px" }} />
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", color: theme.textMuted }}>Adherence to contract delivery lead-times</span>
        </div>

      </div>

      {/* Requisitions vs Procurement Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="lg:grid-cols-2">
        
        {/* Comparison Metrics */}
        <div style={{
          background: theme.glassBg, backdropFilter: "blur(20px)",
          border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
          boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1.5rem"
        }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, margin: 0 }}>Portal Evaluation Breakdown</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                <span>Requisitioners Satisfaction Index</span>
                <span style={{ color: theme.crimson }}>{scorecard.avgEndUserScore.toFixed(1)}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: `${scorecard.avgEndUserScore}%`, height: "100%", background: theme.crimson, borderRadius: "999px" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                <span>Procurement Office Satisfaction Index</span>
                <span style={{ color: theme.goldDark }}>{scorecard.avgOfficeScore.toFixed(1)}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: `${scorecard.avgOfficeScore}%`, height: "100%", background: theme.goldDark, borderRadius: "999px" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Customer Feedback Feed */}
        <div style={{
          background: theme.glassBg, backdropFilter: "blur(20px)",
          border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
          boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1rem"
        }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, margin: 0 }}>Recent Institutional Reviews</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "350px", overflowY: "auto", paddingRight: "0.5rem" }}>
            {scorecard.evaluations.map((ev: any) => (
              <div key={ev.id} style={{
                padding: "1rem", borderRadius: "0.75rem", border: "1px solid rgba(0,0,0,0.06)",
                background: "rgba(255,255,255,0.5)", display: "flex", flexDirection: "column", gap: "0.25rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: theme.textMuted }}>
                  <span>{ev.evaluationType === "EndUser" ? "End User Evaluation" : "Procurement Evaluation"}</span>
                  <span>{new Date(ev.evaluationDate).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: "0.82rem", color: theme.textMain, fontStyle: "italic", marginTop: "0.2rem" }}>
                  "{ev.comments || "No comments written."}"
                </div>
              </div>
            ))}
            {scorecard.evaluations.length === 0 && (
              <div style={{ padding: "2rem", textAlign: "center", color: theme.textMuted }}>
                No feedback reviews logged yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
