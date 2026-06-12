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
    <div className="relative min-h-screen flex flex-col justify-between p-4 sm:p-8 md:p-12 lg:p-16 bg-[#FAF9F6] dark:bg-[#0f172a] text-[#1A1A1A] dark:text-slate-200 font-sans overflow-x-hidden transition-colors duration-300">
      
      {/* Background Animated Halos (Subtle ambient light) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-20">
        <div className="absolute top-[10%] left-[10%] w-[50%] aspect-square rounded-full bg-radial from-[#7e191b]/5 to-transparent blur-[120px] animate-float-1" />
        <div className="absolute bottom-[10%] right-[10%] w-[50%] aspect-square rounded-full bg-radial from-[#ca8a04]/5 to-transparent blur-[120px] animate-float-2" />
        {/* Fine background administrative grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(126,25,27,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(126,25,27,0.01)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between pb-6 border-b border-[#E7E5E0]/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#7e191b] dark:bg-[#962124] rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm border border-[#ca8a04]/30 flex-shrink-0">
            <span>P</span>
            <span className="text-[#ca8a04] dark:text-[#facc15]">W</span>
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-[#7e191b] dark:text-[#f8fafc] block leading-none">ProcureWise</span>
            <span className="text-[9px] uppercase tracking-widest text-[#ca8a04] dark:text-[#eab308] font-bold mt-1.5 block">Batanes State College</span>
          </div>
        </div>
        
        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center py-10 w-full max-w-xl mx-auto">
        
        {/* Core Pillars Typography Block */}
        <div className="text-center space-y-3 mb-8">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7e191b]/5 dark:bg-[#7e191b]/15 border border-[#7e191b]/10 dark:border-[#7e191b]/30 text-[10px] text-[#7e191b] dark:text-[#f87171] font-bold uppercase tracking-widest">
            🏛️ Institutional Procurement Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] dark:text-white tracking-tight leading-tight">
            Modern, Transparent & Elegant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto tracking-wide leading-relaxed">
            Authorized portal for Batanes State College solicitations, quotations, and automated best-value recommendations.
          </p>
        </div>

        {/* Minimalist Floating Card */}
        <div className="w-full bg-[#FCFAF6] dark:bg-[#1e293b] border border-[#E7E5E0] dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-100/50 dark:shadow-none p-6 sm:p-10 space-y-6 transition-all duration-300">
          
          {/* Navigation Tabs (Perfect spacing, bottom border, opacity changes) */}
          <div className="flex border-b border-[#E7E5E0] dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); handleClearParams(); }}
              className={`flex-1 pb-4 text-xs sm:text-sm font-bold tracking-wider transition-all duration-300 cursor-pointer outline-none ${
                activeTab === 'login' 
                  ? 'text-[#7e191b] dark:text-white border-b-2 border-[#7e191b] dark:border-[#eab308] opacity-100' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 opacity-60 hover:opacity-80'
              }`}
            >
              🔒 Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); handleClearParams(); }}
              className={`flex-1 pb-4 text-xs sm:text-sm font-bold tracking-wider transition-all duration-300 cursor-pointer outline-none ${
                activeTab === 'register' 
                  ? 'text-[#7e191b] dark:text-white border-b-2 border-[#7e191b] dark:border-[#eab308] opacity-100' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 opacity-60 hover:opacity-80'
              }`}
            >
              📝 Supplier Register
            </button>
          </div>

          {/* Error and Success Alerts */}
          {error && (
            <div className="relative flex items-start gap-3 rounded-2xl border border-red-200 dark:border-red-950/40 bg-red-50/50 dark:bg-red-950/20 p-4 text-xs text-red-600 dark:text-red-400">
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
            <div className="relative flex items-start gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-950/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 text-xs text-emerald-600 dark:text-emerald-400">
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

          {/* Form Content Rendering */}
          {activeTab === 'login' ? (
            <form 
              onSubmit={(e) => handleFormSubmit(e, login)} 
              className="space-y-5"
            >
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 dark:text-slate-400">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@college.edu.ph"
                  className="w-full px-4 py-3 rounded-xl border border-[#E7E5E0] dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-[#1A1A1A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-[#7e191b] dark:focus:ring-[#f59e0b] focus:border-[#7e191b] dark:focus:border-[#eab308]"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 dark:text-slate-400">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-[#E7E5E0] dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-[#1A1A1A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-[#7e191b] dark:focus:ring-[#f59e0b] focus:border-[#7e191b] dark:focus:border-[#eab308]"
                  />

                  {/* Show/Hide Password Eye Button */}
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center z-10">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-all p-1 hover:scale-105 active:scale-95 outline-none cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                    >
                      {showPassword ? (
                        <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#7e191b] hover:bg-[#962124] active:scale-[0.99] text-white text-xs uppercase tracking-widest font-extrabold shadow-sm hover:shadow-md hover:shadow-[#7e191b]/10 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing In...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>
          ) : (
            <form 
              onSubmit={(e) => handleFormSubmit(e, register)} 
              className="space-y-4"
            >
              {/* Full Name & Username in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 dark:text-slate-400">
                    Full Name *
                  </label>
                  <input
                    name="fullName"
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E5E0] dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-[#1A1A1A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-[#7e191b] dark:focus:ring-[#f59e0b] focus:border-[#7e191b] dark:focus:border-[#eab308]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 dark:text-slate-400">
                    Username *
                  </label>
                  <input
                    name="username"
                    type="text"
                    required
                    placeholder="johndoe"
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E5E0] dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-[#1A1A1A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-[#7e191b] dark:focus:ring-[#f59e0b] focus:border-[#7e191b] dark:focus:border-[#eab308]"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 dark:text-slate-400">
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="supplier@company.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#E7E5E0] dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-[#1A1A1A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-[#7e191b] dark:focus:ring-[#f59e0b] focus:border-[#7e191b] dark:focus:border-[#eab308]"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 dark:text-slate-400">
                  Password *
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showRegPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-[#E7E5E0] dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-[#1A1A1A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-[#7e191b] dark:focus:ring-[#f59e0b] focus:border-[#7e191b] dark:focus:border-[#eab308]"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center z-10">
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-all p-1 hover:scale-105 active:scale-95 outline-none cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                    >
                      {showRegPassword ? (
                        <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 dark:text-slate-400">
                  Company Name *
                </label>
                <input
                  name="companyName"
                  type="text"
                  required
                  placeholder="Acme Industrial Corp."
                  className="w-full px-4 py-3 rounded-xl border border-[#E7E5E0] dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-[#1A1A1A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-[#7e191b] dark:focus:ring-[#f59e0b] focus:border-[#7e191b] dark:focus:border-[#eab308]"
                />
              </div>

              {/* TIN & Contact Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 dark:text-slate-400">
                    TIN (Optional)
                  </label>
                  <input
                    name="tin"
                    type="text"
                    placeholder="000-000-000-000"
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E5E0] dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-[#1A1A1A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-[#7e191b] dark:focus:ring-[#f59e0b] focus:border-[#7e191b] dark:focus:border-[#eab308]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 dark:text-slate-400">
                    Contact Number
                  </label>
                  <input
                    name="contactNumber"
                    type="text"
                    placeholder="+63 917 123 4567"
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E5E0] dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-[#1A1A1A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-[#7e191b] dark:focus:ring-[#f59e0b] focus:border-[#7e191b] dark:focus:border-[#eab308]"
                  />
                </div>
              </div>

              {/* Business Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 dark:text-slate-400">
                  Business Address *
                </label>
                <textarea
                  name="businessAddress"
                  required
                  rows={2}
                  placeholder="Basco, Batanes, Philippines"
                  className="w-full px-4 py-3 rounded-xl border border-[#E7E5E0] dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-950 text-[#1A1A1A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-[#7e191b] dark:focus:ring-[#f59e0b] focus:border-[#7e191b] dark:focus:border-[#eab308] resize-none h-[76px]"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-3 py-3.5 px-4 rounded-xl bg-[#7e191b] hover:bg-[#962124] active:scale-[0.99] text-white text-xs uppercase tracking-widest font-extrabold shadow-sm hover:shadow-md hover:shadow-[#7e191b]/10 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Registering Company...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>
          )}

          {/* Help Desk Disclaimer (Generous breathing room and neutral tones) */}
          <div className="pt-6 text-center border-t border-[#E7E5E0] dark:border-slate-800">
            <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 block leading-relaxed font-semibold">
              Forgot your credentials or need system access?
            </span>
            <button
              onClick={() => alert("Please contact the BSC Procurement Unit Helpdesk or System Admin to request support.")}
              className="mt-2 text-xs text-[#7e191b] dark:text-[#f59e0b] hover:underline font-extrabold cursor-pointer outline-none transition-colors duration-200 min-h-[44px] px-4"
            >
              Contact Admin Support
            </button>
          </div>

        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center border-t border-[#E7E5E0]/60 dark:border-slate-800/60 pt-6 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider gap-3 sm:gap-0">
        <span>© {new Date().getFullYear()} Batanes State College</span>
        <span className="flex items-center gap-2 text-[#ca8a04]">
          <span className="h-2 w-2 rounded-full bg-[#ca8a04] animate-pulse" />
          Procurement Unit System
        </span>
      </footer>

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
