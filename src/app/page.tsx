"use client";

import React, { useState, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { login, register } from './actions/auth';
import { ThemeToggle } from '@/components/theme-toggle';

function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const error = searchParams.get('error');
  const success = searchParams.get('success');

  // Derive initial tab from error query parameter directly to avoid useEffect cascading renders
  const initialTab = (error && (
    error.toLowerCase().includes('company') || 
    error.toLowerCase().includes('tin') || 
    error.toLowerCase().includes('address') || 
    error.toLowerCase().includes('full name')
  )) ? 'register' : 'login';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClearParams = () => {
    router.replace('/');
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>, action: (formData: FormData) => Promise<unknown>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(formData);
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0f172a] text-[#1A1A1A] dark:text-slate-200 font-sans flex items-center justify-center p-4 sm:p-6 md:p-10 transition-colors duration-300 relative overflow-x-hidden">
      
      {/* Background Ambient Decorative Light Grid (Very subtle luxury touch) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20 dark:opacity-10">
        <div className="absolute top-[5%] left-[5%] w-[45%] aspect-square rounded-full bg-radial from-[#7e191b]/5 to-transparent blur-[120px]" />
        <div className="absolute bottom-[5%] right-[5%] w-[45%] aspect-square rounded-full bg-radial from-[#ca8a04]/5 to-transparent blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(126,25,27,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(126,25,27,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Floating Card Container */}
      <div className="relative z-10 w-full max-w-[1120px] min-h-[680px] bg-white dark:bg-slate-900 rounded-[24px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.02),0px_12px_24px_-4px_rgba(26,26,26,0.04),0px_32px_64px_-12px_rgba(26,26,26,0.08)] overflow-hidden flex flex-col lg:flex-row items-stretch border border-[#E7E5E0]/40 dark:border-slate-800/40 transition-all duration-300">
        
        {/* ========================================== */}
        {/* LEFT PANEL: Quiet Luxury Identity Panel  */}
        {/* ========================================== */}
        <div className="w-full lg:w-[45%] lg:shrink-0 lg:grow-0 bg-[#1A1A1A] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden select-none">
          {/* Accent lighting for left panel */}
          <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-[#800000]/10 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-[#D4AF37]/5 blur-[80px] pointer-events-none" />

          {/* Top Micro-Copy with max-width wrapping to prevent overflow */}
          <div className="relative z-10 flex justify-center lg:justify-start">
            <span className="text-[10px] sm:text-[11px] tracking-[0.1em] text-[#E5E5E5]/70 font-semibold uppercase block leading-relaxed max-w-[320px] text-center lg:text-left">
              Global procurement made simple – online procurement solutions for you.
            </span>
          </div>

          {/* Main Headline */}
          <div className="relative z-10 mt-8 mb-4">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-white leading-tight text-center lg:text-left">
              Manage your procurement
            </h1>
          </div>

          {/* Smartphone & Graph Visual Asset */}
          <div className="relative z-10 flex-grow flex items-center justify-center py-6">
            <div className="relative flex items-center justify-center">
              
              {/* Smartphone Frame (3D tilt rotation) */}
              <div 
                className="relative w-[210px] h-[340px] bg-[#161617] border-[4px] border-[#38383a] rounded-[32px] p-2.5 shadow-2xl transition-all duration-500 hover:rotate-0"
                style={{
                  transform: 'perspective(1000px) rotateY(-10deg) rotateX(6deg) rotateZ(-2deg)',
                  boxShadow: '15px 15px 35px rgba(0,0,0,0.6), -10px -10px 25px rgba(255,255,255,0.01)'
                }}
              >
                {/* Screen Content */}
                <div className="relative w-full h-full rounded-[23px] bg-[#0A0A0A] overflow-hidden flex flex-col justify-between p-3.5 border border-[#161617]">
                  
                  {/* Notch / Dynamic Island */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-black rounded-full z-30" />

                  {/* Mini Screen Header */}
                  <div className="pt-4 flex justify-between items-center border-b border-slate-900 pb-1.5">
                    <div>
                      <span className="text-[6px] text-slate-500 uppercase tracking-widest block font-bold">PROCUREWISE</span>
                      <span className="text-[8px] text-white font-extrabold block">Bidding Comparison</span>
                    </div>
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  {/* Vertical Grouped Column Chart */}
                  <div className="flex-1 flex flex-col justify-end gap-4 py-2">
                    
                    {/* Item Group 1: Bond Paper (Long) */}
                    <div className="space-y-1">
                      <div className="flex items-end justify-between h-[70px] px-1.5 relative border-b border-slate-900">
                        {/* Supplier A column (Maroon) */}
                        <div className="relative w-3.5 bg-gradient-to-t from-[#4a0d0e] to-[#800000] rounded-t-sm" style={{ height: '85%' }}>
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[6px] font-bold text-white bg-slate-950 px-1 py-0.5 rounded border border-slate-900 leading-none">₱210</span>
                        </div>
                        {/* Supplier B column (Gold) */}
                        <div className="relative w-3.5 bg-gradient-to-t from-[#917122] to-[#D4AF37] rounded-t-sm" style={{ height: '70%' }}>
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[6px] font-bold text-white bg-slate-950 px-1 py-0.5 rounded border border-slate-900 leading-none">₱195</span>
                        </div>
                        {/* Supplier C column (Gray) */}
                        <div className="relative w-3.5 bg-gradient-to-t from-[#4c4c4e] to-[#8A8A8F] rounded-t-sm" style={{ height: '78%' }}>
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[6px] font-bold text-white bg-slate-950 px-1 py-0.5 rounded border border-slate-900 leading-none">₱205</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-[6.5px] text-slate-400 font-bold uppercase tracking-wider block">Bond Paper (Long)</span>
                      </div>
                    </div>

                    {/* Item Group 2: Bond Paper (Short) */}
                    <div className="space-y-1">
                      <div className="flex items-end justify-between h-[70px] px-1.5 relative border-b border-slate-900">
                        {/* Supplier A column (Maroon) */}
                        <div className="relative w-3.5 bg-gradient-to-t from-[#4a0d0e] to-[#800000] rounded-t-sm" style={{ height: '72%' }}>
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[6px] font-bold text-white bg-slate-950 px-1 py-0.5 rounded border border-slate-900 leading-none">₱185</span>
                        </div>
                        {/* Supplier B column (Gold) */}
                        <div className="relative w-3.5 bg-gradient-to-t from-[#917122] to-[#D4AF37] rounded-t-sm" style={{ height: '58%' }}>
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[6px] font-bold text-white bg-slate-950 px-1 py-0.5 rounded border border-slate-900 leading-none">₱170</span>
                        </div>
                        {/* Supplier C column (Gray) */}
                        <div className="relative w-3.5 bg-gradient-to-t from-[#4c4c4e] to-[#8A8A8F] rounded-t-sm" style={{ height: '65%' }}>
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[6px] font-bold text-white bg-slate-950 px-1 py-0.5 rounded border border-slate-900 leading-none">₱180</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-[6.5px] text-slate-400 font-bold uppercase tracking-wider block">Bond Paper (Short)</span>
                      </div>
                    </div>

                  </div>

                  {/* Screen Footer Info */}
                  <div className="flex justify-between items-center text-[5.5px] text-slate-500 border-t border-slate-900 pt-1.5 font-semibold">
                    <span>Live Quotations</span>
                    <span>ProcureWise Mobile</span>
                  </div>

                </div>
              </div>

              {/* Hand Overlay Silhouette holding phone - shifted slightly to remain fully in Left Panel */}
              <div 
                className="absolute w-[160px] h-[160px] pointer-events-none z-20 select-none"
                style={{
                  bottom: '-35px',
                  right: '-30px',
                  transform: 'rotate(-4deg)'
                }}
              >
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]">
                  {/* Palm and wrist base */}
                  <path d="M70 120 C 72 105, 68 95, 62 90 C 58 87, 52 87, 48 92 C 45 96, 42 104, 43 112 C 44 115, 38 118, 30 120 Z" fill="url(#handGrad)" />
                  {/* Thumb overlapping the phone chassis & bezel on the lower right */}
                  <path d="M48,82 C 55,78, 63,82, 65,90 C 67,98, 62,106, 54,108 C 50,109, 48,106, 47,102 C 46,98, 45,86, 48,82 Z" fill="url(#handGrad)" />
                  
                  <defs>
                    <linearGradient id="handGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#252527" />
                      <stop offset="100%" stopColor="#0B0B0C" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

            </div>
          </div>

          {/* Left Footer: Copyright */}
          <div className="relative z-10 text-center lg:text-left mt-4 text-[11px] font-medium text-[#E5E5E5]/50 tracking-wider">
            <span>© 2026 Batanes State College</span>
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT PANEL: Sign-In / Register Form      */}
        {/* ========================================== */}
        <div className="w-full lg:w-[55%] lg:shrink-0 lg:grow-0 bg-white dark:bg-slate-900 p-8 sm:p-12 lg:p-16 flex flex-col justify-between transition-colors duration-300">
          
          {/* Top Header Lockup & Switch Link */}
          <div className="flex justify-between items-center text-[13px] mb-8 lg:mb-4">
            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>ProcureWise</span>
              <span className="text-gray-300 dark:text-slate-800 font-light">|</span>
              <span className="text-gray-400 dark:text-gray-500 font-medium">Batanes State College</span>
            </div>
            
            <button
              type="button"
              onClick={() => { setActiveTab(activeTab === 'login' ? 'register' : 'login'); handleClearParams(); }}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 flex items-center gap-1.5 opacity-80 cursor-pointer outline-none font-semibold"
            >
              {activeTab === 'login' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Sign Up
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </div>

          {/* Central Form Container - tightened width to 380px to center elegantly without overflow */}
          <div className="my-auto w-full max-w-[380px] mx-auto py-4">
            
            {/* Form Title */}
            <h2 className="text-[28px] font-bold text-gray-900 dark:text-white tracking-tight mb-5 leading-tight">
              {activeTab === 'login' ? 'Sign In' : 'Supplier Register'}
            </h2>

            {/* Error and Success Alerts */}
            {error && (
              <div className="relative flex items-start gap-3 rounded-2xl border border-red-200 dark:border-red-950/40 bg-red-50/50 dark:bg-red-950/20 p-4 mb-4 text-xs text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-red-500 mt-0.5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span className="pr-4 leading-relaxed font-semibold">{error}</span>
                <button onClick={handleClearParams} className="absolute right-3.5 top-3.5 text-red-400 hover:text-red-700 transition-colors cursor-pointer">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            )}

            {success && (
              <div className="relative flex items-start gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-950/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 mb-4 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-top-1 duration-200">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span className="pr-4 leading-relaxed font-semibold">{success}</span>
                <button onClick={handleClearParams} className="absolute right-3.5 top-3.5 text-emerald-400 hover:text-emerald-700 transition-colors cursor-pointer">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Form Renderer */}
            {activeTab === 'login' ? (
              <form 
                onSubmit={(e) => handleFormSubmit(e, login)} 
                className="space-y-4"
              >
                {/* Field 1: Email/Username */}
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Email or Username"
                    className="w-full h-[52px] px-4 rounded-[12px] border border-gray-200 dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm font-semibold transition-all duration-200 outline-none focus:border-gray-900 dark:focus:border-slate-400 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-400"
                  />
                </div>

                {/* Field 2: Password */}
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Password"
                    className="w-full h-[52px] px-4 pr-12 rounded-[12px] border border-gray-200 dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm font-semibold transition-all duration-200 outline-none focus:border-gray-900 dark:focus:border-slate-400 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-all cursor-pointer p-1"
                  >
                    {showPassword ? (
                      <svg fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" className="w-[18px] h-[18px]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" className="w-[18px] h-[18px]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Secondary Links: Forgot password */}
                <div className="text-center pt-1">
                  <a href="#" className="text-[#800000] dark:text-[#f87171] hover:text-[#962124] dark:hover:text-[#f87171]/80 text-sm font-semibold hover:underline transition-colors duration-200">
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-[54px] rounded-full bg-gradient-to-r from-[#FF6B35] to-[#DD2C53] text-white font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md shadow-[#FF6B35]/25 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Signing In...
                      </span>
                    ) : '→ Sign In'}
                  </button>
                </div>
              </form>
            ) : (
              <form 
                onSubmit={(e) => handleFormSubmit(e, register)} 
                className="space-y-3"
              >
                {/* Full Name & Username in 2 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    name="fullName"
                    type="text"
                    required
                    placeholder="Full Name *"
                    className="w-full h-[46px] px-4 rounded-[12px] border border-gray-200 dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm font-semibold transition-all duration-200 outline-none focus:border-gray-900 dark:focus:border-slate-400 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-400"
                  />
                  <input
                    name="username"
                    type="text"
                    required
                    placeholder="Username *"
                    className="w-full h-[46px] px-4 rounded-[12px] border border-gray-200 dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm font-semibold transition-all duration-200 outline-none focus:border-gray-900 dark:focus:border-slate-400 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-400"
                  />
                </div>

                {/* Email Address */}
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email Address *"
                  className="w-full h-[46px] px-4 rounded-[12px] border border-gray-200 dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm font-semibold transition-all duration-200 outline-none focus:border-gray-900 dark:focus:border-slate-400 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-400"
                />

                {/* Password Input with eye toggle */}
                <div className="relative">
                  <input
                    name="password"
                    type={showRegPassword ? "text" : "password"}
                    required
                    placeholder="Password *"
                    className="w-full h-[46px] px-4 pr-12 rounded-[12px] border border-gray-200 dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm font-semibold transition-all duration-200 outline-none focus:border-gray-900 dark:focus:border-slate-400 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-all cursor-pointer p-1"
                  >
                    {showRegPassword ? (
                      <svg fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" className="w-[18px] h-[18px]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" className="w-[18px] h-[18px]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Company Name */}
                <input
                  name="companyName"
                  type="text"
                  required
                  placeholder="Company Name *"
                  className="w-full h-[46px] px-4 rounded-[12px] border border-gray-200 dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm font-semibold transition-all duration-200 outline-none focus:border-gray-900 dark:focus:border-slate-400 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-400"
                />

                {/* TIN & Contact Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    name="tin"
                    type="text"
                    placeholder="TIN (Optional)"
                    className="w-full h-[46px] px-4 rounded-[12px] border border-gray-200 dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm font-semibold transition-all duration-200 outline-none focus:border-gray-900 dark:focus:border-slate-400 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-400"
                  />
                  <input
                    name="contactNumber"
                    type="text"
                    placeholder="Contact Number *"
                    className="w-full h-[46px] px-4 rounded-[12px] border border-gray-200 dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm font-semibold transition-all duration-200 outline-none focus:border-gray-900 dark:focus:border-slate-400 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-400"
                  />
                </div>

                {/* Business Address */}
                <textarea
                  name="businessAddress"
                  required
                  rows={2}
                  placeholder="Business Address *"
                  className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm font-semibold transition-all duration-200 outline-none focus:border-gray-900 dark:focus:border-slate-400 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-400 resize-none h-[68px]"
                />

                {/* Submit Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-[54px] rounded-full bg-gradient-to-r from-[#FF6B35] to-[#DD2C53] text-white font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md shadow-[#FF6B35]/25 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Registering...
                      </span>
                    ) : '→ Create Account'}
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Right Footer Layout */}
          <div className="flex justify-between items-center text-[11px] text-gray-400 dark:text-gray-500 pt-6 mt-8 border-t border-gray-100 dark:border-slate-800 font-semibold uppercase tracking-wider">
            {/* Left element: Hide on desktop left-panel copy, display on mobile */}
            <div className="lg:hidden">
              © 2026 BBSC
            </div>
            
            {/* Right element: Support and Dropdown */}
            <div className="flex items-center justify-between w-full lg:justify-end gap-5">
              <a 
                onClick={() => alert("Please contact the BSC Procurement Unit Helpdesk or System Admin to request support.")}
                className="hover:text-gray-700 dark:hover:text-slate-300 transition-colors duration-200 cursor-pointer"
              >
                Contact Admin Support
              </a>
              
              <div className="relative group cursor-pointer flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-300 transition-colors duration-200">
                <span>English</span>
                <svg className="w-3 h-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
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
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] dark:bg-[#0f172a]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7e191b] border-t-transparent" />
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}
