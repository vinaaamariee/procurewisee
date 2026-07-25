"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OfficerDashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[OfficerDashboard] Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "var(--alert-dim)", color: "var(--alert)" }}
      >
        <AlertTriangle className="h-8 w-8" />
      </div>

      <div className="max-w-md">
        <h2
          className="text-xl font-bold"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
        >
          Something went wrong
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          An error occurred while loading the Officer Dashboard. This may be a
          temporary issue — try again or contact your system administrator if the
          problem persists.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <button
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
        style={{ background: "var(--accent)" }}
      >
        <RotateCcw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}
