import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:px-8 space-y-6 ${className}`}>
      {children}
    </div>
  );
}
