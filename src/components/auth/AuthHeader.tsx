"use client";

import React from "react";
import Image from "next/image";

export default function AuthHeader() {
  return (
    <div className="flex flex-col items-center text-center gap-3 select-none w-full">

      {/* BSC Header Frame — 280px */}
      <div className="w-full flex justify-center">
        <Image
          src="/images/Header-Frame.png"
          alt="Batanes State College"
          width={280}
          height={126}
          priority
          className="object-contain"
          style={{ width: "280px" }}
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
        <p className="text-[10px] font-medium text-secondary">Version 2.0</p>
      </div>

      {/* Gold divider */}
      <div className="flex items-center gap-2 w-full">
        <span className="h-px flex-1 bg-secondary/40" />
        <span className="text-[10px] font-bold text-secondary">◆</span>
        <span className="h-px flex-1 bg-secondary/40" />
      </div>
    </div>
  );
}