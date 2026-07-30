"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import LoginHero from '@/components/auth/LoginHero';
import LoginForm from '@/components/auth/LoginForm';
import LoginFooter from '@/components/auth/LoginFooter';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const error = searchParams.get('error');
  const success = searchParams.get('success');

  const handleClearParams = () => {
    router.replace('/login');
  };

  return (
    <div data-theme="bsc" className="min-h-screen flex flex-col lg:flex-row bg-base-200 text-base-content selection:bg-[#7B1E1E]/20">
      {/* Left Panel - BSC Hero & Procurement Workflow */}
      <div className="lg:w-1/2 flex flex-col">
        <LoginHero />
      </div>

      {/* Right Panel - Centered Login Card & Controls */}
      <div className="lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-16 relative bg-base-200">
        {/* Theme Toggle in Top Right */}
        <div className="absolute top-6 right-6 z-20">
          <ThemeToggle />
        </div>

        {/* Centered Login Card Container */}
        <div className="flex-1 flex items-center justify-center my-auto py-8">
          <LoginForm 
            errorParam={error} 
            successParam={success} 
            onClearParams={handleClearParams} 
          />
        </div>

        {/* Footer info */}
        <div className="pt-4">
          <LoginFooter />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-base-200">
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