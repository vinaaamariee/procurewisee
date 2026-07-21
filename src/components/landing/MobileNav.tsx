"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogIn, ChevronRight } from "lucide-react";

interface MobileNavProps {
  links: Array<{ label: string; href: string }>;
}

export default function MobileNav({ links }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 md:hidden"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="fixed inset-x-0 top-20 z-40 border-b border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl md:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1 px-4 py-5 max-w-7xl mx-auto">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <span>{link.label}</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-gray-100 dark:border-slate-800">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#7B1E1E] hover:bg-[#5E1414] text-white px-5 py-3 text-sm font-bold shadow-md transition-all"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In to Portal</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
