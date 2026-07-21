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
      className="sticky top-0 flex h-screen w-60 shrink-0 flex-col text-slate-200 shadow-sm"
      style={{ background: "#0B2D5C", borderRight: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Masthead rule, consistent with the rest of the app */}
      <div
        className="h-[3px] w-full flex-shrink-0"
        style={{ background: "linear-gradient(90deg, #0B2D5C 0 34%, #A6761D 34% 67%, #B7202E 67% 100%)" }}
      />

      {/* Brand */}
      <div className="flex h-[77px] items-center border-b px-6" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div>
          <div
            className="text-lg font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Procure<span style={{ color: "#C99A2E" }}>Wise</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
            Batanes State College
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-8 overflow-y-auto px-3 py-6">
        {sections.map((section) => (
          <div key={section.title}>
            <div
              className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {section.title}
            </div>

            <div className="space-y-1">
              {section.items.map((item) => {
                const isOverview = item.label === "Dashboard";
                const isActive =
                  pathname === item.href ||
                  (!isOverview && pathname.startsWith(item.href + "/"));

                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors"
                    style={
                      isActive
                        ? { background: "rgba(255,255,255,0.08)", color: "#ffffff" }
                        : { color: "rgba(255,255,255,0.65)" }
                    }
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r"
                        style={{ background: "#C99A2E" }}
                      />
                    )}

                    <Icon
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: isActive ? "#C99A2E" : "rgba(255,255,255,0.45)" }}
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
        className="border-t p-4 text-xs"
        style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
      >
        Procurement Management System
      </div>
    </aside>
  );
}
