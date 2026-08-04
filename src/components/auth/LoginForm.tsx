"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth";
import { Eye, EyeOff, ArrowRight, Mail, Lock, ArrowLeft } from "lucide-react";
import LoginAlert from "./LoginAlert";
import AuthHeader from "./AuthHeader";

interface LoginFormProps {
  errorParam: string | null;
  successParam: string | null;
  onClearParams: () => void;
  onToggleTab?: (tab: "login" | "register") => void;
}

export default function LoginForm({
  errorParam,
  successParam,
  onClearParams,
  onToggleTab,
}: LoginFormProps) {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isPending, startTransition] = useTransition();
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
      "To reset your password, contact the BSC ICT Office or Procurement Unit Helpdesk.\n\nEmail: procurement@bsc.edu.ph | Phone: (078) 533-3000"
    );
  };

  return (
    <div className="w-full flex flex-col justify-center h-full p-6 sm:p-10 md:p-[56px] space-y-6">
      {/* Back to Home Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#7B1E1E] transition-colors group w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Home</span>
      </Link>

      {/* BSC Logo Banner & Gold Separator */}
      <AuthHeader />

      {/* Title & Subtitle */}
      <div className="space-y-2 text-left">
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
          Sign In
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          Sign in using your institutional account to access ProcureWise.
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
        <LoginAlert
          type="success"
          message={forgotPasswordMsg}
          onClose={() => setForgotPasswordMsg(null)}
        />
      )}

      {/* Login Inputs Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <input type="hidden" name="next" value={searchParams.get("next") || ""} />

        {/* Institutional Email */}
        <div className="space-y-1.5 text-left">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
            Institutional Email
          </label>
          <div className="relative">
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="username@bsc.edu.ph"
              aria-label="Institutional Email"
              className="w-full input pl-9 text-sm rounded-md bg-white border-[#E5E7EB] text-[#1E293B] focus:border-[#7B1E1E]"
              disabled={isPending}
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5 text-left">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
            Password
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              aria-label="Password"
              className="w-full input pl-9 pr-9 text-sm rounded-md bg-white border-[#E5E7EB] text-[#1E293B] focus:border-[#7B1E1E]"
              disabled={isPending}
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me / Forgot Password option row */}
        <div className="flex items-center justify-between">
          <label className="label cursor-pointer flex items-center gap-1.5 p-0">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="checkbox checkbox-xs rounded-sm border-slate-300 [--chkbg:#7B1E1E] [--chkfg:white] checked:border-[#7B1E1E]"
            />
            <span className="label-text text-xs text-slate-600 dark:text-slate-300 font-semibold select-none">
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

        {/* Primary Action Button (Sign In →) */}
        <button
          type="submit"
          className="w-full h-[52px] min-h-[52px] rounded-md text-white font-bold bg-[#7B1E1E] hover:bg-[#651517] border-none flex items-center justify-center gap-1.5 transition-colors shadow-none"
          disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="loading loading-spinner loading-xs text-white"></span>
              Signing In...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1">
              Sign In →
            </span>
          )}
        </button>
      </form>

      {/* Switch trigger account creation */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-500 font-semibold">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => onToggleTab?.("register")}
            className="text-[#7B1E1E] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}
