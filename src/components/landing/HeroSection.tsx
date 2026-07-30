"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, LogIn, Search, ShieldCheck, FileCheck, Award, Layers } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="hero bg-gradient-to-b from-base-100 via-base-200/40 to-base-100 py-12 lg:py-20 border-b border-base-200">
      <div className="hero-content text-center max-w-5xl px-4">
        <div className="space-y-6">
          {/* Institutional Compliance Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7B1E1E]/20 bg-[#7B1E1E]/5 px-4 py-1.5 text-xs font-bold text-[#7B1E1E] uppercase tracking-wider shadow-sm">
            <ShieldCheck className="h-4 w-4 text-[#A6761D]" />
            <span>Republic Act No. 9184 Compliant — Government Procurement System</span>
          </div>

          {/* Institutional Branding */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 flex items-center justify-center rounded-2xl bg-white p-2.5 shadow-md border border-base-200">
              <Image
                src="/images/bsc-logo.png"
                alt="Batanes State College Logo"
                width={100}
                height={100}
                className="object-contain h-full w-full"
                priority
              />
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#7B1E1E] tracking-tight leading-tight">
                Batanes State College
              </h1>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#A6761D] tracking-tight">
                Procurement Management Information System
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-base-content/60">
                Powered by ProcureWise
              </p>
            </div>
          </div>

          {/* System Purpose Description */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-base-content/80 leading-relaxed font-normal">
            The official digital portal for managing institutional purchase requests, procurement reviews,
            requests for quotation, supplier bidding, best-value evaluations, and purchase orders for Batanes State College.
            Modernizing public procurement for accountability, speed, and fiscal integrity.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="btn btn-primary btn-md sm:btn-lg rounded-xl bg-[#7B1E1E] hover:bg-[#601717] text-white border-none font-bold shadow-md px-6 sm:px-8"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/login"
              className="btn btn-outline btn-md sm:btn-lg rounded-xl border-[#7B1E1E] text-[#7B1E1E] hover:bg-[#7B1E1E] hover:text-white font-bold px-6 sm:px-8"
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In</span>
            </Link>

            <Link
              href="/catalog"
              className="btn btn-ghost btn-md sm:btn-lg rounded-xl text-base-content/80 hover:text-[#7B1E1E] hover:bg-base-200 font-bold px-6"
            >
              <Search className="h-5 w-5 text-[#A6761D]" />
              <span>Browse Public Catalog</span>
            </Link>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 max-w-4xl mx-auto">
            <div className="card bg-base-100 p-4 border border-base-200 shadow-sm text-center">
              <FileCheck className="h-6 w-6 text-[#7B1E1E] mx-auto mb-1" />
              <div className="text-sm font-bold text-base-content">Appendix 60 PR</div>
              <div className="text-xs text-base-content/60">Digital Requisitions</div>
            </div>

            <div className="card bg-base-100 p-4 border border-base-200 shadow-sm text-center">
              <Layers className="h-6 w-6 text-[#A6761D] mx-auto mb-1" />
              <div className="text-sm font-bold text-base-content">Automated RFQ</div>
              <div className="text-xs text-base-content/60">PR-to-RFQ Conversion</div>
            </div>

            <div className="card bg-base-100 p-4 border border-base-200 shadow-sm text-center">
              <Award className="h-6 w-6 text-[#7B1E1E] mx-auto mb-1" />
              <div className="text-sm font-bold text-base-content">Best-Value MCDM</div>
              <div className="text-xs text-base-content/60">Supplier Scoring Engine</div>
            </div>

            <div className="card bg-base-100 p-4 border border-base-200 shadow-sm text-center">
              <FileCheck className="h-6 w-6 text-[#A6761D] mx-auto mb-1" />
              <div className="text-sm font-bold text-base-content">Appendix 61 PO</div>
              <div className="text-xs text-base-content/60">Government Form PO</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
