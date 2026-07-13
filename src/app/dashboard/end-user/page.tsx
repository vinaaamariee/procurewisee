import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

export const metadata = { title: "End User Dashboard — ProcureWise" };

export default async function EndUserDashboard() {
  const { profile } = await requireRole("End User");

  // Fetch department budget allocations
  const budget = await prisma.departmentBudget.findUnique({
    where: { department: profile.fullName }
  }) || { allocatedBudget: 250000.00, spentBudget: 119600.00 };

  // Fetch count statistics and pending actions data
  const [
    prCount,
    ppmpCount,
    pendingPpmps,
    pendingPrs,
    deliveredPos,
    evaluatedSupplierIds
  ] = await Promise.all([
    prisma.purchaseRequest.count({ where: { requestedById: profile.id } }),
    prisma.ppmp.count({ where: { preparedById: profile.id } }),
    prisma.ppmp.findMany({
      where: {
        preparedById: profile.id,
        status: { in: ["Draft", "Returned"] }
      },
      select: { id: true, projectTitle: true, status: true },
      take: 3
    }),
    prisma.purchaseRequest.findMany({
      where: {
        requestedById: profile.id,
        status: { in: ["Draft", "ReturnedForRevision"] }
      },
      select: { id: true, prNumber: true, status: true, purpose: true },
      take: 3
    }),
    prisma.purchaseOrder.findMany({
      where: {
        pr: {
          requestedById: profile.id
        },
        status: { in: ["Delivered", "Closed"] }
      },
      select: {
        supplierId: true,
        supplier: {
          select: {
            id: true,
            companyName: true
          }
        }
      }
    }),
    prisma.supplierEvaluation.findMany({
      where: {
        evaluatorName: profile.fullName
      },
      select: {
        supplierId: true
      }
    }).then(list => list.map(e => e.supplierId))
  ]);

  // Fetch recent PR submissions
  const recentPrs = await prisma.purchaseRequest.findMany({
    where: { requestedById: profile.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Filter delivered PO suppliers that have not been evaluated yet
  const uniqueDeliveredSuppliers = Array.from(
    new Map(
      deliveredPos
        .filter(po => po.supplier !== null)
        .map(po => [po.supplierId, po.supplier])
    ).values()
  );

  const pendingEvaluations = uniqueDeliveredSuppliers.filter(
    sup => !evaluatedSupplierIds.includes(sup.id)
  );

  // Compile Actions List
  const actionsList: Array<{
    type: "planning" | "requisition" | "evaluation";
    title: string;
    description: string;
    link: string;
    statusLabel?: string;
  }> = [];

  pendingPpmps.forEach(ppmp => {
    actionsList.push({
      type: "planning",
      title: ppmp.status === "Returned" ? "Revise Returned PPMP" : "Complete PPMP Planning",
      description: ppmp.projectTitle,
      link: `/dashboard/end-user/ppmp?id=${ppmp.id}`,
      statusLabel: ppmp.status
    });
  });

  pendingPrs.forEach(pr => {
    actionsList.push({
      type: "requisition",
      title: pr.status === "ReturnedForRevision" ? "Revise Returned PR" : "Complete PR Requisition",
      description: pr.purpose,
      link: `/dashboard/end-user/pr?id=${pr.id}`,
      statusLabel: pr.status === "ReturnedForRevision" ? "Returned" : "Draft"
    });
  });

  pendingEvaluations.forEach(sup => {
    actionsList.push({
      type: "evaluation",
      title: "Supplier Evaluation Pending",
      description: `Rate performance for ${sup.companyName}`,
      link: `/dashboard/end-user/evaluation?supplierId=${sup.id}`
    });
  });

  const allocated = Number(budget.allocatedBudget);
  const spent = Number(budget.spentBudget);
  const remaining = allocated - spent;
  const spentPercent = Math.min((spent / allocated) * 100, 100);

  // CSS variables used from globals.css (navy blue system)
  const v = {
    surface: 'var(--surface)',
    border: 'var(--border)',
    accent: 'var(--accent)',
    accentLight: 'var(--accent-light)',
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    green: 'var(--green)',
    shadow: '0 4px 24px rgba(30,58,138,0.07)',
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2.5rem", fontFamily: '"Inter", sans-serif' }}>
      
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${v.border}`, paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 5, height: 48, borderRadius: 4, background: `linear-gradient(180deg, ${v.accent}, ${v.accentLight})`, flexShrink: 0 }} />
          <div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: v.textPrimary, margin: 0, letterSpacing: "-0.5px" }}>
              Welcome back, {profile.fullName}!
            </h1>
            <p style={{ marginTop: "0.25rem", fontSize: "0.9rem", color: v.textSecondary, margin: "0.25rem 0 0 0" }}>
              Requisitioner Portal &bull; Manage and track your department&apos;s procurement planning and purchase requests.
            </p>
          </div>
        </div>
      </div>

      {/* Grid panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr lg:grid-cols-3", gap: "2rem" }} className="grid grid-cols-1 lg:grid-cols-3">
        
        {/* Left main: statistics and recent requests */}
        <div style={{ gridColumn: "span 2" }} className="lg:col-span-2 space-y-8">
          
          {/* Budget progress panel */}
          <div style={{
            background: v.surface,
            border: `1px solid ${v.border}`, borderRadius: "1.25rem", padding: "2rem",
            boxShadow: v.shadow
          }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: v.textPrimary, margin: "0 0 1.5rem 0" }}>Department Fiscal Budget Tracker</h2>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", fontSize: "0.85rem", fontWeight: 700 }}>
              <span style={{ color: v.textSecondary }}>Allocated: ₱{allocated.toLocaleString()}</span>
              <span style={{ color: v.accent }}>Spent: ₱{spent.toLocaleString()} ({spentPercent.toFixed(1)}%)</span>
            </div>
            
            {/* Progress Bar */}
            <div style={{ width: "100%", height: "10px", backgroundColor: "rgba(30,58,138,0.07)", borderRadius: "999px", overflow: "hidden", marginBottom: "1.5rem" }}>
              <div style={{ width: `${spentPercent}%`, height: "100%", background: `linear-gradient(90deg, ${v.accent}, ${v.accentLight})`, borderRadius: "999px" }} />
            </div>

            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: v.textPrimary }}>
              Remaining Available Allocation: <span style={{ color: "#059669", fontSize: "1rem", fontWeight: 800 }}>₱{remaining.toLocaleString()}</span>
            </div>
          </div>

          {/* Recent Requisitions Table */}
          <div style={{
            background: v.surface,
            border: `1px solid ${v.border}`, borderRadius: "1.25rem", overflow: "hidden", boxShadow: v.shadow
          }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${v.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: v.textPrimary, margin: 0 }}>My Recent Purchase Requests</h2>
              <Link href="/dashboard/end-user/pr" style={{ fontSize: "0.75rem", fontWeight: 700, color: v.accent, textDecoration: "none" }}>
                View All →
              </Link>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--section-bg)', borderBottom: `1px solid ${v.border}` }}>
                    <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", color: v.textSecondary, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>PR Number</th>
                    <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", color: v.textSecondary, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Purpose</th>
                    <th style={{ padding: "0.875rem 1.5rem", textAlign: "right", color: v.textSecondary, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Estimated Cost</th>
                    <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", color: v.textSecondary, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPrs.map(pr => (
                    <tr key={pr.id} style={{ borderBottom: `1px solid ${v.border}` }}>
                      <td style={{ padding: "1rem 1.5rem", fontWeight: 700, color: v.accent }}>{pr.prNumber}</td>
                      <td style={{ padding: "1rem 1.5rem", color: v.textPrimary, maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pr.purpose}</td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "right", fontWeight: 600, color: v.textPrimary }}>₱{Number(pr.totalCost).toLocaleString()}</td>
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
                      <td colSpan={4} style={{ padding: '1rem' }}>
                        <EmptyState
                          preset="purchase-requests"
                          title="No Purchase Requests Yet"
                          description="You haven't submitted any purchase requests. Browse the marketplace catalog to get started."
                          action={{ label: '→ Browse Catalog', href: '/end-user' }}
                          compact
                        />
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
          
          {/* My Pending Actions */}
          <div style={{
            background: v.surface,
            border: `1px solid ${v.border}`, borderRadius: "1.25rem", padding: "1.5rem",
            boxShadow: v.shadow
          }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: v.textPrimary, margin: "0 0 1.25rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              📋 My Pending Actions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {actionsList.length > 0 ? (
                actionsList.map((action, i) => {
                  const badgeColor = 
                    action.type === "planning" 
                      ? { bg: "rgba(245,158,11,0.1)", text: "#d97706" }
                      : action.type === "requisition"
                      ? { bg: "rgba(239,68,68,0.1)", text: "#dc2626" }
                      : { bg: "rgba(16,185,129,0.1)", text: "#059669" };

                  const btnLabel = 
                    action.statusLabel === "Returned" 
                      ? "Revise"
                      : action.type === "evaluation"
                      ? "Rate Supplier"
                      : "Complete";

                  return (
                    <div 
                      key={i} 
                      style={{
                        padding: "1.1rem", borderRadius: "1rem",
                        background: "var(--bg-dark)", border: `1px solid ${v.border}`,
                        display: "flex", flexDirection: "column", gap: "0.75rem",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ 
                          fontSize: "0.65rem", fontWeight: 800, padding: "0.15rem 0.5rem", borderRadius: "4px",
                          backgroundColor: badgeColor.bg, color: badgeColor.text, textTransform: "uppercase", letterSpacing: "0.5px"
                        }}>
                          {action.type === "planning" ? "Planning" : action.type === "requisition" ? "Requisition" : "Evaluation"}
                        </span>
                        <span style={{ 
                          fontSize: "0.65rem", fontWeight: 700, 
                          color: action.statusLabel === "Returned" || action.statusLabel === "ReturnedForRevision" ? "#ef4444" : "var(--text-muted)"
                        }}>
                          {action.statusLabel || "Pending"}
                        </span>
                      </div>
                      
                      <div>
                        <h4 style={{ fontSize: "0.8rem", fontWeight: 800, color: v.textPrimary, margin: 0 }}>
                          {action.title}
                        </h4>
                        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.20rem 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {action.description}
                        </p>
                      </div>

                      <Link 
                        href={action.link} 
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.35rem",
                          textDecoration: "none", padding: "0.5rem 1rem", borderRadius: "0.5rem",
                          background: `linear-gradient(135deg, ${v.accent}, ${v.accentLight})`, color: "#fff",
                          fontWeight: 700, fontSize: "0.75rem", width: "100%", textAlign: "center",
                          boxShadow: "0 2px 8px rgba(30,58,138,0.1)",
                          transition: "all 0.15s ease"
                        }}
                        className="hover:opacity-90 hover:shadow-md"
                      >
                        {btnLabel} &rarr;
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div style={{
                  padding: "1.5rem", border: `1px dashed ${v.border}`, borderRadius: "0.85rem",
                  textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 500
                }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>✅</div>
                  All caught up! No pending actions.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: v.surface,
            border: `1px solid ${v.border}`, borderRadius: "1.25rem", padding: "1.5rem",
            boxShadow: v.shadow
          }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: v.textPrimary, margin: "0 0 1.25rem 0" }}>Quick Actions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link href="/" style={{
                display: "block", textDecoration: "none", padding: "0.75rem 1rem", borderRadius: "0.75rem",
                background: `linear-gradient(135deg, ${v.accent}, ${v.accentLight})`, color: "#fff",
                fontWeight: 700, fontSize: "0.8rem", textAlign: "center"
              }}>
                🛒 Open Procurement Catalog
              </Link>
              <Link href="/dashboard/end-user/ppmp" style={{
                display: "block", textDecoration: "none", padding: "0.75rem 1rem", borderRadius: "0.75rem",
                background: "transparent", border: `1px solid ${v.border}`, color: v.textPrimary,
                fontWeight: 600, fontSize: "0.8rem", textAlign: "center"
              }}>
                📅 Manage PPMP Calendars
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{
            background: v.surface,
            border: `1px solid ${v.border}`, borderRadius: "1.25rem", padding: "1.5rem",
            boxShadow: v.shadow, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem"
          }}>
            <div style={{ textAlign: "center", padding: "1rem", borderRight: `1px solid ${v.border}` }}>
              <span style={{ fontSize: "1.875rem", fontWeight: 900, color: v.accent }}>{prCount}</span>
              <span style={{ display: "block", fontSize: "0.75rem", color: v.textSecondary, fontWeight: 700, marginTop: "0.25rem" }}>PRs Filed</span>
            </div>
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <span style={{ fontSize: "1.875rem", fontWeight: 900, color: v.accentLight }}>{ppmpCount}</span>
              <span style={{ display: "block", fontSize: "0.75rem", color: v.textSecondary, fontWeight: 700, marginTop: "0.25rem" }}>PPMPs Prepared</span>
            </div>
          </div>

        </div>

      </div>

      {/* ── Activity Feed ── */}
      <ActivityFeed limit={8} compact />

    </div>
  );
}
