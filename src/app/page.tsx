"use client";

import React, { useState, useTransition, Suspense } from 'react';
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
    <div className="relative flex min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-300 selection:bg-[#7e191b] selection:text-white font-sans overflow-hidden transition-colors duration-300">
      
      {/* Theme Toggle Positioned Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* 50/50 Split Grid */}
      <div className="flex flex-col md:flex-row w-full min-h-screen">
        
        {/* Left Column - Academic/Branding Showcase (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-1/2 relative flex-col justify-center items-center p-12 overflow-hidden bg-[#7e191b] dark:bg-[#450a0a] border-r border-[#ca8a04]/20 transition-colors duration-300">
          
          {/* Subtle warm gold lighting source (Dark mode only) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden hidden dark:block">
            <div className="absolute top-[20%] right-[-10%] w-[80%] aspect-square rounded-full bg-[#ca8a04]/10 blur-[130px]" />
            <div className="absolute bottom-[20%] left-[-10%] w-[60%] aspect-square rounded-full bg-[#7e191b]/10 blur-[120px]" />
          </div>

          {/* Floating square cards with user silhouettes */}
          <div className="absolute top-[18%] left-[18%] w-14 h-14 bg-white/5 border border-white/10 shadow-xl rounded-xl flex items-center justify-center -rotate-6 opacity-75">
            <svg viewBox="0 0 100 100" className="w-7 h-7 text-[#ca8a04]/60">
              <circle cx="50" cy="40" r="22" fill="currentColor" />
              <path d="M15 85c0-18 15-28 35-28s35 10 35 28v5H15v-5z" fill="currentColor" />
            </svg>
          </div>

          <div className="absolute bottom-[16%] left-[44%] w-18 h-18 bg-white/5 border border-white/10 shadow-xl rounded-2xl flex items-center justify-center rotate-12 opacity-75 animate-pulse" style={{ animationDuration: '4s' }}>
            <svg viewBox="0 0 100 100" className="w-9 h-9 text-[#ca8a04]/60">
              <circle cx="50" cy="40" r="22" fill="currentColor" />
              <path d="M15 85c0-18 15-28 35-28s35 10 35 28v5H15v-5z" fill="currentColor" />
            </svg>
          </div>

          <div className="absolute top-[26%] right-[22%] w-16 h-16 bg-white/5 border border-white/10 shadow-xl rounded-xl flex items-center justify-center rotate-6 opacity-75">
            <svg viewBox="0 0 100 100" className="w-8 h-8 text-[#ca8a04]/60">
              <circle cx="50" cy="40" r="22" fill="currentColor" />
              <path d="M15 85c0-18 15-28 35-28s35 10 35 28v5H15v-5z" fill="currentColor" />
            </svg>
          </div>

          {/* Central Glassmorphic Testimonial Card */}
          <div className="relative z-10 bg-white/10 dark:bg-black/30 border border-white/15 backdrop-blur-xl p-7 sm:p-8 rounded-2xl w-full max-w-sm shadow-2xl transition-colors text-white">
            
            {/* Small BBSC Gold icon badge */}
            <div className="h-9 w-9 bg-[#ca8a04] rounded-lg flex items-center justify-center text-[#7e191b] mb-6 shadow-md shadow-[#ca8a04]/20">
              <span className="font-extrabold text-sm">🏛️</span>
            </div>

            {/* Quote block */}
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
              "ProcureWise is the official procurement support platform of Batanes State College. We replace slow, manual paperwork with objective automated bidding and comparisons—making the entire solicitation process transparent and compliant."
            </p>

            {/* Author info */}
            <div>
              <span className="text-[#ca8a04] font-bold text-xs block">BATANES STATE COLLEGE</span>
              <span className="text-white/60 text-[10px] mt-0.5 block">Procurement Unit Portal</span>
            </div>

            {/* Pagination Indicators */}
            <div className="flex items-center gap-1.5 mt-8">
              <div className="h-1.5 w-1.5 rounded-full bg-[#ca8a04]" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
            </div>
          </div>

        </div>

        {/* Right Column - Auth Form */}
        <div className="w-full md:w-1/2 bg-slate-50 dark:bg-[#0f172a] flex flex-col justify-center px-8 sm:px-16 md:px-24 py-12 relative transition-colors duration-300">
          
          {/* Logo brand for Mobile View (Hidden on Desktop) */}
          <div className="absolute top-8 left-8 flex items-center gap-2 md:hidden">
            <div className="h-8 w-8 bg-[#7e191b] shadow-sm rounded-lg flex items-center justify-center text-white font-black text-xs border border-[#ca8a04]/20">
              <span>P</span>
              <span className="text-[#ca8a04]">W</span>
            </div>
            <span className="text-sm font-extrabold tracking-tight text-[#7e191b] dark:text-[#f59e0b]">ProcureWise</span>
          </div>

          <div className="w-full max-w-md mx-auto space-y-6 pt-10 md:pt-0">
            
            {/* Headers */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                {activeTab === 'login' ? 'Welcome to ProcureWise' : 'Create Supplier Account'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2.5">
                {activeTab === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={() => { setActiveTab('register'); handleClearParams(); }}
                      className="text-[#7e191b] dark:text-red-400 hover:underline font-semibold cursor-pointer"
                    >
                      Click here
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => { setActiveTab('login'); handleClearParams(); }}
                      className="text-[#7e191b] dark:text-red-400 hover:underline font-semibold cursor-pointer"
                    >
                      Click here
                    </button>
                  </>
                )}
              </p>
            </div>

            {/* Error and Success Alerts */}
            {error && (
              <div className="relative flex items-start gap-3 rounded-lg border border-red-200 dark:border-red-900/20 bg-red-50 dark:bg-red-950/20 p-3.5 text-xs text-red-600 dark:text-red-400">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span className="pr-4 leading-normal">{error}</span>
                <button onClick={handleClearParams} className="absolute right-2 top-2 text-red-400 hover:text-red-600 dark:text-red-400/50 dark:hover:text-red-400 transition-colors">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            )}

            {success && (
              <div className="relative flex items-start gap-3 rounded-lg border border-emerald-200 dark:border-emerald-900/20 bg-emerald-50 dark:bg-emerald-950/20 p-3.5 text-xs text-emerald-600 dark:text-emerald-400">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span className="pr-4 leading-normal">{success}</span>
                <button onClick={handleClearParams} className="absolute right-2 top-2 text-emerald-400 hover:text-emerald-600 dark:text-emerald-400/50 dark:hover:text-emerald-400 transition-colors">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Login Mode */}
            {activeTab === 'login' ? (
              <form onSubmit={(e) => handleFormSubmit(e, login)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-lg px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition focus:border-[#7e191b] dark:focus:border-red-600 focus:ring-1 focus:ring-[#7e191b]/10 text-sm shadow-sm dark:shadow-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-lg pl-4 pr-11 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition focus:border-[#7e191b] dark:focus:border-red-600 focus:ring-1 focus:ring-[#7e191b]/10 text-sm shadow-sm dark:shadow-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors p-1 rounded-md outline-none"
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
                  className="w-full bg-[#7e191b] hover:bg-[#962124] dark:bg-red-700 dark:hover:bg-red-600 text-white py-3 rounded-lg text-sm font-semibold transition cursor-pointer shadow-md shadow-red-900/15"
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
              /* Register Mode */
              <form onSubmit={(e) => handleFormSubmit(e, register)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Full Name
                    </label>
                    <input
                      name="fullName"
                      type="text"
                      required
                      placeholder="Juan Dela Cruz"
                      className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition focus:border-[#7e191b] text-sm shadow-sm dark:shadow-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Username
                    </label>
                    <input
                      name="username"
                      type="text"
                      required
                      placeholder="juan_dc"
                      className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition focus:border-[#7e191b] text-sm shadow-sm dark:shadow-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition focus:border-[#7e191b] text-sm shadow-sm dark:shadow-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showRegPassword ? "text" : "password"}
                      required
                      placeholder="Min 6 characters"
                      className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-lg pl-4 pr-11 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition focus:border-[#7e191b] text-sm shadow-sm dark:shadow-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors p-1 rounded-md outline-none"
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
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Company Name
                  </label>
                  <input
                    name="companyName"
                    type="text"
                    required
                    className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition focus:border-[#7e191b] text-sm shadow-sm dark:shadow-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                      TIN (Optional)
                    </label>
                    <input
                      name="tin"
                      type="text"
                      placeholder="000-000-000-000"
                      className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition focus:border-[#7e191b] text-sm shadow-sm dark:shadow-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Contact Number (Optional)
                    </label>
                    <input
                      name="contactNumber"
                      type="text"
                      className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition focus:border-[#7e191b] text-sm shadow-sm dark:shadow-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Business Address
                  </label>
                  <textarea
                    name="businessAddress"
                    required
                    rows={2}
                    className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition focus:border-[#7e191b] text-sm shadow-sm dark:shadow-none resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#7e191b] hover:bg-[#962124] dark:bg-red-700 dark:hover:bg-red-600 text-white py-3 rounded-lg text-sm font-semibold transition cursor-pointer shadow-md shadow-red-900/15"
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

            {/* Forgot password link */}
            <div className="pt-2 text-center md:text-left">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Forgot your password?{' '}
                <button
                  onClick={() => alert("Please contact your ProcureWise administrator to reset your password.")}
                  className="text-[#7e191b] dark:text-red-400 hover:underline font-semibold cursor-pointer"
                >
                  Click here
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
