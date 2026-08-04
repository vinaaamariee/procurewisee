"use client";

import React from "react";
import Image from "next/image";

export default function AuthHeader() {
  return (
    <div className="flex flex-col items-center text-center gap-2 select-none w-full">

      {/* BSC Official Logo — 110px */}
      <div className="flex justify-center">
        <Image
          src="/images/bsc-logo.png"
          alt="Batanes State College"
          width={110}
          height={110}
          priority
          className="object-contain"
          style={{ width: "110px", height: "110px" }}
        />
      </div>

      {/* Government identity block */}
      <div className="space-y-0.5">
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-base-content/50">
          Republic of the Philippines
        </p>
        <p className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-base-content/80">
          Batanes State College
        </p>
      </div>

      {/* App name + subtitle */}
      <div className="space-y-0.5">
        <h1 className="text-[20px] font-extrabold tracking-tight text-base-content leading-none">
          Procure<span className="text-primary">Wise</span>
        </h1>
        <p className="text-[11px] font-semibold text-base-content/60">
          Procurement Management Information System
        </p>
      </div>
    </div>
  );
}