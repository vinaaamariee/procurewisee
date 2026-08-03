import React from "react";

export default function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div className="space-y-1">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-base-content">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-base-content/70 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2 self-start sm:self-auto">{action}</div>}
    </div>
  );
}
