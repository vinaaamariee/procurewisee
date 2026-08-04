"use client";

import React, { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
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
    <div className="w-full flex flex-col justify-center h-full space-y-6">
      <AuthHeader />

      <div className="space-y-2 text-left">
        <h2 className="text-[40px] font-[700] tracking-tight text-[#1F2937]">
          Sign In
        </h2>
        <p className="text-[14px] text-[#6B7280] leading-relaxed font-medium">
          Sign in using your institutional account to access the Procurement Management Information System.
        </p>
      </div>

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

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <input type="hidden" name="next" value={searchParams.get("next") || ""} />

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

        <div className="flex items-center justify-between">
          <label className="label cursor-pointer flex items-center gap-1.5 p-0">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="checkbox checkbox-xs rounded-sm border-[#D6DCE5] [--chkbg:#7B1E1E] [--chkfg:white] checked:border-[#7B1E1E]"
            />
            <span className="label-text text-xs text-[#6B7280] font-semibold select-none">
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

        <button
          type="submit"
          className="w-full h-[56px] min-h-[56px] rounded-lg text-white font-bold bg-[#7B1E1E] hover:bg-[#651517] border-none flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm"
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

      <div className="border-t border-[#D6DCE5] my-2">
        <div className="flex items-center justify-center gap-4 -mt-2">
          <span className="h-[1px] flex-1 bg-[#D6DCE5]"></span>
          <span className="text-xs text-[#6B7280] font-medium px-2">OR</span>
          <span className="h-[1px] flex-1 bg-[#D6DCE5]"></span>
        </div>
      </div>

      <div className="text-center pt-1">
        <p className="text-xs text-[#6B7280] font-semibold">
          Need an account?{" "}
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