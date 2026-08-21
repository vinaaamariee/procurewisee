"use client";

import React from 'react';
import { ShieldAlert, ShieldCheck, X } from 'lucide-react';

interface LoginAlertProps {
  type: 'error' | 'success';
  message: string;
  onClose: () => void;
}

export default function LoginAlert({ type, message, onClose }: LoginAlertProps) {
  const isError = type === 'error';

  return (
    <div
      className="relative flex flex-col items-start gap-3 rounded-lg border p-4 text-sm leading-relaxed"
      role="alert"
      style={{
        borderColor: isError ? 'rgba(128, 0, 0, 0.2)' : 'rgba(128, 0, 0, 0.2)',
        backgroundColor: isError ? 'rgba(128, 0, 0, 0.03)' : 'rgba(128, 0, 0, 0.03)',
        color: isError ? '#800000' : '#800000',
      }}
    >
      {isError ? (
        <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
      ) : (
        <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
      )}
      <span className="pr-6 font-semibold leading-relaxed">{message}</span>
      <button
        onClick={onClose}
        className="absolute right-3 top-3 bg-transparent border-none cursor-pointer"
        aria-label="Close alert"
        type="button"
        style={{ color: 'inherit', opacity: 0.6 }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}