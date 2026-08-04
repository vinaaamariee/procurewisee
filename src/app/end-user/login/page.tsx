"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import AuthLayout from '@/components/auth/AuthLayout';

function EndUserLoginPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = React.useState<'login' | 'register'>(
    tabParam === 'register' ? 'register' : 'login'
  );

  const error = searchParams.get('error');
  const success = searchParams.get('success');

  const handleClearParams = () => {
    router.replace('/end-user/login');
  };

  const handleToggleTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    router.replace(`/end-user/login?tab=${tab}`);
  };

  return (
    <AuthLayout
      activeTab={activeTab}
      onToggleTab={handleToggleTab}
      loginForm={
        <LoginForm
          errorParam={activeTab === 'login' ? error : null}
          successParam={activeTab === 'login' ? success : null}
          onClearParams={handleClearParams}
          onToggleTab={handleToggleTab}
        />
      }
      registerForm={
        <RegisterForm
          errorParam={activeTab === 'register' ? error : null}
          successParam={activeTab === 'register' ? success : null}
          onClearParams={handleClearParams}
          onToggleTab={handleToggleTab}
        />
      }
    />
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
