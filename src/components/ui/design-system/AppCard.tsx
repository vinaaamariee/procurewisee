import React from "react";

interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AppCard({
  children,
  header,
  footer,
  className = "",
  ...props
}: AppCardProps) {
  return (
    <div
      {...props}
      className={`rounded-md border border-base-300 bg-base-100 text-base-content overflow-hidden shadow-none ${className}`}
    >
      {header && (
        <div className="border-b border-base-200 bg-base-50/50 px-5 py-3">
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="border-t border-base-200 bg-base-50/50 px-5 py-3.5">
          {footer}
        </div>
      )}
    </div>
  );
}
