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
    <div className="login-container-wrapper min-h-screen relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        /* --- ProcureWise login — official portal theme --- */
        .login-container-wrapper {
            display: flex;
            min-height: 100vh;
            width: 100%;
            background-color: var(--bg-deep);
            font-family: var(--font-body);
        }

        /* Masthead rule, consistent with the app header */
        .login-container-wrapper::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            background: linear-gradient(90deg, #0B2D5C 0 34%, #A6761D 34% 67%, #B7202E 67% 100%);
            z-index: 20;
        }

        /* --- Left Panel (institutional identity) --- */
        .left-panel {
            width: 50%;
            background: #0B2D5C;
            position: relative;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
        }

        .left-panel-watermark {
            position: absolute;
            right: -40px;
            bottom: -60px;
            font-family: var(--font-display);
            font-weight: 800;
            font-size: 340px;
            line-height: 1;
            color: rgba(255, 255, 255, 0.045);
            pointer-events: none;
            user-select: none;
            z-index: 0;
        }

        .logo-container { display: flex; align-items: center; gap: 14px; position: relative; z-index: 1; }

        .tagline {
            color: rgba(255, 255, 255, 0.6);
            font-size: 13.5px;
            line-height: 1.6;
            max-width: 440px;
            margin-top: 20px;
            position: relative;
            z-index: 1;
        }

        .left-panel-footer {
            color: rgba(255, 255, 255, 0.45);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            position: relative;
            z-index: 1;
        }

        /* --- Right Panel (sign-in form) --- */
        .right-panel {
            width: 50%;
            background-color: var(--bg-deep);
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px;
        }

        .right-panel-inner {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: calc(100vh - 80px);
            width: 100%;
            max-width: 440px;
        }
        @media (max-width: 900px) {
            .right-panel-inner { min-height: auto; }
        }

        .login-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 40px;
            width: 100%;
            box-shadow: var(--shadow-card);
            margin: auto 0;
        }

        .card-header h2 {
            font-size: 12px;
            color: var(--secondary);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            margin-bottom: 10px;
        }

        .card-header h1 {
            font-family: var(--font-display);
            font-size: 26px;
            color: var(--text-primary);
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: 0;
        }

        .card-header p {
            font-size: 13.5px;
            color: var(--text-secondary);
            margin-bottom: 26px;
        }

        .form-group { margin-bottom: 18px; position: relative; }

        .form-group label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 8px;
        }

        .input-wrapper { position: relative; }

        .form-group input {
            width: 100%;
            padding: 13px 44px 13px 14px;
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            font-size: 14.5px;
            background-color: var(--surface);
            color: var(--text-primary);
            outline: none;
            font-family: inherit;
            transition: var(--transition);
        }

        .form-group input::placeholder { color: var(--text-muted); }

        .form-group input:focus {
            border-color: var(--accent);
            box-shadow: 0 0 0 2px var(--accent-glass);
        }

        .input-icon {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            width: 18px;
            height: 18px;
            cursor: pointer;
            transition: color 0.2s ease;
        }
        .input-icon:hover { color: var(--text-primary); }

        .forgot-password {
            display: block;
            text-align: right;
            font-size: 13px;
            color: var(--text-secondary);
            text-decoration: none;
            margin-top: -6px;
            margin-bottom: 22px;
        }
        .forgot-password:hover { color: var(--accent); text-decoration: underline; }

        .btn-submit {
            width: 100%;
            padding: 13px;
            border: 1px solid var(--accent);
            border-radius: var(--radius-sm);
            background: var(--accent);
            color: #ffffff;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.2px;
            cursor: pointer;
            transition: var(--transition);
        }
        .btn-submit:hover { background: var(--accent-light); border-color: var(--accent-light); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Responsive */
        @media (max-width: 900px) {
            .login-container-wrapper { flex-direction: column; }
            .left-panel {
                width: 100%;
                min-height: 30vh;
                padding: 28px;
            }
            .left-panel-watermark { font-size: 180px; right: -20px; bottom: -40px; }
            .right-panel { width: 100%; padding: 28px 20px; }
            .login-card { padding: 28px 22px; }
        }
      `}} />

      {/* Left Panel */}
      <div className="left-panel">
        <div className="left-panel-watermark" aria-hidden="true">PW</div>

        <div>
          <div className="logo-container">
            <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '6px', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', flexShrink: 0 }}>
              <span style={{ color: '#0B2D5C' }}>P</span><span style={{ color: '#A6761D' }}>W</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', color: '#ffffff', fontSize: '28px', fontWeight: 700, lineHeight: 1.15, letterSpacing: 0 }}>ProcureWise</div>
              <div style={{ color: '#C99A2E', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginTop: '5px' }}>Procurement Management System</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', marginTop: '3px' }}>Batanes State College</div>
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