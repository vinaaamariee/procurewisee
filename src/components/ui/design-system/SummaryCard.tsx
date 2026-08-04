import React from "react";

interface SummaryCardProps {
  label: string;
  value: string | number;
  desc?: string;
  icon?: React.ReactNode;
  accentClass?: string;
  className?: string;
}

export default function SummaryCard({
  label,
  value,
  desc,
  icon,
  accentClass = "",
  className = "",
}: SummaryCardProps) {
  return (
    <div
      className={`flex flex-col justify-between p-4 rounded-md border border-base-300 bg-base-100 text-base-content text-left ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/65">
          {label}
        </span>
        {icon && (
          <div className={`p-1.5 rounded bg-base-200 text-base-content/75 shrink-0 ${accentClass}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2.5">
        <span className="text-2xl font-bold tracking-tight text-base-content font-display">
          {value}
        </span>
        {desc && (
          <p className="text-[11px] text-base-content/50 mt-0.5 leading-snug">
            {desc}
          </p>
        )}
      </div>
    </div>
  );
}
