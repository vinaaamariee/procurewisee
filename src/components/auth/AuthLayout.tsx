"use client";

import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import HeroPanel from "./HeroPanel";
import AuthFooter from "./AuthFooter";

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

      {/* Auth Card Container */}
      <div className="relative z-10 w-full max-w-[980px] min-h-[620px] bg-base-100 rounded-md border border-base-300 shadow-none flex flex-col overflow-hidden">
        
        {/* Desktop Split Sliding Layout */}
        <div className="relative flex-1 hidden md:flex min-h-[620px]">
          {/* Left panel slot (always Sign In) */}
          <div
            className={`w-1/2 flex items-center justify-center transition-all duration-500 ${
              activeTab === "login"
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
            aria-hidden={activeTab !== "login"}
          >
            {loginForm}
          </div>

          {/* Right panel slot (always Create Account) */}
          <div
            className={`w-1/2 flex items-center justify-center transition-all duration-500 ${
              activeTab === "register"
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
            aria-hidden={activeTab !== "register"}
          >
            {registerForm}
          </div>

          {/* Sliding Cover Overlay Banner */}
          <HeroPanel activeTab={activeTab} onToggle={onToggleTab} />
        </div>

        {/* Mobile Layout (No slide, clean switcher card) */}
        <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 md:hidden">
          <div className="transition-all duration-300">
            {activeTab === "login" ? loginForm : registerForm}
          </div>
        </div>
      </div>

      {/* Global minimal footer */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md mt-6">
        <AuthFooter />
      </div>
    </div>
  );
}
