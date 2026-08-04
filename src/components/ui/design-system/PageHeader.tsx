import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-base-300 ${className}`}>
      <div className="text-left">
        <h1 className="text-2xl font-bold tracking-tight text-base-content font-display">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-base-content/60 mt-1">
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
