"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral text-neutral-content border-t border-neutral-content/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Institutional Branding (span 2) */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-white p-1 shadow-sm">
                <Image
                  src="/images/bsc-logo.png"
                  alt="Batanes State College Logo"
                  width={44}
                  height={44}
                  className="object-contain h-full w-full"
                />
              </div>
              <div>
                <div className="text-lg font-black tracking-tight text-white">
                  Batanes State College
                </div>
                <div className="text-xs font-bold text-[#A6761D]">
                  Procurement Management Information System
                </div>
                <div className="text-[10px] uppercase font-bold text-neutral-content/50">
                  Powered by ProcureWise
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-content/70 leading-relaxed max-w-md">
              The official internal digital platform for institutional procurement management at Batanes State College,
              in full compliance with Republic Act No. 9184, the Government Procurement Reform Act.
              Access is restricted to authenticated institutional users only.
            </p>

            <div className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-neutral-content/80 font-medium">
              <ShieldCheck className="h-4 w-4 text-[#A6761D]" />
              <span>RA 9184 Compliant · Authenticated Access Only</span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#A6761D]">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs font-semibold text-neutral-content/80">
              <li>
                <a href="#workflow" className="hover:text-white transition-colors">Procurement Workflow</a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">System Features</a>
              </li>
              <li>
                <a href="#roles" className="hover:text-white transition-colors">User Roles</a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">About the System</a>
              </li>
              <li>
                <a href="#help" className="hover:text-white transition-colors">Help & FAQs</a>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors text-[#A6761D] font-bold">
                  Institutional Sign In →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#A6761D]">
              Contact Information
            </h3>
            <div className="space-y-2.5 text-xs text-neutral-content/80 font-normal">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#A6761D] flex-shrink-0 mt-0.5" />
                <span>San Antonio, Basco, Batanes, 3900 Philippines</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#A6761D] flex-shrink-0" />
                <span>procurement@bsc.edu.ph</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#A6761D] flex-shrink-0" />
                <span>(078) 533-3000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="divider divider-neutral my-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-content/50 font-medium">
          <div>
            © {currentYear} Batanes State College. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-neutral-content/80 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about" className="hover:text-neutral-content/80 transition-colors">
              Terms of Use
            </Link>
            <span>Powered by ProcureWise</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
