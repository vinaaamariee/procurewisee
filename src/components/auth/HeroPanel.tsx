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
      className="absolute inset-y-0 text-white flex flex-col justify-center items-center p-12 text-center select-none transition-all duration-500 ease-in-out z-20 hidden md:flex"
      style={{
        width: isLogin ? "55%" : "45%",
        left: isLogin ? "45%" : "0%",
        backgroundImage: 'linear-gradient(rgba(123, 30, 30, 0.90), rgba(94, 20, 20, 0.92)), url("/images/Header-Frame.png")',
        backgroundPosition: "center bottom",
        backgroundSize: "90%",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Top right dot pattern (M365/SAP dashboard inspired) */}
      <div className="absolute top-6 right-8 font-mono text-[16px] tracking-[0.3em] opacity-10 select-none leading-tight text-white">
        ••••••••
        <br />
        ••••••••
      </div>

      {/* Large College Seal Watermark (top-right side alignment) */}
      <div className="pointer-events-none absolute -right-[80px] top-[80px] opacity-[0.06] select-none shrink-0 w-[500px] h-[500px]">
        <Image
          src="/images/bsc-logo.png"
          alt=""
          width={500}
          height={500}
          className="object-contain w-full h-full"
        />
      </div>

      {/* Hero content area */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center justify-center h-full space-y-6">
        
        {/* Register Hero prompt (visible when activeTab is login, covering right 55%) */}
        <div
          className={`absolute transition-all duration-500 flex flex-col items-center space-y-6 ${
            isLogin ? "opacity-100 scale-100 relative" : "opacity-0 scale-95 pointer-events-none absolute"
          }`}
        >
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-wider uppercase text-white">
              WELCOME TO PROCUREWISE
            </h2>
            <div className="text-xs font-semibold text-[#C89B3C] uppercase tracking-widest">
              Batanes State College
            </div>
          </div>
          
          <p className="text-xs text-white/80 leading-relaxed font-medium">
            Create an institutional account to submit Purchase Requests, track procurement activities, and monitor procurement status.
          </p>

          <button
            type="button"
            onClick={() => onToggle("register")}
            className="btn bg-white border-none hover:bg-neutral-100 text-[#7B1E1E] text-xs font-bold h-[52px] px-8 rounded-[10px] transition-colors"
          >
            Create Account
          </button>
        </div>

        {/* Login Hero prompt (visible when activeTab is register, covering left 45%) */}
        <div
          className={`absolute transition-all duration-500 flex flex-col items-center space-y-6 ${
            !isLogin ? "opacity-100 scale-100 relative" : "opacity-0 scale-95 pointer-events-none absolute"
          }`}
        >
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-wider uppercase text-white">
              WELCOME BACK
            </h2>
            <div className="text-xs font-semibold text-[#C89B3C] uppercase tracking-widest">
              Batanes State College
            </div>
          </div>
          
          <p className="text-xs text-white/80 leading-relaxed font-medium">
            Sign in using your registered institutional account to access ProcureWise.
          </p>

          <button
            type="button"
            onClick={() => onToggle("login")}
            className="btn bg-white border-none hover:bg-neutral-100 text-[#7B1E1E] text-xs font-bold h-[52px] px-8 rounded-[10px] transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
