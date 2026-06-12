"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href: string;
  label?: string;
}

export function BackButton({ href, label = "Back" }: BackButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 py-2 -ml-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-[#7e191b] dark:hover:text-[#f59e0b] hover:bg-[#7e191b]/5 dark:hover:bg-[#f59e0b]/5 transition-all duration-200 outline-none focus:ring-2 focus:ring-[#7e191b] dark:focus:ring-[#f59e0b] group min-h-[44px] min-w-[44px]"
      aria-label={label}
    >
      <ArrowLeft className="h-4.5 w-4.5 transition-transform duration-200 group-hover:-translate-x-0.5 text-slate-500 dark:text-slate-400 group-hover:text-[#7e191b] dark:group-hover:text-[#f59e0b]" />
      <span>{label}</span>
    </Link>
  );
}
