import React from "react";
import Link from "next/link";

export default function PrDetailNotFound() {
  return (
    <div style={{
      maxWidth: "500px",
      margin: "6rem auto",
      padding: "4rem 2rem",
      textAlign: "center",
      fontFamily: '"Inter", sans-serif',
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "1.25rem",
      boxShadow: "var(--shadow-card)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1.5rem"
    }}>
      <div style={{ fontSize: "3.5rem" }}>🔍</div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
        Purchase Request Not Found
      </h2>
      <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
        We couldn't locate any Purchase Request matching this identifier in the Batanes State College database.
      </p>

      <Link
        href="/dashboard/officer/pr"
        style={{
          padding: "0.65rem 1.75rem",
          borderRadius: "0.75rem",
          border: "none",
          background: "var(--accent)",
          color: "#fff",
          fontWeight: 700,
          fontSize: "0.85rem",
          textDecoration: "none",
          boxShadow: "0 4px 12px rgba(126, 25, 27, 0.2)",
          transition: "opacity 0.2s"
        }}
        className="hover:opacity-90"
      >
        ← Back to Requisitions Hub
      </Link>
    </div>
  );
}
