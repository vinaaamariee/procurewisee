import React from "react";
import { ProductListItem } from "@/features/catalog/server/queries";
import BudgetWidget from "./BudgetWidget";

export interface DraftItem {
  product: ProductListItem;
  quantity: number;
  description: string;
}

interface PPMPDraftCartProps {
  items: DraftItem[];
  ppmpNumber: string;
  projectTitle: string;
  fundingSource: string;
  department: string;
  office: string;
  budgetAllocated: number;
  budgetAlreadyPlanned: number;
  onUpdateQuantity: (productId: number, qty: number) => void;
  onUpdateDescription: (productId: number, desc: string) => void;
  onRemoveItem: (productId: number) => void;
  onUpdateMetadata: (key: string, val: any) => void;
  onSaveDraft: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export default function PPMPDraftCart({
  items,
  ppmpNumber,
  projectTitle,
  fundingSource,
  department,
  office,
  budgetAllocated,
  budgetAlreadyPlanned,
  onUpdateQuantity,
  onUpdateDescription,
  onRemoveItem,
  onUpdateMetadata,
  onSaveDraft,
  onCancel,
  isSaving,
}: PPMPDraftCartProps) {
  const currentDraftTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.product.estimatedUnitCost,
    0
  );

  const isCartEmpty = items.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCartEmpty) return;
    onSaveDraft();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {/* Budget Summary Widget at the top of the workspace */}
      <BudgetWidget
        allocated={budgetAllocated}
        alreadyPlanned={budgetAlreadyPlanned}
        currentDraft={currentDraftTotal}
      />

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          padding: "1.5rem",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: "0 0 1.25rem 0",
          }}
        >
          PPMP Draft Cart
        </h3>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Metadata */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                PPMP Number *
              </label>
              <input
                type="text"
                required
                placeholder="E.g., PPMP-2026-ICT-001"
                value={ppmpNumber}
                onChange={(e) => onUpdateMetadata("ppmpNumber", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--bg-deep)",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontSize: "0.8rem",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                Project Title *
              </label>
              <input
                type="text"
                required
                placeholder="E.g., Procurement Upgrades"
                value={projectTitle}
                onChange={(e) => onUpdateMetadata("projectTitle", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--bg-deep)",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontSize: "0.8rem",
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                Funding Source *
              </label>
              <select
                value={fundingSource}
                onChange={(e) => onUpdateMetadata("fundingSource", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--bg-deep)",
                  color: "var(--text-primary)",
                  outline: "none",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                <option value="GAA 2026">GAA 2026</option>
                <option value="Income Fund">Income Fund</option>
                <option value="Fiduciary Fund">Fiduciary Fund</option>
                <option value="Special Trust Fund">Special Trust Fund</option>
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                  Department
                </label>
                <input
                  type="text"
                  disabled
                  value={department}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "rgba(0,0,0,0.03)",
                    color: "var(--text-muted)",
                    outline: "none",
                    fontSize: "0.8rem",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                  Office
                </label>
                <input
                  type="text"
                  disabled
                  value={office}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "rgba(0,0,0,0.03)",
                    color: "var(--text-muted)",
                    outline: "none",
                    fontSize: "0.8rem",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "0.5rem" }}>
              Selected Products List
            </span>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "280px", overflowY: "auto", paddingRight: "0.25rem" }}>
              {items.map((item) => {
                const itemTotal = item.quantity * item.product.estimatedUnitCost;
                return (
                  <div
                    key={item.product.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      background: "var(--bg-deep)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "0.75rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <strong style={{ fontSize: "0.8rem", color: "var(--text-primary)" }}>
                          {item.product.name}
                        </strong>
                        <span style={{ display: "block", fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                          Code: {item.product.productCode || "N/A"} • Unit: {item.product.unit.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", alignItems: "center" }}>
                      <div>
                        <label style={{ fontSize: "0.65rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.15rem" }}>
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => onUpdateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                          style={{
                            width: "100%",
                            padding: "0.3rem 0.5rem",
                            borderRadius: "6px",
                            border: "1px solid var(--border)",
                            background: "var(--surface)",
                            color: "var(--text-primary)",
                            fontSize: "0.75rem",
                            outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.15rem" }}>
                          Unit Price
                        </span>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          ₱{item.product.estimatedUnitCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.15rem" }}>
                          Total Cost
                        </span>
                        <strong style={{ fontSize: "0.8rem", color: "var(--accent)" }}>
                          ₱{itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Add optional item remarks/specifications..."
                        value={item.description}
                        onChange={(e) => onUpdateDescription(item.product.id, e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.4rem",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                          background: "var(--surface)",
                          color: "var(--text-primary)",
                          fontSize: "0.7rem",
                          outline: "none",
                          marginTop: "0.25rem",
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {isCartEmpty && (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                  Your cart is empty. Add products from the Marketplace first.
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: "0.6rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "rgba(0,0,0,0.04)",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.8rem",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCartEmpty || isSaving}
              style={{
                flex: 1,
                padding: "0.6rem",
                borderRadius: "8px",
                border: "none",
                background: isCartEmpty ? "var(--text-muted)" : "#7e191b",
                color: "white",
                cursor: isCartEmpty ? "not-allowed" : "pointer",
                fontWeight: 700,
                fontSize: "0.8rem",
              }}
            >
              {isSaving ? "Saving..." : "Save PPMP Draft"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
