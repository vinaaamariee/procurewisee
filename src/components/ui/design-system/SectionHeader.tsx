import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  actions,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3 border-b border-base-200 ${className}`}>
      <div className="text-left">
        <h2 className="text-sm font-bold text-base-content tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] text-base-content/50">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
