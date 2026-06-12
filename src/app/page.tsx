"use client";

import React, { useState, useTransition, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { login, register } from './actions/auth';
import { ThemeToggle } from '@/components/theme-toggle';

function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const error = searchParams.get('error');
  const success = searchParams.get('success');

  // Automatically switch to register tab if an error mentions registration fields
  useEffect(() => {
    if (error && (error.toLowerCase().includes('company') || error.toLowerCase().includes('tin') || error.toLowerCase().includes('address') || error.toLowerCase().includes('full name'))) {
      setActiveTab('register');
    }
  }, [error]);

  const handleClearParams = () => {
    router.replace('/');
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>, action: (formData: FormData) => Promise<any>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(formData);
    });
  };

  return (
    <div className="relative flex min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-300 font-sans overflow-hidden transition-colors duration-300">
      
      {/* Background Animated Orbs for Right Column / Full screen */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-20">
        <div className="absolute top-[20%] right-[-10%] w-[60%] aspect-square rounded-full bg-radial from-[#ca8a04]/10 to-transparent blur-[130px] animate-float-1" />
        <div className="absolute bottom-[20%] left-[20%] w-[50%] aspect-square rounded-full bg-radial from-[#7e191b]/10 to-transparent blur-[120px] animate-float-2" />
      </div>

      {/* Theme Toggle Positioned Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* 50/50 Split Grid */}
      <div className="flex flex-col md:flex-row w-full min-h-screen z-10 relative">
        
        {/* Left Column - Premium BSC Showcase Banner (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-16 overflow-hidden bg-gradient-to-br from-[#7e191b] via-[#5c0f11] to-[#3b0a0a] border-r border-[#ca8a04]/20 transition-all duration-300">
          
          {/* Subtle brand halos floating inside Left Column */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[15%] right-[-20%] w-[90%] aspect-square rounded-full bg-radial from-[#ca8a04]/15 to-transparent blur-[120px] animate-float-1" />
            <div className="absolute bottom-[10%] left-[-10%] w-[80%] aspect-square rounded-full bg-radial from-[#7e191b]/20 to-transparent blur-[140px] animate-float-2" />
            
            {/* Soft administrative grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
          </div>

          {/* Header Brand Info */}
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-[#7e191b] font-black text-xl shadow-lg border border-[#ca8a04]/40 shimmer-sweep">
              <span>P</span>
              <span className="text-[#ca8a04]">W</span>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block leading-none">ProcureWise</span>
              <span className="text-[10px] uppercase tracking-wider text-[#ca8a04] font-black mt-1.5 block">Batanes State College</span>
            </div>
          </div>

          {/* Central Hero Concept Presentation */}
          <div className="relative z-10 my-auto max-w-md space-y-10">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ca8a04]/20 border border-[#ca8a04]/30 text-xs text-[#fef08a] font-bold uppercase tracking-wider animate-pulse-subtle">
                🏛️ Institutional Bidding Hub
              </span>
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                Modern, Transparent & Elegant Procurement.
              </h1>
              <p className="text-white/80 text-sm leading-relaxed font-medium">
                Empowering Batanes State College with structured solicitations, instant supplier quotation comparisons, and dynamic decision matrix evaluations.
              </p>
            </div>

            {/* Core Value Pillars Grid */}
            <div className="grid grid-cols-1 gap-4.5 pt-2">
              {[
                { title: 'System Transparency', desc: 'Secure bidding logs and structured lot-basis quote evaluations.', icon: '🎯' },
                { title: 'Product Catalog Integration', desc: 'Pre-fill requisition specifications directly from the catalog.', icon: '⚡' },
                { title: 'Decision Matrix Scoring', desc: 'Objective MCDM analysis factoring in price, lead time, and compliance.', icon: '📈' }
              ].map((pillar) => (
                <div 
                  key={pillar.title} 
                  className="flex gap-4 p-4.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#ca8a04]/30 hover:shadow-lg hover:shadow-[#ca8a04]/5 hover:-translate-y-0.5 transition-all duration-300 cursor-default group"
                >
                  <span className="text-2xl mt-0.5 transform group-hover:scale-110 transition-transform duration-300">{pillar.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#fef08a] transition-colors duration-300">{pillar.title}</h3>
                    <p className="text-xs text-white/70 mt-1.5 leading-normal">{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="relative z-10 flex justify-between items-center border-t border-white/15 pt-6 text-white/50 text-xs font-semibold">
            <span>© {new Date().getFullYear()} Batanes State College</span>
            <span className="flex items-center gap-2 text-[#ca8a04]">
              <span className="h-2 w-2 rounded-full bg-[#ca8a04] animate-pulse" />
              Procurement Unit Portal
            </span>
          </div>

        </div>

        {/* Right Column - Auth Form Container */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-12 relative overflow-y-auto">
          
          {/* Logo brand for Mobile View (Hidden on Desktop) */}
          <div className="flex items-center gap-2.5 md:hidden mx-auto mb-8">
            <div className="h-10 w-10 bg-[#7e191b] shadow-md rounded-xl flex items-center justify-center text-white font-black text-sm border border-[#ca8a04]/30">
              <span>P</span>
              <span className="text-[#ca8a04]">W</span>
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-[#7e191b] dark:text-[#f59e0b] block leading-none">ProcureWise</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-0.5 block">Batanes State College</span>
            </div>
          </div>

          {/* Centered Floating Premium Form Card */}
          <div className="w-full max-w-md mx-auto bg-white/90 dark:bg-[#1e293b]/90 border border-slate-200/80 dark:border-[#334155]/80 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 md:p-10 space-y-6 backdrop-blur-md transition-all duration-300">
            
            {/* Header / Intro */}
            <div className="space-y-1 text-center">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {activeTab === 'login' ? 'Sign In to Portal' : 'Supplier Registry'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                {activeTab === 'login' ? 'Enter credentials to access your dashboard.' : 'Register your company as an official BSC supplier.'}
              </p>
            </div>

            {/* Pill Tab Switcher with sliding background pill */}
            <div className="relative flex p-1 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
              
              {/* Sliding Background Pill */}
              <div 
                className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-[#7e191b] rounded-xl transition-all duration-300 ease-out shadow-md shadow-[#7e191b]/20"
                style={{
                  transform: activeTab === 'login' ? 'translateX(0)' : 'translateX(100%)'
                }}
              />

              <button
                type="button"
                onClick={() => { setActiveTab('login'); handleClearParams(); }}
                className={`relative flex-1 py-2.5 text-xs font-black rounded-xl transition-colors duration-300 cursor-pointer z-10 ${
                  activeTab === 'login' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                🔒 Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); handleClearParams(); }}
                className={`relative flex-1 py-2.5 text-xs font-black rounded-xl transition-colors duration-300 cursor-pointer z-10 ${
                  activeTab === 'register' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                📝 Supplier Register
              </button>
            </div>

            {/* Error and Success Alerts */}
            {error && (
              <div className="relative flex items-start gap-3 rounded-2xl border border-red-200 dark:border-red-950/40 bg-red-50 dark:bg-red-950/20 p-4 text-xs text-red-600 dark:text-red-400 animate-shake">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-red-500 mt-0.5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span className="pr-4 leading-relaxed font-medium">{error}</span>
                <button onClick={handleClearParams} className="absolute right-3.5 top-3.5 text-red-400 hover:text-red-700 transition-colors cursor-pointer">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            )}

            {success && (
              <div className="relative flex items-start gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-950/40 bg-emerald-50 dark:bg-emerald-950/20 p-4 text-xs text-emerald-600 dark:text-emerald-400">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span className="pr-4 leading-relaxed font-medium">{success}</span>
                <button onClick={handleClearParams} className="absolute right-3.5 top-3.5 text-emerald-400 hover:text-emerald-700 transition-colors cursor-pointer">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Horizontal Flex Sliding Mask Container */}
            <div className="w-full overflow-hidden">
              <div 
                className="flex w-[200%] items-start transition-transform duration-500 ease-out"
                style={{
                  transform: activeTab === 'login' ? 'translateX(0)' : 'translateX(-50%)'
                }}
              >
                
                {/* Form 1: Sign In */}
                <form 
                  onSubmit={(e) => handleFormSubmit(e, login)} 
                  className="w-1/2 pr-3 pl-0.5 space-y-5"
                >
                  {/* Email input */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="login-input-wrapper">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none z-10">
                        <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="name@batanesstatecollege.edu.ph"
                        className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-300 focus:bg-white dark:focus:bg-slate-900 focus:border-[#7e191b] dark:focus:border-[#ca8a04] focus:ring-4 focus:ring-[#7e191b]/5 dark:focus:ring-[#ca8a04]/5 text-sm shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Password input */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="login-input-wrapper">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none z-10">
                        <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-12 py-3.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-300 focus:bg-white dark:focus:bg-slate-900 focus:border-[#7e191b] dark:focus:border-[#ca8a04] focus:ring-4 focus:ring-[#7e191b]/5 dark:focus:ring-[#ca8a04]/5 text-sm shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-all p-1 hover:scale-110 active:scale-95 outline-none cursor-pointer"
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
                    className="w-full btn-premium text-white py-3.5 rounded-xl text-sm font-black transition cursor-pointer shadow-lg shadow-[#7e191b]/15"
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Signing in...
                      </span>
                    ) : 'Sign In'}
                  </button>
                </form>

                {/* Form 2: Supplier Register */}
                <form 
                  onSubmit={(e) => handleFormSubmit(e, register)} 
                  className="w-1/2 pl-3 pr-0.5 space-y-4"
                >
                  {/* Full Name & Username */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Full Name *
                      </label>
                      <div className="login-input-wrapper">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none z-10">
                          <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </span>
                        <input
                          name="fullName"
                          type="text"
                          required
                          placeholder="Juan Dela Cruz"
                          className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-300 focus:bg-white dark:focus:bg-slate-900 focus:border-[#7e191b] dark:focus:border-[#ca8a04] focus:ring-4 focus:ring-[#7e191b]/5 text-sm shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Username *
                      </label>
                      <div className="login-input-wrapper">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none z-10">
                          <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </span>
                        <input
                          name="username"
                          type="text"
                          required
                          placeholder="juan_dc"
                          className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-300 focus:bg-white dark:focus:bg-slate-900 focus:border-[#7e191b] dark:focus:border-[#ca8a04] focus:ring-4 focus:ring-[#7e191b]/5 text-sm shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <div className="login-input-wrapper">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none z-10">
                        <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="supplier@company.com"
                        className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-300 focus:bg-white dark:focus:bg-slate-900 focus:border-[#7e191b] dark:focus:border-[#ca8a04] focus:ring-4 focus:ring-[#7e191b]/5 text-sm shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Password *
                    </label>
                    <div className="login-input-wrapper">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none z-10">
                        <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        name="password"
                        type={showRegPassword ? "text" : "password"}
                        required
                        placeholder="Min 6 characters"
                        className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-11 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-300 focus:bg-white dark:focus:bg-slate-900 focus:border-[#7e191b] dark:focus:border-[#ca8a04] focus:ring-4 focus:ring-[#7e191b]/5 text-sm shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-all p-1 hover:scale-110 active:scale-95 outline-none cursor-pointer"
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

                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Company Name *
                    </label>
                    <div className="login-input-wrapper">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none z-10">
                        <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h18v3H3V3z" />
                        </svg>
                      </span>
                      <input
                        name="companyName"
                        type="text"
                        required
                        placeholder="Batanes Supplies Corp."
                        className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-300 focus:bg-white dark:focus:bg-slate-900 focus:border-[#7e191b] dark:focus:border-[#ca8a04] focus:ring-4 focus:ring-[#7e191b]/5 text-sm shadow-sm"
                      />
                    </div>
                  </div>

                  {/* TIN & Contact Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        TIN (Optional)
                      </label>
                      <div className="login-input-wrapper">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none z-10">
                          <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </span>
                        <input
                          name="tin"
                          type="text"
                          placeholder="000-000-000-000"
                          className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-300 focus:bg-white dark:focus:bg-slate-900 focus:border-[#7e191b] dark:focus:border-[#ca8a04] focus:ring-4 focus:ring-[#7e191b]/5 text-sm shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Contact Number
                      </label>
                      <div className="login-input-wrapper">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none z-10">
                          <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-1.514 2.022a13.916 13.916 0 01-6.793-6.793l2.022-1.514c.362-.272.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                          </svg>
                        </span>
                        <input
                          name="contactNumber"
                          type="text"
                          placeholder="+63 917 123 4567"
                          className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-300 focus:bg-white dark:focus:bg-slate-900 focus:border-[#7e191b] dark:focus:border-[#ca8a04] focus:ring-4 focus:ring-[#7e191b]/5 text-sm shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Address */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Business Address *
                    </label>
                    <div className="login-input-wrapper">
                      <span className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 pointer-events-none z-10">
                        <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
                        </svg>
                      </span>
                      <textarea
                        name="businessAddress"
                        required
                        rows={2}
                        placeholder="Street, Barangay, Municipality, Province"
                        className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-300 focus:bg-white dark:focus:bg-slate-900 focus:border-[#7e191b] dark:focus:border-[#ca8a04] focus:ring-4 focus:ring-[#7e191b]/5 text-sm shadow-sm resize-none"
                      ></textarea>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full btn-premium text-white py-3.5 rounded-xl text-sm font-black transition cursor-pointer shadow-lg shadow-[#7e191b]/15 mt-2"
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Creating account...
                      </span>
                    ) : 'Create Account'}
                  </button>
                </form>

              </div>
            </div>

            {/* Help desk disclaimer */}
            <div className="pt-4 text-center border-t border-slate-200/50 dark:border-slate-800/50 font-medium">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Forgot your password or need access?{' '}
                <button
                  onClick={() => alert("Please contact the BSC Procurement Unit Helpdesk or System Admin to reset your credentials.")}
                  className="text-[#7e191b] dark:text-[#f59e0b] hover:underline font-bold cursor-pointer outline-none"
                >
                  Contact Admin Support
                </button>
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7e191b] border-t-transparent" />
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}
