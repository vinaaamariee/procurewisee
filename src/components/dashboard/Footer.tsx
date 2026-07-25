"use client";

import { ShieldCheck, Database, Server, Clock, Heart } from "lucide-react";

function StatusDot({ ok = true }: { ok?: boolean }) {
  return (
    <span
      className="relative flex h-2 w-2 shrink-0"
      aria-hidden="true"
    >
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${ok ? "bg-emerald-500" : "bg-red-500"}`}
      />
      <span
        className={`relative inline-flex h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`}
      />
    </span>
  );
}

export default function Footer() {
  const now = new Date();
  const lastSync = now.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const year = now.getFullYear();

  return (
    <footer
      className="rounded-3xl border"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex flex-col gap-6 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">

        {/* ── Left: Brand ────────────────────────────── */}
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            ProcureWise{" "}
            <span
              className="ml-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider"
              style={{
                background: "var(--accent-glass)",
                borderColor: "var(--border-accent)",
                color: "var(--accent)",
              }}
            >
              v1.0.0
            </span>
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            Procurement Management Information System · Batanes State College
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © {year} Batanes State College · All rights reserved
          </p>
        </div>

        {/* ── Center: System Health ───────────────────── */}
        <div className="flex flex-wrap items-center gap-5">

          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            <StatusDot ok />
            <Database className="h-3.5 w-3.5" />
            <span className="font-semibold">Database Connected</span>
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            <StatusDot ok />
            <Server className="h-3.5 w-3.5" />
            <span className="font-semibold">Server Healthy</span>
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            <StatusDot ok />
            <Clock className="h-3.5 w-3.5" />
            <span className="font-semibold">Last Sync: {lastSync}</span>
          </div>

        </div>

        {/* ── Right: Env + Credits ───────────────────── */}
        <div className="flex flex-col items-start gap-1.5 lg:items-end">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest"
            style={{
              background: "rgba(16,185,129,0.07)",
              borderColor: "rgba(16,185,129,0.25)",
              color: "#059669",
            }}
          >
            <ShieldCheck className="h-3 w-3" />
            Production
          </span>

          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Built with <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" /> by the ProcureWise Team
          </div>
        </div>

      </div>
    </footer>
  );
}