import type { Metadata } from 'next';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';
import {
  Package,
  ShieldCheck,
  BarChart3,
  Building2,
  FileCheck2,
  Cpu,
  Award,
  BookOpen,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About ProcureWise — Batanes State College Procurement System',
  description:
    'ProcureWise is the official intelligent procurement analytics and automated canvassing platform of Batanes State College (Basco, Batanes). Compliant with RA 9184 and COA/GAM rules.',
};

export default function AboutPage() {
  const pillars = [
    {
      icon: Cpu,
      title: 'MCDM Best-Value Engine',
      description:
        'Employs Multi-Criteria Decision Making (MCDM) algorithms to evaluate bids across price, delivery compliance, and supplier reliability ratings.',
      color: '#7B1E1E',
      bg: 'rgba(123, 30, 30, 0.08)',
    },
    {
      icon: FileCheck2,
      title: 'Official BSC Digital Forms',
      description:
        'Standardized digital paper layouts for PR (Appendix 60), RFQ (Annex D), Ack Receipt (Annex E), AOQ (Annex F), and PO (Appendix 61) with official institutional letterheads.',
      color: '#D4A017',
      bg: 'rgba(212, 160, 23, 0.08)',
    },
    {
      icon: BarChart3,
      title: 'Historical Price Intelligence',
      description:
        'ARIMA-powered price forecasting and historical price trends derived from historical Small Value Procurement (SVP) workbooks.',
      color: '#059669',
      bg: 'rgba(5, 150, 105, 0.08)',
    },
    {
      icon: ShieldCheck,
      title: 'RA 9184 & COA Compliance',
      description:
        'Strict audit trails, role-based approval controls (Requisitioner, Officer, Approver), and digital signatures per Republic Act 9184 IRR.',
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.08)',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#F7F8FA] via-[#F3F4F6] to-[#F7F8FA] dark:bg-slate-950 text-[#111827] dark:text-slate-100 font-sans">
      <Header />

      <main className="flex-1 py-12 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7B1E1E]/10 dark:bg-red-950/40 border border-[#7B1E1E]/20 text-[#7B1E1E] dark:text-red-400 text-xs font-bold uppercase tracking-widest">
              <Building2 className="w-3.5 h-3.5" />
              Batanes State College
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111827] dark:text-white tracking-tight">
              About <span className="text-[#7B1E1E] dark:text-red-400">Procure</span>
              <span className="text-[#D4A017]">Wise</span>
            </h1>
            <p className="text-sm sm:text-base text-[#6B7280] dark:text-slate-300 leading-relaxed">
              ProcureWise is the official intelligent procurement analytics, automated canvassing,
              and decision support platform designed specifically for <strong>Batanes State College</strong> (Basco, Batanes).
            </p>
          </div>

          {/* Institutional Overview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-lg space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#7B1E1E] text-white flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5 text-[#D4A017]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#111827] dark:text-white">Institutional Mission &amp; Purpose</h2>
                <p className="text-xs text-slate-500">San Antonio, Basco, Batanes</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              ProcureWise modernizes manual government procurement by converting paper-heavy canvassing and manual price matching into a unified digital workflow. From initial Annual Procurement Plan (APP) itemization to final Purchase Order issuance, the system enforces transparency, eliminates data entry redundancies, and empowers the Bids and Awards Committee (BAC) with objective quantitative metrics.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-xs font-bold uppercase tracking-wider text-[#7B1E1E] dark:text-red-400 mb-1">Entity</div>
                <div className="text-sm font-semibold">Batanes State College</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-xs font-bold uppercase tracking-wider text-[#D4A017] mb-1">Location</div>
                <div className="text-sm font-semibold">Basco, Batanes</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-xs font-bold uppercase tracking-wider text-[#059669] mb-1">Governance</div>
                <div className="text-sm font-semibold">RA 9184 &amp; COA GAM</div>
              </div>
            </div>
          </div>

          {/* System Pillars */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#111827] dark:text-white">System Architecture &amp; Capabilities</h2>
              <p className="text-xs text-slate-500 mt-1">Core technology driving transparent procurement</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillars.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.title}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition flex items-start gap-4"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: p.bg }}
                    >
                      <Icon className="w-6 h-6" style={{ color: p.color }} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-[#111827] dark:text-white">{p.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{p.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Call to Action */}
          <div className="bg-gradient-to-r from-[#7B1E1E] to-[#5E1414] rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl font-black">Ready to explore ProcureWise?</h3>
              <p className="text-xs text-slate-200">
                Browse public item catalogs, track existing Purchase Requests, or sign into your operational role.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/catalog"
                className="px-5 py-2.5 rounded-xl bg-[#D4A017] text-slate-950 text-xs font-bold hover:bg-[#b88a1b] transition shadow-md"
              >
                Browse Catalog
              </Link>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
