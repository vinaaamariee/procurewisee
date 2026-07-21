import { ReactNode } from "react";

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <main
      className="min-h-screen"
      style={{
        background: `
          radial-gradient(circle at top right, rgba(123,30,30,.05), transparent 40%),
          linear-gradient(180deg, var(--bg-deep) 0%, #f9fafb 100%)
        `,
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">{children}</div>
      </div>
    </main>
  );
}