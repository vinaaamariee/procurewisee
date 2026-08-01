"use client";

import React, { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import LoginForm from '@/components/auth/LoginForm';
import EndUserRegisterForm from '@/components/auth/EndUserRegisterForm';
import { UserCheck, UserPlus } from 'lucide-react';

function EndUserLoginPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    tabParam === 'register' ? 'register' : 'login'
  );

  const error = searchParams.get('error');
  const success = searchParams.get('success');

  const handleClearParams = () => {
    router.replace('/end-user/login');
  };

  return (
    <div
      data-theme="bsc"
      className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-base-content selection:bg-[#7B1E1E]/20 p-4 sm:p-6 relative"
    >
      {/* Subtle background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#7B1E1E]/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#A6761D]/5 blur-3xl" />
      </div>

      {/* Theme Toggle — top right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Container */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md space-y-4">
        
        {/* Tab Switcher (Sign In vs Register) */}
        <div className="bg-base-100 p-1.5 rounded-2xl shadow-sm border border-base-200 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`btn btn-sm border-none rounded-xl text-xs font-bold transition-all ${
              activeTab === 'login'
                ? 'bg-[#7B1E1E] text-white shadow-sm'
                : 'bg-transparent text-base-content/70 hover:bg-base-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Sign In
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`btn btn-sm border-none rounded-xl text-xs font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-[#7B1E1E] text-white shadow-sm'
                : 'bg-transparent text-base-content/70 hover:bg-base-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-[#A6761D]" />
            Create Account
          </button>
        </div>

        {/* Dynamic Form Content */}
        {activeTab === 'register' ? (
          <EndUserRegisterForm
            errorParam={error}
            successParam={success}
            onClearParams={handleClearParams}
          />
        ) : (
          <LoginForm
            errorParam={error}
            successParam={success}
            onClearParams={handleClearParams}
          />
        )}
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-6 text-[11px] text-base-content/40 font-medium text-center">
        © {new Date().getFullYear()} Batanes State College · End User Portal
      </p>
    </div>
  );
}

export default function EndUserLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-base-200" data-theme="bsc">
          <div className="flex flex-col items-center gap-3">
            <span className="loading loading-spinner loading-lg text-[#7B1E1E]"></span>
            <span className="text-xs font-bold text-base-content/60 uppercase tracking-widest">
              Loading End User Portal...
            </span>
          </div>
        </div>
      }
    >
      <EndUserLoginPageContent />
    </Suspense>
  );
}
