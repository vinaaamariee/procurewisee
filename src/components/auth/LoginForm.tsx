"use client";

import React, { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import LoginAlert from "./LoginAlert";
import AuthBranding from "./AuthBranding";

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
    <div className="w-full flex flex-col gap-5 my-auto">
      {/* Branding */}
      <AuthBranding />

      {/* Heading */}
      <div className="space-y-1.5 text-center">
        <h2 className="text-[28px] font-extrabold tracking-tight text-base-content">
          Sign In
        </h2>
        <p className="text-sm text-base-content/60 leading-relaxed">
          Welcome back.{" "}
          <span className="text-base-content/80 font-semibold">
            Sign in using your institutional account.
          </span>
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
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={searchParams.get("next") || ""} />

        {/* Email */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend text-[11px] font-bold uppercase tracking-wider text-base-content/70">
            Institutional Email
          </legend>
          <div className="relative">
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="username@bsc.edu.ph"
              aria-label="Institutional Email"
              className="w-full h-14 pl-10 rounded-xl border border-base-300 bg-base-100 text-sm font-medium text-base-content placeholder:text-base-content/40 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
              disabled={isPending}
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
          </div>
        </fieldset>

        {/* Password */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend text-[11px] font-bold uppercase tracking-wider text-base-content/70">
            Password
          </legend>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              aria-label="Password"
              className="w-full h-14 pl-10 pr-10 rounded-xl border border-base-300 bg-base-100 text-sm font-medium text-base-content placeholder:text-base-content/40 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
              disabled={isPending}
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content focus:outline-none transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </fieldset>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="checkbox checkbox-xs checkbox-primary rounded-sm"
            />
            <span className="text-xs text-base-content/60 font-semibold">
              Remember Me
            </span>
          </label>

          <button
            type="button"
            onClick={handleForgotPasswordClick}
            className="text-xs font-bold text-primary hover:text-primary-focus hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full h-14 mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-white text-sm font-semibold transition-colors hover:bg-[#7B1E1E] disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <span className="loading loading-spinner loading-xs" />
              Signing In...
            </>
          ) : (
            "Sign In →"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-base-300" />
        <span className="text-xs text-base-content/40 font-medium">OR</span>
        <span className="h-px flex-1 bg-base-300" />
      </div>

      {/* Register link */}
        <p className="text-center text-xs text-base-content/60 font-semibold">
          Need an account?{" "}
          <button
            type="button"
            onClick={() => onToggleTab?.("register")}
            className="font-bold text-primary hover:text-primary-focus hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            Create Account
          </button>
        </p>
    </div>
  );
}