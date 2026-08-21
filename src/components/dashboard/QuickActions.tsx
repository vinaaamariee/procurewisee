"use client";

import Link from "next/link";
import { LucideIcon, Plus, FileSearch, ShoppingCart, Building2, BarChart3, Search } from "lucide-react";

interface QuickAction {
  label: string;
  sublabel: string;
  href: string;
  Icon: LucideIcon;
  variant: "primary" | "white";
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
    variant: "white",
  },
  {
    label: "Purchase Orders",
    sublabel: "Manage POs",
    href: "/dashboard/officer/po",
    Icon: ShoppingCart,
    variant: "white",
  },
  {
    label: "Suppliers",
    sublabel: "Vendor registry",
    href: "/dashboard/supplier-profiles",
    Icon: Building2,
    variant: "white",
  },
  {
    label: "Analytics",
    sublabel: "Reports & charts",
    href: "/dashboard/officer/analytics",
    Icon: BarChart3,
    variant: "white",
  },
  {
    label: "Marketplace",
    sublabel: "Browse catalog",
    href: "/",
    Icon: Search,
    variant: "white",
  },
];

export default function QuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-2.5 font-sans">
      {ACTIONS.map((action) => {
        const { label, sublabel, href, Icon, variant } = action;

        // Padding dialed back from px-5 py-4 to px-4 py-3: still a real
        // improvement in touch-target size over the original px-4 py-2.5,
        // but narrow enough that all 6 buttons fit on one row at typical
        // desktop widths instead of forcing a wrap.
        const base =
          "group inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition-all duration-200 border shadow-sm shrink-0";

        const styles: Record<string, string> = {
          primary:
            "bg-[var(--secondary)] text-slate-950 border-[var(--border-accent)] hover:bg-[var(--secondary-dark,#8a621a)] hover:shadow-md hover:-translate-y-0.5 font-extrabold rounded-lg",
          white:
            "bg-white text-slate-900 border-white hover:bg-slate-100 hover:text-[var(--text-primary)] hover:shadow-md hover:-translate-y-0.5 rounded-lg",
        };

        return (
          <Link key={label} href={href} className={`${base} ${styles[variant]}`}>
            <Icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span className="flex flex-col leading-tight">
              <span>{label}</span>
              <span className="text-[10px] font-medium opacity-80">{sublabel}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}