"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-4 border-secondary bg-neutral text-neutral-content">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center bg-white p-1">
              <Image
                src="/images/bsc-logo.png"
                alt="Batanes State College Logo"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="font-bold">Batanes State College</p>
              <p className="text-xs text-neutral-content/65">Procurement Management Information System</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs text-neutral-content/75 sm:items-end">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-secondary" />
              San Antonio, Basco, Batanes
            </span>
            <a className="flex items-center gap-2 hover:text-secondary" href="mailto:procurement@bsc.edu.ph">
              <Mail className="h-4 w-4 text-secondary" />
              procurement@bsc.edu.ph
            </a>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-neutral-content/20 pt-4 text-xs text-neutral-content/55 sm:flex-row">
          <span>© {currentYear} Batanes State College</span>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-secondary">Privacy</Link>
            <Link href="/login" className="font-semibold text-secondary">Institutional sign in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
