import Link from "next/link";
import { Package } from "lucide-react";

const usefulLinks = [
  { label: "Procurement Catalog", href: "/catalog" },
  { label: "Track Request", href: "/track" },
  { label: "Submit Purchase Request", href: "/end-user" },
  { label: "Login Portal", href: "/login" },
];

const systemLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Price Comparison", href: "/price-comparison" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-slate-800 bg-[#F7F8FA] dark:bg-slate-950 text-[#111827] dark:text-slate-100 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* ── College Information ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7B1E1E] to-[#5E1414] text-white font-black text-base shadow-md">
                <Package className="h-5.5 w-5.5 text-[#D4A017]" />
              </div>
              <div>
                <div className="text-lg font-black tracking-tight text-[#111827] dark:text-white">
                  <span className="text-[#7B1E1E] dark:text-red-400">Procure</span>
                  <span className="text-[#D4A017]">Wise</span>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#6B7280] dark:text-slate-400">
                  Batanes State College
                </div>
              </div>
            </div>
            <p className="max-w-md text-sm text-[#6B7280] dark:text-slate-400 leading-relaxed">
              An Intelligent Procurement Analytics and Automated Canvassing
              System with Best-Value Recommendation Engine. Modernizing
              government procurement for transparency and efficiency.
            </p>
          </div>

          {/* ── Useful Links ── */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#7B1E1E] dark:text-red-400">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {usefulLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B7280] dark:text-slate-400 hover:text-[#7B1E1E] dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── System ── */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#7B1E1E] dark:text-red-400">
              System
            </h3>
            <ul className="space-y-2.5">
              {systemLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B7280] dark:text-slate-400 hover:text-[#7B1E1E] dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1 text-xs font-bold text-[#6B7280] dark:text-slate-400 shadow-sm">
                  v0.1.0
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-12 border-t border-gray-200 dark:border-slate-800 pt-8 text-center text-xs font-medium text-[#6B7280] dark:text-slate-500">
          © {currentYear} ProcureWise — Batanes State College. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
