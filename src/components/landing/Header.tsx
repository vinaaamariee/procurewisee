"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogIn, ArrowRight, FileText, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-base-100/95 backdrop-blur border-b border-base-200 shadow-sm transition-colors">
      <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20">
        {/* Navbar Start: Brand */}
        <div className="navbar-start">
          <Link href="/" className="flex items-center gap-3 group no-underline">
            <div className="relative h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-base-200">
              <Image
                src="/images/bsc-logo.png"
                alt="Batanes State College Logo"
                width={40}
                height={40}
                className="object-contain h-full w-full"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-base font-black tracking-tight text-[#7B1E1E] leading-tight">
                Batanes State College
              </div>
              <div className="text-xs font-bold text-[#A6761D] leading-tight">
                Procurement Management Information System
              </div>
            </div>
          </Link>
        </div>

        {/* Navbar Center: Navigation Links */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1 font-semibold text-sm">
            <li>
              <a href="#workflow" className="hover:text-[#7B1E1E] active:bg-[#7B1E1E]/10">
                Workflow
              </a>
            </li>
            <li>
              <a href="#features" className="hover:text-[#7B1E1E] active:bg-[#7B1E1E]/10">
                Features
              </a>
            </li>
            <li>
              <a href="#roles" className="hover:text-[#7B1E1E] active:bg-[#7B1E1E]/10">
                User Roles
              </a>
            </li>
            <li>
              <Link href="/catalog" className="hover:text-[#7B1E1E] active:bg-[#7B1E1E]/10">
                Public Catalog
              </Link>
            </li>
            <li>
              <Link href="/track" className="hover:text-[#7B1E1E] active:bg-[#7B1E1E]/10">
                Track Request
              </Link>
            </li>
          </ul>
        </div>

        {/* Navbar End: Actions */}
        <div className="navbar-end gap-2 sm:gap-3">
          <ThemeToggle />

          <Link
            href="/catalog"
            className="btn btn-ghost btn-sm hidden sm:inline-flex rounded-lg text-xs font-bold text-base-content/80 hover:text-[#7B1E1E]"
          >
            <Search className="h-4 w-4 text-[#A6761D]" />
            <span className="hidden xl:inline">Search Supplies</span>
          </Link>

          <Link
            href="/login"
            className="btn btn-outline btn-sm rounded-lg border-[#7B1E1E] text-[#7B1E1E] hover:bg-[#7B1E1E] hover:text-white font-bold"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </Link>

          <Link
            href="/login"
            className="btn btn-primary btn-sm rounded-lg bg-[#7B1E1E] hover:bg-[#601717] text-white border-none font-bold hidden sm:inline-flex shadow-sm"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}