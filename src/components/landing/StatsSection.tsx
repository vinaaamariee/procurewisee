"use client";

import { FileCheck, Users, ShieldCheck, Layers } from "lucide-react";

export default function StatsSection() {
  return (
    <section className="border-b border-base-300 bg-base-200 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* daisyUI Stats Component */}
        <div className="stats stats-vertical w-full rounded-box border border-base-300 bg-base-100 lg:stats-horizontal">
          {/* Stat 1 */}
          <div className="stat p-6">
            <div className="stat-figure text-[#800000]">
              <Layers className="h-8 w-8" />
            </div>
            <div className="stat-title text-xs font-bold uppercase tracking-wider text-base-content/60">
              Procurement Workflow
            </div>
            <div className="stat-value text-2xl sm:text-3xl font-black text-[#800000]">
              7-Step Process
            </div>
            <div className="stat-desc text-xs font-semibold text-base-content/70">
              PR â†’ Review â†’ RFQ â†’ Quotes â†’ Award â†’ PO â†’ Delivery
            </div>
          </div>

          {/* Stat 2 */}
          <div className="stat p-6">
            <div className="stat-figure text-[var(--secondary-strong)]">
              <Users className="h-8 w-8" />
            </div>
            <div className="stat-title text-xs font-bold uppercase tracking-wider text-base-content/60">
              Institutional Access
            </div>
            <div className="stat-value text-2xl sm:text-3xl font-black text-[var(--secondary-strong)]">
              Role-Based
            </div>
            <div className="stat-desc text-xs font-semibold text-base-content/70">
              End User, Procurement Staff & Administrator
            </div>
          </div>

          {/* Stat 3 */}
          <div className="stat p-6">
            <div className="stat-figure text-[#800000]">
              <FileCheck className="h-8 w-8" />
            </div>
            <div className="stat-title text-xs font-bold uppercase tracking-wider text-base-content/60">
              Official Templates
            </div>
            <div className="stat-value text-2xl sm:text-3xl font-black text-[#800000]">
              Appendix 60 & 61
            </div>
            <div className="stat-desc text-xs font-semibold text-base-content/70">
              Gov't PR & PO Government Forms
            </div>
          </div>

          {/* Stat 4 */}
          <div className="stat p-6">
            <div className="stat-figure text-[var(--secondary-strong)]">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="stat-title text-xs font-bold uppercase tracking-wider text-base-content/60">
              Compliance Standard
            </div>
            <div className="stat-value text-2xl sm:text-3xl font-black text-[var(--secondary-strong)]">
              RA 9184
            </div>
            <div className="stat-desc text-xs font-semibold text-base-content/70">
              Government Procurement Reform Act
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
