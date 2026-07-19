import React from "react";
import clsx from "clsx";

interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function CardHeader({
  children,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div
      {...props}
      className={clsx(
        "flex items-center justify-between",
        "border-b border-[var(--border)]",
        "pb-4 mb-6",
        className
      )}
    >
      {children}
    </div>
  );
}