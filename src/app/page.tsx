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
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-16 py-12 relative overflow-y-auto">
          
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
            <div className="space-y-1 flex flex-col items-center justify-center">
              {activeTab === 'login' ? (
                <h2 className="uiverse-title leading-tight mb-2">
                  Sign In to Portal
                </h2>
              ) : (
                <h2 className="uiverse-title leading-tight mb-2">
                  Supplier Registry
                </h2>
              )}
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium text-center">
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
                  className="w-1/2 pr-3 pl-0.5 uiverse-form-container"
                >
                  {/* Email input */}
                  <label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder=" "
                      className="uiverse-input"
                    />
                    <span>Email Address</span>
                  </label>

                  {/* Password input */}
                  <label>
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder=" "
                      className="uiverse-input pr-12"
                    />
                    <span>Password</span>

                    {/* Show/Hide Password Eye Button */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center z-10">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-all p-1 hover:scale-110 active:scale-95 outline-none cursor-pointer"
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
                  </label>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full uiverse-submit text-white"
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
                  className="w-1/2 pl-3 pr-0.5 uiverse-form-container"
                >
                  {/* Full Name & Username */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label>
                      <input
                        name="fullName"
                        type="text"
                        required
                        placeholder=" "
                        className="uiverse-input"
                      />
                      <span>Full Name *</span>
                    </label>
                    <label>
                      <input
                        name="username"
                        type="text"
                        required
                        placeholder=" "
                        className="uiverse-input"
                      />
                      <span>Username *</span>
                    </label>
                  </div>

                  {/* Email */}
                  <label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder=" "
                      className="uiverse-input"
                    />
                    <span>Email Address *</span>
                  </label>

                  {/* Password */}
                  <label>
                    <input
                      name="password"
                      type={showRegPassword ? "text" : "password"}
                      required
                      placeholder=" "
                      className="uiverse-input pr-12"
                    />
                    <span>Password *</span>
                    
                    {/* Show/Hide Password Eye Button */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center z-10">
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-all p-1 hover:scale-110 active:scale-95 outline-none cursor-pointer"
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
                  </label>

                  {/* Company Name */}
                  <label>
                    <input
                      name="companyName"
                      type="text"
                      required
                      placeholder=" "
                      className="uiverse-input"
                    />
                    <span>Company Name *</span>
                  </label>

                  {/* TIN & Contact Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label>
                      <input
                        name="tin"
                        type="text"
                        placeholder=" "
                        className="uiverse-input"
                      />
                      <span>TIN (Optional)</span>
                    </label>
                    <label>
                      <input
                        name="contactNumber"
                        type="text"
                        placeholder=" "
                        className="uiverse-input"
                      />
                      <span>Contact Number</span>
                    </label>
                  </div>

                  {/* Business Address */}
                  <label>
                    <textarea
                      name="businessAddress"
                      required
                      rows={2}
                      placeholder=" "
                      className="uiverse-input resize-none h-[76px]"
                    ></textarea>
                    <span>Business Address *</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full uiverse-submit text-white mt-2"
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
