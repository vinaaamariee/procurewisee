"use client";

import React, { useState, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { login, register } from './actions/auth';
import type { UserRole } from '@/types/auth';

function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Procurement Officer');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const error = searchParams.get('error');
  const success = searchParams.get('success');

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

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>, action: (formData: FormData) => Promise<any>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(formData);
    });
  };

  return (
    <div className="relative flex min-h-screen bg-[#090b0f] text-slate-350 selection:bg-blue-600 selection:text-white font-sans overflow-hidden">
      
      {/* 50/50 Split Grid */}
      <div className="flex flex-col md:flex-row w-full min-h-screen">
        
        {/* Left Column - 3D/Warm Orange Ambient Showcase (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-1/2 relative flex-col justify-center items-center p-12 overflow-hidden bg-gradient-to-br from-[#1b120c] via-[#0f0f13] to-[#07070a] border-r border-white/5">
          
          {/* Subtle warm orange lighting source */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[20%] right-[-10%] w-[80%] aspect-square rounded-full bg-[#f97316]/10 blur-[130px]" />
            <div className="absolute bottom-[20%] left-[-10%] w-[60%] aspect-square rounded-full bg-blue-900/10 blur-[120px]" />
          </div>

          {/* Floating square cards with user silhouettes */}
          <div className="absolute top-[18%] left-[18%] w-14 h-14 bg-[#141519] border border-white/5 shadow-2xl rounded-xl flex items-center justify-center -rotate-6 opacity-80">
            <svg viewBox="0 0 100 100" className="w-7 h-7 text-slate-700">
              <circle cx="50" cy="40" r="22" fill="currentColor" />
              <path d="M15 85c0-18 15-28 35-28s35 10 35 28v5H15v-5z" fill="currentColor" />
            </svg>
          </div>

          <div className="absolute bottom-[16%] left-[44%] w-18 h-18 bg-[#141519] border border-white/5 shadow-2xl rounded-2xl flex items-center justify-center rotate-12 opacity-80 animate-pulse" style={{ animationDuration: '4s' }}>
            <svg viewBox="0 0 100 100" className="w-9 h-9 text-slate-700">
              <circle cx="50" cy="40" r="22" fill="currentColor" />
              <path d="M15 85c0-18 15-28 35-28s35 10 35 28v5H15v-5z" fill="currentColor" />
            </svg>
          </div>

          <div className="absolute top-[26%] right-[22%] w-16 h-16 bg-[#141519] border border-white/5 shadow-2xl rounded-xl flex items-center justify-center rotate-6 opacity-80">
            <svg viewBox="0 0 100 100" className="w-8 h-8 text-slate-700">
              <circle cx="50" cy="40" r="22" fill="currentColor" />
              <path d="M15 85c0-18 15-28 35-28s35 10 35 28v5H15v-5z" fill="currentColor" />
            </svg>
          </div>

          {/* Central Glassmorphic Testimonial Card */}
          <div className="relative z-10 bg-[#161413]/35 border border-white/5 backdrop-blur-md p-7 sm:p-8 rounded-2xl w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            
            {/* Small blue rounded icon badge */}
            <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-6 shadow-md shadow-blue-600/10">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="h-4.5 w-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>

            {/* Quote block */}
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
              "ProcureWise was created to simplify institutional buying. We replace slow, manual paperwork and complex spreadsheets with automated bidding and objective scoring—making the entire procurement process fast, fair, and transparent."
            </p>

            {/* Author info */}
            <div>
              <span className="text-slate-200 font-semibold text-xs block">Our Mission</span>
              <span className="text-slate-500 text-[10px] mt-0.5 block">Simplifying Institutional Procurement</span>
            </div>

            {/* Pagination Indicators */}
            <div className="flex items-center gap-1.5 mt-8">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <div className="h-1.5 w-1.5 rounded-full bg-slate-650" />
              <div className="h-1.5 w-1.5 rounded-full bg-slate-650" />
            </div>
          </div>

        </div>

        {/* Right Column - Dark Auth Form */}
        <div className="w-full md:w-1/2 bg-[#090b11] flex flex-col justify-center px-8 sm:px-16 md:px-24 py-12 relative">
          
          {/* Logo brand for Mobile View (Hidden on Desktop) */}
          <div className="absolute top-8 left-8 flex items-center gap-2 md:hidden">
            <div className="h-7 w-7 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs border border-white/5">
              <span>P</span>
              <span className="text-blue-400">W</span>
            </div>
            <span className="text-sm font-extrabold tracking-tight text-white">ProcureWise</span>
          </div>

          <div className="w-full max-w-md mx-auto space-y-6">
            
            {/* Headers */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white leading-none">
                {activeTab === 'login' ? 'Welcome to ProcureWise' : 'Create your account'}
              </h2>
              <p className="text-sm text-slate-400 mt-2.5">
                {activeTab === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={() => { setActiveTab('register'); handleClearParams(); }}
                      className="text-blue-500 hover:underline font-semibold cursor-pointer"
                    >
                      Click here
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => { setActiveTab('login'); handleClearParams(); }}
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
              <div className="relative flex items-start gap-3 rounded-lg border border-red-900/20 bg-red-950/20 p-3.5 text-xs text-red-400">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span className="pr-4 leading-normal">{decodeURIComponent(error)}</span>
                <button onClick={handleClearParams} className="absolute right-2 top-2 text-red-400/50 hover:text-red-400 transition-colors">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            )}

            {success && (
              <div className="relative flex items-start gap-3 rounded-lg border border-emerald-900/20 bg-emerald-950/20 p-3.5 text-xs text-emerald-400">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span className="pr-4 leading-normal">{decodeURIComponent(success)}</span>
                <button onClick={handleClearParams} className="absolute right-2 top-2 text-emerald-400/50 hover:text-emerald-400 transition-colors">
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
                  <label className="block text-xs font-semibold text-slate-400">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full bg-[#101216] border border-[#21262e] rounded-lg px-4 py-3 text-slate-100 placeholder-slate-650 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 text-sm"
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
                      className="w-full bg-[#101216] border border-[#21262e] rounded-lg pl-4 pr-11 py-3 text-slate-100 placeholder-slate-650 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-white transition-colors p-1 rounded-md outline-none"
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
                  className="w-full bg-[#3051c5] hover:bg-[#3d63e2] text-white py-3 rounded-lg text-sm font-semibold transition cursor-pointer"
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
                    <label className="block text-xs font-semibold text-slate-400">
                      Full Name
                    </label>
                    <input
                      name="fullName"
                      type="text"
                      required
                      placeholder="Juan Dela Cruz"
                      className="w-full bg-[#101216] border border-[#21262e] rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 outline-none transition focus:border-blue-500 text-sm"
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
                      className="w-full bg-[#101216] border border-[#21262e] rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 outline-none transition focus:border-blue-500 text-sm"
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
                    className="w-full bg-[#101216] border border-[#21262e] rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-650 outline-none transition focus:border-blue-500 text-sm"
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
                      className="w-full bg-[#101216] border border-[#21262e] rounded-lg pl-4 pr-11 py-2.5 text-slate-100 placeholder-slate-600 outline-none transition focus:border-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-white transition-colors p-1 rounded-md outline-none"
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
                  className="w-full bg-[#3051c5] hover:bg-[#3d63e2] text-white py-3 rounded-lg text-sm font-semibold transition cursor-pointer"
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
              <span className="text-xs text-slate-400">
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
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#090b0f]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}
