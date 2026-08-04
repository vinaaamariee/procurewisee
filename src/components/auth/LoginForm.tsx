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
    <div className="w-full flex flex-col justify-center h-full space-y-4">
      {/* Logo + Identity Block */}
      <AuthHeader />

      {/* Sign In heading */}
      <div className="space-y-1 text-left">
        <h2
          style={{ fontSize: "48px", fontWeight: 800 }}
          className="tracking-tight text-[#1F2937] leading-none"
        >
          Sign In
        </h2>
        <p className="text-[13px] text-[#6B7280] leading-relaxed font-medium">
          Welcome back.{" "}
          <span className="text-[#1F2937] font-semibold">
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
      <form onSubmit={handleFormSubmit} className="space-y-3">
        <input type="hidden" name="next" value={searchParams.get("next") || ""} />

        {/* Email */}
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
              className="w-full px-4 pl-11 text-sm text-[#1E293B] outline-none transition-all"
              style={{
                height: "58px",
                borderRadius: "10px",
                border: "1px solid #d7dce3",
                background: "white",
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid #7B1E1E";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(123,30,30,.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid #d7dce3";
                e.currentTarget.style.boxShadow = "none";
              }}
              disabled={isPending}
            />
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          </div>
        </div>

        {/* Password */}
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
              className="w-full px-4 pl-11 pr-12 text-sm text-[#1E293B] outline-none transition-all"
              style={{
                height: "58px",
                borderRadius: "10px",
                border: "1px solid #d7dce3",
                background: "white",
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid #7B1E1E";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(123,30,30,.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid #d7dce3";
                e.currentTarget.style.boxShadow = "none";
              }}
              disabled={isPending}
            />
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me + Forgot password */}
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

        {/* Login Button */}
        <button
          type="submit"
          className="w-full text-white font-bold border-none flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm cursor-pointer"
          style={{
            height: "58px",
            borderRadius: "10px",
            background: "#7B1E1E",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#651517";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = isPending
              ? "#651517"
              : "#7B1E1E";
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(1px)";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
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

      {/* OR divider */}
      <div className="flex items-center justify-center gap-4 py-1">
        <span className="h-[1px] flex-1 bg-[#D6DCE5]" />
        <span className="text-xs text-[#6B7280] font-medium px-2">OR</span>
        <span className="h-[1px] flex-1 bg-[#D6DCE5]" />
      </div>

      {/* Register link */}
      <div className="text-center">
        <p className="text-xs text-[#6B7280] font-semibold">
          Need an account?{" "}
          <button
            type="button"
            onClick={() => onToggleTab?.("register")}
            className="text-[#7B1E1E] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            Create End User Account
          </button>
        </p>
      </div>
    </div>
  );
}