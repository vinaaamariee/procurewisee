"use client";

import React, { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { login } from '@/app/actions/auth';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import LoginAlert from './LoginAlert';
import styles from '@/app/login/login.module.css';

interface LoginFormProps {
  errorParam: string | null;
  successParam: string | null;
  onClearParams: () => void;
}

export default function LoginForm({ errorParam, successParam, onClearParams }: LoginFormProps) {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
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
    setForgotPasswordMsg("Please contact the BSC Procurement Unit Helpdesk or your IT Administrator to reset your password.");
  };

  return (
    <div className={styles.loginCard}>
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <h2>Sign In</h2>
        <h1>Sign in to your account</h1>
        <p>Use your ProcureWise credentials to continue.</p>
      </div>

      <p className="text-sm text-[var(--text-secondary)] mb-6">
        Sign in using your official College account to access the Procurement Management Information System.
      </p>

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

      {/* Forgot Password Inline Message */}
      {forgotPasswordMsg && (
        <LoginAlert
          type="success"
          message={forgotPasswordMsg}
          onClose={() => setForgotPasswordMsg(null)}
        />
      )}

      {/* Login Form */}
      <form onSubmit={handleFormSubmit} className="space-y-5">
        <input type="hidden" name="next" value={searchParams.get("next") || ""} />

        {/* Email Address */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Email Address</label>
          <div className={styles.inputWrapper}>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="name@bsc.edu.ph"
              className={styles.inputField}
              disabled={isPending}
            />
            <Mail 
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" 
              aria-hidden="true" 
            />
          </div>
        </div>

        {/* Password */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Password</label>
          <div className={styles.inputWrapper}>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={styles.inputField}
              disabled={isPending}
            />
            <Lock 
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" 
              aria-hidden="true" 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.inputIcon}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Forgot Password Trigger */}
        <button
          type="button"
          onClick={handleForgotPasswordClick}
          className={styles.forgotPassword}
        >
          Forgot Password?
        </button>

        {/* Submit Button */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isPending}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {isPending ? "Signing In..." : "Sign In to ProcureWise"}
          {!isPending && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
