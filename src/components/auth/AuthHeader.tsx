"use client";

import React from "react";
import Image from "next/image";

export default function AuthHeader() {
  return (
    <div className="flex flex-col items-center text-center space-y-4 select-none w-full">
      {/* Header Frame Image */}
      <div className="w-full flex justify-center">
        <Image
          src="/images/Header-Frame.png"
          alt="Batanes State College"
          width={520}
          height={240}
          priority
          className="mx-auto object-contain"
        />
      </div>

      {/* Title block */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
          Procure<span className="text-[#7B1E1E]">Wise</span>
        </h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-[320px]">
          Procurement Management Information System
        </p>
      </div>

      {/* Gold diamond divider */}
      <div className="flex items-center justify-center gap-3 w-full py-1">
        <span className="h-[1px] flex-1 max-w-[80px] bg-[#C89B3C]/30"></span>
        <span className="text-xs font-bold text-[#C89B3C]">────────◆────────</span>
        <span className="h-[1px] flex-1 max-w-[80px] bg-[#C89B3C]/30"></span>
      </div>
    </div>
  );
}
