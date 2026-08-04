import { ReactNode } from "react";

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <main
      className="min-h-screen bg-base-200"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="space-y-8">{children}</div>
      </div>
    </main>
  );
}