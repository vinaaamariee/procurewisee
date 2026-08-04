"use client";

import React from "react";

export default function AuthHeader() {
  return (
    <div className="flex flex-col items-center text-center gap-2 select-none w-full">

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
          Procure<span style={{ color: '#7B1E1E' }}>Wise</span>
        </h1>
        <p className="text-[11px] font-semibold text-base-content/60">
          Procurement Management Information System
        </p>
      </div>
    </div>
  );
}