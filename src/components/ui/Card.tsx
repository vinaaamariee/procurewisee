import React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

/**
 * Shared dashboard surface. Keep layout concerns with the calling page while
 * ensuring every workspace panel shares the same document-like elevation.
 */
export default function Card({ children, className, ...props }: CardProps) {
  return (
    <section
      {...props}
      className={clsx(
        "overflow-hidden rounded-2xl border border-base-300/40 bg-base-100 text-base-content shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
