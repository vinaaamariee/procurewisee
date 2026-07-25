"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import LoginHero from '@/components/auth/LoginHero';
import LoginForm from '@/components/auth/LoginForm';
import LoginFooter from '@/components/auth/LoginFooter';
import styles from './login.module.css';

function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const error = searchParams.get('error');
  const success = searchParams.get('success');

  const handleClearParams = () => {
    router.replace('/login');
  };

  return (
    <div className={styles.wrapper}>
      {/* Left Panel - Hero Branding */}
      <LoginHero />

      {/* Right Panel - Login Card and Footer Form */}
      <div className={styles.rightPanel}>
        {/* Theme Toggle Button */}
        <div className="absolute top-8 right-8 z-20">
          <ThemeToggle />
        </div>

        <div className={styles.rightPanelInner}>
          <LoginForm 
            errorParam={error} 
            successParam={success} 
            onClearParams={handleClearParams} 
          />
          <LoginFooter />
        </div>
      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#F2F3EF] dark:bg-[#0E1420]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B2D5C] border-t-transparent" />
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}