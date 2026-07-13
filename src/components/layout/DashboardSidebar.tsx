"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
};

export default function DashboardSidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const navLinks: Record<string, NavItem[]> = {
    "Procurement Officer": [
      { label: "Overview", href: "/dashboard/officer" },
      { label: "Purchase Requests", href: "/dashboard/officer/pr" },
      { label: "Purchase Orders", href: "/dashboard/officer/po" },
      { label: "Analytics", href: "/dashboard/officer/analytics" },
    ],
    "Administrative Approver": [
      { label: "Overview", href: "/dashboard/approver" },
      { label: "Analytics", href: "/dashboard/approver/analytics" },
    ],
    "End User": [
      { label: "Overview", href: "/dashboard/end-user" },
      { label: "My PPMPs", href: "/dashboard/end-user/ppmp" },
      { label: "Purchase Requests", href: "/dashboard/end-user/pr" },
    ],
  };

  const links = navLinks[role] || [];

  return (
    <aside className="flex w-64 flex-col border-r border-slate-800 bg-[#0f172a] text-white shadow-xl">
      <div className="flex h-20 items-center border-b border-slate-800 px-6">
        <div className="text-lg font-bold tracking-wide">
          Procure<span className="text-yellow-400">Wise</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");

          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                isActive
                  ? "block rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-yellow-400 transition-all"
                  : "block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-white/5 hover:text-white"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4 text-xs text-slate-400">
        BSC Procurement System
      </div>
    </aside>
  );
}