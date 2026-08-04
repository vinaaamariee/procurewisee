"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  ShoppingCart,
  BarChart3,
  Users,
  FileCheck2,
  Workflow,
  ClipboardCheck,
  ScrollText,
  ChartNoAxesCombined,
  CalendarDays,
  Star,
  Sparkles,
  ListOrdered,
  Settings,
  TrendingUp,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: any;
  disabled?: boolean;
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
        title: "MAIN",
        items: [
          {
            label: "Dashboard",
            href: "/dashboard/officer",
            icon: LayoutDashboard,
          },
        ],
      },
      {
        title: "PROCUREMENT",
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
        title: "SUPPLIERS",
        items: [
          {
            label: "Suppliers",
            href: "/dashboard/supplier-profiles",
            icon: Users,
          },
          {
            label: "Evaluations",
            href: "/dashboard/officer/evaluations",
            icon: Star,
          },
        ],
      },
      {
        title: "REPORTS",
        items: [
          {
            label: "Forecasting",
            href: "/dashboard/officer/forecast",
            icon: TrendingUp,
          },
          {
            label: "Reports",
            href: "/dashboard/officer/analytics",
            icon: BarChart3,
          },
        ],
      },
      {
        title: "SETTINGS",
        items: [
          {
            label: "Settings",
            href: "/dashboard/officer/settings",
            icon: Settings,
          },
        ],
      },
    ],
    "Administrative Approver": [
      {
        title: "MAIN",
        items: [
          { label: "Dashboard", href: "/dashboard/approver", icon: LayoutDashboard },
          { label: "Review History", href: "/dashboard/approver/history", icon: FileCheck2 },
        ],
      },
      {
        title: "PROCUREMENT",
        items: [
          { label: "Workflows", href: "/dashboard/approver/workflows", icon: Workflow },
          { label: "Form Templates", href: "/dashboard/approver/forms", icon: ClipboardCheck },
        ],
      },
      {
        title: "REPORTS",
        items: [
          { label: "Reports", href: "/dashboard/approver/reports", icon: ScrollText },
          { label: "Analytics", href: "/dashboard/approver/analytics", icon: ChartNoAxesCombined },
        ],
      },
    ],
    "End User": [
      {
        title: "MAIN",
        items: [
          { label: "Dashboard", href: "/dashboard/end-user", icon: LayoutDashboard },
        ],
      },
      {
        title: "PROCUREMENT",
        items: [
          { label: "Purchase Requests", href: "/dashboard/end-user/pr", icon: FileText },
        ],
      },
      {
        title: "SUPPLIERS",
        items: [
          { label: "Evaluations", href: "/dashboard/end-user/evaluation", icon: Star },
        ],
      },
    ],
  };

  const sections = navConfig[role] || [];

  return (
    <aside
      className="relative flex w-72 flex-col overflow-hidden bg-base-100 border-r border-base-300 shadow-none shrink-0"
    >
      {/* Brand Header Band */}
      <div className="h-[3px] w-full flex-shrink-0 bg-primary" />

      {/* Watermark Logo Background */}
      <Image
        src="/images/bsc-logo.png"
        alt=""
        width={420}
        height={420}
        className="pointer-events-none absolute -bottom-14 -left-20 opacity-[0.02] dark:opacity-[0.04] select-none"
      />

      {/* Brand Profile */}
      <div className="border-b border-base-300 px-6 py-6 bg-base-100/50">
        <div className="flex flex-col items-center text-center">
          <div className="p-1 border border-base-300 rounded bg-base-100 shadow-none">
            <Image
              src="/images/bsc-logo.png"
              alt="Batanes State College"
              width={64}
              height={64}
              priority
            />
          </div>

          <h1
            className="mt-3 text-xl font-bold text-base-content font-display"
          >
            Procure<span className="text-primary">Wise</span>
          </h1>

          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-primary">
            Procurement Management
          </p>

          <p className="text-[10px] text-base-content/60">
            Batanes State College
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="relative flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {sections.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? "pt-4 border-t border-base-200" : ""}>
            <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-base-content/40">
              {section.title}
            </div>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isOverview = item.label === "Dashboard";
                const isActive =
                  item.href !== "#" && (
                    pathname === item.href ||
                    (!isOverview && pathname.startsWith(item.href + "/"))
                  );
                const isDisabled = item.disabled;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      if (isDisabled || item.href === "#") {
                        e.preventDefault();
                      }
                    }}
                    className={`group relative flex items-center gap-3 rounded-md px-3.5 py-2 text-xs transition-colors duration-100 ${
                      isDisabled
                        ? "opacity-35 cursor-not-allowed select-none"
                        : isActive
                        ? "bg-primary/10 text-primary font-bold border-l-2 border-primary rounded-l-none"
                        : "text-base-content/75 hover:bg-base-200 hover:text-base-content"
                    }`}
                  >
                    <Icon
                      className="h-4.5 w-4.5 flex-shrink-0"
                      style={{
                        color: isActive ? "var(--color-primary)" : "currentColor",
                      }}
                    />

                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="border-t border-base-300 px-6 py-4 bg-base-100/50">
        <div className="text-xs font-bold text-primary">
          ProcureWise
        </div>
        <div className="mt-0.5 text-[10px] text-base-content/50 leading-tight">
          Procurement Management System
        </div>
        <div className="mt-2 text-[9px] text-base-content/40">
          © 2026 Batanes State College
        </div>
      </div>
    </aside>
  );
}
