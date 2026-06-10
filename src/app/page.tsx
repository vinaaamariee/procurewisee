"use client";

import React, { useState, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { login, register } from './actions/auth';
import type { UserRole } from '@/types/auth';

function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Procurement Officer');
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const error = searchParams.get('error');
  const success = searchParams.get('success');

  const rolesList: { role: UserRole; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      role: 'Procurement Officer',
      label: 'Officer',
      desc: 'Canvassing & RFQs',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      role: 'Administrative Approver',
      label: 'Approver',
      desc: 'MCDM Approvals',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      role: 'Supplier',
      label: 'Supplier',
      desc: 'Bids & Quotations',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ];

  const handleClearParams = () => {
    router.replace('/');
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#030712] px-4 py-12 selection:bg-indigo-500 selection:text-white overflow-hidden">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] aspect-square rounded-full bg-indigo-500/10 blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] aspect-square rounded-full bg-sky-500/10 blur-[150px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-[460px] rounded-3xl border border-white/5 bg-slate-900/40 p-8 backdrop-blur-xl shadow-2xl z-10 transition-all duration-300">
        
        {/* Accent Top Border Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 font-extrabold text-lg text-white shadow-lg shadow-indigo-500/15 mb-4 hover:scale-105 transition-all duration-300">
            <span>P</span>
            <span className="text-sky-200">W</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            ProcureWise Gateway
          </h1>
          <p className="mt-1.5 text-xs text-slate-400">
            Institutional Procurement & Solicitations Management
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-950/60 p-1 mb-6 border border-white/5">
          <button
            onClick={() => { setActiveTab('login'); handleClearParams(); }}
            className={`flex-1 text-center py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); handleClearParams(); }}
            className={`flex-1 text-center py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Info Alerts */}
        {error && (
          <div className="relative flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 mb-6 text-xs text-red-400">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 shrink-0 mt-0.5">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span className="pr-4 leading-normal">{decodeURIComponent(error)}</span>
            <button onClick={handleClearParams} className="absolute right-2 top-2 text-red-400/50 hover:text-red-400">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        )}

        {success && (
          <div className="relative flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 mb-6 text-xs text-emerald-400">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 shrink-0 mt-0.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <span className="pr-4 leading-normal">{decodeURIComponent(success)}</span>
            <button onClick={handleClearParams} className="absolute right-2 top-2 text-emerald-400/50 hover:text-emerald-400">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'login' ? (
          <form action={login} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@bsc.edu.ph"
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition duration-150 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-slate-950/80"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Password
                </label>
              </div>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition duration-150 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-slate-950/80"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/15 hover:from-indigo-500 hover:to-indigo-400 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
            >
              {isPending ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form action={register} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Full Name
                </label>
                <input
                  name="fullName"
                  type="text"
                  required
                  placeholder="Juan Dela Cruz"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:bg-slate-950/80"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Username
                </label>
                <input
                  name="username"
                  type="text"
                  required
                  placeholder="juan_dc"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:bg-slate-950/80"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="juan@bsc.edu.ph"
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:bg-slate-950/80"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="•••••••• (Min 6 chars)"
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:bg-slate-950/80"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Assign System Role
              </label>
              <input type="hidden" name="role" value={selectedRole} />
              
              <div className="grid grid-cols-1 gap-2.5">
                {rolesList.map((item) => {
                  const isSelected = selectedRole === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setSelectedRole(item.role)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 text-white'
                          : 'border-white/5 bg-slate-950/30 text-slate-400 hover:border-white/10 hover:bg-slate-950/50'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/15 hover:from-indigo-500 hover:to-indigo-400 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {isPending ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#030712]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}
