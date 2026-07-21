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
  accentClass = "bg-blue-50 text-blue-700",
  trend,
}: StatCardProps) {
  return (
    <Link href={href} className="block group">
      <div
        className="h-full rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`rounded-xl p-3 ${accentClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <span
              className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                trend.up === false
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {trend.label}
            </span>
          )}
        </div>

        {/* Value */}
        <div>
          <p
            className="text-3xl font-black tracking-tight transition-colors duration-200 group-hover:text-[var(--accent)]"
            style={{ color: "var(--text-primary)" }}
          >
            {value}
          </p>
          <p className="mt-0.5 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
            {label}
          </p>
          <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
            {desc}
          </p>
        </div>
      </div>
    </Link>
  );
}
