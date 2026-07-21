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
            label: "Annual Procurement Plan",
            href: "/dashboard/officer/app",
            icon: ClipboardList,
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
        title: "REPORTING",
        items: [
          {
            label: "Reports & Insights",
            href: "/dashboard/officer/analytics",
            icon: BarChart3,
          },
        ],
      },
      {
        title: "ADMINISTRATION",
        items: [
          {
            label: "Supplier Profiles",
            href: "/dashboard/supplier-profiles",
            icon: Users,
          },
        ],
      },
    ],
    "Administrative Approver": [
      {
        title: "Overview",
        items: [
          { label: "Dashboard", href: "/dashboard/approver", icon: LayoutDashboard },
          { label: "Review History", href: "/dashboard/approver/history", icon: FileCheck2 },
        ],
      },
      {
        title: "Governance",
        items: [
          { label: "Workflows", href: "/dashboard/approver/workflows", icon: Workflow },
          { label: "Form Templates", href: "/dashboard/approver/forms", icon: ClipboardCheck },
        ],
      },
      {
        title: "Reporting",
        items: [
          { label: "Reports", href: "/dashboard/approver/reports", icon: ScrollText },
          { label: "Analytics", href: "/dashboard/approver/analytics", icon: ChartNoAxesCombined },
        ],
      },
    ],
    "End User": [
      {
        title: "Overview",
        items: [
          { label: "Dashboard", href: "/dashboard/end-user", icon: LayoutDashboard },
        ],
      },
      {
        title: "My Planning",
        items: [
          { label: "PPMP Planning", href: "/dashboard/end-user/ppmp", icon: CalendarDays },
          { label: "Purchase Requests", href: "/dashboard/end-user/pr", icon: FileText },
          { label: "Supplier Evaluation", href: "/dashboard/end-user/evaluation", icon: Star },
        ],
      },
    ],
  };

  const sections = navConfig[role] || [];

  return (
    <aside
      className="relative flex w-72 flex-col overflow-hidden shadow-lg"
      style={{
        background:
          "linear-gradient(180deg, #0B3B6E 0%, #08284F 100%)",
        borderRight: "1px solid rgba(255,255,255,.08)",
      }}
    >
      {/* Accent Bar */}
      <div
        className="h-[4px] w-full flex-shrink-0"
        style={{
          background:
            "linear-gradient(90deg,#0B3B6E 0 34%,#D4A017 34% 67%,#B7202E 67% 100%)",
        }}
      />

      {/* Watermark */}
      <Image
        src="/images/bsc-logo.png"
        alt=""
        width={420}
        height={420}
        className="pointer-events-none absolute -bottom-14 -left-20 opacity-[0.04] select-none"
      />

      {/* Brand */}
      <div
        className="border-b px-6 py-8"
        style={{
          borderColor: "rgba(255,255,255,.08)",
        }}
      >
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/bsc-logo.png"
            alt="Batanes State College"
            width={72}
            height={72}
            priority
          />

          <h1
            className="mt-4 text-2xl font-bold text-white"
            style={{
              fontFamily: "var(--font-display)",
            }}
          >
            Procure
            <span style={{ color: "#D4A017" }}>Wise</span>
          </h1>

          <p
            className="mt-2 text-[11px] uppercase tracking-[0.18em]"
            style={{
              color: "#D4A017",
            }}
          >
            Procurement Management
          </p>

          <p
            className="text-[11px]"
            style={{
              color: "rgba(255,255,255,.65)",
            }}
          >
            Batanes State College
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 overflow-y-auto px-5 py-7 space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <div
              className="mb-3 px-3 text-[10px] font-semibold tracking-[0.18em]"
              style={{
                color: "rgba(255,255,255,.35)",
              }}
            >
              {section.title}
            </div>

            <div className="space-y-1.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isOverview = item.label === "Dashboard";
                const isActive =
                  pathname === item.href ||
                  (!isOverview && pathname.startsWith(item.href + "/"));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:translate-x-1 hover:bg-white/5"
                    style={{
                      background: isActive
                        ? "rgba(255,255,255,.10)"
                        : "transparent",
                      color: isActive
                        ? "#FFFFFF"
                        : "rgba(255,255,255,.72)",
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-2 bottom-2 w-[4px] rounded-r-full"
                        style={{
                          background: "#D4A017",
                        }}
                      />
                    )}

                    <Icon
                      className="h-5 w-5 flex-shrink-0"
                      style={{
                        color: isActive
                          ? "#D4A017"
                          : "rgba(255,255,255,.45)",
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

      {/* Footer */}
      <div
        className="border-t px-6 py-5"
        style={{
          borderColor: "rgba(255,255,255,.08)",
        }}
      >
        <div
          className="text-sm font-semibold"
          style={{
            color: "#D4A017",
          }}
        >
          ProcureWise
        </div>

        <div
          className="mt-1 text-[11px]"
          style={{
            color: "rgba(255,255,255,.45)",
          }}
        >
          Procurement Management Information System
        </div>

        <div
          className="mt-3 text-[11px]"
          style={{
            color: "rgba(255,255,255,.35)",
          }}
        >
          © 2026 Batanes State College
        </div>
      </div>
    </aside>
  );
}
