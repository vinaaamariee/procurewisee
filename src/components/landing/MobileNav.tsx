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
        className="btn btn-square btn-ghost btn-sm md:hidden"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="fixed inset-x-0 top-24 z-40 border-b-2 border-primary bg-base-100 md:hidden">
          <div className="flex flex-col gap-1 px-4 py-5 max-w-7xl mx-auto">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-sm font-bold text-base-content hover:bg-base-200"
              >
                <span>{link.label}</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-gray-100 dark:border-slate-800">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="btn btn-primary btn-block rounded-field text-sm font-bold"
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
