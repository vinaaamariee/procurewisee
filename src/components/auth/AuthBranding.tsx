"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GraduationCap } from "lucide-react";

interface AuthBrandingProps {
  size?: number;
}

export default function AuthBranding({ size = 88 }: AuthBrandingProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex flex-col items-center text-center select-none" aria-label="Batanes State College">
      <div
        className="relative flex items-center justify-center"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {!imgError ? (
          <Image
            src="/images/bsc-logo.png"
            alt="Batanes State College Official Logo"
            width={size}
            height={size}
            className="object-contain h-full w-full"
            onError={() => setImgError(true)}
            priority
          />
        ) : (
          <div className="w-full h-full rounded-full bg-primary flex flex-col items-center justify-center">
            <GraduationCap className="text-secondary" style={{ width: size * 0.4, height: size * 0.4 }} />
          </div>
        )}
      </div>

      {/* Institutional text stack */}
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-base-content/50">
        Republic of the Philippines
      </p>
      <p className="text-sm font-bold uppercase tracking-[0.12em] text-base-content">
        Batanes State College
      </p>
      <p className="mt-1.5 text-[26px] font-extrabold tracking-tight leading-none">
        <span className="text-gray-900">Procure</span>
        <span style={{ color: "#7B1E1E" }}>Wise</span>
      </p>
      <p className="mt-1.5 text-[11px] text-base-content/55 leading-snug">
        Procurement Management Information System
      </p>

      {/* Gold divider */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="h-px w-10" style={{ backgroundColor: "#C89B3C" }} />
        <span
          className="block w-1.5 h-1.5 rotate-45"
          style={{ backgroundColor: "#C89B3C" }}
        />
        <span className="h-px w-10" style={{ backgroundColor: "#C89B3C" }} />
      </div>
    </div>
  );
}
