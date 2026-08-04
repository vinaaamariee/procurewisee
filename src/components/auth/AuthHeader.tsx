"use client";

import React from "react";
import Image from "next/image";

export default function AuthHeader() {
  return (
    <div className="flex flex-col items-center text-center space-y-4 select-none w-full">
      <div className="w-full flex justify-center">
        <Image
          src="/images/Header-Frame.png"
          alt="Batanes State College"
          width={540}
          height={240}
          priority
          className="object-contain mx-auto"
        />
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-[#1F2937]">
          Procure<span className="text-[#7B1E1E]">Wise</span>
        </h1>
        <p className="text-xs font-semibold text-[#6B7280]">
          Procurement Management Information System
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 w-full py-1">
        <span className="h-[1px] flex-1 max-w-[80px] bg-[#C89B3C]/30"></span>
        <span className="text-xs font-bold text-[#C89B3C]">────────◆────────</span>
        <span className="h-[1px] flex-1 max-w-[80px] bg-[#C89B3C]/30"></span>
      </div>
    </div>
  );
}