"use client";

import Link from "next/link";
import { LucideIcon, Plus, FileSearch, ShoppingCart, Building2, BarChart3, Search } from "lucide-react";

interface QuickAction {
  label: string;
  sublabel: string;
  href: string;
  Icon: LucideIcon;
  variant: "primary" | "secondary" | "ghost";
}

const ACTIONS: QuickAction[] = [
  {
    label: "New RFQ",
    sublabel: "Draft solicitation",
    href: "/dashboard/officer/rfq/new",
    Icon: Plus,
    variant: "primary",
  },
  {
    label: "View RFQs",
    sublabel: "All solicitations",
    href: "/dashboard/officer/rfq",
    Icon: FileSearch,
    variant: "secondary",
  },
  {
    label: "Purchase Orders",
    sublabel: "Manage POs",
    href: "/dashboard/officer/po",
    Icon: ShoppingCart,
    variant: "ghost",
  },
  {
    label: "Suppliers",
    sublabel: "Vendor registry",
    href: "/dashboard/supplier-profiles",
    Icon: Building2,
    variant: "ghost",
  },
  {
    label: "Analytics",
    sublabel: "Reports & charts",
    href: "/dashboard/officer/analytics",
    Icon: BarChart3,
    variant: "ghost",
  },
  {
    label: "Marketplace",
    sublabel: "Browse catalog",
    href: "/",
    Icon: Search,
    variant: "ghost",
  },
];

export default function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2.5">
      {ACTIONS.map((action) => {
        const { label, sublabel, href, Icon, variant } = action;

        const base =
          "group inline-flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 border";

        const styles: Record<string, string> = {
          primary:
            "bg-[var(--accent)] text-white border-transparent hover:opacity-90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
          secondary:
            "bg-[var(--accent-glass)] text-[var(--accent)] border-[var(--border-accent)] hover:bg-[var(--accent)] hover:text-white hover:-translate-y-0.5",
          ghost:
            "bg-transparent text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-accent)] hover:text-[var(--accent)] hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]",
        };

        return (
          <Link key={label} href={href} className={`${base} ${styles[variant]}`}>
            <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            <span className="flex flex-col leading-tight">
              <span>{label}</span>
              <span className="text-[10px] font-normal opacity-70">{sublabel}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
