import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  desc?: string;
  href: string;
  Icon: LucideIcon;
  accentClass?: string;
}

export default function StatCard({
  label,
  value,
  desc,
  href,
  Icon,
  accentClass = "bg-base-200 text-base-content/80",
}: StatCardProps) {
  return (
    <Link href={href} className="block group">
      <div
        className="flex flex-col justify-between h-full p-4 rounded-md border border-base-300 bg-base-100 shadow-none transition-colors duration-100 hover:bg-base-200/50"
      >
        {/* Title & Icon */}
        <div className="flex items-center justify-between gap-3 text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/65">
            {label}
          </span>
          <div className={`p-1.5 rounded bg-base-200 text-base-content/75 shrink-0 ${accentClass}`}>
            <Icon className="h-4.5 w-4.5 shrink-0" /> {/* 18px */}
          </div>
        </div>

        {/* Value */}
        <div className="mt-3 text-left">
          <span className="text-2xl font-bold tracking-tight text-base-content font-display">
            {value}
          </span>
          {desc && (
            <p className="text-[10px] text-base-content/50 mt-0.5 leading-snug">
              {desc}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
