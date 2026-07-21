"use client";

import Link from "next/link";
import { ChevronRight, LayoutDashboard } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="relative z-10 mb-6 flex flex-col gap-2 font-sans">
      {/* Breadcrumb Navigation */}
      <div
        className="flex items-center gap-2 text-xs font-semibold"
        style={{ color: "var(--text-muted)" }}
      >
        <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
        <Link
          href="/dashboard"
          className="transition-colors duration-150 hover:text-[var(--accent)]"
        >
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span style={{ color: "var(--text-secondary)" }}>Procurement Officer</span>
      </div>

      {/* Main Title & Subtitle */}
      <div>
        <h1
          className="text-3xl font-extrabold tracking-tight font-sans"
          style={{ color: "var(--text-primary)" }}
        >
          Procurement Dashboard
        </h1>

        <p
          className="mt-1 text-sm font-normal"
          style={{ color: "var(--text-muted)" }}
        >
          Monitor procurement activities, RFQs, suppliers, and purchasing workflows.
        </p>
      </div>
    </header>
  );
}