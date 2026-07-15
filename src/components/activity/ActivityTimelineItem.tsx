"use client";

import type { ActivityItem } from "@/app/actions/activity";
import {
  FileText,
  ClipboardList,
  ShoppingCart,
  Quote,
  Scale,
  Circle,
} from "lucide-react";

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bg: string; border: string }
> = {
  pr: {
    label: "Purchase Request",
    icon: FileText,
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
  },
  rfq: {
    label: "RFQ",
    icon: ClipboardList,
    color: "text-indigo-700 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  po: {
    label: "Purchase Order",
    icon: ShoppingCart,
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  quote: {
    label: "Supplier Quote",
    icon: Quote,
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
  },
  evaluation: {
    label: "Evaluation",
    icon: Scale,
    color: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
  },
  general: {
    label: "System",
    icon: Circle,
    color: "text-slate-700 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-900/20",
    border: "border-slate-200 dark:border-slate-800",
  },
};

const AVATAR_PALETTE = [
  "#7e191b",
  "#4f46e5",
  "#059669",
  "#d97706",
  "#2563eb",
  "#7c3aed",
  "#0891b2",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

interface ActivityTimelineItemProps {
  item: ActivityItem;
  isLast: boolean;
}

export default function ActivityTimelineItem({
  item,
  isLast,
}: ActivityTimelineItemProps) {
  const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.general;
  const Icon = config.icon;
  const bgColor = avatarColor(item.userName);

  return (
    <li className="relative flex items-start gap-4 px-5 py-4 transition hover:bg-[var(--surface-hover)]">
      {/* Timeline connector */}
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-[1.85rem] top-14 bottom-0 w-0.5 bg-[var(--border)]"
        />
      )}

      {/* Avatar */}
      <div
        className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ background: bgColor }}
        title={item.userName}
      >
        {item.userInitials}

        {/* Category icon badge */}
        <div
          className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface)] shadow-sm"
        >
          <Icon className="h-3 w-3 text-[var(--text-muted)]" />
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${config.bg} ${config.color} ${config.border}`}
            >
              {config.label}
            </span>
            <span className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-[260px]">
              {item.title}
            </span>
          </div>

          <time
            dateTime={item.timestamp}
            title={item.timestamp}
            className="text-xs font-medium text-[var(--text-muted)] shrink-0"
          >
            {item.relativeTime}
          </time>
        </div>

        <p className="text-sm text-[var(--text-secondary)] truncate">
          {item.description}
        </p>

        <span className="text-xs text-[var(--text-muted)]">
          by{" "}
          <strong className="font-semibold text-[var(--text-secondary)]">
            {item.userName}
          </strong>{" "}
          · {item.timestamp}
        </span>
      </div>
    </li>
  );
}