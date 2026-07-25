"use client";

import React, { useState, useTransition, Suspense } from 'react';
import Image from "next/image";
import { useSearchParams, useRouter } from 'next/navigation';
import { login } from '../actions/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { Eye, EyeOff, ArrowRight, ShieldAlert, Mail, Lock, ShieldCheck } from 'lucide-react';

function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const error = searchParams.get('error');
  const success = searchParams.get('success');

  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClearParams = () => {
    router.replace('/login');
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>, action: (formData: FormData) => Promise<unknown>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(formData);
    });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row bg-[#F2F3EF] dark:bg-[#0E1420] text-[#1C2230] dark:text-[#EEF1F6] antialiased">
      {/* Top Border Accent (Government Masthead) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0B2D5C] via-[#A6761D] to-[#B7202E] z-50" />

      {/* Left Panel: Institutional Identity */}
      <div className="relative w-full md:w-1/2 bg-[#0B2D5C] dark:bg-[#081e3e] flex flex-col justify-between p-8 md:p-16 overflow-hidden">
        {/* Subtle Watermark */}
        <div className="absolute -right-16 -bottom-16 text-[260px] md:text-[340px] font-extrabold leading-none text-white/[0.03] select-none pointer-events-none font-display">
          PW
        </div>

        {/* Top Info / Logo */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white border border-white/20 rounded-2xl w-14 h-14 flex items-center justify-center font-display font-black text-2xl shadow-md shrink-0">
            <span className="text-[#0B2D5C]">P</span>
            <span className="text-[#A6761D]">W</span>
          </div>
          <div>
            <h1 className="font-display text-white text-3xl font-extrabold tracking-tight">ProcureWise</h1>
            <p className="text-[#C99A2E] text-xs font-bold uppercase tracking-widest mt-0.5">Procurement Management System</p>
            <p className="text-white/60 text-[10px] font-semibold tracking-wider">Batanes State College</p>
          </div>
        </div>

        {/* Center Content / Tagline */}
        <div className="relative z-10 my-auto py-12 md:py-0 max-w-lg">
          <h2 className="text-white font-display text-2xl md:text-3xl font-bold leading-tight mb-4">
            Smart Procurement Analytics & Decision Support
          </h2>
          <p className="text-white/70 text-sm md:text-base leading-relaxed">
            ProcureWise streamlines procurement workflows, from Purchase Requests (PR) and PPMP planning to canvassing, ARIMA-powered price forecasting, and MCDM best-value supplier recommendations.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/40 text-[11px] font-bold tracking-wider uppercase">
          © 2026 Batanes State College
        </div>
      </div>

      {/* Right Panel: Sign-In Form */}
      <div className="relative w-full md:w-1/2 flex items-center justify-center p-6 md:p-16">
        {/* Theme Toggle Button */}
        <div className="absolute top-8 right-8 z-20">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md flex flex-col justify-between min-h-[calc(100vh-8rem)]">
          <div className="my-auto py-8">
            {/* Form Header */}
            <div className="mb-8">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#A6761D] dark:text-[#C99A2E]">
                Sign In
              </span>
              <h2 className="font-display text-3xl font-bold mt-1 text-[#1C2230] dark:text-[#EEF1F6]">
                Welcome back
              </h2>
              <p className="text-sm text-[#4B5567] dark:text-[#A8B0C0] mt-2">
                Access the Batanes State College Procurement Portal
              </p>
            </div>

            {/* Error and Success Alerts */}
            {error && (
              <div className="relative flex items-start gap-3 rounded-2xl border border-red-200 dark:border-red-950/40 bg-red-50/50 dark:bg-red-950/20 p-4 mb-6 text-xs text-red-600 dark:text-red-400">
                <ShieldAlert className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <span className="pr-6 leading-relaxed font-semibold">{error}</span>
                <button onClick={handleClearParams} className="absolute right-4 top-4 text-red-400 hover:text-red-700 dark:hover:text-red-200 transition-colors cursor-pointer">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            )}

            {success && (
              <div className="relative flex items-start gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-950/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 mb-6 text-xs text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                <span className="pr-6 leading-relaxed font-semibold">{success}</span>
                <button onClick={handleClearParams} className="absolute right-4 top-4 text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200 transition-colors cursor-pointer">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Login Card */}
            <div className="bg-white dark:bg-[#161D2C] border border-[#D4D7DE] dark:border-[#2A3345] rounded-3xl p-6 md:p-8 shadow-[0_2px_12px_rgba(16,24,40,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <form onSubmit={(e) => handleFormSubmit(e, login)} className="space-y-5">
                <input type="hidden" name="next" value={searchParams.get("next") || ""} />
                
                {/* Email Address */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1C2230] dark:text-[#EEF1F6] uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="name@bsc.edu.ph"
                      className="w-full bg-[#F2F3EF] dark:bg-[#0E1420] border border-[#D4D7DE] dark:border-[#2A3345] rounded-xl px-4 py-3 pl-11 text-sm text-[#1C2230] dark:text-[#EEF1F6] outline-none placeholder:text-[#7C879A] dark:placeholder:text-[#6B7488] focus:border-[#0B2D5C] dark:focus:border-[#6C93CC] focus:ring-2 focus:ring-[#0B2D5C]/10 dark:focus:ring-[#6C93CC]/10 transition-all"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7C879A] dark:text-[#6B7488]" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1C2230] dark:text-[#EEF1F6] uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full bg-[#F2F3EF] dark:bg-[#0E1420] border border-[#D4D7DE] dark:border-[#2A3345] rounded-xl px-4 py-3 pl-11 pr-11 text-sm text-[#1C2230] dark:text-[#EEF1F6] outline-none placeholder:text-[#7C879A] dark:placeholder:text-[#6B7488] focus:border-[#0B2D5C] dark:focus:border-[#6C93CC] focus:ring-2 focus:ring-[#0B2D5C]/10 dark:focus:ring-[#6C93CC]/10 transition-all"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7C879A] dark:text-[#6B7488]" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-[#1C2230] dark:hover:text-[#EEF1F6] text-[#7C879A] dark:text-[#6B7488] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert("Please contact the Admin Support to reset your password."); }}
                    className="text-xs font-semibold text-[#4B5567] dark:text-[#A8B0C0] hover:text-[#0B2D5C] dark:hover:text-[#6C93CC] hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#0B2D5C] hover:bg-[#1E4A85] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-xl py-3 px-4 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isPending ? "Signing In..." : "Sign In to ProcureWise"}
                  {!isPending && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </div>

          {/* Right Panel Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] text-[#7C879A] dark:text-[#6B7488] pt-6 border-t border-[#D4D7DE] dark:border-[#2A3345] font-bold uppercase tracking-widest gap-4">
            <div className="md:hidden">
              © 2026 Batanes State College
            </div>
            <div className="flex items-center gap-6">
              <a
                onClick={() => alert("Please contact the BSC Procurement Unit Helpdesk or System Admin to request support.")}
                className="hover:text-[#1C2230] dark:hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Contact Admin Support
              </a>
              <div className="relative group cursor-pointer flex items-center gap-1 hover:text-[#1C2230] dark:hover:text-white transition-colors duration-200">
                <span>English</span>
                <svg className="w-3 h-3 text-[#7C879A]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
      <div className="flex min-h-screen items-center justify-center bg-[#F2F3EF] dark:bg-[#0E1420]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B2D5C] border-t-transparent" />
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}