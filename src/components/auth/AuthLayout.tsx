"use client";

import React from "react";
import HeroPanel from "./HeroPanel";
import styles from "@/app/login/login-sliding.module.css";

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
  const isLogin = activeTab === "login";

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4 selection:bg-primary/20">
      {/* ── Card ──────────────────────────────────────────────────────── */}
      <div
        className="bg-base-100 border border-base-300 flex flex-col overflow-hidden"
        style={{
          width: "min(980px, 95vw)",
          minHeight: "620px",
          borderRadius: "6px",
          boxShadow: "none",
        }}
      >
        {/* ── Desktop: sliding split panel ─────────────────────────── */}
        <div className="relative flex-1 hidden md:block overflow-hidden" style={{ minHeight: "620px" }}>

          {/* Login form — always left */}
          <div
            className={`${styles.formPanel} ${styles.formLeft} px-10 py-8 ${
              isLogin ? styles.formVisible : styles.formHidden
            }`}
          >
            {loginForm}
          </div>

          {/* Register form — always right */}
          <div
            className={`${styles.formPanel} ${styles.formRight} px-10 py-8 ${
              isLogin ? styles.formHidden : styles.formVisible
            }`}
          >
            {registerForm}
          </div>

          {/* Hero panel — slides over whichever form is inactive */}
          <div
            className={`${styles.heroPanel} ${
              isLogin ? styles.heroLogin : styles.heroRegister
            }`}
            style={{ width: "50%" }}
          >
            <HeroPanel activeTab={activeTab} onToggle={onToggleTab} />
          </div>
        </div>

        {/* ── Mobile: stacked ──────────────────────────────────────── */}
        <div className="flex-1 flex flex-col justify-center px-6 py-8 md:hidden">
          <div className="transition-all duration-300">
            {isLogin ? loginForm : registerForm}
          </div>
        </div>
      </div>

      {/* ── Version bar below card ────────────────────────────────── */}
      <div
        className="flex items-center justify-between w-full mt-3 px-2"
        style={{ maxWidth: "min(980px, 95vw)" }}
      >
        <span className="text-[10px] font-medium text-base-content/40 select-none">
          ProcureWise v2.0
        </span>
        <span className="text-[10px] font-medium text-base-content/40 select-none">
          © 2026 Batanes State College
        </span>
      </div>
    </div>
  );
}