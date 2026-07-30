"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogIn, ArrowRight, Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-base-100/95 backdrop-blur border-b border-base-200 shadow-sm transition-colors">
      <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
        {/* Left: Mobile Dropdown & Brand */}
        <div className="navbar-start gap-2">
          {/* Mobile Menu Dropdown */}
          <div className="dropdown lg:hidden">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm" aria-label="Toggle Navigation Menu">
              <Menu className="h-5 w-5" />
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-200 font-semibold"
            >
              <li>
                <a href="#workflow">Workflow</a>
              </li>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#roles">User Roles</a>
              </li>
              <li>
                <Link href="/catalog">Catalog</Link>
              </li>
              <li>
                <Link href="/track">Track Request</Link>
              </li>
            </ul>
          </div>

          {/* College Branding */}
          <Link href="/" className="flex items-center gap-3 group no-underline">
            <div className="relative h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-base-200">
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
              <div className="text-sm sm:text-base font-black tracking-tight text-[#7B1E1E] leading-tight">
                Batanes State College
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-[#A6761D] leading-tight">
                Procurement Management Information System
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1 font-bold text-sm">
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
                Catalog
              </Link>
            </li>
            <li>
              <Link href="/track" className="hover:text-[#7B1E1E] active:bg-[#7B1E1E]/10">
                Track Request
              </Link>
            </li>
          </ul>
        </div>

        {/* Right: Actions */}
        <div className="navbar-end gap-2">
          <ThemeToggle />

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