"use client";

import Link from "next/link";
import { ShieldCheck, Lock, FileCheck2, LogIn } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="border-b border-base-300 bg-base-100 py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Compliance Badge */}
            <div className="inline-flex items-center gap-2 border-l-4 border-primary bg-base-200 px-3.5 py-2 text-xs font-bold text-primary uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-secondary" />
              <span>Republic Act No. 9184 — Government Procurement Reform Act</span>
            </div>

            {/* Institution & System Title */}
            <div className="space-y-2">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary tracking-tight leading-tight">
                  Batanes State College
                </h1>
                <p className="text-xs font-bold uppercase tracking-widest text-secondary">
                  Official Internal Procurement System
                </p>
              </div>

              <h2 className="max-w-2xl pt-2 text-xl font-bold text-base-content sm:text-2xl lg:text-3xl">
                Procurement Management Information System
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-base-content/80 leading-relaxed font-normal">
              Manage purchase requests, quotations, supplier evaluation, and purchase orders in one
              secure institutional system.
            </p>

            {/* Single primary CTA + account request note */}
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/login"
                className="btn btn-primary btn-md rounded-field font-bold px-8 w-fit"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In to ProcureWise</span>
              </Link>

              <p className="text-xs text-base-content/60 font-medium">
                No account yet?{" "}
                <a
                  href="mailto:procurement@bsc.edu.ph"
                  className="font-bold text-secondary hover:underline"
                >
                  Request access from the Procurement Office →
                </a>
              </p>
            </div>

          </div>

          {/* Right Column: concise access notice */}
          <div className="lg:col-span-5">
            <div className="card card-border rounded-box bg-base-100">
              <div className="card-body gap-4 p-5 sm:p-6">
                <div className="flex items-center gap-3 border-b border-base-300 pb-4">
                  <Lock className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-bold text-primary">Institutional access only</h3>
                    <p className="text-xs text-base-content/65">A registered BSC account is required.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                  <p className="text-sm leading-relaxed text-base-content/75">
                    Official forms, approvals, and audit records are handled inside the authenticated portal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
