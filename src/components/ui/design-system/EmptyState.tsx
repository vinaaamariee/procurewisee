import React from "react";
import ActionButton from "./ActionButton";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionHref,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-base-300 rounded-md bg-base-100/50 ${className}`}>
      {icon && (
        <div className="mb-3 text-base-content/40 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-bold text-base-content tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-base-content/50 max-w-sm mt-1 leading-normal">
        {description}
      </p>
      {(actionLabel && (onAction || actionHref)) && (
        <div className="mt-4">
          {actionHref ? (
            <a href={actionHref}>
              <ActionButton variant="primary" size="sm">
                {actionLabel}
              </ActionButton>
            </a>
          ) : (
            <ActionButton variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </ActionButton>
          )}
        </div>
      )}
    </div>
  );
}
