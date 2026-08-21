"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck2,
  Truck,
  History,
  ScrollText,
  FileText,
  ShoppingCart,
  BarChart3,
  Star,
  Building2,
  TrendingUp,
  Settings,
  BookOpen,
  ClipboardList,
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
            label: "Pre-Canvass",
            href: "/dashboard/officer/pre-canvass",
            icon: ClipboardList,
          },
          {
            label: "RFQs",
            href: "/dashboard/officer/rfq",
            icon: FileCheck2,
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
            href: "/dashboard/officer/suppliers",
            icon: Building2,
          },
          {
            label: "Evaluation",
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
            href: "/dashboard/officer/reports",
            icon: BarChart3,
          },
        ],
      },
      {
        title: "CATALOG",
        items: [
          {
            label: "Product Catalog",
            href: "/dashboard/catalog",
            icon: BookOpen,
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
          {
            label: "Purchase Request Verification",
            href: "/dashboard/approver/pr",
            icon: FileCheck2,
          },
          {
            label: "Delivery Monitoring",
            href: "/dashboard/approver/deliveries",
            icon: Truck,
          },
          {
            label: "Verification History",
            href: "/dashboard/approver/history",
            icon: History,
          },
        ],
      },
      {
        title: "CATALOG",
        items: [
          { label: "Product Catalog", href: "/dashboard/catalog", icon: BookOpen },
        ],
      },
      {
        title: "REPORTS",
        items: [
          { label: "Reports", href: "/dashboard/approver/reports", icon: ScrollText },
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
          { label: "PPMP", href: "/dashboard/end-user/ppmp", icon: ClipboardList },
          { label: "Purchase Requests", href: "/dashboard/end-user/pr", icon: FileText },
          { label: "Package Review", href: "/dashboard/end-user/package-review", icon: FileCheck2 },
        ],
      },
      {
        title: "SUPPLIERS",
        items: [
          { label: "Supplier Quotations", href: "/dashboard/end-user/quotations", icon: ShoppingCart },
        ],
      },
      {
        title: "CATALOG",
        items: [
          { label: "Product Catalog", href: "/dashboard/end-user/catalog", icon: BookOpen },
        ],
      },
    ],
  };

  const sections = navConfig[role] || [];

  /** UI-friendly display names — DB role strings are unchanged */
  const roleDisplayNames: Record<string, string> = {
    "Procurement Officer": "Procurement Staff",
    "Administrative Approver": "Procurement Officer II",
    "End User": "End User",
  };
  const displayRole = roleDisplayNames[role] || role;

  return (
    <aside
      className="relative flex w-72 flex-col overflow-hidden shrink-0"
      style={{
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      {/* Brand Header Band */}
      <div className="h-[3px] w-full flex-shrink-0" style={{ background: "var(--gold)" }} />

      {/* Watermark Logo Background */}
      <Image
        src="/images/bsc-logo.png"
        alt=""
        width={420}
        height={420}
        className="pointer-events-none absolute -bottom-14 -left-20 opacity-[0.06] select-none"
      />

      {/* Brand Profile */}
      <div
        className="px-6 py-6"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="p-1 rounded bg-white shadow-none"
          >
            <Image
              src="/images/bsc-logo.png"
              alt="Batanes State College"
              width={64}
              height={64}
              priority
            />
          </div>

          <h1 className="mt-3 text-xl font-bold text-white font-display">
            Procure<span style={{ color: "var(--gold-light)" }}>Wise</span>
          </h1>

          <p
            className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em]"
            style={{ color: "var(--gold-light)" }}
          >
            Procurement Management
          </p>

          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>
            Batanes State College
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="relative flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {sections.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? "pt-4" : ""} style={idx > 0 ? { borderTop: "1px solid var(--sidebar-border)" } : undefined}>
            <div
              className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--sidebar-label)" }}
            >
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
                      isDisabled ? "opacity-35 cursor-not-allowed select-none" : ""
                    }`}
                    style={
                      isDisabled
                        ? undefined
                        : isActive
                        ? {
                            background: "var(--sidebar-active-bg)",
                            color: "var(--sidebar-active-text)",
                            fontWeight: 700,
                            borderLeft: "2px solid var(--gold)",
                            borderRadius: "4px 0 0 4px",
                          }
                        : { color: "var(--sidebar-item)" }
                    }
                    onMouseEnter={(e) => {
                      if (!isDisabled && !isActive) e.currentTarget.style.background = "var(--sidebar-item-hover-bg)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isDisabled && !isActive) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Icon
                      className="h-4.5 w-4.5 flex-shrink-0"
                      style={{
                        color: isActive ? "var(--gold-light)" : "currentColor",
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
      <div className="px-6 py-4" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        <div className="text-xs font-bold" style={{ color: "var(--gold-light)" }}>
          ProcureWise
        </div>
        <div className="mt-0.5 text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.55)" }}>
          Procurement Management System
        </div>
        {role && (
          <div
            className="mt-2 text-[9px] font-semibold uppercase tracking-wide leading-tight"
            style={{ color: "var(--sidebar-label)" }}
          >
            {displayRole}
          </div>
        )}
        <div className="mt-1 text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>
          © 2026 Batanes State College
        </div>
      </div>
    </aside>
  );
}
