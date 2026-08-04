"use client";

import React, { useState, useTransition } from "react";
import { registerEndUser } from "@/app/actions/auth";
import { Eye, EyeOff, Mail, Lock, User, Building2, ArrowLeft, CheckCircle2 } from "lucide-react";
import LoginAlert from "./LoginAlert";
import AuthHeader from "./AuthHeader";

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
    <div className="w-full flex flex-col justify-center h-full p-6 sm:p-10 md:p-[56px] space-y-6">
      {/* Back to Login Link */}
      <button
        type="button"
        onClick={() => onToggleTab?.("login")}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#7B1E1E] transition-colors group w-fit bg-transparent border-none p-0 cursor-pointer text-left"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Sign In</span>
      </button>

      {/* College Identity Header */}
      <AuthHeader />

      {/* Title & Desc */}
      <div className="space-y-2 text-left">
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
          Create Account
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          Create an End User account to submit Purchase Requests and access institutional services.
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
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5 text-left">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
            Full Name
          </label>
          <div className="relative">
            <input
              name="fullName"
              type="text"
              required
              placeholder="Juan Dela Cruz"
              aria-label="Full Name"
              className="w-full input pl-9 text-sm rounded-md bg-white border-[#E5E7EB] text-[#1E293B] focus:border-[#7B1E1E]"
              disabled={isPending}
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

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

        {/* Department */}
        <div className="space-y-1.5 text-left">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
            Department
          </label>
          <div className="relative">
            <input
              name="department"
              type="text"
              required
              placeholder="E.g., ICT Department, General Services"
              aria-label="Department"
              className="w-full input pl-9 text-sm rounded-md bg-white border-[#E5E7EB] text-[#1E293B] focus:border-[#7B1E1E]"
              disabled={isPending}
            />
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Password & Confirm Password Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                minLength={6}
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
              Confirm Password
            </label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="••••••••"
                aria-label="Confirm Password"
                className="w-full input pl-9 pr-9 text-sm rounded-md bg-white border-[#E5E7EB] text-[#1E293B] focus:border-[#7B1E1E]"
                disabled={isPending}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 pt-1 text-left">
          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500 font-semibold leading-tight select-none">
            By creating an account, you confirm that you are an authorized requisitioner representing your department.
          </p>
        </div>

        {/* Action Button (Create Account) */}
        <button
          type="submit"
          className="w-full h-[52px] min-h-[52px] rounded-md text-white font-bold bg-[#7B1E1E] hover:bg-[#651517] border-none flex items-center justify-center gap-1.5 transition-colors shadow-none mt-2"
          disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="loading loading-spinner loading-xs text-white"></span>
              Creating Account...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1">
              Create Account
            </span>
          )}
        </button>
      </form>

      {/* Switch trigger back to sign in */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-500 font-semibold">
          Already registered?{" "}
          <button
            type="button"
            onClick={() => onToggleTab?.("login")}
            className="text-[#7B1E1E] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
