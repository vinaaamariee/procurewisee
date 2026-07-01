import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import HeroSearchForm from "./HeroSearchForm";

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--bg-deep)" }}
    >
      {/* Decorative background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--text-primary) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Gradient orbs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#7e191b]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#ca8a04]/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          {/* Institution badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-muted)",
              background: "var(--surface)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#ca8a04] animate-pulse" />
            Batanes State College
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl"
            style={{ color: "var(--text-primary)" }}
          >
            <span className="text-[#7e191b] dark:text-[#e23a3e]">PROCURE</span>
            <span className="text-[#ca8a04] dark:text-[#facc15]">WISE</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-base font-medium leading-relaxed sm:text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            An Intelligent Procurement Analytics and Automated Canvassing System
            with Best-Value Recommendation Engine
          </p>

          {/* Description */}
          <p className="mt-3 text-sm leading-relaxed sm:text-base"
            style={{ color: "var(--text-muted)" }}
          >
            Digitizing procurement planning, market scoping, canvassing, and
            decision support for Batanes State College.
          </p>

          {/* Search bar */}
          <div className="mt-8">
            <HeroSearchForm />
          </div>

          {/* CTA Button */}
          <div className="mt-6">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl"
              style={{
                background: "linear-gradient(135deg, #7e191b, #962124)",
              }}
            >
              Browse Procurement Catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
