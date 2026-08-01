"use client";

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { login } from '@/app/actions/auth';
import {
  Eye, EyeOff, ArrowRight, Mail, Lock,
  ArrowLeft, GraduationCap,
} from 'lucide-react';
import LoginAlert from './LoginAlert';

interface LoginFormProps {
  errorParam: string | null;
  successParam: string | null;
  onClearParams: () => void;
}

export default function LoginForm({ errorParam, successParam, onClearParams }: LoginFormProps) {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [imgError, setImgError] = useState(false);
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState<string | null>(null);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await login(formData);
    });
  };

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotPasswordMsg(
      "To reset your password, contact the BSC ICT Office or Procurement Unit Helpdesk.\n\nEmail: procurement@bsc.edu.ph  |  Phone: (078) 533-3000"
    );
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200 w-full rounded-2xl overflow-hidden">
      <div className="card-body p-7 sm:p-9 space-y-6">

        {/* ← Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-base-content/50 hover:text-[#7B1E1E] transition-colors group w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Institutional Branding */}
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="relative h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-white border border-base-200 shadow-sm p-1">
            {!imgError ? (
              <Image
                src="/images/bsc-logo.png"
                alt="Batanes State College Logo"
                width={44}
                height={44}
                className="object-contain h-full w-full"
                onError={() => setImgError(true)}
                priority
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-[#7B1E1E] flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-[#A6761D]" />
              </div>
            )}
          </div>

          {/* Name & Badge */}
          <div>
            <span className="badge badge-outline border-[#7B1E1E]/30 text-[#7B1E1E] text-[10px] font-bold tracking-widest uppercase mb-0.5">
              Official Portal
            </span>
            <div className="text-sm font-black text-[#7B1E1E] leading-tight tracking-tight">
              Batanes State College
            </div>
            <div className="text-[11px] font-semibold text-base-content/60 leading-tight">
              Procurement Management Information System
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="space-y-0.5 border-t border-base-200 pt-5">
          <h1 className="text-xl font-extrabold text-[#7B1E1E] tracking-tight">
            Sign In
          </h1>
          <p className="text-xs text-base-content/65 leading-relaxed">
            Welcome back. Sign in using your institutional account to access the Procurement Management Information System.
          </p>
        </div>

        {/* Alerts */}
        {errorParam && (
          <LoginAlert type="error" message={errorParam} onClose={onClearParams} />
        )}
        {successParam && (
          <LoginAlert type="success" message={successParam} onClose={onClearParams} />
        )}
        {forgotPasswordMsg && (
          <LoginAlert type="success" message={forgotPasswordMsg} onClose={() => setForgotPasswordMsg(null)} />
        )}

        {/* Auth Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <input type="hidden" name="next" value={searchParams.get("next") || ""} />

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-base-content/80 block">
              Email Address
            </label>
            <div className="relative">
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="username@bsc.edu.ph"
                className="input input-bordered w-full pl-10 text-sm font-medium focus:input-primary rounded-xl"
                disabled={isPending}
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/35" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-base-content/80 block">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="input input-bordered w-full pl-10 pr-10 text-sm font-medium focus:input-primary rounded-xl"
                disabled={isPending}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/35" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="label cursor-pointer flex items-center gap-2 p-0">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox checkbox-primary checkbox-xs rounded"
              />
              <span className="label-text text-xs text-base-content/75 font-medium">
                Remember Me
              </span>
            </label>

            <button
              type="button"
              onClick={handleForgotPasswordClick}
              className="text-xs text-[#7B1E1E] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn w-full text-white font-bold bg-[#7B1E1E] hover:bg-[#601717] border-none shadow-sm text-sm rounded-xl"
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-xs"></span>
                Signing In…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign In to ProcureWise
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Need an Account? */}
        <div className="border-t border-base-200 pt-4 space-y-2 text-center">
          <div className="bg-[#A6761D]/10 border border-[#A6761D]/25 rounded-2xl p-3 text-center space-y-1">
            <p className="text-xs font-bold text-[#7B1E1E]">
              Department Requisitioner?
            </p>
            <p className="text-[11px] text-base-content/70 leading-tight">
              Department End Users can register their own account directly.
            </p>
            <Link
              href="/end-user/login?tab=register"
              className="btn btn-xs rounded-xl bg-[#7B1E1E] hover:bg-[#601717] text-white border-none font-extrabold mt-1 inline-flex items-center gap-1"
            >
              Create End User Account →
            </Link>
          </div>

          <p className="text-[11px] text-base-content/50 leading-relaxed pt-1">
            Procurement & Admin accounts are provisioned by the ICT/Procurement Unit.
          </p>
        </div>

      </div>
    </div>
  );
}
