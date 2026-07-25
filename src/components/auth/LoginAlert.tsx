"use client";

import React from 'react';
import { ShieldAlert, ShieldCheck, X } from 'lucide-react';
import styles from '@/app/login/login.module.css';

interface LoginAlertProps {
  type: 'error' | 'success';
  message: string;
  onClose: () => void;
}

export default function LoginAlert({ type, message, onClose }: LoginAlertProps) {
  const isError = type === 'error';
  const alertClass = isError 
    ? `${styles.alert} ${styles.alertError}`
    : `${styles.alert} ${styles.alertSuccess}`;

  return (
    <div className={alertClass} role="alert">
      {isError ? (
        <ShieldAlert className={styles.alertIcon} />
      ) : (
        <ShieldCheck className={styles.alertIcon} />
      )}
      <span className="pr-6 font-semibold leading-relaxed">{message}</span>
      <button 
        onClick={onClose} 
        className={styles.alertClose}
        aria-label="Close alert"
        type="button"
      >
        <X className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}
