"use client";

import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import HeroPanel from "./HeroPanel";
import { ShieldCheck, Lock, Headset } from "lucide-react";

interface AuthLayoutProps {
  activeTab: "login" | "register";
  onToggleTab: (tab: "login" | "register") => void;
  loginForm: React.ReactNode;
  registerForm: React.ReactNode;
}

export default function AuthLayout({
  activeTab,
  onToggleTab,
  loginForm,
  registerForm,
}: AuthLayoutProps) {
  return (
    <div
      data-theme="bsc"
      className="min-h-screen bg-[#F6F7F9] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative selection:bg-[#7B1E1E]/20"
    >
      {/* Theme Toggle (positioned top-right) */}
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-[1280px] w-[95%] min-h-[760px] bg-white dark:bg-slate-950 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden">
        
        {/* Desktop Split Panel (visible md and up) */}
        <div className="relative flex-1 hidden md:flex min-h-[704px]">
          {/* Left panel slot (occupies 45% width, always LoginForm background white) */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-[45%] flex items-center justify-center bg-white dark:bg-slate-950 transition-all duration-500 ${
              activeTab === "login"
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
            aria-hidden={activeTab !== "login"}
          >
            {loginForm}
          </div>

          {/* Right panel slot (occupies 55% width, always RegisterForm background white) */}
          <div
            className={`absolute right-0 top-0 bottom-0 w-[55%] flex items-center justify-center bg-white dark:bg-slate-950 transition-all duration-500 ${
              activeTab === "register"
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
            aria-hidden={activeTab !== "register"}
          >
            {registerForm}
          </div>

          {/* Sliding Morphing Overlay (Dynamic 55% / 45% cover panel) */}
          <HeroPanel activeTab={activeTab} onToggle={onToggleTab} />
        </div>

        {/* Mobile Stacked Layout */}
        <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 md:hidden">
          <div className="transition-all duration-300">
            {activeTab === "login" ? loginForm : registerForm}
          </div>
        </div>

        {/* Institutional 56px footer bar */}
        <div className="h-[56px] min-h-[56px] bg-[#7B1E1E] text-white flex items-center justify-between px-6 sm:px-8 text-xs font-semibold select-none border-t border-red-950/20 z-30">
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C89B3C]" />
              <span>Shield Secure Access</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#C89B3C]" />
              <span>Lock Protected Data</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Headset className="w-4 h-4 text-[#C89B3C]" />
              <span>IT Help Desk</span>
            </div>
          </div>
          <div className="w-full sm:w-auto text-center sm:text-right">
            <span>© 2026 Batanes State College</span>
          </div>
        </div>

      </div>
    </div>
  );
}
