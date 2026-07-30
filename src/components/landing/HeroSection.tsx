"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, LogIn, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export default function HeroSection() {
  const workflowSteps = [
    { title: "Purchase Request", desc: "Appendix 60 PR Requisition" },
    { title: "Procurement Review", desc: "Budget & Specification Audit" },
    { title: "Request for Quotation", desc: "Automated RFQ Publication" },
    { title: "Supplier Quotations", desc: "Sealed Bidding & AOQ" },
    { title: "Supplier Evaluation", desc: "MCDM Best-Value Scoring" },
    { title: "Purchase Order", desc: "Appendix 61 PO Generation" },
    { title: "Delivery & Inspection", desc: "Receipt & Audit Completion" },
  ];

  return (
    <section className="bg-gradient-to-b from-base-100 via-base-200/30 to-base-100 py-8 lg:py-14 border-b border-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Compliance Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#7B1E1E]/20 bg-[#7B1E1E]/5 px-3.5 py-1.5 text-xs font-bold text-[#7B1E1E] uppercase tracking-wider shadow-sm">
              <ShieldCheck className="h-4 w-4 text-[#A6761D]" />
              <span>Republic Act No. 9184 — Government Procurement Reform Act</span>
            </div>

            {/* Institution & System Title */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-base-200">
                  <Image
                    src="/images/bsc-logo.png"
                    alt="Batanes State College Logo"
                    width={48}
                    height={48}
                    className="object-contain h-full w-full"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#7B1E1E] tracking-tight leading-tight">
                    Batanes State College
                  </h1>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#A6761D]">
                    Official Internal Procurement System
                  </p>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-base-content tracking-tight pt-1">
                Procurement Management Information System
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-base-content/80 leading-relaxed font-normal">
              The official internal digital platform for managing Purchase Requests, Requests for Quotation,
              Supplier Evaluation, Purchase Orders, and end-to-end procurement monitoring across
              Batanes State College. Access is restricted to authenticated institutional users only.
            </p>

            {/* Auth Gate Notice */}
            <div className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-900/20 px-4 py-2.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <Lock className="h-4 w-4 flex-shrink-0" />
              <span>All procurement modules are available only after signing in with your institutional account.</span>
            </div>

            {/* Primary CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/login"
                className="btn btn-primary btn-md rounded-xl bg-[#7B1E1E] hover:bg-[#601717] text-white border-none font-bold shadow-md px-6"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>

              <Link
                href="/login"
                className="btn btn-outline btn-md rounded-xl border-[#7B1E1E] text-[#7B1E1E] hover:bg-[#7B1E1E] hover:text-white font-bold px-6"
              >
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Sub-feature list */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-semibold text-base-content/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#7B1E1E] flex-shrink-0" />
                <span>Official Appendix 60 PR Form</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#A6761D] flex-shrink-0" />
                <span>Automated PR-to-RFQ Conversion</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#7B1E1E] flex-shrink-0" />
                <span>MCDM Best-Value Recommendation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#A6761D] flex-shrink-0" />
                <span>Official Appendix 61 PO Form</span>
              </div>
            </div>
          </div>

          {/* Right Column: Workflow Visualization */}
          <div className="lg:col-span-5">
            <div className="card bg-base-100 p-5 sm:p-6 rounded-2xl border border-base-200 shadow-md">
              <div className="flex items-center justify-between border-b border-base-200 pb-3 mb-4">
                <h3 className="text-sm font-extrabold text-[#7B1E1E] uppercase tracking-wider">
                  Institutional Procurement Lifecycle
                </h3>
                <div className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-base-content/50" />
                  <span className="badge badge-sm border-[#A6761D]/30 bg-[#A6761D]/10 text-[#A6761D] font-bold">
                    Authenticated
                  </span>
                </div>
              </div>

              {/* daisyUI Steps Vertical */}
              <ul className="steps steps-vertical w-full text-xs">
                {workflowSteps.map((step, idx) => (
                  <li
                    key={step.title}
                    data-content={idx + 1}
                    className="step step-primary font-bold py-1"
                  >
                    <div className="text-left ml-2">
                      <div className="font-extrabold text-xs sm:text-sm text-base-content leading-tight">
                        {step.title}
                      </div>
                      <div className="text-[11px] font-medium text-base-content/60">
                        {step.desc}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 pt-3 border-t border-base-200 flex items-center gap-2 text-xs text-base-content/60">
                <Lock className="h-3.5 w-3.5 text-[#A6761D]" />
                <span>All workflow modules require institutional login.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
