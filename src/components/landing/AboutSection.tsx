"use client";

import Image from "next/image";
import { GraduationCap, ShieldCheck, Globe, BookOpen } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-14 lg:py-20 bg-base-100 border-b border-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left: About Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="badge badge-outline border-[#800000] text-[#800000] font-bold uppercase tracking-wider text-xs py-2 px-3">
                About the System
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#800000] tracking-tight">
                About ProcureWise
              </h2>
            </div>

            <p className="text-sm sm:text-base text-base-content/80 leading-relaxed">
              ProcureWise is the official internal Procurement Management Information System of Batanes State College,
              developed to modernize and digitize the institution's procurement operations in full compliance with
              <strong className="text-[#800000]"> Republic Act No. 9184</strong>, the Government Procurement Reform Act.
            </p>

            <p className="text-sm sm:text-base text-base-content/80 leading-relaxed">
              The system automates and centralizes the entire procurement lifecycle â€” from the creation of Purchase
              Requests by college offices and departments, through procurement review, competitive bidding via Request
              for Quotation, multi-criteria supplier evaluation, and culminating in the official issuance of
              Appendix 61 Purchase Orders and delivery tracking.
            </p>

            <p className="text-sm sm:text-base text-base-content/80 leading-relaxed">
              Access to all procurement modules is strictly restricted to registered institutional users with
              assigned roles. This ensures accountability, transparency, and data integrity throughout the procurement process.
            </p>

            {/* Highlight Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-base-200/50 border border-base-200">
                <GraduationCap className="h-5 w-5 text-[#800000] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-extrabold text-base-content">State University & College</div>
                  <div className="text-xs text-base-content/60">Designed for the unique procurement needs of SUCs under CHED supervision.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-base-200/50 border border-base-200">
                <ShieldCheck className="h-5 w-5 text-[var(--secondary-strong)] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-extrabold text-base-content">RA 9184 Compliant</div>
                  <div className="text-xs text-base-content/60">All procurement workflows align with Philippine government procurement regulations.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-base-200/50 border border-base-200">
                <Globe className="h-5 w-5 text-[#800000] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-extrabold text-base-content">Transparent by Design</div>
                  <div className="text-xs text-base-content/60">Every procurement action is logged with a tamper-evident audit trail.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-base-200/50 border border-base-200">
                <BookOpen className="h-5 w-5 text-[var(--secondary-strong)] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-extrabold text-base-content">MCDM Best-Value Engine</div>
                  <div className="text-xs text-base-content/60">Multi-Criteria Decision-Making algorithm ensures fair, objective supplier selection.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Institution Info Card */}
          <div className="lg:col-span-5">
            <div className="card card-border rounded-box bg-base-100 p-6 space-y-5">
              {/* College Info */}
              <div className="flex flex-col items-center text-center space-y-3 border-b border-base-300 pb-5">
                <div className="relative h-20 w-20 flex items-center justify-center bg-white p-2 border border-base-300">
                  <Image
                    src="/images/bsc-logo.png"
                    alt="Batanes State College Logo"
                    width={72}
                    height={72}
                    className="object-contain h-full w-full"
                  />
                </div>
                <div>
                  <div className="text-lg font-black text-[#800000]">Batanes State College</div>
                  <div className="text-xs font-bold text-[var(--secondary-strong)]">San Antonio, Basco, Batanes</div>
                  <div className="text-xs text-base-content/60 mt-1">CHED-Supervised State University</div>
                </div>
              </div>

              {/* System Purpose */}
              <div className="space-y-3 text-xs text-base-content/80">
                <div className="font-extrabold text-sm text-base-content uppercase tracking-wider">
                  System Purpose
                </div>
                <p className="leading-relaxed">
                  ProcureWise digitizes the complete procurement cycle for Batanes State College â€” replacing
                  manual paper-based processes with a centralized, role-governed digital platform aligned with RA 9184.
                </p>
                <p className="leading-relaxed">
                  This is an internal institutional system. All procurement operations require users to be
                  authenticated with a registered Batanes State College institutional account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
