"use client";

import React from 'react';
import { HelpCircle, Globe } from 'lucide-react';

export default function LoginFooter() {
  const handleSupportClick = () => {
    alert("Please contact the BSC Procurement Unit Helpdesk or System Admin to request account support.");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-base-content/60 pt-4 max-w-md mx-auto w-full">
      <div className="text-[11px] font-medium">
        BSC Procurement System
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSupportClick}
          className="flex items-center gap-1.5 hover:text-[#7B1E1E] transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Contact Admin Support</span>
        </button>

        <div className="flex items-center gap-1 text-xs font-medium">
          <Globe className="w-3.5 h-3.5" />
          <span>English</span>
        </div>
      </div>
    </div>
  );
}
