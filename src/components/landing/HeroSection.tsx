"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  FileText,
  Globe,
  Clock,
  Sparkles,
  Search,
  Building2,
  CheckCircle2,
} from "lucide-react";
import HeroSearchForm from "./HeroSearchForm";
import type { ActiveRfq } from "@/features/landing/server/queries";

const ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Mandatory PhilGEPS Registration Update",
    content:
      "All active suppliers are required to upload their updated 2026 Platinum membership certificate before participating in upcoming bids.",
    date: "July 10, 2026",
    tag: "Urgent",
    tagColor: "bg-red-500 text-white dark:bg-red-950/80 dark:text-red-300",
  },
  {
    id: 2,
    title: "New Automated Canvassing Guidelines",
    content:
      "Please ensure to download the latest Excel RFQ bidding template format for all bids starting July 15. Previous template formats will fail verification.",
    date: "July 07, 2026",
    tag: "Guide",
    tagColor: "bg-amber-500 text-white dark:bg-amber-950/80 dark:text-amber-300",
  },
  {
    id: 3,
    title: "MCDM Scoring System Orientation",
    content:
      "A virtual workshop for Batanes State College department heads on budget execution and Best-Value vendor rating factors will be held on July 18.",
    date: "July 05, 2026",
    tag: "Training",
    tagColor: "bg-blue-500 text-white dark:bg-blue-950/80 dark:text-blue-300",
  },
];

const NEWS_UPDATES = [
  {
    id: 1,
    title: "Batanes State College Achieves 98% PPMP Efficiency",
    summary:
      "By deploying digital procurement planning dashboards, the BSC Procurement Unit achieved record-breaking compliance in budget matching for Q2 2026.",
    date: "Oct 2026",
    readTime: "3 min read",
  },
  {
    id: 2,
    title: "Digital Canvassing Reduces Award Lead Times by 14 Days",
    summary:
      "The implementation of the ProcureWise Best-Value recommendation algorithms has significantly optimized canvassing reviews and accelerated vendor awards.",
    date: "Sep 2026",
    readTime: "4 min read",
  },
];

const FALLBACK_RFQS: ActiveRfq[] = [
  {
    id: "mock-rfq-1",
    rfqNumber: "RFQ-2026-015",
    title: "Supply and Delivery of IT Equipment for the College of Engineering",
    publishDate: "2026-07-10T12:00:00Z",
    closingDate: "2026-07-20T17:00:00Z",
  },
  {
    id: "mock-rfq-2",
    rfqNumber: "RFQ-2026-016",
    title: "Catering Services for the 2026 Commencement Exercises",
    publishDate: "2026-07-08T09:00:00Z",
    closingDate: "2026-07-18T17:00:00Z",
  },
  {
    id: "mock-rfq-3",
    rfqNumber: "RFQ-2026-017",
    title: "Procurement of Scientific Lab Equipment for Chemistry Department",
    publishDate: "2026-07-05T08:30:00Z",
    closingDate: "2026-07-25T17:00:00Z",
  },
];

interface HeroSectionProps {
  activeRfqs?: ActiveRfq[];
}

export default function HeroSection({ activeRfqs = [] }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<"rfqs" | "announcements" | "news">(
    "rfqs"
  );

  const rfqsToDisplay = activeRfqs.length > 0 ? activeRfqs : FALLBACK_RFQS;

  return (
    <section className="relative overflow-hidden bg-[#F7F8FA] dark:bg-slate-950 transition-colors duration-300">
      {/* Decorative Subtle Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #111827 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Ambient Lighting Orbs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full blur-[120px] bg-[#7B1E1E]/10 dark:bg-red-500/5" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full blur-[120px] bg-[#D4A017]/10 dark:bg-yellow-500/5" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Left Column: Greeting, Title, Search & Buttons */}
          <div className="flex flex-col items-start justify-center space-y-6 text-left">
            {/* Institution Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-1.5 text-xs font-bold text-gray-700 dark:text-slate-300 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#D4A017] animate-pulse" />
              <span>Batanes State College</span>
            </div>

            {/* Title & Headline */}
            <div className="space-y-2">
              <p className="text-lg font-bold text-[#D4A017] tracking-wide">
                Good Morning 👋
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#111827] dark:text-white tracking-tight leading-[1.1]">
                Welcome to{" "}
                <span className="text-[#7B1E1E] dark:text-red-400">
                  ProcureWise
                </span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Digitizing Procurement Planning, Market Scoping, Canvassing, and
              Decision Support for Batanes State College.
            </p>

            {/* Search Bar */}
            <div className="w-full max-w-xl pt-2">
              <HeroSearchForm />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2 w-full sm:w-auto">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7B1E1E] hover:bg-[#5E1414] active:scale-[0.98] text-white px-7 py-3.5 text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/track"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 border border-[#7B1E1E] text-[#7B1E1E] dark:text-red-400 px-7 py-3.5 text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto"
              >
                <span>Track Purchase Request</span>
              </Link>
            </div>
          </div>

          {/* Right Column: BSC Information Center Widget */}
          <div className="w-full">
            <div className="w-full rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-xl transition-all duration-300">
              {/* Widget Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#D4A017]/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-[#D4A017]" />
                  </div>
                  <h3 className="font-bold text-sm text-[#111827] dark:text-white uppercase tracking-wider">
                    BSC Info Center
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Updates
                </div>
              </div>

              {/* Tabs Buttons */}
              <div className="flex gap-1.5 p-1 rounded-2xl bg-gray-100/80 dark:bg-slate-800/60 mb-5">
                {[
                  { id: "rfqs", label: "Active RFQs", icon: FileText },
                  { id: "announcements", label: "Announcements", icon: Bell },
                  { id: "news", label: "News", icon: Globe },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-white dark:bg-slate-700 text-[#7B1E1E] dark:text-white shadow-sm scale-[1.01]"
                          : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Panels */}
              <div className="min-h-[280px]">
                {/* Active RFQs Panel */}
                {activeTab === "rfqs" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    {rfqsToDisplay.map((rfq) => (
                      <div
                        key={rfq.id}
                        className="group flex flex-col p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/20">
                            {rfq.rfqNumber}
                          </span>
                          <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {rfq.closingDate
                              ? `Closing: ${new Date(
                                  rfq.closingDate
                                ).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                })}`
                              : "No deadline"}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#111827] dark:text-white leading-snug line-clamp-2 group-hover:text-[#7B1E1E] dark:group-hover:text-red-300 transition-colors">
                          {rfq.title}
                        </h4>
                      </div>
                    ))}
                  </div>
                )}

                {/* Announcements Panel */}
                {activeTab === "announcements" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    {ANNOUNCEMENTS.map((ann) => (
                      <div
                        key={ann.id}
                        className="flex flex-col p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ann.tagColor}`}
                          >
                            {ann.tag}
                          </span>
                          <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                            {ann.date}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#111827] dark:text-white mb-1 leading-snug">
                          {ann.title}
                        </h4>
                        <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                          {ann.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* News Panel */}
                {activeTab === "news" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    {NEWS_UPDATES.map((news) => (
                      <div
                        key={news.id}
                        className="flex flex-col p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200"
                      >
                        <div className="flex justify-between text-[11px] text-gray-500 dark:text-slate-400 font-medium mb-1.5">
                          <span>{news.date}</span>
                          <span>{news.readTime}</span>
                        </div>
                        <h4 className="text-xs font-bold text-[#111827] dark:text-white mb-1 leading-snug">
                          {news.title}
                        </h4>
                        <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed line-clamp-2">
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
    </section>
  );
}
