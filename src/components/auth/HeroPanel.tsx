"use client";

import React from "react";

interface HeroPanelProps {
  activeTab: "login" | "register";
  onToggle: (tab: "login" | "register") => void;
}

export default function HeroPanel({ activeTab, onToggle }: HeroPanelProps) {
  const isLogin = activeTab === "login";

  return (
    <div
      className={`absolute inset-y-0 left-0 w-1/2 bg-[#7B1E1E] text-white flex flex-col justify-center items-center p-12 text-center select-none transition-transform duration-500 ease-in-out z-20 hidden md:flex ${
        isLogin ? "translate-x-full" : "translate-x-0"
      }`}
    >
      {/* Decorative background watermark */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[400px] h-[400px] rounded-full border-[30px] border-white" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center justify-center h-full space-y-6">
        {/* Register Hero: Shown when activeTab is login (overlay is on the right, prompting registration) */}
        <div
          className={`absolute transition-all duration-500 flex flex-col items-center space-y-6 ${
            isLogin ? "opacity-100 scale-100 relative" : "opacity-0 scale-95 pointer-events-none absolute"
          }`}
        >
          <h2 className="text-2xl font-bold tracking-tight uppercase font-display">
            New to ProcureWise?
          </h2>
          <p className="text-xs text-white/80 leading-relaxed font-medium">
            Create an End User account to submit Purchase Requests, monitor procurement activities, and access institutional procurement services.
          </p>
          <button
            type="button"
            onClick={() => onToggle("register")}
            className="btn btn-outline border-white hover:bg-white hover:text-[#7B1E1E] text-white text-xs font-bold px-6 py-2.5 rounded-md transition-colors"
          >
            Create Account
          </button>
        </div>

        {/* Login Hero: Shown when activeTab is register (overlay is on the left, prompting login) */}
        <div
          className={`absolute transition-all duration-500 flex flex-col items-center space-y-6 ${
            !isLogin ? "opacity-100 scale-100 relative" : "opacity-0 scale-95 pointer-events-none absolute"
          }`}
        >
          <h2 className="text-2xl font-bold tracking-tight uppercase font-display">
            Welcome Back
          </h2>
          <p className="text-xs text-white/80 leading-relaxed font-medium">
            Access the Procurement Management Information System of Batanes State College. Sign in using your registered institutional account.
          </p>
          <button
            type="button"
            onClick={() => onToggle("login")}
            className="btn btn-outline border-white hover:bg-white hover:text-[#7B1E1E] text-white text-xs font-bold px-6 py-2.5 rounded-md transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
