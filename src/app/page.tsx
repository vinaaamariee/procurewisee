"use client";

import React, { useState, useTransition, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { login, register } from './actions/auth';
import type { UserRole } from '@/types/auth';

function LoginPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Procurement Officer');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const error = searchParams.get('error');
  const success = searchParams.get('success');

  // Automatically open modal if error or success parameter is present in URL
  useEffect(() => {
    if (error || success) {
      setIsAuthModalOpen(true);
      if (error) {
        setAuthMode('login');
      }
    }
  }, [error, success]);

  const rolesList: { role: UserRole; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      role: 'Procurement Officer',
      label: 'Officer',
      desc: 'Canvass items & publish RFQs',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      role: 'Administrative Approver',
      label: 'Approver',
      desc: 'MCDM analytics & approvals',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      role: 'Supplier',
      label: 'Supplier',
      desc: 'Submit bids & quotations',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ];

  const handleClearParams = () => {
    router.replace('/');
  };

  const handleCloseModal = () => {
    setIsAuthModalOpen(false);
    handleClearParams();
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>, action: (formData: FormData) => Promise<any>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(formData);
    });
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-300 font-sans relative overflow-x-hidden">
      
      {/* ── BACKGROUND AMBIENT GLOWS ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] left-[10%] w-[50%] aspect-square rounded-full bg-blue-600/5 blur-[150px]" />
        <div className="absolute top-[20%] right-[5%] w-[45%] aspect-square rounded-full bg-[#f97316]/5 blur-[150px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[55%] aspect-square rounded-full bg-indigo-600/5 blur-[160px]" />
      </div>

      {/* ── NAVBAR ── */}
      <header className="relative z-20 border-b border-white/5 bg-slate-950/45 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity">
            <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-sm border border-white/5">
              <span>P</span>
              <span className="text-blue-400">W</span>
            </div>
            <span className="text-base font-extrabold tracking-tight text-white block leading-none">ProcureWise</span>
          </div>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#mockup" className="hover:text-white transition-colors">How It Works</a>
            <a href="#mission" className="hover:text-white transition-colors">Our Mission</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4 text-sm font-semibold">
            <button 
              onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => { setAuthMode('register'); setIsAuthModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/15 cursor-pointer"
            >
              Get Started
            </button>
          </div>

        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 text-center space-y-8">
        
        <div className="space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
            Next-Gen Solicitations & Bidding
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Intelligent Gateway for <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-[#f97316] bg-clip-text text-transparent">
              Institutional Procurement.
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            ProcureWise automates Request for Quotations (RFQs), streamlines supplier submissions, and uses weighted Multi-Criteria Decision Making (MCDM) to rank bids objectively.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => { setAuthMode('register'); setIsAuthModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/15 transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            Get Started Free
          </button>
          <a 
            href="#features"
            className="border border-slate-800 bg-[#101216]/50 hover:bg-[#101216] text-slate-300 px-6 py-3 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            Learn More
          </a>
        </div>

      </section>

      {/* ── MOCKUP VIEW ── */}
      <section id="mockup" className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        
        <div className="rounded-2xl border border-white/5 bg-slate-900/20 backdrop-blur-xl p-4 sm:p-6 md:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.4)]">
          {/* Header element of Mockup */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/60" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <span className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="text-xs text-slate-500 font-semibold ml-4">MCDM Comparison Board — RFQ-2026-001</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">Auto-Evaluated</span>
          </div>

          {/* Table representation */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Supplier Name</th>
                  <th className="py-2.5 px-3 text-center">Price Score</th>
                  <th className="py-2.5 px-3 text-center">Delivery Score</th>
                  <th className="py-2.5 px-3 text-center">Reliability</th>
                  <th className="py-2.5 px-3 text-center">MCDM Score</th>
                  <th className="py-2.5 px-3 text-right">Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03] text-slate-300 font-medium">
                <tr className="bg-emerald-500/[0.02] text-white">
                  <td className="py-3.5 px-3 font-semibold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Batanes General Trading Co.
                  </td>
                  <td className="py-3.5 px-3 text-center">98.50</td>
                  <td className="py-3.5 px-3 text-center">100.00</td>
                  <td className="py-3.5 px-3 text-center">96.00</td>
                  <td className="py-3.5 px-3 text-center text-emerald-400 font-extrabold">98.15</td>
                  <td className="py-3.5 px-3 text-right font-bold text-emerald-400">#1 (Winner)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    Cagayan Valley Print & Sign
                  </td>
                  <td className="py-3.5 px-3 text-center">92.00</td>
                  <td className="py-3.5 px-3 text-center">85.00</td>
                  <td className="py-3.5 px-3 text-center">90.00</td>
                  <td className="py-3.5 px-3 text-center">89.50</td>
                  <td className="py-3.5 px-3 text-right font-semibold text-slate-400">#2</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    Manila Office Depot Corp.
                  </td>
                  <td className="py-3.5 px-3 text-center">88.50</td>
                  <td className="py-3.5 px-3 text-center">70.00</td>
                  <td className="py-3.5 px-3 text-center">85.00</td>
                  <td className="py-3.5 px-3 text-center">81.20</td>
                  <td className="py-3.5 px-3 text-right font-semibold text-slate-400">#3</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" className="relative z-10 border-t border-white/5 bg-slate-950/20 py-24">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">Built to solve canvas complexities</h2>
            <p className="text-slate-400 text-sm">
              We replaced manual, error-prone paperwork with robust automated engines that compile, evaluate, and audit everything.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md space-y-4 hover:border-slate-800 transition duration-300">
              <div className="h-10 w-10 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white">Unified RFQ Canvassing</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Publish solicitations in seconds. Suppliers upload quotations directly, eliminating the need to type bids from paper abstracts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md space-y-4 hover:border-slate-800 transition duration-300">
              <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white">Weighted MCDM Scoring</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Score bids objectively using customizable weights for cost, delivery speed, and supplier rating history.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md space-y-4 hover:border-slate-800 transition duration-300">
              <div className="h-10 w-10 bg-[#f97316]/10 border border-[#f97316]/20 text-[#f97316] rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white">Immutable Audit Trails</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Log every single action—from quotation uploads to approvals—in an secure, audit-friendly database.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── OUR MISSION SECTION ── */}
      <section id="mission" className="relative z-10 py-24 max-w-4xl mx-auto px-6 text-center space-y-6">
        <span className="text-[#f97316] font-bold text-4xl leading-none select-none block">“</span>
        <h2 className="text-xl sm:text-2xl text-slate-200 font-medium leading-relaxed italic px-4">
          ProcureWise was created to simplify institutional buying. We replace slow, manual paperwork and complex spreadsheets with automated bidding and objective scoring—making the entire procurement process fast, fair, and transparent.
        </h2>
        <span className="text-[#f97316] font-bold text-4xl leading-none select-none block mt-[-15px]">”</span>
        <div>
          <span className="text-white font-extrabold text-sm block">Our Mission</span>
          <span className="text-slate-500 text-[11px] font-semibold mt-1 block">Simplifying Institutional Procurement</span>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950/45 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-slate-900 rounded flex items-center justify-center text-white font-black text-xs border border-white/5">
              <span>P</span>
            </div>
            <span className="font-extrabold text-white">ProcureWise</span>
          </div>
          <span>© {new Date().getFullYear()} ProcureWise. All rights reserved.</span>
        </div>
      </footer>

      {/* ── AUTHENTICATION MODAL OVERLAY ── */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          
          {/* Modal Card Box */}
          <div className="relative w-full max-w-5xl rounded-3xl border border-white/5 bg-[#090b0f] shadow-2xl flex flex-col md:flex-row min-h-[580px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Modal Button */}
            <button 
              onClick={handleCloseModal}
              className="absolute right-4 top-4 z-20 text-slate-400 hover:text-white bg-slate-950/50 p-2 rounded-full border border-white/5 transition cursor-pointer"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>

            {/* Left Column - Showcase (Warm orange mesh gradient) */}
            <div className="hidden md:flex md:w-1/2 relative flex-col justify-center items-center p-8 overflow-hidden bg-gradient-to-br from-[#1b120c] via-[#0f0f13] to-[#07070a] border-r border-white/5">
              
              {/* Radial glow */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[20%] right-[-10%] w-[80%] aspect-square rounded-full bg-[#f97316]/10 blur-[100px]" />
                <div className="absolute bottom-[20%] left-[-10%] w-[60%] aspect-square rounded-full bg-blue-900/10 blur-[100px]" />
              </div>

              {/* Floating square cards */}
              <div className="absolute top-[15%] left-[15%] w-12 h-12 bg-[#141519] border border-white/5 shadow-2xl rounded-xl flex items-center justify-center -rotate-6 opacity-75">
                <svg viewBox="0 0 100 100" className="w-6 h-6 text-slate-700">
                  <circle cx="50" cy="40" r="22" fill="currentColor" />
                  <path d="M15 85c0-18 15-28 35-28s35 10 35 28v5H15v-5z" fill="currentColor" />
                </svg>
              </div>

              <div className="absolute bottom-[12%] left-[45%] w-16 h-16 bg-[#141519] border border-white/5 shadow-2xl rounded-xl flex items-center justify-center rotate-12 opacity-75">
                <svg viewBox="0 0 100 100" className="w-8 h-8 text-slate-700">
                  <circle cx="50" cy="40" r="22" fill="currentColor" />
                  <path d="M15 85c0-18 15-28 35-28s35 10 35 28v5H15v-5z" fill="currentColor" />
                </svg>
              </div>

              {/* Showcase glassmorphic card */}
              <div className="relative z-10 bg-[#161413]/35 border border-white/5 backdrop-blur-md p-6 rounded-2xl w-full max-w-xs shadow-2xl">
                <div className="h-8 w-8 bg-blue-650 rounded-lg flex items-center justify-center text-white mb-4 shadow-md">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed mb-4 font-medium">
                  "ProcureWise was created to simplify institutional buying. We replace slow, manual paperwork and complex spreadsheets with automated bidding and objective scoring—making the entire procurement process fast, fair, and transparent."
                </p>
                <div>
                  <span className="text-slate-200 font-semibold text-[11px] block">Our Mission</span>
                  <span className="text-slate-500 text-[9px] mt-0.5 block">Simplifying Institutional Procurement</span>
                </div>
              </div>

            </div>

            {/* Right Column - Auth Form */}
            <div className="w-full md:w-1/2 bg-[#090b11] flex flex-col justify-center px-6 sm:px-12 py-12 relative">
              <div className="w-full max-w-sm mx-auto space-y-6">
                
                {/* Headers */}
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white leading-none">
                    {authMode === 'login' ? 'Welcome to ProcureWise' : 'Create your account'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-2">
                    {authMode === 'login' ? (
                      <>
                        Don't have an account?{' '}
                        <button
                          onClick={() => { setAuthMode('register'); handleClearParams(); }}
                          className="text-blue-500 hover:underline font-semibold cursor-pointer"
                        >
                          Click here
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <button
                          onClick={() => { setAuthMode('login'); handleClearParams(); }}
                          className="text-blue-500 hover:underline font-semibold cursor-pointer"
                        >
                          Click here
                        </button>
                      </>
                    )}
                  </p>
                </div>

                {/* Error and Success Alerts */}
                {error && (
                  <div className="relative flex items-start gap-3 rounded-lg border border-red-900/20 bg-red-950/20 p-3 text-xs text-red-400">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 shrink-0 mt-0.5">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span className="pr-4 leading-normal font-medium">{decodeURIComponent(error)}</span>
                    <button onClick={handleClearParams} className="absolute right-2 top-2 text-red-400/50 hover:text-red-400 transition-colors">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </div>
                )}

                {success && (
                  <div className="relative flex items-start gap-3 rounded-lg border border-emerald-900/20 bg-emerald-950/20 p-3 text-xs text-emerald-400">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 shrink-0 mt-0.5">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span className="pr-4 leading-normal font-medium">{decodeURIComponent(success)}</span>
                    <button onClick={handleClearParams} className="absolute right-2 top-2 text-emerald-400/50 hover:text-emerald-400 transition-colors">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Forms */}
                {authMode === 'login' ? (
                  <form onSubmit={(e) => handleFormSubmit(e, login)} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400">
                        Email Address
                      </label>
                      <input
                        name="email"
                        type="email"
                        required
                        className="w-full bg-[#101216] border border-[#21262e] rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          className="w-full bg-[#101216] border border-[#21262e] rounded-lg pl-4 pr-11 py-2.5 text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 rounded-md outline-none"
                        >
                          {showPassword ? (
                            <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                          ) : (
                            <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full bg-[#3051c5] hover:bg-[#3d63e2] text-white py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer"
                    >
                      {isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Logging in...
                        </span>
                      ) : 'Login'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={(e) => handleFormSubmit(e, register)} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-400">
                          Full Name
                        </label>
                        <input
                          name="fullName"
                          type="text"
                          required
                          placeholder="Juan Dela Cruz"
                          className="w-full bg-[#101216] border border-[#21262e] rounded-lg px-4 py-2 text-slate-100 placeholder-slate-600 outline-none transition focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-400">
                          Username
                        </label>
                        <input
                          name="username"
                          type="text"
                          required
                          placeholder="juan_dc"
                          className="w-full bg-[#101216] border border-[#21262e] rounded-lg px-4 py-2 text-slate-100 placeholder-slate-600 outline-none transition focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400">
                        Email Address
                      </label>
                      <input
                        name="email"
                        type="email"
                        required
                        className="w-full bg-[#101216] border border-[#21262e] rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-500 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          name="password"
                          type={showRegPassword ? "text" : "password"}
                          required
                          placeholder="Min 6 characters"
                          className="w-full bg-[#101216] border border-[#21262e] rounded-lg pl-4 pr-11 py-2 text-slate-100 placeholder-slate-600 outline-none transition focus:border-blue-500 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 rounded-md outline-none"
                        >
                          {showRegPassword ? (
                            <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                          ) : (
                            <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400">
                        Assign System Role
                      </label>
                      <input type="hidden" name="role" value={selectedRole} />
                      
                      <div className="grid grid-cols-3 gap-2">
                        {rolesList.map((item) => {
                          const isSelected = selectedRole === item.role;
                          return (
                            <button
                              key={item.role}
                              type="button"
                              onClick={() => setSelectedRole(item.role)}
                              className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition duration-150 cursor-pointer ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-600/10 text-white shadow-sm'
                                  : 'border-slate-800 bg-[#101216] text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <div className={`p-1 rounded mb-1 transition-colors ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {item.icon}
                              </div>
                              <div className="text-[9px] font-bold leading-tight">{item.label}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full bg-[#3051c5] hover:bg-[#3d63e2] text-white py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer"
                    >
                      {isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Creating account...
                        </span>
                      ) : 'Create Account'}
                    </button>
                  </form>
                )}

                {/* Social Divider */}
                <div className="flex items-center my-4 w-full">
                  <div className="flex-grow border-t border-slate-800" />
                  <span className="px-3 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Or continue with</span>
                  <div className="flex-grow border-t border-slate-800" />
                </div>

                {/* Social Button Grid */}
                <div className="grid grid-cols-3 gap-3 w-full">
                  <button type="button" className="flex items-center justify-center py-2 px-4 border border-slate-800 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer">
                    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5">
                      <path fill="#ea4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.827 1.109 15.093 0 12 0 7.354 0 3.307 2.673 1.353 6.578l3.913 3.187z" />
                      <path fill="#4285f4" d="M23.49 12.273c0-.818-.073-1.609-.209-2.373H12v4.582h6.445a5.524 5.524 0 01-2.395 3.627l3.736 2.9c2.182-2.009 3.44-4.964 3.44-8.736z" />
                      <path fill="#fbbc05" d="M5.266 14.235a7.037 7.037 0 010-4.47l-3.913-3.187a11.93 11.93 0 000 10.844l3.913-3.187z" />
                      <path fill="#34a853" d="M12 24c3.24 0 5.956-1.077 7.945-2.918l-3.736-2.9C15.177 18.89 13.709 19.09 12 19.091a7.077 7.077 0 01-6.734-4.856L1.353 17.422C3.307 21.327 7.354 24 12 24z" />
                    </svg>
                  </button>
                  
                  <button type="button" className="flex items-center justify-center py-2 px-4 border border-slate-800 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>

                  <button type="button" className="flex items-center justify-center py-2 px-4 border border-slate-800 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5 text-white">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </button>
                </div>

                {/* Close text helper */}
                <div className="pt-2 text-center">
                  <span className="text-[10px] text-slate-500">
                    Forgot your password?{' '}
                    <button
                      onClick={() => alert("Please contact your ProcureWise administrator to reset your password.")}
                      className="text-blue-500 hover:underline font-semibold cursor-pointer"
                    >
                      Click here
                    </button>
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#07090e]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}
