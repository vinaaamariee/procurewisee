"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface MobileNavProps {
  links: Array<{ label: string; href: string }>;
}

export default function MobileNav({ links }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors md:hidden"
        style={{
          borderColor: "var(--border)",
          color: "var(--text-primary)",
          background: "var(--surface)",
        }}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-16 z-40 w-full border-b shadow-lg md:hidden"
          style={{
            background: "var(--bg-header)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex flex-col gap-1 px-4 py-3">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: "var(--text-secondary)" }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="mt-2 flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-bold transition-all"
              style={{
                borderColor: "var(--border)",
                color: "var(--accent)",
                background: "var(--surface)",
              }}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
