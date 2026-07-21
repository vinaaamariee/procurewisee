import { signout } from "@/app/actions/auth";
import { getAuthenticatedUser } from "@/lib/auth/get-user-profile";
import { ROLE_HOME } from "@/types/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import NotificationBell from "@/components/notifications/NotificationBell";
import GlobalSearch from "@/components/search/GlobalSearch";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getAuthenticatedUser();
  const dashboardHome = ROLE_HOME[profile.role];

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-deep)" }}>
      <DashboardSidebar role={profile.role} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-50 border-b shadow-sm"
          style={{
            background: "var(--bg-header)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex min-h-20 items-center justify-between gap-4 px-5 py-3 sm:px-8">
            <Link
              href={dashboardHome}
              className="flex min-w-0 items-center gap-3 no-underline"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-md border"
                style={{
                  background: "white",
                  borderColor: "var(--border-accent)",
                }}
              >
                <span
                  className="text-lg font-black"
                  style={{ color: "var(--accent)", fontFamily: "var(--font-display)" }}
                >
                  P
                </span>
                <span
                  className="text-lg font-black"
                  style={{ color: "var(--secondary)", fontFamily: "var(--font-display)" }}
                >
                  W
                </span>
              </div>

              <div className="min-w-0">
                <h1
                  className="truncate text-lg font-bold"
                  style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
                >
                  ProcureWise
                </h1>
                <p
                  className="hidden text-xs uppercase tracking-[0.12em] sm:block"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Batanes State College
                </p>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Link
                href={dashboardHome}
                className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-bold transition-colors hover:bg-[var(--surface-hover)] lg:hidden"
                style={{ borderColor: "var(--border)", color: "var(--accent)" }}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <span
                className="hidden rounded-md px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] xl:inline-flex"
                style={{
                  background: "var(--accent-glass)",
                  border: "1px solid var(--border-accent)",
                  color: "var(--accent)",
                }}
              >
                {profile.role}
              </span>

              <div
                className="flex items-center gap-3 rounded-md border p-1.5 pr-3"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full font-bold text-white"
                  style={{ background: "var(--accent)" }}
                >
                  {profile.fullName?.[0]?.toUpperCase() ?? "U"}
                </div>

                <div className="hidden min-w-0 leading-tight xl:block">
                  <div
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {profile.fullName}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {profile.email}
                  </div>
                </div>
              </div>

              <GlobalSearch />
              <NotificationBell currentUser={profile} />
              <ThemeToggle />

              <form action={signout}>
                <button
                  type="submit"
                  className="rounded-md border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20 sm:px-4"
                >
                  <span className="hidden sm:inline">Sign Out</span><span className="sm:hidden">Out</span>
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8" style={{ background: "var(--bg-deep)" }}>
          <div className="mx-auto max-w-7xl space-y-8">{children}</div>
        </main>

        <footer
          className="border-t px-8 py-4 text-center text-xs"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-muted)",
          }}
        >
          ProcureWise · Batanes State College · Procurement Management System
        </footer>
      </div>
    </div>
  );
}
