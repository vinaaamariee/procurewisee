import React, { useState } from "react";
import { ProductListItem } from "@/features/catalog/server/queries";
import SuggestedProducts from "./SuggestedProducts";

interface PPMPMarketplaceProps {
  products: ProductListItem[];
  onAddItem: (product: ProductListItem) => void;
}

export default function PPMPMarketplace({
  products,
  onAddItem,
}: PPMPMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("All");
  const [selectedProductDetails, setSelectedProductDetails] = useState<ProductListItem | null>(null);

  // 1. Get unique category list from products for category tabs filter
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category.name)))];

  // 2. Filter products by search query and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.productCode && p.productCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.brand && p.brand.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategoryName === "All" || p.category.name === selectedCategoryName;

    return matchesSearch && matchesCategory;
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {/* 1. Suggested Products Panel */}
      <SuggestedProducts products={products} onAddProduct={onAddItem} />

      {/* 2. Main Marketplace Catalog */}
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
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Procurement Catalog
          </h3>

          {/* Search bar */}
          <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
            <input
              type="text"
              placeholder="Search products, brands, codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.55rem 1rem",
                borderRadius: "999px",
                border: "1px solid var(--border)",
                background: "var(--bg-deep)",
                color: "var(--text-primary)",
                outline: "none",
                fontSize: "0.8rem",
              }}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
          {categories.map((catName) => {
            const isActive = selectedCategoryName === catName;
            return (
              <button
                key={catName}
                onClick={() => setSelectedCategoryName(catName)}
                style={{
                  padding: "0.45rem 1rem",
                  borderRadius: "999px",
                  border: "1px solid var(--border)",
                  background: isActive ? "linear-gradient(90deg, #7e191b 0%, #b88a1b 100%)" : "var(--surface)",
                  color: isActive ? "white" : "var(--text-secondary)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: isActive ? "0 2px 8px rgba(184, 138, 27, 0.2)" : "none",
                  whiteSpace: "nowrap",
                }}
              >
                {catName}
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {filteredProducts.map((product) => {
            const supplierCount = 3;

            return (
              <div
                key={product.id}
                style={{
                  background: "var(--bg-deep)",
                  border: "1px solid var(--border)",
                  borderRadius: "1rem",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "1rem",
                  position: "relative",
                }}
              >
                {/* Header info */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.35rem" }}>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      {product.category.name}
                    </span>
                  </div>

                  <h4
                    onClick={() => setSelectedProductDetails(product)}
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      margin: 0,
                      cursor: "pointer",
                      textDecoration: "underline",
                      textDecorationColor: "transparent",
                      transition: "all 0.2s ease",
                      lineClamp: 2,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                    className="hover:text-[var(--accent)] hover:underline"
                  >
                    {product.name}
                  </h4>
                  <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                    Brand: {product.brand?.name || "Generic"} • Code: {product.productCode || "N/A"}
                  </span>

                  <span style={{ display: "block", fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.75rem" }}>
                    Suppliers compared: <strong>{supplierCount} vendors</strong> • Last updated: <strong>{new Date(product.updatedAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</strong>
                  </span>
                </div>

                <button
                  onClick={() => onAddItem(product)}
                  style={{
                    width: "100%",
                    padding: "0.55rem",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    background: "#7e191b",
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  + Add to PPMP Draft
                </button>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div style={{ gridColumn: "span 3", padding: "4rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              No products found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedProductDetails && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "1.25rem",
              maxWidth: "500px",
              width: "100%",
              padding: "2rem",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              fontFamily: '"Inter", sans-serif',
            }}
          >
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                {selectedProductDetails.name}
              </h3>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Code: {selectedProductDetails.productCode || "N/A"} • Category: {selectedProductDetails.category.name}
              </span>
            </div>

            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
              {selectedProductDetails.description}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
              <button
                type="button"
                onClick={() => {
                  onAddItem(selectedProductDetails);
                  setSelectedProductDetails(null);
                }}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#7e191b",
                  color: "white",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Add to PPMP
              </button>
            </div>

            <button
              onClick={() => setSelectedProductDetails(null)}
              style={{
                width: "100%",
                padding: "0.55rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "rgba(0,0,0,0.03)",
                color: "var(--text-primary)",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
