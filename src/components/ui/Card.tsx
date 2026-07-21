import React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export default function Card({ children, className, ...props }: CardProps) {
  return (
    <section
      {...props}
      className={clsx(
        "overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
