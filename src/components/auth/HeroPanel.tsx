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
    title: "Welcome\nBack",
    body: "Access the Procurement Management Information System of Batanes State College. Sign in using your registered institutional account.",
    btnLabel: "Create Account",
    btnTarget: "register" as const,
  },
  register: {
    title: "New to\nProcureWise?",
    body: "Create an End User account to submit Purchase Requests, monitor procurement activities, and access institutional procurement services.",
    btnLabel: "Sign In",
    btnTarget: "login" as const,
  },
};

export default function HeroPanel({ activeTab, onToggle }: HeroPanelProps) {
  const content = HERO_CONTENT[activeTab];

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center text-white select-none overflow-hidden">

      {/* Layer 1 - solid maroon background */}
      <div className="absolute inset-0 bg-primary" />

      {/* Layer 2 - BSC logo watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Image
          src="/images/bsc-logo.png"
          alt=""
          width={420}
          height={420}
          className="object-contain grayscale"
          style={{ opacity: 0.06, width: "420px", height: "420px" }}
        />
      </div>

      {/* Layer 3 - subtle grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.045,
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 w-full max-w-[360px] px-8 flex flex-col items-center text-center gap-6">

        {/* Title */}
        <h2
          className="text-[42px] font-extrabold leading-[1.05] tracking-tight text-white uppercase"
          style={{ whiteSpace: "pre-line" }}
        >
          {content.title}
        </h2>

        {/* Body copy */}
        <p className="text-[13px] text-white/80 leading-relaxed font-medium">
          {content.body}
        </p>

        {/* CTA button */}
        <button
          type="button"
          onClick={() => onToggle(content.btnTarget)}
          className="btn btn-outline border-white text-white hover:bg-white hover:text-primary hover:border-white active:translate-y-px transition-all duration-200 px-8 rounded-[6px]"
        >
          {content.btnLabel}
        </button>

        {/* College footer text */}
        <p className="text-[10px] text-white/35 font-semibold tracking-wider uppercase">
          Batanes State College · Republic of the Philippines
        </p>
      </div>
    </div>
  );
}
