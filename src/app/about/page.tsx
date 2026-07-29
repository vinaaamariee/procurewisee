import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import {
  Package,
  Shield,
  Award,
  BarChart3,
  CheckCircle2,
  Building2,
  FileCheck,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About ProcureWise — Intelligent Procurement Analytics | Batanes State College",
  description:
    "Learn about ProcureWise: Batanes State College's automated canvassing, MCDM best-value recommendation engine, and transparent procurement analytics platform.",
};

const pillars = [
  {
    icon: BrainCircuit,
    title: "MCDM Recommendation Engine",
    description:
      "Multi-Criteria Decision Making algorithms automatically calculate standardized score vectors balancing price, lead time, and supplier reliability.",
    color: "#7B1E1E",
    bg: "rgba(123, 30, 30, 0.08)",
  },
  {
    icon: FileCheck,
    title: "Automated Canvassing & Abstract",
    description:
      "Eliminates manual tabulation by auto-aggregating supplier bids into official, audit-ready abstracts of canvas for instant review.",
    color: "#D4A017",
    bg: "rgba(212, 160, 23, 0.08)",
  },
  {
    icon: Shield,
    title: "Forensic Audit Trail",
    description:
      "Every status transition, budget allocation, and bid entry is asynchronously stamped into an immutable audit trail using modern Next.js schedulers.",
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.08)",
  },
  {
    icon: TrendingUp,
    title: "Historical Price Tracking",
    description:
      "Preserves long-term item price histories to identify market inflation trends and optimize departmental procurement budget allocations.",
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.08)",
  },
];

const institutionalGoals = [
  "Enhance transparency and accountability in institutional expenditures.",
  "Drastically reduce turnaround time from requisition submission to PO award.",
  "Ensure strict adherence to Philippine Republic Act 9184 procurement standards.",
  "Provide actionable data analytics for administrative decision-makers.",
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#F7F8FA] via-[#F3F4F6] to-[#F7F8FA] dark:bg-slate-950 text-[#111827] dark:text-slate-100 font-sans">
      <Header />

      <main className="flex-1">
        {/* ── Hero Banner ── */}
        <section className="relative overflow-hidden bg-gradient-to-r from-[#7B1E1E] via-[#5E1414] to-[#3B0A0A] py-16 lg:py-24 text-white">
          <div className="absolute inset-0 bg-[radial-[#D4A017]/10_1px,transparent_1px] [background-size:24px_24px] opacity-30" />
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4A017]/40 bg-[#D4A017]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#D4A017] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Batanes State College System</span>
              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
                About <span className="text-[#D4A017]">ProcureWise</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
                An Intelligent Procurement Analytics and Automated Canvassing System with Best-Value Recommendation Engine engineered specifically to elevate institutional procurement at Batanes State College.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 rounded-full bg-[#D4A017] px-6 py-3 text-xs font-bold text-[#111827] hover:bg-[#b88a10] transition-all shadow-md hover:-translate-y-0.5"
                >
                  <Package className="h-4 w-4" />
                  <span>Browse Procurement Catalog</span>
                </Link>
                <Link
                  href="/track"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs font-bold text-white hover:bg-white/20 transition-all backdrop-blur-md"
                >
                  <span>Track Purchase Request</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Content ── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16 lg:space-y-20">
          
          {/* Overview & Mission */}
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7B1E1E] dark:text-[#D4A017]">
                <Building2 className="h-4 w-4" />
                <span>Institutional Vision</span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-[#111827] dark:text-white">
                Modernizing Higher Education Procurement
              </h2>

              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 leading-relaxed">
                ProcureWise bridges traditional government procurement workflows with cutting-edge analytics. By replacing manual paperwork with automated canvas generation, multi-criteria decision support, and digital auditability, the system empowers Procurement Officers, Approvers, and Requisitions to achieve maximum value for state college funds.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {institutionalGoals.map((goal, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#059669] flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-700 dark:text-slate-300 font-medium">
                      {goal}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats / Highlight Box */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7B1E1E]/10 text-[#7B1E1E] dark:text-red-400">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827] dark:text-white">
                    Built for Batanes State College
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Compliant with Philippine Public Procurement Guidelines
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 text-center">
                  <div className="text-2xl font-black text-[#7B1E1E] dark:text-red-400">100%</div>
                  <div className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Paperless Canvas</div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 text-center">
                  <div className="text-2xl font-black text-[#D4A017]">MCDM</div>
                  <div className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Recommendation</div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 text-center">
                  <div className="text-2xl font-black text-[#059669]">E2E</div>
                  <div className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Audit Trail</div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 text-center">
                  <div className="text-2xl font-black text-[#6366f1]">24/7</div>
                  <div className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Public Tracking</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key System Pillars */}
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
                Technical Capabilities
              </p>
              <h2 className="text-3xl font-bold text-[#111827] dark:text-white">
                Core System Features
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ background: pillar.bg }}
                      >
                        <Icon className="h-6 w-6" style={{ color: pillar.color }} />
                      </div>
                      <h3 className="text-base font-bold text-[#111827] dark:text-white">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
