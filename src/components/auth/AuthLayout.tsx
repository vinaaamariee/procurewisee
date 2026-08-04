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
      <div className="w-full max-w-[1380px] w-[95%] min-h-[820px] bg-white rounded-[22px] border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden">
        <div className="relative flex-1 hidden md:flex min-h-[820px]">
          <div className="w-[48%] bg-white p-[64px] flex flex-col justify-center overflow-y-auto">
            {activeTab === "login" ? loginForm : registerForm}
          </div>
          <div className="w-[52%]">
            <HeroPanel activeTab={activeTab} onToggle={onToggleTab} />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 md:hidden">
          <div className="transition-all duration-300">
            {activeTab === "login" ? loginForm : registerForm}
          </div>
        </div>

        <AuthFooter />
      </div>
    </div>
  );
}

function AuthFooter() {
  return (
    <div className="h-[64px] min-h-[64px] bg-[#7B1E1E] text-white flex items-center justify-center px-6 border-t-[3px] border-[#C89B3C] z-30">
      <div className="flex items-center gap-8 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#C89B3C]" />
          <span>Secure Access</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-[#C89B3C]" />
          <span>Protected Data</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Headset className="w-4 h-4 text-[#C89B3C]" />
          <span>Support</span>
        </div>
      </div>
    </div>
  );
}