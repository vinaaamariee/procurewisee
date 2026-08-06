"use client";

import React, { useState, useTransition } from "react";
import { registerEndUser } from "@/app/actions/auth";
import {
  Eye, EyeOff, Mail, Lock, User, Building2, CheckCircle2,
} from "lucide-react";
import LoginAlert from "./LoginAlert";
import AuthBranding from "./AuthBranding";

interface RegisterFormProps {
  errorParam: string | null;
  successParam: string | null;
  onClearParams: () => void;
  onToggleTab?: (tab: "login" | "register") => void;
}

export default function RegisterForm({
  errorParam,
  successParam,
  onClearParams,
  onToggleTab,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await registerEndUser(formData);
    });
  };

  return (
    <div className="w-full flex flex-col gap-4 my-auto">
      {/* Branding */}
      <AuthBranding />

      {/* Heading */}
      <div className="space-y-1 text-center">
        <h2 className="text-[28px] font-extrabold tracking-tight text-base-content">
          Create Account
        </h2>
        <p className="text-sm text-base-content/60 leading-relaxed">
          Register your institutional account to access the{" "}
          <span className="text-base-content/80 font-semibold">
            Procurement Management Information System.
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

      {/* Form */}
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">

        {/* Full Name */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend text-[11px] font-bold uppercase tracking-wider text-base-content/70">
            Full Name <span className="text-error normal-case tracking-normal">*</span>
          </legend>
          <div className="relative">
            <input
              name="fullName"
              type="text"
              required
              placeholder="Juan Dela Cruz"
              aria-label="Full Name"
              className="w-full h-14 pl-10 rounded-xl border border-base-300 bg-base-100 text-sm font-medium text-base-content placeholder:text-base-content/40 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
              disabled={isPending}
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
          </div>
        </fieldset>

        {/* Institutional Email */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend text-[11px] font-bold uppercase tracking-wider text-base-content/70">
            Institutional Email <span className="text-error normal-case tracking-normal">*</span>
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

        {/* Department */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend text-[11px] font-bold uppercase tracking-wider text-base-content/70">
            Department / Office <span className="text-error normal-case tracking-normal">*</span>
          </legend>
          <div className="relative">
            <input
              name="department"
              type="text"
              required
              placeholder="E.g., ICT Department, General Services"
              aria-label="Department"
              className="w-full h-14 pl-10 rounded-xl border border-base-300 bg-base-100 text-sm font-medium text-base-content placeholder:text-base-content/40 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
              disabled={isPending}
            />
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
          </div>
        </fieldset>

        {/* Password + Confirm Password (2-col) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Password */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-[11px] font-bold uppercase tracking-wider text-base-content/70">
              Password <span className="text-error normal-case tracking-normal">*</span>
            </legend>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-[11px] font-bold uppercase tracking-wider text-base-content/70">
              Confirm Password <span className="text-error normal-case tracking-normal">*</span>
            </legend>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="••••••••"
                aria-label="Confirm Password"
                className="w-full h-14 pl-10 pr-10 rounded-xl border border-base-300 bg-base-100 text-sm font-medium text-base-content placeholder:text-base-content/40 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
                disabled={isPending}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content focus:outline-none transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </fieldset>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-base-content/60 leading-tight">
            By creating an account, you confirm that you are an authorized requisitioner representing your department or office unit.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full h-14 mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-white text-sm font-semibold transition-colors hover:bg-[#651517] disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <span className="loading loading-spinner loading-xs" />
              Creating Account...
            </>
          ) : (
            "Create Account →"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-base-300" />
        <span className="text-xs text-base-content/40 font-medium">OR</span>
        <span className="h-px flex-1 bg-base-300" />
      </div>

      {/* Sign in link */}
      <p className="text-center text-xs text-base-content/60 font-semibold">
        Already registered?{" "}
        <button
          type="button"
          onClick={() => onToggleTab?.("login")}
          className="font-bold text-primary hover:text-primary-focus hover:underline bg-transparent border-none p-0 cursor-pointer"
        >
          Sign In
        </button>
      </p>
    </div>
  );
}