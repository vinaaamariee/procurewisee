"use client";

import React from "react";
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
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col items-center justify-center p-4 selection:bg-[#7B1E1E]/20">
      <div
        className="bg-white rounded-[22px] border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden"
        style={{
          width: "min(1600px, 96vw)",
          minHeight: "min(900px, 92vh)",
        }}
      >
        {/* Desktop two-column layout */}
        <div className="relative flex-1 hidden md:flex" style={{ minHeight: "min(828px, calc(92vh - 72px))" }}>
          {/* Left panel — 48% */}
          <div className="w-[48%] bg-white flex flex-col justify-center overflow-y-auto">
            <div className="px-[56px] py-[40px]">
              {activeTab === "login" ? loginForm : registerForm}
            </div>

            {/* Bottom version bar */}
            <div className="px-[56px] pb-4 flex items-center justify-between text-[10px] text-[#6B7280] font-medium select-none">
              <span>ProcureWise v2.0</span>
              <span>© 2026 Batanes State College</span>
            </div>
          </div>

          {/* Right panel — 52% */}
          <div className="w-[52%]">
            <HeroPanel activeTab={activeTab} onToggle={onToggleTab} />
          </div>
        </div>

        {/* Mobile single-column layout */}
        <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 md:hidden">
          <div className="transition-all duration-300">
            {activeTab === "login" ? loginForm : registerForm}
          </div>
        </div>

        {/* Footer */}
        <AuthFooter />
      </div>
    </div>
  );
}

function AuthFooter() {
  return (
    <div
      className="bg-[#7B1E1E] text-white flex items-center justify-center px-6 border-t-[3px] border-[#C89B3C] z-30"
      style={{ height: "72px", minHeight: "72px" }}
    >
      <div className="flex items-center gap-10 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-[18px] h-[18px] text-[#C89B3C]" />
          <span>Secure Access</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-[18px] h-[18px] text-[#C89B3C]" />
          <span>Protected Data</span>
        </div>
        <div className="flex items-center gap-2">
          <Headset className="w-[18px] h-[18px] text-[#C89B3C]" />
          <span>Support</span>
        </div>
      </div>
    </div>
  );
}