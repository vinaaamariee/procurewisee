import React from "react";

interface BudgetWidgetProps {
  allocated: number;
  alreadyPlanned: number;
  currentDraft: number;
}

export default function BudgetWidget({
  allocated,
  alreadyPlanned,
  currentDraft,
}: BudgetWidgetProps) {
  const totalPlannedAndDraft = alreadyPlanned + currentDraft;
  const remaining = allocated - totalPlannedAndDraft;
  const utilization = allocated > 0 ? (totalPlannedAndDraft / allocated) * 100 : 0;
  const isOverBudget = remaining < 0;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "1rem",
        padding: "1.5rem",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Department Budget Tracker
        </h3>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            padding: "0.25rem 0.5rem",
            borderRadius: "6px",
            background: isOverBudget ? "rgba(220, 38, 38, 0.1)" : "rgba(16, 185, 129, 0.1)",
            color: isOverBudget ? "#ef4444" : "#10b981",
          }}
        >
          {isOverBudget ? "Over Budget" : "Within Limit"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>
            Total Allocated Budget
          </span>
          <strong style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>
            ₱{allocated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>
            Already Planned (Other plans)
          </span>
          <strong style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-secondary)" }}>
            ₱{alreadyPlanned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>
            Current PPMP Draft
          </span>
          <strong style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--accent)" }}>
            ₱{currentDraft.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>
            Remaining Budget
          </span>
          <strong
            style={{
              fontSize: "1.2rem",
              fontWeight: 800,
              color: isOverBudget ? "#ef4444" : "#10b981",
            }}
          >
            ₱{remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 700 }}>
          <span style={{ color: "var(--text-secondary)" }}>Budget Utilization</span>
          <span style={{ color: isOverBudget ? "#ef4444" : "var(--text-primary)" }}>
            {utilization.toFixed(1)}%
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: "8px",
            backgroundColor: "rgba(0,0,0,0.06)",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.min(utilization, 100)}%`,
              height: "100%",
              backgroundColor: isOverBudget ? "#ef4444" : "#b88a1b",
              borderRadius: "999px",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
