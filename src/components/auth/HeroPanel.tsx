"use client";

import React from "react";
import Image from "next/image";

interface HeroPanelProps {
  activeTab: "login" | "register";
  onToggle: (tab: "login" | "register") => void;
}

export default function HeroPanel({ activeTab, onToggle }: HeroPanelProps) {
  return (
    <div
      className="relative inset-y-0 right-0 text-white flex flex-col justify-center items-center p-12 text-center select-none transition-all duration-200 ease-in-out z-20 hidden md:flex overflow-hidden"
      style={{ width: "52%" }}
    >
      {/* Layer 1 — Background image with filter */}
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

      {/* Layer 2 — Maroon gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(rgba(123,30,30,.93), rgba(90,18,18,.90))",
        }}
      />

      {/* Layer 3 — BSC logo watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <Image
          src="/images/bsc-logo.png"
          alt=""
          width={480}
          height={480}
          className="object-contain"
          style={{ width: "480px", height: "480px", opacity: 0.05 }}
        />
      </div>

      {/* Layer 4 — Subtle grid (Microsoft-style) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.04,
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center justify-center space-y-7">
        {/* Title */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#C89B3C]">
            Batanes State College
          </p>
          <h2 className="text-[48px] font-[800] tracking-[-0.02em] uppercase text-white leading-none">
            PROCUREWISE
          </h2>
          <p className="text-sm font-semibold text-white/70 tracking-wide">
            Procurement Management Information System
          </p>
        </div>

        {/* Gold divider */}
        <div className="flex items-center justify-center gap-3 w-full">
          <span className="h-[1px] flex-1 max-w-[60px] bg-[#C89B3C]" />
          <span className="text-xs font-bold text-[#C89B3C]">◆</span>
          <span className="h-[1px] flex-1 max-w-[60px] bg-[#C89B3C]" />
        </div>

        {/* Description */}
        <p className="text-[13px] text-white/80 leading-relaxed font-medium text-center">
          Digitizing procurement workflows for{" "}
          <span className="text-white font-semibold">Batanes State College.</span>
          <br />
          Submit Purchase Requests, track approvals,
          <br />
          manage RFQs, and streamline institutional procurement.
        </p>

        {/* CTA Button */}
        <button
          type="button"
          onClick={() => onToggle("register")}
          className="h-[52px] px-10 rounded-[10px] bg-white text-[#7B1E1E] font-bold text-sm border-none cursor-pointer transition-all duration-200 hover:bg-[#FFF6EB] active:translate-y-[1px]"
        >
          Request an Account
        </button>
      </div>
    </div>
  );
}