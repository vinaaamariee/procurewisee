"use client";

import { FileCheck, Users, ShieldCheck, Layers } from "lucide-react";

export default function StatsSection() {
  return (
    <section className="py-12 bg-base-200/50 border-b border-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* daisyUI Stats Component */}
        <div className="stats stats-vertical lg:stats-horizontal shadow-sm bg-base-100 border border-base-200 w-full rounded-2xl">
          {/* Stat 1 */}
          <div className="stat p-6">
            <div className="stat-figure text-[#7B1E1E]">
              <Layers className="h-8 w-8" />
            </div>
            <div className="stat-title text-xs font-bold uppercase tracking-wider text-base-content/60">
              Procurement Workflow
            </div>
            <div className="stat-value text-2xl sm:text-3xl font-black text-[#7B1E1E]">
              7-Step Digital
            </div>
            <div className="stat-desc text-xs font-semibold text-base-content/70">
              PR → RFQ → PO Lifecycle
            </div>
          </div>

          {/* Stat 2 */}
          <div className="stat p-6">
            <div className="stat-figure text-[#A6761D]">
              <Users className="h-8 w-8" />
            </div>
            <div className="stat-title text-xs font-bold uppercase tracking-wider text-base-content/60">
              System Access
            </div>
            <div className="stat-value text-2xl sm:text-3xl font-black text-[#A6761D]">
              Multi-Role Access
            </div>
            <div className="stat-desc text-xs font-semibold text-base-content/70">
              End User, Officer, BAC & Admin
            </div>
          </div>

          {/* Stat 3 */}
          <div className="stat p-6">
            <div className="stat-figure text-[#7B1E1E]">
              <FileCheck className="h-8 w-8" />
            </div>
            <div className="stat-title text-xs font-bold uppercase tracking-wider text-base-content/60">
              Document Templates
            </div>
            <div className="stat-value text-2xl sm:text-3xl font-black text-[#7B1E1E]">
              Appendix 60 & 61
            </div>
            <div className="stat-desc text-xs font-semibold text-base-content/70">
              Official Government Forms
            </div>
          </div>

          {/* Stat 4 */}
          <div className="stat p-6">
            <div className="stat-figure text-[#A6761D]">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="stat-title text-xs font-bold uppercase tracking-wider text-base-content/60">
              Compliance Standard
            </div>
            <div className="stat-value text-2xl sm:text-3xl font-black text-[#A6761D]">
              100% RA 9184
            </div>
            <div className="stat-desc text-xs font-semibold text-base-content/70">
              Audited & Transparent
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
