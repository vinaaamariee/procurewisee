"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell, FileText, Globe, Clock, Sparkles } from "lucide-react";
import HeroSearchForm from "./HeroSearchForm";
import type { ActiveRfq } from "@/features/landing/server/queries";

const ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Mandatory PhilGEPS Registration Update",
    content: "All active suppliers are required to upload their updated 2026 Platinum membership certificate before participating in upcoming bids.",
    date: "July 10, 2026",
    tag: "Urgent",
    tagColor: "var(--maroon)"
  },
  {
    id: 2,
    title: "New Automated Canvassing Guidelines",
    content: "Please ensure to download the latest Excel RFQ bidding template format for all bids starting July 15. Previous template formats will fail verification.",
    date: "July 07, 2026",
    tag: "Guide",
    tagColor: "var(--accent-light)"
  },
  {
    id: 3,
    title: "MCDM Scoring System Orientation",
    content: "A virtual workshop for Batanes State College department heads on budget execution and Best-Value vendor rating factors will be held on July 18.",
    date: "July 05, 2026",
    tag: "Training",
    tagColor: "var(--gold)"
  }
];

const NEWS_UPDATES = [
  {
    id: 1,
    title: "Batanes State College Achieves 98% PPMP Efficiency",
    summary: "By deploying digital procurement planning dashboards, the BSC Procurement Unit achieved record-breaking compliance in budget matching for Q2 2026.",
    date: "Oct 2026",
    readTime: "3 min read"
  },
  {
    id: 2,
    title: "Digital Canvassing Reduces Award Lead Times by 14 Days",
    summary: "The implementation of the ProcureWise Best-Value recommendation algorithms has significantly optimized canvassing reviews and accelerated vendor awards.",
    date: "Sep 2026",
    readTime: "4 min read"
  }
];

const FALLBACK_RFQS: ActiveRfq[] = [
  {
    id: "mock-rfq-1",
    rfqNumber: "RFQ-2026-015",
    title: "Supply and Delivery of IT Equipment for the College of Engineering",
    publishDate: "2026-07-10T12:00:00Z",
    closingDate: "2026-07-20T17:00:00Z"
  },
  {
    id: "mock-rfq-2",
    rfqNumber: "RFQ-2026-016",
    title: "Catering Services for the 2026 Commencement Exercises",
    publishDate: "2026-07-08T09:00:00Z",
    closingDate: "2026-07-18T17:00:00Z"
  },
  {
    id: "mock-rfq-3",
    rfqNumber: "RFQ-2026-017",
    title: "Procurement of Scientific Lab Equipment for Chemistry Department",
    publishDate: "2026-07-05T08:30:00Z",
    closingDate: "2026-07-25T17:00:00Z"
  }
];

interface HeroSectionProps {
  activeRfqs?: ActiveRfq[];
}

export default function HeroSection({ activeRfqs = [] }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<'rfqs' | 'announcements' | 'news'>('rfqs');

  // Use real database RFQs if present; otherwise, fall back to realistic mock items
  const rfqsToDisplay = activeRfqs.length > 0 ? activeRfqs : FALLBACK_RFQS;

  return (
    <section
      className="relative overflow-hidden border-b border-slate-100 dark:border-slate-900"
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
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: "var(--accent-glass)" }} />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: "var(--secondary-dim)" }} />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headings, Search Form, CTA */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start justify-center">
            {/* Institution badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-muted)",
                background: "var(--surface)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--gold)" }} />
              Batanes State College
            </div>

            {/* Title */}
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl"
              style={{ color: "var(--text-primary)" }}
            >
              <span style={{ color: "var(--maroon)" }}>PROCURE</span>
              <span style={{ color: "var(--gold)" }}>WISE</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-base font-semibold leading-relaxed sm:text-lg max-w-xl"
              style={{ color: "var(--text-secondary)" }}
            >
              An Intelligent Procurement Analytics and Automated Canvassing System
              with Best-Value Recommendation Engine
            </p>

            {/* Description */}
            <p className="mt-3 text-sm leading-relaxed sm:text-base max-w-xl"
              style={{ color: "var(--text-muted)" }}
            >
              Digitizing procurement planning, market scoping, canvassing, and
              decision support for Batanes State College.
            </p>

            {/* Search bar */}
            <div className="mt-8 w-full max-w-xl">
              <HeroSearchForm />
            </div>

            {/* CTA Button */}
            <div className="mt-6">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:translate-y-[-1px]"
                style={{
                  background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                }}
              >
                Browse Procurement Catalog
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Info Center Dashboard Widget */}
          <div className="lg:col-span-5 w-full">
            <div 
              className="w-full rounded-3xl border p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
              }}
            >
              {/* Widget Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: "var(--gold)" }} />
                  <h3 
                    className="font-extrabold text-xs uppercase tracking-widest"
                    style={{ color: "var(--text-primary)" }}
                  >
                    BSC Info Center
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Feeds
                </div>
              </div>

              {/* Tabs buttons */}
              <div className="flex gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 mb-5">
                {[
                  { id: 'rfqs', label: 'Active RFQs', icon: FileText },
                  { id: 'announcements', label: 'Announcements', icon: Bell },
                  { id: 'news', label: 'News', icon: Globe }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-white dark:bg-slate-700 shadow-sm font-extrabold scale-[1.02]'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                      style={{ color: isActive ? "var(--maroon)" : undefined }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label.split(' ')[isActive ? 0 : 0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Panels */}
              <div className="min-h-[290px] flex flex-col justify-between">
                <div>
                  {activeTab === 'rfqs' && (
                    <div className="space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {rfqsToDisplay.map((rfq) => (
                        <div
                          key={rfq.id}
                          className="group flex flex-col p-3.5 rounded-2xl border bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/40 transition-all duration-200"
                          style={{ borderColor: "var(--border)" }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border"
                              style={{ color: "var(--gold)", backgroundColor: "var(--gold-dim)", borderColor: "var(--border-gold)" }}
                            >
                              {rfq.rfqNumber}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {rfq.closingDate ? `Closing: ${new Date(rfq.closingDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}` : 'No deadline'}
                            </span>
                          </div>
                          <h4 
                            className="text-xs font-bold leading-relaxed line-clamp-2 group-hover:text-[var(--maroon)] transition-colors"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {rfq.title}
                          </h4>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'announcements' && (
                    <div className="space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {ANNOUNCEMENTS.map((ann) => (
                        <div
                          key={ann.id}
                          className="flex flex-col p-3.5 rounded-2xl border bg-white/40 dark:bg-slate-900/40"
                          style={{ borderColor: "var(--border)" }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span 
                              className="px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider"
                              style={{ backgroundColor: ann.tagColor }}
                            >
                              {ann.tag}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                              {ann.date}
                            </span>
                          </div>
                          <h4 
                            className="text-xs font-extrabold mb-1 leading-normal"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {ann.title}
                          </h4>
                          <p className="text-[10.5px] leading-relaxed font-semibold" style={{ color: "var(--text-muted)" }}>
                            {ann.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'news' && (
                    <div className="space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {NEWS_UPDATES.map((news) => (
                        <div
                          key={news.id}
                          className="flex flex-col p-3.5 rounded-2xl border bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/40 transition-all duration-200"
                          style={{ borderColor: "var(--border)" }}
                        >
                          <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1.5">
                            <span>{news.date}</span>
                            <span>{news.readTime}</span>
                          </div>
                          <h4 
                            className="text-xs font-extrabold mb-1 leading-normal"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {news.title}
                          </h4>
                          <p className="text-[10.5px] leading-relaxed font-semibold" style={{ color: "var(--text-muted)" }}>
                            {news.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

