"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GraduationCap } from "lucide-react";

interface AuthBrandingProps {
  size?: number;
}

export default function AuthBranding({ size = 104 }: AuthBrandingProps) {
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
    </div>
  );
}
