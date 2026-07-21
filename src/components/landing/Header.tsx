"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import MobileNav from "./MobileNav";
import { Search, LogIn, Package } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Procurement Catalog", href: "/catalog" },
  { label: "Track Request", href: "/track" },
  { label: "About", href: "#about" },
];

export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("#")) return false;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl transition-colors">
      <nav
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* ── Brand ── */}
        <Link
          href="/"
          className="group flex items-center gap-3.5 no-underline"
          aria-label="ProcureWise Home"
        >
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7B1E1E] to-[#5E1414] text-white font-black text-base shadow-md transition-transform duration-200 group-hover:scale-105">
            <Package className="h-5.5 w-5.5 text-[#D4A017]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-lg font-black tracking-tight text-[#111827] dark:text-white leading-tight">
              <span className="text-[#7B1E1E] dark:text-red-400">Procure</span>
              <span className="text-[#D4A017]">Wise</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] dark:text-slate-400 leading-tight">
              Batanes State College
            </div>
          </div>
        </Link>

        {/* ── Desktop Navigation ── */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "text-[#7B1E1E] dark:text-[#D4A017] bg-[#7B1E1E]/5 dark:bg-[#D4A017]/10"
                    : "text-[#6B7280] dark:text-slate-300 hover:text-[#111827] dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-slate-800/60"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-[#7B1E1E] dark:bg-[#D4A017]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-3">
          {/* Catalog Quick Search Trigger (Desktop) */}
          <Link
            href="/catalog"
            className="hidden items-center gap-2 rounded-full border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-[#6B7280] dark:text-slate-400 hover:border-[#7B1E1E]/30 transition-all lg:flex"
            aria-label="Quick search catalog"
          >
            <Search className="h-3.5 w-3.5 text-[#7B1E1E]" />
            <span>Search supplies...</span>
          </Link>

          <ThemeToggle />

          <Link
            href="/login"
            className="hidden items-center gap-2 rounded-full bg-[#7B1E1E] hover:bg-[#5E1414] text-white px-5 py-2.5 text-xs font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 md:flex"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </Link>

          <MobileNav links={navLinks} />
        </div>
      </nav>
    </header>
  );
}