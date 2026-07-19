"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  ShoppingCart,
  BarChart3,
  Users,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: any;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

export default function DashboardSidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const navConfig: Record<string, NavSection[]> = {
    "Procurement Officer": [
      {
        title: "Overview",
        items: [
          {
            label: "Dashboard",
            href: "/dashboard/officer",
            icon: LayoutDashboard,
          },
        ],
      },
      {
        title: "Procurement",
        items: [
          {
            label: "Purchase Requests",
            href: "/dashboard/officer/pr",
            icon: FileText,
          },
          {
            label: "RFQs",
            href: "/dashboard/officer/rfq",
            icon: ClipboardList,
          },
          {
            label: "Purchase Orders",
            href: "/dashboard/officer/po",
            icon: ShoppingCart,
          },
        ],
      },
      {
        title: "Analytics",
        items: [
          {
            label: "Reports & Insights",
            href: "/dashboard/officer/analytics",
            icon: BarChart3,
          },
        ],
      },
      {
        title: "Management",
        items: [
          {
            label: "Supplier Profiles",
            href: "/dashboard/supplier-profiles",
            icon: Users,
          },
        ],
      },
    ],
  };

  const sections = navConfig[role] || [];

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 bg-slate-900 text-slate-200 shadow-sm">
      
      {/* Brand */}
      <div className="flex h-20 items-center border-b border-slate-800 px-6">
        <div>
          <div className="text-lg font-semibold tracking-tight text-white">
            Procure<span className="text-amber-400">Wise</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">
            Batanes State College
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">

        {sections.map((section) => (
          <div key={section.title}>
            <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {section.title}
            </div>

            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition ${
                      isActive
                        ? "bg-slate-800 text-white"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-amber-400" />
                    )}

                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? "text-amber-400"
                          : "text-slate-400 group-hover:text-white"
                      }`}
                    />

                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-4 text-xs text-slate-500">
        Procurement Management System
      </div>
    </aside>
  );
}