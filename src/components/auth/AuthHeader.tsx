"use client";

import React from "react";
import Image from "next/image";

export default function AuthHeader() {
  return (
    <div className="flex flex-col items-center text-center space-y-3 select-none w-full">
      {/* BSC Logo — Header Frame */}
      <div className="w-full flex justify-center">
        <Image
          src="/images/Header-Frame.png"
          alt="Batanes State College"
          width={320}
          height={144}
          priority
          className="object-contain mx-auto"
          style={{ width: "320px" }}
        />
      </div>

      {/* Government identity block */}
      <div className="space-y-0.5">
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#6B7280]">
          Republic of the Philippines
        </p>
        <p className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-[#1F2937]">
          Batanes State College
        </p>
      </div>

      {/* App name */}
      <div className="space-y-0.5">
        <h1 className="text-[22px] font-extrabold tracking-tight text-[#1F2937] leading-none">
          Procure<span className="text-[#7B1E1E]">Wise</span>
        </h1>
        <p className="text-[11px] font-semibold text-[#6B7280]">
          Procurement Management Information System
        </p>
        <p className="text-[10px] font-medium text-[#C89B3C]">Version 2.0</p>
      </div>

      {/* Gold divider */}
      <div className="flex items-center justify-center gap-2 w-full pt-0.5">
        <span className="h-[1px] flex-1 bg-[#C89B3C]/40" />
        <span className="text-[10px] font-bold text-[#C89B3C]">◆</span>
        <span className="h-[1px] flex-1 bg-[#C89B3C]/40" />
      </div>
    </div>
  );
}