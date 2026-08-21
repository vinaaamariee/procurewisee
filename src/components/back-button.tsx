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
      className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 py-2 -ml-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-[#7B1E1E] dark:hover:text-[#A6761D] hover:bg-[#7B1E1E]/5 dark:hover:bg-[#A6761D]/5 transition-all duration-200 outline-none focus:ring-2 focus:ring-[#7B1E1E] dark:focus:ring-[#A6761D] group min-h-[44px] min-w-[44px]"
      aria-label={label}
    >
      <ArrowLeft className="h-4.5 w-4.5 transition-transform duration-200 group-hover:-translate-x-0.5 text-slate-500 dark:text-slate-400 group-hover:text-[#7B1E1E] dark:group-hover:text-[#A6761D]" />
      <span>{label}</span>
    </Link>
  );
}
