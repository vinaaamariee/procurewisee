
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
      className={`overflow-hidden rounded-md border border-base-300 bg-base-100 text-base-content shadow-none ${className}`}
    >
      {children}
    </div>
  );
}
