import React from "react";

interface TableContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function TableContainer({
  children,
  className = "",
  ...rest
}: TableContainerProps) {
  return (
    <div
      {...rest}
className={`overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </div>
  );
}
