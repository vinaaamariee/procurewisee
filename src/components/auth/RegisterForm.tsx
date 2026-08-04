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
    <div className="w-full flex flex-col justify-center h-full space-y-6">
      <AuthHeader />

      <div className="space-y-2 text-left">
        <h2 className="text-[40px] font-[700] tracking-tight text-[#1F2937]">
          Create Account
        </h2>
        <p className="text-[14px] text-[#6B7280] leading-relaxed font-medium">
          Create an institutional account to access the Procurement Management Information System.
        </p>
      </div>

      {errorParam && (
        <LoginAlert type="error" message={errorParam} onClose={onClearParams} />
      )}
      {successParam && (
        <LoginAlert type="success" message={successParam} onClose={onClearParams} />
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="space-y-1.5 text-left">
          <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
            Full Name
          </label>
          <div className="relative">
            <input
              name="fullName"
              type="text"
              required
              placeholder="Juan Dela Cruz"
              aria-label="Full Name"
              className="w-full h-[56px] px-4 pl-10 text-sm rounded-lg bg-white border border-[#D6DCE5] text-[#1E293B] focus:border-[#7B1E1E] focus:ring-2 focus:ring-[#7B1E1E]/20 transition-colors outline-none"
              disabled={isPending}
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          </div>
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
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
              className="w-full h-[56px] px-4 pl-10 text-sm rounded-lg bg-white border border-[#D6DCE5] text-[#1E293B] focus:border-[#7B1E1E] focus:ring-2 focus:ring-[#7B1E1E]/20 transition-colors outline-none"
              disabled={isPending}
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          </div>
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
            Department
          </label>
          <div className="relative">
            <input
              name="department"
              type="text"
              required
              placeholder="E.g., ICT Department, General Services"
              aria-label="Department"
              className="w-full h-[56px] px-4 pl-10 text-sm rounded-lg bg-white border border-[#D6DCE5] text-[#1E293B] focus:border-[#7B1E1E] focus:ring-2 focus:ring-[#7B1E1E]/20 transition-colors outline-none"
              disabled={isPending}
            />
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
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
                className="w-full h-[56px] px-4 pl-10 pr-10 text-sm rounded-lg bg-white border border-[#D6DCE5] text-[#1E293B] focus:border-[#7B1E1E] focus:ring-2 focus:ring-[#7B1E1E]/20 transition-colors outline-none"
                disabled={isPending}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
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
                className="w-full h-[56px] px-4 pl-10 pr-10 text-sm rounded-lg bg-white border border-[#D6DCE5] text-[#1E293B] focus:border-[#7B1E1E] focus:ring-2 focus:ring-[#7B1E1E]/20 transition-colors outline-none"
                disabled={isPending}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 pt-1 text-left">
          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#6B7280] font-semibold leading-tight select-none">
            By creating an account, you confirm that you are an authorized requisitioner representing your department.
          </p>
        </div>

        <button
          type="submit"
          className="w-full h-[56px] min-h-[56px] rounded-lg text-white font-bold bg-[#7B1E1E] hover:bg-[#651517] border-none flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm mt-2"
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

      <div className="border-t border-[#D6DCE5] my-2">
        <div className="flex items-center justify-center gap-4 -mt-2">
          <span className="h-[1px] flex-1 bg-[#D6DCE5]"></span>
          <span className="text-xs text-[#6B7280] font-medium px-2">OR</span>
          <span className="h-[1px] flex-1 bg-[#D6DCE5]"></span>
        </div>
      </div>

      <div className="text-center pt-1">
        <p className="text-xs text-[#6B7280] font-semibold">
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