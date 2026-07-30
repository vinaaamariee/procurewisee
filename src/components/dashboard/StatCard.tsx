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
  href,
  Icon,
  accentClass = "bg-blue-50 text-blue-700",
}: StatCardProps) {
  return (
    <Link href={href} className="block group font-sans">
      <div
        className="flex flex-col justify-between h-full p-5 rounded-xl border border-base-300 bg-base-100 shadow-sm transition-all duration-150 hover:border-base-400 hover:shadow"
      >
        {/* 1. Title at top-left + Icon on top-right */}
        <div className="flex items-center justify-between gap-3 text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-base-content/70">
            {label}
          </p>
          <div className={`p-2 rounded-lg ${accentClass} shrink-0`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* 2. Large Number in the middle */}
        <div className="mt-4 text-left">
          <p className="text-3xl font-black text-base-content tracking-tight">
            {value}
          </p>
        </div>
      </div>
    </Link>
  );
}
