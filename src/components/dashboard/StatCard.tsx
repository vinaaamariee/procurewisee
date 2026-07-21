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
        className="flex flex-col justify-between h-full p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg font-sans"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* 1. Title at top-left + Icon/Trend on top-right */}
        <div className="flex items-center justify-between gap-3">
          <p
            className="text-xs font-bold uppercase tracking-wider transition-colors duration-200 group-hover:text-[var(--accent)] font-sans"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          >
            {label}
          </p>
          <div className="flex items-center gap-2">
            {trend && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${
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

        {/* 2. Large Number in the middle (mt-4) */}
        <div className="mt-4">
          <p
            className="text-4xl font-bold tracking-tight transition-colors duration-200 group-hover:text-[var(--accent)] font-sans"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
          >
            {value}
          </p>
        </div>

        {/* 3. Subtitle at the bottom */}
        <div className="mt-2">
          <p
            className="text-xs font-normal font-sans"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
          >
            {desc}
          </p>
        </div>
      </div>
    </Link>
  );
}
