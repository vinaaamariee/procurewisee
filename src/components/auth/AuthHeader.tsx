"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GraduationCap } from "lucide-react";

export default function AuthHeader() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex flex-col items-center text-center space-y-4 select-none">
      {/* Enlarged College Logo */}
      <div className="relative h-24 w-24 flex-shrink-0 flex items-center justify-center rounded-md bg-base-100 border border-base-300 p-2 shadow-none">
        {!imgError ? (
          <Image
            src="/images/bsc-logo.png"
            alt="Batanes State College Logo"
            width={96}
            height={96}
            className="object-contain h-full w-full"
            onError={() => setImgError(true)}
            priority
          />
        ) : (
          <div className="w-full h-full rounded bg-primary flex items-center justify-center">
            <GraduationCap className="h-12 w-12 text-[#B8860B]" />
          </div>
        )}
      </div>

      {/* College Identity Title */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50 leading-none">
          Republic of the Philippines
        </p>
        <p className="text-sm font-bold uppercase text-primary tracking-wide leading-tight font-display">
          Batanes State College
        </p>
        
        {/* Subtle Gold diamond dot divider */}
        <div className="flex items-center justify-center gap-2 py-0.5">
          <span className="h-[1px] w-8 bg-[#B8860B]/30"></span>
          <span className="text-[10px] text-[#B8860B]">◆</span>
          <span className="h-[1px] w-8 bg-[#B8860B]/30"></span>
        </div>

        <h1 className="text-base font-bold text-base-content leading-tight">
          Procure<span className="text-primary">Wise</span>
        </h1>
        <p className="text-[11px] text-base-content/60 leading-tight font-medium max-w-[280px]">
          Procurement Management Information System
        </p>
      </div>
    </div>
  );
}
