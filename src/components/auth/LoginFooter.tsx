"use client";

import React from 'react';
import Link from 'next/link';
import { HelpCircle, Home } from 'lucide-react';

export default function LoginFooter() {
  const handleSupportClick = () => {
    alert("Please contact the BSC Procurement Unit Helpdesk or System Admin to request account support.\n\nEmail: procurement@bsc.edu.ph\nICT Support: ict@bsc.edu.ph\nPhone: (078) 533-3000");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-base-content/60 pt-4 max-w-md mx-auto w-full">
      <Link
        href="/"
        className="flex items-center gap-1.5 hover:text-[#7B1E1E] transition-colors font-semibold text-[11px]"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSupportClick}
          className="flex items-center gap-1.5 hover:text-[#7B1E1E] transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Contact Admin Support</span>
        </button>

        <span className="text-[10px] font-medium text-base-content/40">
          © {new Date().getFullYear()} BSC
        </span>
      </div>
    </div>
  );
}
