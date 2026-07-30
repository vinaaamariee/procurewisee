"use client";

import React, { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { login } from '@/app/actions/auth';
import { Eye, EyeOff, ArrowRight, Mail, Lock, ShieldCheck, UserCheck, FileSpreadsheet, KeyRound } from 'lucide-react';
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
    setForgotPasswordMsg("Please contact the BSC Procurement Unit Helpdesk or IT Administrator to reset your account password.");
  };

  const supportedRoles = [
    { label: "End User", icon: UserCheck, desc: "Departments & Faculty" },
    { label: "Procurement Officer", icon: FileSpreadsheet, desc: "Procurement Staff" },
    { label: "BAC Secretariat", icon: ShieldCheck, desc: "Bids & Awards Committee" },
    { label: "Administrator", icon: KeyRound, desc: "System Superuser" },
  ];

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 w-full max-w-md mx-auto">
      <div className="card-body p-6 sm:p-8 space-y-5">
        {/* Card Header */}
        <div className="space-y-1 text-left">
          <span className="badge badge-primary badge-outline text-[10px] font-bold uppercase tracking-wider">
            Secure Authentication
          </span>
          <h2 className="text-2xl font-extrabold text-[#7B1E1E] tracking-tight">
            Sign In
          </h2>
          <p className="text-xs text-base-content/70 leading-relaxed">
            Enter your official Batanes State College credentials to access the Procurement Portal.
          </p>
        </div>

        {/* Error and Success Alerts */}
        {errorParam && (
          <LoginAlert 
            type="error" 
            message={errorParam} 
            onClose={onClearParams} 
          />
        )}

        {successParam && (
          <LoginAlert 
            type="success" 
            message={successParam} 
            onClose={onClearParams} 
          />
        )}

        {forgotPasswordMsg && (
          <LoginAlert
            type="success"
            message={forgotPasswordMsg}
            onClose={() => setForgotPasswordMsg(null)}
          />
        )}

        {/* Login Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <input type="hidden" name="next" value={searchParams.get("next") || ""} />

          {/* Email Input */}
          <div className="fieldset space-y-1">
            <label className="fieldset-label font-bold text-xs text-base-content/80">
              Email Address
            </label>
            <div className="relative">
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="username@bsc.edu.ph"
                className="input input-bordered w-full pl-10 text-xs sm:text-sm font-medium focus:input-primary"
                disabled={isPending}
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            </div>
          </div>

          {/* Password Input */}
          <div className="fieldset space-y-1">
            <label className="fieldset-label font-bold text-xs text-base-content/80">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="input input-bordered w-full pl-10 pr-10 text-xs sm:text-sm font-medium focus:input-primary"
                disabled={isPending}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
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

          {/* Options Row: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="label cursor-pointer flex items-center gap-2 p-0">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox checkbox-primary checkbox-xs rounded"
              />
              <span className="label-text text-xs text-base-content/80 font-medium">Remember Me</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPasswordClick}
              className="text-xs text-[#7B1E1E] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-full text-white font-bold bg-[#7B1E1E] hover:bg-[#601717] border-[#7B1E1E] shadow-sm text-sm"
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-xs"></span>
                Signing In...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign In to ProcureWise
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Supported Roles Section */}
        <div className="pt-4 border-t border-base-300/80 space-y-3">
          <div className="text-center">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-base-content/50">
              Supported Roles
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {supportedRoles.map((r, i) => {
              const IconComponent = r.icon;
              return (
                <div 
                  key={i} 
                  className="flex items-center gap-2 p-2 rounded-lg bg-base-200/80 border border-base-300 text-left transition hover:border-[#7B1E1E]/40"
                >
                  <div className="p-1.5 rounded-md bg-[#7B1E1E]/10 text-[#7B1E1E]">
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-base-content leading-none">
                      {r.label}
                    </div>
                    <div className="text-[9px] text-base-content/60 leading-tight mt-0.5">
                      {r.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
