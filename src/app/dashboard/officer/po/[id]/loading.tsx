import React from "react";

export default function PoDetailLoading() {
  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", fontFamily: '"Inter", sans-serif' }}>
      {/* Breadcrumb skeleton */}
      <div style={{ height: "20px", width: "300px", background: "rgba(0,0,0,0.06)", borderRadius: "4px" }} className="animate-pulse" />

      {/* Header skeleton */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }} className="animate-pulse">
        <div style={{ width: 5, height: 48, borderRadius: 4, background: "rgba(0,0,0,0.06)" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ height: "30px", width: "250px", background: "rgba(0,0,0,0.06)", borderRadius: "4px" }} />
          <div style={{ height: "18px", width: "400px", background: "rgba(0,0,0,0.06)", borderRadius: "4px" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="lg:grid-cols-3">
        {/* Main PO form skeleton */}
        <div className="lg:col-span-2" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ height: "600px", background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "1.25rem" }} className="animate-pulse" />
        </div>

        {/* Sidebar PO controls skeleton */}
        <div className="lg:col-span-1" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ height: "200px", background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "1.25rem" }} className="animate-pulse" />
          <div style={{ height: "200px", background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "1.25rem" }} className="animate-pulse" />
        </div>
      </div>
    </div>
  );
}
