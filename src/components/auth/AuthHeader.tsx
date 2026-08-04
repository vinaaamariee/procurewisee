"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GraduationCap } from "lucide-react";

export default function AuthHeader() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex flex-col items-center text-center space-y-2 select-none">
      {/* Logos */}
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 flex-shrink-0 flex items-center justify-center rounded bg-base-100 border border-base-300 p-1">
          {!imgError ? (
            <Image
              src="/images/bsc-logo.png"
              alt="Batanes State College Logo"
              width={40}
              height={40}
              className="object-contain h-full w-full"
              onError={() => setImgError(true)}
              priority
            />
          ) : (
            <div className="w-full h-full rounded bg-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-[#A6761D]" />
            </div>
          )}
        </div>
      </div>

      {/* Institutional text */}
      <div className="space-y-0.5">
        <p className="text-[9px] font-bold uppercase tracking-wider text-base-content/50 leading-none">
          Republic of the Philippines
        </p>
        <p className="text-xs font-bold uppercase text-primary leading-tight font-display">
          Batanes State College
        </p>
        <h1 className="text-sm font-bold text-base-content leading-tight">
          Procure<span className="text-primary">Wise</span>
        </h1>
        <p className="text-[10px] text-base-content/60 leading-none font-medium">
          Procurement Management Information System
        </p>
      </div>
    </div>
  );
}
