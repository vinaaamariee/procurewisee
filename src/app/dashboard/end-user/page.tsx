import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "End User Dashboard — ProcureWise" };

export default async function EndUserDashboard() {
  const { profile } = await requireRole("End User");

  // Fetch department budget allocations
  const budget = await prisma.departmentBudget.findUnique({
    where: { department: profile.fullName }
  }) || { allocatedBudget: 250000.00, spentBudget: 119600.00 };

  // Fetch count statistics for PRs and PPMPs
  const [prCount, ppmpCount] = await Promise.all([
    prisma.purchaseRequest.count({ where: { requestedById: profile.id } }),
    prisma.ppmp.count({ where: { preparedById: profile.id } }),
  ]);

  // Fetch recent PR submissions
  const recentPrs = await prisma.purchaseRequest.findMany({
    where: { requestedById: profile.id },
    orderBy: { createdAt: "desc" },
    limit: 5,
  });

  const allocated = Number(budget.allocatedBudget);
  const spent = Number(budget.spentBudget);
  const remaining = allocated - spent;
  const spentPercent = Math.min((spent / allocated) * 100, 100);

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
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2.5rem", fontFamily: '"Inter", sans-serif' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: theme.textMain, margin: 0, letterSpacing: "-0.5px" }}>
          Welcome back, {profile.fullName}!
        </h1>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: theme.textMuted, margin: "0.5rem 0 0 0" }}>
          Requisitioner Portal • Manage and track your department's procurement planning and purchase requests.
        </p>
      </div>

      {/* Grid panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr lg:grid-cols-3", gap: "2rem" }} className="grid grid-cols-1 lg:grid-cols-3">
        
        {/* Left main: statistics and recent requests */}
        <div style={{ gridColumn: "span 2" }} className="lg:col-span-2 space-y-8">
          
          {/* Budget progress panel */}
          <div style={{
            background: theme.glassBg, backdropFilter: "blur(20px)",
            border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
            boxShadow: theme.shadow
          }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, margin: "0 0 1.5rem 0" }}>Department Fiscal Budget Tracker</h2>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", fontSize: "0.85rem", fontWeight: 700 }}>
              <span style={{ color: theme.textMuted }}>Allocated: ₱{allocated.toLocaleString()}</span>
              <span style={{ color: theme.crimson }}>Spent: ₱{spent.toLocaleString()} ({spentPercent.toFixed(1)}%)</span>
            </div>
            
            {/* Progress Bar */}
            <div style={{ width: "100%", height: "10px", backgroundColor: "rgba(0,0,0,0.06)", borderRadius: "999px", overflow: "hidden", marginBottom: "1.5rem" }}>
              <div style={{ width: `${spentPercent}%`, height: "100%", background: `linear-gradient(90deg, ${theme.crimson}, ${theme.gold})`, borderRadius: "999px" }} />
            </div>

            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: theme.textMain }}>
              Remaining Available Allocation: <span style={{ color: "#059669", fontSize: "1rem", fontWeight: 800 }}>₱{remaining.toLocaleString()}</span>
            </div>
          </div>

          {/* Recent Requisitions Table */}
          <div style={{
            background: theme.glassBg, backdropFilter: "blur(20px)",
            border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", overflow: "hidden", boxShadow: theme.shadow
          }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.4)" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, margin: 0 }}>My Recent Purchase Requests</h2>
              <Link href="/dashboard/end-user/pr" style={{ fontSize: "0.75rem", fontWeight: 700, color: theme.crimson, textDecoration: "none" }}>
                View All →
              </Link>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <th style={{ padding: "1rem 1.5rem", textAlign: "left", color: theme.textMuted }}>PR Number</th>
                    <th style={{ padding: "1rem 1.5rem", textAlign: "left", color: theme.textMuted }}>Purpose</th>
                    <th style={{ padding: "1rem 1.5rem", textAlign: "right", color: theme.textMuted }}>Estimated Cost</th>
                    <th style={{ padding: "1rem 1.5rem", textAlign: "center", color: theme.textMuted }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPrs.map(pr => (
                    <tr key={pr.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                      <td style={{ padding: "1rem 1.5rem", fontWeight: 700, color: theme.crimson }}>{pr.prNumber}</td>
                      <td style={{ padding: "1rem 1.5rem", color: theme.textMain, maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pr.purpose}</td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "right", fontWeight: 600 }}>₱{Number(pr.totalCost).toLocaleString()}</td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                        <span style={{
                          padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700,
                          backgroundColor: pr.status === "Approved" || pr.status === "Received" ? "rgba(16, 185, 129, 0.1)" : "rgba(220, 179, 83, 0.1)",
                          color: pr.status === "Approved" || pr.status === "Received" ? "#059669" : "#b88a1b",
                        }}>
                          {pr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentPrs.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: theme.textMuted, fontWeight: 500 }}>
                        No Purchase Requests filed yet. Go to the marketplace catalog to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right sidebar: Actions and quick stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Quick Actions */}
          <div style={{
            background: theme.glassBg, backdropFilter: "blur(20px)",
            border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem",
            boxShadow: theme.shadow
          }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: theme.textMain, margin: "0 0 1.25rem 0" }}>Quick Actions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link href="/" style={{
                display: "block", textDecoration: "none", padding: "0.75rem 1rem", borderRadius: "0.75rem",
                background: `linear-gradient(90deg, ${theme.crimson}, ${theme.goldDark})`, color: "#fff",
                fontWeight: 700, fontSize: "0.8rem", textAlign: "center"
              }}>
                🛒 Open Procurement Catalog
              </Link>
              <Link href="/dashboard/end-user/ppmp" style={{
                display: "block", textDecoration: "none", padding: "0.75rem 1rem", borderRadius: "0.75rem",
                background: "rgba(255,255,255,0.9)", border: "1px solid var(--border)", color: theme.textMain,
                fontWeight: 600, fontSize: "0.8rem", textAlign: "center"
              }}>
                📅 Manage PPMP Calendars
              </Link>
              <Link href="/dashboard/end-user/evaluation" style={{
                display: "block", textDecoration: "none", padding: "0.75rem 1rem", borderRadius: "0.75rem",
                background: "rgba(255,255,255,0.9)", border: "1px solid var(--border)", color: theme.textMain,
                fontWeight: 600, fontSize: "0.8rem", textAlign: "center"
              }}>
                ⭐ Evaluate Supplier
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{
            background: theme.glassBg, backdropFilter: "blur(20px)",
            border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem",
            boxShadow: theme.shadow, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem"
          }}>
            <div style={{ textAlign: "center", padding: "1rem", borderRight: "1px solid rgba(0,0,0,0.06)" }}>
              <span style={{ fontSize: "1.875rem", fontWeight: 900, color: theme.crimson }}>{prCount}</span>
              <span style={{ display: "block", fontSize: "0.75rem", color: theme.textMuted, fontWeight: 700, marginTop: "0.25rem" }}>PRs File</span>
            </div>
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <span style={{ fontSize: "1.875rem", fontWeight: 900, color: theme.goldDark }}>{ppmpCount}</span>
              <span style={{ display: "block", fontSize: "0.75rem", color: theme.textMuted, fontWeight: 700, marginTop: "0.25rem" }}>PPMPs Prepared</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
