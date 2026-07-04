import React, { useState } from "react";
import { ProductListItem } from "@/features/catalog/server/queries";

interface SuggestedProductsProps {
  products: ProductListItem[];
  onAddProduct: (product: ProductListItem) => void;
}

type SuggestionTab = "frequent" | "recent_purchased" | "economical" | "updated";

export default function SuggestedProducts({
  products,
  onAddProduct,
}: SuggestedProductsProps) {
  const [activeTab, setActiveTab] = useState<SuggestionTab>("frequent");

  // Frequently Requested (sorted by popularity desc)
  const frequentProducts = [...products]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 4);

  // Recently Purchased (mocked using products with specific ids or sorting by name length as fallback, or just top 4 of first half)
  const recentlyPurchased = [...products]
    .filter((_, i) => i % 3 === 0)
    .slice(0, 4);

  // Most Economical (sorted by lowestPrice or estimatedUnitCost asc)
  const economicalProducts = [...products]
    .sort((a, b) => {
      const priceA = a.lowestPrice ?? a.estimatedUnitCost;
      const priceB = b.lowestPrice ?? b.estimatedUnitCost;
      return priceA - priceB;
    })
    .slice(0, 4);

  // Recently Updated (sorted by updatedAt desc)
  const recentlyUpdated = [...products]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const getActiveList = () => {
    switch (activeTab) {
      case "frequent":
        return frequentProducts;
      case "recent_purchased":
        return recentlyPurchased;
      case "economical":
        return economicalProducts;
      case "updated":
        return recentlyUpdated;
    }
  };

  const activeList = getActiveList();

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
        gap: "1rem",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
        Suggested for your Department
      </h3>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem", overflowX: "auto" }}>
        {[
          { id: "frequent", label: "Frequently Requested" },
          { id: "recent_purchased", label: "Recently Purchased" },
          { id: "economical", label: "Most Economical" },
          { id: "updated", label: "Recently Updated" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SuggestionTab)}
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                background: isActive ? "rgba(184, 138, 27, 0.15)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid of items */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
        {activeList.map((product) => {
          const currentPrice = product.estimatedUnitCost;
          return (
            <div
              key={product.id}
              style={{
                background: "var(--bg-deep)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "0.75rem",
              }}
            >
              <div>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>
                  {product.category.name}
                </span>
                <h4 style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)", margin: "0.2rem 0 0 0", lineClamp: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                  {product.name}
                </h4>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "0.5rem" }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--accent)" }}>
                    ₱{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>
                    per {product.unit.abbreviation || "unit"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onAddProduct(product)}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  background: "linear-gradient(90deg, #7e191b 0%, #b88a1b 100%)",
                  color: "white",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                + Add to PPMP
              </button>
            </div>
          );
        })}
        {activeList.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.75rem" }}>
            No suggested products available in this category.
          </div>
        )}
      </div>
    </div>
  );
}
