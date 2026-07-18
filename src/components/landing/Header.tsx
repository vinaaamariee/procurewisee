"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import MobileNav from "./MobileNav";

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
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{
        background: "var(--bg-header)",
        borderColor: "var(--border)",
      }}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* ── Brand ── */}
        <Link
          href="/"
          className="group flex items-center gap-3 no-underline"
          aria-label="ProcureWise Home"
        >
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border bg-white font-black text-sm shadow-sm transition-transform group-hover:scale-105 dark:bg-[#1e293b]"
            style={{ borderColor: "var(--border)" }}
          >
            <span style={{ color: "var(--maroon)" }}>P</span>
            <span style={{ color: "var(--gold)" }}>W</span>
          </div>
          <div className="hidden sm:block">
            <div
              className="text-base font-extrabold leading-tight tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              ProcureWise
            </div>
            <div
              className="text-[0.65rem] uppercase tracking-[0.15em] font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Batanes State College
            </div>
          </div>
        </Link>

        {/* ── Desktop Links ── */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className="relative rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                  color: active ? "var(--maroon)" : "var(--text-secondary)",
                }}
              >
                {link.label}
                {active && (
                  <span
                    className="absolute -bottom-[21px] left-1/2 h-[2.5px] w-8 -translate-x-1/2 rounded-full"
                    style={{ background: "var(--maroon)" }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold transition-all hover:shadow-md hover:-translate-y-0.5 md:flex"
            style={{
              borderColor: "var(--maroon)",
              color: "var(--maroon)",
              background: "var(--surface)",
            }}
          >
            Login
          </Link>
          <MobileNav links={navLinks} />
        </div>
      </nav>
    </header>
  );
}