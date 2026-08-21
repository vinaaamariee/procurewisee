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
      className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 py-2 -ml-2 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#800000] dark:hover:text-[var(--secondary-strong)] hover:bg-[#800000]/5 dark:hover:bg-[#D4AF37]/5 transition-all duration-200 outline-none focus:ring-2 focus:ring-[#800000] dark:focus:ring-[#D4AF37] group min-h-[44px] min-w-[44px]"
      aria-label={label}
    >
      <ArrowLeft className="h-4.5 w-4.5 transition-transform duration-200 group-hover:-translate-x-0.5 text-gray-500 dark:text-gray-400 group-hover:text-[#800000] dark:group-hover:text-[var(--secondary-strong)]" />
      <span>{label}</span>
    </Link>
  );
}
