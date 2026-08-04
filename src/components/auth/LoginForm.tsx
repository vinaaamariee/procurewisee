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
    <div className="w-full max-w-sm mx-auto flex flex-col justify-center h-full p-4 sm:p-6 space-y-6">
      {/* Back to Home Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-base-content/40 hover:text-primary transition-colors group w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Home</span>
      </Link>

      {/* College Identity Header */}
      <AuthHeader />

      {/* Title & Desc */}
      <div className="space-y-1 text-left border-t border-base-300 pt-4">
        <h2 className="text-xl font-bold tracking-tight text-primary">
          Sign In
        </h2>
        <p className="text-xs text-base-content/60 leading-relaxed font-medium">
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
        <LoginAlert
          type="success"
          message={forgotPasswordMsg}
          onClose={() => setForgotPasswordMsg(null)}
        />
      )}

      {/* Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <input type="hidden" name="next" value={searchParams.get("next") || ""} />

        {/* Institutional Email */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold text-base-content/75 block">
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
              className="w-full input pl-9 text-sm rounded-md"
              disabled={isPending}
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold text-base-content/75 block">
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
              className="w-full input pl-9 pr-9 text-sm rounded-md"
              disabled={isPending}
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
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
          <label className="label cursor-pointer flex items-center gap-1.5 p-0">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="checkbox checkbox-primary checkbox-xs"
            />
            <span className="label-text text-xs text-base-content/70 font-semibold select-none">
              Remember Me
            </span>
          </label>

          <button
            type="button"
            onClick={handleForgotPasswordClick}
            className="text-xs text-primary font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="btn btn-primary w-full rounded-md text-white font-bold"
          disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="loading loading-spinner loading-xs"></span>
              Signing In...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              Sign In
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </form>

      {/* Need an account? (Switch trigger for Mobile view or sliding click) */}
      <div className="text-center pt-2">
        <p className="text-xs text-base-content/60 font-semibold">
          Need an account?{" "}
          <button
            type="button"
            onClick={() => onToggleTab?.("register")}
            className="text-primary font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}
