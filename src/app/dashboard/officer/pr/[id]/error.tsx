"use client";

import React, { useEffect } from "react";
import Link from "next/link";

interface PrDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PrDetailError({ error, reset }: PrDetailErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{
      maxWidth: "600px",
      margin: "4rem auto",
      padding: "3rem 2rem",
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
      <div style={{ fontSize: "3rem" }}>⚠️</div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
        Failed to load Requisition Details
      </h2>
      <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
        An unexpected error occurred while parsing the requisition record. This might be due to a network disruption or data inconsistency.
      </p>
      
      {error.message && (
        <pre style={{
          padding: "1rem",
          borderRadius: "0.5rem",
          background: "rgba(0,0,0,0.05)",
          fontSize: "0.75rem",
          color: "var(--text-primary)",
          maxWidth: "100%",
          overflowX: "auto",
          textAlign: "left",
          margin: 0
        }}>
          <code>{error.message}</code>
        </pre>
      )}

      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={reset}
          style={{
            padding: "0.6rem 1.5rem",
            borderRadius: "0.75rem",
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
            transition: "opacity 0.2s"
          }}
          className="hover:opacity-90"
        >
          Try Again
        </button>
        <Link
          href="/dashboard/officer/pr"
          style={{
            padding: "0.6rem 1.5rem",
            borderRadius: "0.75rem",
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text-primary)",
            fontWeight: 700,
            fontSize: "0.85rem",
            textDecoration: "none",
            transition: "background 0.2s"
          }}
          className="hover:bg-slate-500/10"
        >
          Back to Requisitions
        </Link>
      </div>
    </div>
  );
}
