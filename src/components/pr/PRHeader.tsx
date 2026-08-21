'use client';

import React from 'react';
import Image from 'next/image';

interface PRHeaderProps {
  className?: string;
}

export default function PRHeader({ className = '' }: PRHeaderProps) {
  return (
    <div className={`text-center space-y-2 pb-4 border-b-2 border-gray-900 ${className}`}>
      <div className="flex items-center justify-center gap-4">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
          <Image
            src="/images/bsc-logo.png"
            alt="Batanes State College Seal"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="text-left font-serif">
          <div className="text-xs uppercase tracking-wider text-gray-700 font-semibold">
            Republic of the Philippines
          </div>
          <div className="text-lg sm:text-xl font-bold tracking-tight text-gray-950 uppercase">
            Batanes State College
          </div>
          <div className="text-xs text-gray-600">
            Washington Ave., San Antonio, Basco, Batanes
          </div>
          <div className="text-xs font-bold text-[#800000] uppercase tracking-wide mt-0.5">
            Procurement Unit / Requisitioning Office
          </div>
        </div>
      </div>
      <div className="pt-2">
        <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-widest uppercase font-serif">
          Purchase Request
        </h1>
        <p className="text-[11px] text-gray-600 italic font-sans">
          (Official Institutional Requisition Form)
        </p>
      </div>
    </div>
  );
}
