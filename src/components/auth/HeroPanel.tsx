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
      className="absolute inset-y-0 left-0 w-[58%] text-white flex flex-col justify-center items-center p-12 text-center select-none transition-transform duration-500 ease-in-out z-20 hidden md:flex"
      style={{
        transform: isLogin ? "translateX(72.41%)" : "translateX(0)",
        backgroundImage: 'linear-gradient(rgba(123, 30, 30, 0.85), rgba(92, 20, 20, 0.92)), url("/images/Header-Frame.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Top right dot pattern (M365/SAP dashboard inspired) */}
      <div className="absolute top-6 right-8 font-mono text-[16px] tracking-[0.3em] opacity-12 select-none leading-tight text-white">
        ••••••••
        <br />
        ••••••••
      </div>

      {/* Large College Seal Watermark in the background */}
      <div className="pointer-events-none absolute -right-[80px] -bottom-[60px] opacity-[0.08] select-none shrink-0 w-[520px] h-[520px]">
        <Image
          src="/images/bsc-logo.png"
          alt=""
          width={520}
          height={520}
          className="object-contain w-full h-full"
        />
      </div>

      {/* Hero content area */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center justify-center h-full space-y-6">
        {/* Register Hero prompt (visible when activeTab is login, covering register side) */}
        <div
          className={`absolute transition-all duration-500 flex flex-col items-center space-y-5 ${
            isLogin ? "opacity-100 scale-100 relative" : "opacity-0 scale-95 pointer-events-none absolute"
          }`}
        >
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-widest text-[#B8860B] uppercase">
              ProcureWise
            </h2>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">
              Procurement Management System
            </h3>
          </div>
          
          <p className="text-xs text-white/80 leading-relaxed font-medium">
            Create an institutional account to submit Purchase Requests, track procurement status, and manage procurement records.
          </p>

          <button
            type="button"
            onClick={() => onToggle("register")}
            className="btn rounded-md bg-white border-none hover:bg-neutral-100 text-[#7B1E1E] text-xs font-bold px-7 py-3 transition-colors"
          >
            Create Account
          </button>
        </div>

        {/* Login Hero prompt (visible when activeTab is register, covering login side) */}
        <div
          className={`absolute transition-all duration-500 flex flex-col items-center space-y-5 ${
            !isLogin ? "opacity-100 scale-100 relative" : "opacity-0 scale-95 pointer-events-none absolute"
          }`}
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight uppercase font-display">
              Welcome Back
            </h2>
          </div>
          
          <p className="text-xs text-white/80 leading-relaxed font-medium">
            Access the Procurement Management Information System of Batanes State College. Sign in using your registered institutional account.
          </p>

          <button
            type="button"
            onClick={() => onToggle("login")}
            className="btn rounded-md bg-white border-none hover:bg-neutral-100 text-[#7B1E1E] text-xs font-bold px-7 py-3 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
