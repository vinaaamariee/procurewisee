"use client";

import React from "react";
import Image from "next/image";

interface HeroPanelProps {
  activeTab: "login" | "register";
  onToggle: (tab: "login" | "register") => void;
}

export default function HeroPanel({ activeTab, onToggle }: HeroPanelProps) {
  const isLogin = activeTab === "login";

  return (
    <div
      className="relative inset-y-0 right-0 text-white flex flex-col justify-center items-center p-12 text-center select-none transition-all duration-200 ease-in-out z-20 hidden md:flex"
      style={{
        width: "52%",
        backgroundImage: 'url("/images/Header-Frame.png")',
        backgroundPosition: "center bottom",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(rgba(123,30,30,.88), rgba(110,20,20,.90))",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)",
          opacity: 0.08,
        }}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06] select-none">
        <Image
          src="/images/bsc-logo.png"
          alt=""
          width={480}
          height={480}
          className="object-contain w-[480px] h-[480px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center justify-center space-y-6">
        <div className="space-y-1">
          <h2 className="text-[48px] font-[800] tracking-[-0.02em] uppercase text-white leading-none">
            WELCOME TO PROCUREWISE
          </h2>
          <div className="flex items-center justify-center gap-3 pt-1">
            <span className="h-[1px] flex-1 max-w-[60px] bg-[#C89B3C]"></span>
            <span className="text-xs font-bold text-[#C89B3C]">◆</span>
            <span className="h-[1px] flex-1 max-w-[60px] bg-[#C89B3C]"></span>
          </div>
        </div>

        <p className="text-xs text-white/80 leading-relaxed font-medium text-center">
          Create an institutional account to submit Purchase Requests, monitor
          procurement activities, and access institutional procurement services.
        </p>

        <button
          type="button"
          onClick={() => onToggle("register")}
          className="h-[54px] px-9 rounded-[10px] bg-white text-[#7B1E1E] font-bold text-xs border-none cursor-pointer transition-all duration-200 hover:bg-[#FFF6EB]"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}