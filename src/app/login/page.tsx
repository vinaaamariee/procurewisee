"use client";

import React, { useState, useTransition, Suspense } from 'react';
import Image from "next/image";
import { useSearchParams, useRouter } from 'next/navigation';
import { login } from '../actions/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

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
        /* --- ProcureWise login — official Batanes Maroon & Gold theme --- */
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
            background: linear-gradient(90deg, #7B1E1E 0 34%, #D4A017 34% 67%, #B7202E 67% 100%);
            z-index: 20;
        }

        /* --- Left Panel (institutional identity) --- */
        .left-panel {
            width: 50%;
            background: linear-gradient(135deg, #74171B 0%, #4B0B0E 100%);
            position: relative;
            padding: 48px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            border-right: 1px solid rgba(255, 255, 255, 0.08);
        }

        .left-panel-watermark {
            position: absolute;
            right: -40px;
            bottom: -60px;
            font-family: var(--font-display);
            font-weight: 800;
            font-size: 340px;
            line-height: 1;
            color: rgba(255, 255, 255, 0.03);
            pointer-events: none;
            user-select: none;
            z-index: 0;
        }

        .logo-container { display: flex; align-items: center; gap: 16px; position: relative; z-index: 1; }

        .tagline {
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
            line-height: 1.6;
            max-width: 460px;
            margin-top: 24px;
            position: relative;
            z-index: 1;
        }

        .left-panel-footer {
            color: rgba(255, 255, 255, 0.4);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.8px;
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
            padding: 48px;
        }

        .right-panel-inner {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: calc(100vh - 96px);
            width: 100%;
            max-width: 440px;
        }
        @media (max-width: 900px) {
            .right-panel-inner { min-height: auto; }
        }

        .login-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 40px;
            width: 100%;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
            margin: auto 0;
            transition: var(--transition);
        }

        .card-header h2 {
            font-size: 12px;
            color: #D4A017;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 8px;
        }

        .card-header h1 {
            font-family: var(--font-display);
            font-size: 28px;
            color: var(--text-primary);
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }

        .card-header p {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 28px;
        }

        .form-group { margin-bottom: 20px; position: relative; }

        .form-group label {
            display: block;
            font-size: 12px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .input-wrapper { position: relative; }

        .form-group input {
            width: 100%;
            padding: 14px 44px 14px 16px;
            border: 1px solid var(--border);
            border-radius: 12px;
            font-size: 14px;
            background-color: var(--surface);
            color: var(--text-primary);
            outline: none;
            font-family: inherit;
            transition: all 0.2s ease;
        }

        .form-group input::placeholder { color: var(--text-muted); }

        .form-group input:focus {
            border-color: #7B1E1E;
            box-shadow: 0 0 0 4px rgba(123, 30, 30, 0.08);
            background-color: var(--surface);
        }

        .input-icon {
            position: absolute;
            right: 16px;
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
            margin-top: -8px;
            margin-bottom: 24px;
            font-weight: 600;
        }
        .forgot-password:hover { color: #7B1E1E; text-decoration: underline; }

        .btn-submit {
            width: 100%;
            padding: 14px;
            border: 1px solid #7B1E1E;
            border-radius: 12px;
            background: #7B1E1E;
            color: #ffffff;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.2px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .btn-submit:hover { background: #5E1414; border-color: #5E1414; transform: translateY(-1px); }
        .btn-submit:active { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* Dark Mode overrides inside CSS block */
        .dark .login-card {
            background-color: #161D2C;
            border-color: #2A3345;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
        }
        .dark .form-group input {
            background-color: #0E1420;
            border-color: #2A3345;
            color: #EEF1F6;
        }
        .dark .form-group input:focus {
            border-color: #D4A017;
            box-shadow: 0 0 0 4px rgba(212, 160, 23, 0.15);
        }
        .dark .forgot-password:hover { color: #D4A017; }
        .dark .btn-submit {
            background: #7B1E1E;
            border-color: #7B1E1E;
        }
        .dark .btn-submit:hover {
            background: #952929;
            border-color: #952929;
        }

        /* Responsive */
        @media (max-width: 900px) {
            .login-container-wrapper { flex-direction: column; }
            .left-panel {
                width: 100%;
                min-height: 35vh;
                padding: 32px 24px;
            }
            .left-panel-watermark { font-size: 180px; right: -20px; bottom: -40px; }
            .right-panel { width: 100%; padding: 32px 20px; }
            .login-card { padding: 32px 24px; border-radius: 20px; }
        }
      `}} />

      {/* Left Panel */}
      <div className="left-panel">
        <div className="left-panel-watermark" aria-hidden="true">PW</div>

        <div>
          <div className="logo-container">
            <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '10px', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px', flexShrink: 0, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <span style={{ color: '#7B1E1E' }}>P</span><span style={{ color: '#D4A017' }}>W</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', color: '#ffffff', fontSize: '28px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.5px' }}>ProcureWise</div>
              <div style={{ color: '#D4A017', fontSize: '11px', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', marginTop: '4px' }}>Procurement Management System</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', marginTop: '2px' }}>Batanes State College</div>
            </div>
          </div>

          <p className="tagline">
            ProcureWise supports procurement planning, bidding, supplier evaluation, and purchase order management for the College&rsquo;s Bids and Awards Committee and end-user offices.
          </p>
        </div>

        <div className="left-panel-footer">© 2026 Batanes State College</div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="absolute top-10 right-10 z-10">
          <ThemeToggle />
        </div>

        <div className="right-panel-inner">
          <div className="login-card">
            <div className="card-header">
              <h2>Sign In</h2>
              <h1>Sign in to your account</h1>
              <p>Use your ProcureWise credentials to continue.</p>
            </div>

            <p>
              Sign in using your official College account to access the
              Procurement Management Information System.
            </p>


            {/* Error and Success Alerts */}
            {error && (
              <div className="relative flex items-start gap-3 rounded-md border border-red-200 dark:border-red-950/40 bg-red-50/50 dark:bg-red-950/20 p-4 mb-5 text-xs text-red-600 dark:text-red-400">
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
              <div className="relative flex items-start gap-3 rounded-md border border-emerald-200 dark:border-emerald-950/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 mb-5 text-xs text-emerald-600 dark:text-emerald-400">
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

            {/* Form */}
            <form onSubmit={(e) => handleFormSubmit(e, login)}>
              <input type="hidden" name="next" value={searchParams.get("next") || ""} />
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Email or Username"
                  />
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <circle cx="9" cy="10" r="3"></circle>
                    <path d="M15 10h2"></path>
                    <path d="M15 14h2"></path>
                    <path d="M4 18c2.67-1.33 5.33-2 8-2s5.33.67 8 2"></path>
                  </svg>
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                  />
                  {showPassword ? (
                    <EyeOff className="input-icon" onClick={() => setShowPassword(!showPassword)} />
                  ) : (
                    <Eye className="input-icon" onClick={() => setShowPassword(!showPassword)} />
                  )}
                </div>
              </div>

              <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); alert("Please contact the Admin Support to reset your password."); }}>
                Forgot Password?
              </a>

              <button type="submit" className="btn-submit" disabled={isPending} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {isPending ? "Signing In..." : "Sign In to ProcureWise"}
                {!isPending && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>

          {/* Right Footer Layout */}
          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-6 mt-8 border-t border-slate-200 dark:border-slate-800/60 font-semibold uppercase tracking-wider z-10">
            <div className="lg:hidden">
              © 2026 Batanes State College
            </div>

            <div className="flex items-center justify-between w-full lg:justify-end gap-5">
              <a
                onClick={() => alert("Please contact the BSC Procurement Unit Helpdesk or System Admin to request support.")}
                className="hover:text-slate-800 dark:hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Contact Admin Support
              </a>

              <div className="relative group cursor-pointer flex items-center gap-1 hover:text-slate-800 dark:hover:text-white transition-colors duration-200">
                <span>English</span>
                <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-deep)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}