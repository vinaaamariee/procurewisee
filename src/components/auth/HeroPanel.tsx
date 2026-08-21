"use client";

import React from "react";
import Image from "next/image";

interface HeroPanelProps {
  activeTab: "login" | "register";
  onToggle: (tab: "login" | "register") => void;
}

/* Hero content for each state */
const HERO_CONTENT = {
  login: {
    btnLabel: "Create Account",
    btnTarget: "register" as const,
    description:
      "Access the Procurement Management Information System of Batanes State College. Sign in using your registered institutional account.",
  },
  register: {
    btnLabel: "Sign In",
    btnTarget: "login" as const,
    description:
      "Create an End User account to submit Purchase Requests, monitor procurement activities, and access institutional procurement services.",
  },
};

export default function HeroPanel({ activeTab, onToggle }: HeroPanelProps) {
  const content = HERO_CONTENT[activeTab];

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center text-white select-none overflow-hidden">

      {/* Layer 1 - solid maroon background (hardcoded gradient, per design spec) */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #800000 0%, #800000 100%)" }}
      />

      {/* Layer 2 - BSC logo watermark (no blur/rotation/shadow) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Image
          src="/images/bsc-logo.png"
          alt=""
          width={520}
          height={520}
          className="object-contain"
          style={{ opacity: 0.05, width: "520px", height: "520px" }}
        />
      </div>

      {/* Layer 3 - dotted grid pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.025,
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 w-full max-w-[460px] px-8 flex flex-col items-center text-center gap-7">

        {/* Badge */}
        <p
          className="text-[12px] font-semibold uppercase leading-relaxed"
          style={{ color: "rgba(255, 255, 255, 0.75)", letterSpacing: "4px" }}
        >
          Procurement Management Information System
        </p>

        {/* Heading */}
        <h2 className="text-[40px] xl:text-[52px] font-extrabold uppercase leading-[1.05] tracking-tight text-white">
          Welcome to ProcureWise
        </h2>

        {/* Gold divider with diamond */}
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-12" style={{ backgroundColor: 'var(--secondary-strong)' }} />
          <span
            className="block w-2 h-2 rotate-45"
            style={{ backgroundColor: 'var(--secondary-strong)' }}
          />
          <span className="h-px w-12" style={{ backgroundColor: 'var(--secondary-strong)' }} />
        </div>

        {/* Description */}
        <p
          className="max-w-[420px] text-[15px] leading-[1.8]"
          style={{ color: "rgba(255, 255, 255, 0.88)" }}
        >
          {content.description}
        </p>

        {/* CTA button */}
        <button
          type="button"
          onClick={() => onToggle(content.btnTarget)}
          className="h-[54px] px-9 rounded-xl border-2 border-white text-white text-sm font-semibold transition-colors hover:bg-white hover:text-[#800000] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          {content.btnLabel} →
        </button>
      </div>
    </div>
  );
}
