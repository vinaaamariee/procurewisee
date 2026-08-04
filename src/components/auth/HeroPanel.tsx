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
    eyebrow: "Procurement Management Information System",
    title: "Welcome\nBack",
    body: "Access the Procurement Management Information System of Batanes State College. Sign in using your registered institutional account.",
    btnLabel: "Create Account",
    btnTarget: "register" as const,
  },
  register: {
    eyebrow: "End User Self-Registration",
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

      {/* Layer 1 — campus background image with subtle filter */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url("/images/Header-Frame.png")',
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          filter: "grayscale(15%) contrast(105%)",
        }}
      />

      {/* Layer 2 — maroon gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, rgba(123,30,30,.95) 0%, rgba(90,18,18,.92) 100%)",
        }}
      />

      {/* Layer 3 — BSC logo watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Image
          src="/images/bsc-logo.png"
          alt=""
          width={420}
          height={420}
          className="object-contain"
          style={{ opacity: 0.05, width: "420px", height: "420px" }}
        />
      </div>

      {/* Layer 4 — Microsoft-style subtle grid */}
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

      {/* ── Hero content ────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[360px] px-8 flex flex-col items-center text-center gap-6">

        {/* Eyebrow */}
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-secondary opacity-90">
          {content.eyebrow}
        </p>

        {/* Title */}
        <div className="space-y-2">
          <h2
            className="text-[42px] font-extrabold leading-[1.05] tracking-tight text-white uppercase"
            style={{ whiteSpace: "pre-line" }}
          >
            {content.title}
          </h2>

          {/* Gold accent divider */}
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-secondary/70" />
            <span className="text-secondary text-xs">◆</span>
            <span className="h-px w-10 bg-secondary/70" />
          </div>
        </div>

        {/* Body copy */}
        <p className="text-[13px] text-white/80 leading-relaxed font-medium">
          {content.body}
        </p>

        {/* CTA button — outline style */}
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