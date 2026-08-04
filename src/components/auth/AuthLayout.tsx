"use client";

import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import HeroPanel from "./HeroPanel";

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
      className="min-h-screen bg-base-200 text-base-content flex flex-col items-center justify-center p-4 sm:p-6 relative selection:bg-primary/20"
    >
      {/* Subtle background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#A6761D]/5 blur-3xl" />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>

      {/* Large Auth Card Container */}
      <div className="relative z-10 w-full max-w-[1200px] w-[min(1200px,95vw)] min-h-[720px] bg-base-100 rounded-md border border-base-300 shadow-none flex flex-col overflow-hidden">
        
        {/* Desktop Split Sliding Layout */}
        <div className="relative flex-1 hidden md:flex min-h-[660px]">
          {/* Left panel slot (always Sign In - occupying 42% width) */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-[42%] flex items-center justify-center transition-all duration-500 ${
              activeTab === "login"
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
            aria-hidden={activeTab !== "login"}
          >
            {loginForm}
          </div>

          {/* Right panel slot (always Create Account - occupying 42% width) */}
          <div
            className={`absolute right-0 top-0 bottom-0 w-[42%] flex items-center justify-center transition-all duration-500 ${
              activeTab === "register"
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
            aria-hidden={activeTab !== "register"}
          >
            {registerForm}
          </div>

          {/* Sliding Cover Overlay Banner (occupying 58% width) */}
          <HeroPanel activeTab={activeTab} onToggle={onToggleTab} />
        </div>

        {/* Mobile Layout (No slide, clean switcher card) */}
        <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 md:hidden">
          <div className="transition-all duration-300">
            {activeTab === "login" ? loginForm : registerForm}
          </div>
        </div>

        {/* Bottom Information Anchor Bar (mockup alignment) */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 py-4 border-t border-base-300 text-[10px] font-bold text-base-content/40 uppercase tracking-widest bg-base-100 select-none">
          <span>Secure Access</span>
          <span className="text-[#B8860B]">◆</span>
          <span>Protected Data</span>
          <span className="text-[#B8860B]">◆</span>
          <span>Help Desk</span>
          <span className="text-[#B8860B]">◆</span>
          <span>Batanes State College</span>
        </div>
      </div>
    </div>
  );
}
