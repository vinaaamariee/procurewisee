import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import MobileNav from "./MobileNav";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Procurement Catalog", href: "/catalog" },
  { label: "Track Request", href: "/track" },
  { label: "About", href: "#about" },
];

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-xl animate-fade-in"
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
          className="flex items-center gap-3 no-underline"
          aria-label="ProcureWise Home"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border bg-white font-black text-sm shadow-md dark:bg-[#1e293b]" style={{ borderColor: "var(--border)" }}>
            <span style={{ color: "var(--maroon)" }}>P</span>
            <span style={{ color: "var(--gold)" }}>W</span>
          </div>
          <div>
            <div className="text-base font-extrabold leading-tight tracking-tight" style={{ color: "var(--text-primary)" }}>
              ProcureWise
            </div>
            <div className="text-[0.65rem] uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
              Batanes State College
            </div>
          </div>
        </Link>

        {/* ── Desktop Links ── */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--text-secondary)" }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold transition-all hover:shadow-md md:flex"
            style={{
              borderColor: "var(--border)",
              color: "var(--accent)",
              background: "var(--surface)",
            }}
          >
            Login
          </Link>
          {/* Mobile hamburger */}
          <MobileNav links={navLinks} />
        </div>
      </nav>
    </header>
  );
}
