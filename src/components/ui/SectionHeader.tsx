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
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--text-primary)]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
