"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import LoginForm from '@/components/auth/LoginForm';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const error = searchParams.get('error');
  const success = searchParams.get('success');

  const handleClearParams = () => {
    router.replace('/login');
  };

  return (
    <div
      data-theme="bsc"
      className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-base-content selection:bg-[#7B1E1E]/20 p-4 sm:p-6 relative"
    >
      {/* Subtle background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#7B1E1E]/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#A6761D]/5 blur-3xl" />
      </div>

      {/* Theme Toggle — top right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Centered Auth Card */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        <LoginForm
          errorParam={error}
          successParam={success}
          onClearParams={handleClearParams}
        />
      </div>

      {/* Minimal Footer */}
      <p className="relative z-10 mt-6 text-[11px] text-base-content/40 font-medium text-center">
        © {new Date().getFullYear()} Batanes State College · Powered by ProcureWise
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-base-200" data-theme="bsc">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-[#7B1E1E]"></span>
          <span className="text-xs font-bold text-base-content/60 uppercase tracking-widest">
            Loading BSC Portal...
          </span>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}