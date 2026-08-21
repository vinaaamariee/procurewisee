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
    color: "text-[var(--accent)]",
    bg: "bg-[var(--accent-glass)]",
    border: "border-[var(--border-accent)]",
  },
  rfq: {
    label: "RFQ",
    icon: ClipboardList,
    color: "text-[var(--secondary)]",
    bg: "bg-[var(--secondary-dim)]",
    border: "border-[var(--border-accent)]",
  },
  po: {
    label: "Purchase Order",
    icon: ShoppingCart,
    color: "text-[var(--accent)]",
    bg: "bg-[var(--accent-glass)]",
    border: "border-[var(--border-accent)]",
  },
  quote: {
    label: "Supplier Quote",
    icon: Quote,
    color: "text-[var(--secondary)]",
    bg: "bg-[var(--secondary-dim)]",
    border: "border-[var(--border-accent)]",
  },
  evaluation: {
    label: "Evaluation",
    icon: Scale,
    color: "text-[var(--secondary)]",
    bg: "bg-[var(--secondary-dim)]",
    border: "border-[var(--border-accent)]",
  },
  general: {
    label: "System",
    icon: Circle,
    color: "text-[var(--text-secondary)]",
    bg: "bg-[var(--surface-hover)]",
    border: "border-[var(--border)]",
  },
};

// Only maroon and gold for avatar cycling
const AVATAR_PALETTE = [
  "#7B1E1E",
  "#A6761D",
  "#5a1515",
  "#8a621a",
  "#7B1E1E",
  "#A6761D",
  "#5a1515",
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
          className="absolute left-5 top-14 bottom-0 w-px bg-[var(--border)]"
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
              className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${config.bg} ${config.color} ${config.border}`}
            >
              {config.label}
            </span>
            <span className="text-[0.9rem] font-semibold text-[var(--text-primary)] truncate max-w-[260px]">
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