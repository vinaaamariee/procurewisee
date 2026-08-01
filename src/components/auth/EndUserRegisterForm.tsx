"use client";

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { registerEndUser } from '@/app/actions/auth';
import {
  Eye, EyeOff, ArrowRight, Mail, Lock, User, Building2,
  ArrowLeft, GraduationCap, CheckCircle2, ShieldCheck,
} from 'lucide-react';
import LoginAlert from './LoginAlert';

interface EndUserRegisterFormProps {
  errorParam: string | null;
  successParam: string | null;
  onClearParams: () => void;
}

export default function EndUserRegisterForm({
  errorParam,
  successParam,
  onClearParams,
}: EndUserRegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imgError, setImgError] = useState(false);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await registerEndUser(formData);
    });
  };

  return (
    <div className="card bg-base-100 shadow-2xl border border-base-200 w-full rounded-3xl overflow-hidden transition-all duration-300">
      <div className="card-body p-7 sm:p-9 space-y-6">

        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-base-content/50 hover:text-[#7B1E1E] transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Official Portal Login</span>
          </Link>
          <span className="badge badge-warning gap-1 bg-[#A6761D]/15 text-[#A6761D] border-[#A6761D]/30 text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-2 rounded-lg">
            <ShieldCheck className="w-3 h-3" /> End User Portal
          </span>
        </div>

        {/* Institutional Branding */}
        <div className="flex items-center gap-3 border-b border-base-200 pb-5">
          <div className="relative h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-2xl bg-white border border-base-200 shadow-sm p-1">
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
              <div className="w-full h-full rounded-xl bg-[#7B1E1E] flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-[#A6761D]" />
              </div>
            )}
          </div>

          <div>
            <div className="text-base font-black text-[#7B1E1E] leading-tight tracking-tight">
              End User Self-Registration
            </div>
            <div className="text-[11px] font-semibold text-base-content/60 leading-tight">
              Batanes State College Procurement System
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-[#7B1E1E] tracking-tight">
            Create Requisitioner Account
          </h1>
          <p className="text-xs text-base-content/65 leading-relaxed">
            Register your departmental account to submit Purchase Requests (PR) and create Annual PPMP items.
          </p>
        </div>

        {/* Alerts */}
        {errorParam && (
          <LoginAlert type="error" message={errorParam} onClose={onClearParams} />
        )}
        {successParam && (
          <LoginAlert type="success" message={successParam} onClose={onClearParams} />
        )}

        {/* Self Registration Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-base-content/80 block">
              Full Name <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                name="fullName"
                type="text"
                required
                placeholder="Juan Dela Cruz"
                className="input input-bordered w-full pl-10 text-sm font-medium focus:input-primary rounded-xl"
                disabled={isPending}
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/35" />
            </div>
          </div>

          {/* Department / Unit */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-base-content/80 block">
              Department / Office Unit <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                name="department"
                type="text"
                required
                placeholder="E.g., ICT Department, General Services"
                className="input input-bordered w-full pl-10 text-sm font-medium focus:input-primary rounded-xl"
                disabled={isPending}
              />
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/35" />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-base-content/80 block">
              Email Address <span className="text-error">*</span>
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

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content/80 block">
                Password <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="input input-bordered w-full pl-10 pr-9 text-sm font-medium focus:input-primary rounded-xl"
                  disabled={isPending}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/35" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content/80 block">
                Confirm Password <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="input input-bordered w-full pl-10 pr-9 text-sm font-medium focus:input-primary rounded-xl"
                  disabled={isPending}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/35" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-base-content/65 leading-tight">
              By creating an account, you confirm that you are an authorized requester representing your department or office unit.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn w-full text-white font-bold bg-[#7B1E1E] hover:bg-[#601717] border-none shadow-md text-sm rounded-xl py-3 mt-2"
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-xs"></span>
                Creating End User Account…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Create Account & Sign In
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Existing Account Link */}
        <div className="border-t border-base-200 pt-4 text-center">
          <p className="text-xs text-base-content/70">
            Already have an End User account?{" "}
            <Link
              href="/end-user/login?tab=login"
              className="text-[#7B1E1E] font-extrabold hover:underline"
            >
              Sign In Here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
