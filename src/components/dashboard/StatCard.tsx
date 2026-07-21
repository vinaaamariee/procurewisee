import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  desc: string;
  href: string;
  Icon: LucideIcon;
  accentClass?: string;
  trend?: {
    label: string;
    up?: boolean;
  };
}

export default function StatCard({
  label,
  value,
  desc,
  href,
  Icon,
  accentClass = "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  trend,
}: StatCardProps) {
  return (
    <Link href={href} className="block group font-sans">
      <div
        className="flex flex-col justify-between h-full rounded-3xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl font-sans"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* 1. Title at Top + Icon / Trend Badge */}
        <div className="flex items-center justify-between gap-3">
          <p
            className="text-xs font-extrabold uppercase tracking-wider transition-colors duration-200 group-hover:text-[var(--accent)]"
            style={{ color: "var(--text-secondary)" }}
          >
            {label}
          </p>
          <div className="flex items-center gap-2">
            {trend && (
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                  trend.up === false
                    ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300"
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                }`}
              >
                {trend.label}
              </span>
            )}
            <div className={`rounded-xl p-2.5 shrink-0 ${accentClass}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* 2. Large Number in Middle */}
        <div className="my-3">
          <p
            className="text-4xl font-extrabold tracking-tight transition-colors duration-200 group-hover:text-[var(--accent)] font-sans"
            style={{ color: "var(--text-primary)" }}
          >
            {value}
          </p>
        </div>

        {/* 3. Subtitle at Bottom */}
        <div>
          <p className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>
            {desc}
          </p>
        </div>
      </div>
    </Link>
  );
}
