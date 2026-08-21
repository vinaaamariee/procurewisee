import { signout } from "@/app/actions/auth";
import { getAuthenticatedUser } from "@/lib/auth/get-user-profile";
import { ROLE_HOME, ROLE_LABELS } from "@/types/auth";
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
    <div className="flex min-h-screen bg-base-200">
      <DashboardSidebar role={profile.role} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-50 border-b border-base-300 bg-base-100 transition-all duration-200 shadow-none"
        >
          <div className="flex min-h-20 items-center justify-between gap-4 px-5 py-3 sm:px-8">
            <Link
              href={dashboardHome}
              className="flex min-w-0 items-center gap-3 no-underline group active:scale-[0.98] transition-transform duration-150"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-base-300 bg-base-100 transition-all duration-200 group-hover:shadow-sm"
              >
                <span
                  className="text-lg font-black tracking-tight"
                  style={{ color: "var(--accent)", fontFamily: "var(--font-display)" }}
                >
                  P
                </span>
                <span
                  className="text-lg font-black tracking-tight"
                  style={{ color: 'var(--secondary-strong)', fontFamily: "var(--font-display)" }}
                >
                  W
                </span>
              </div>

              <div className="min-w-0">
                <h1
                  className="truncate text-lg font-bold tracking-tight transition-colors duration-200 group-hover:text-[var(--accent-light)]"
                  style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
                >
                  ProcureWise
                </h1>
                <p
                  className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] sm:block text-[var(--text-secondary)]"
                >
                  Batanes State College
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <NotificationBell currentUser={profile} />
              <ThemeToggle />

              <div
                className="flex items-center gap-3 rounded-md border border-base-300 bg-base-100 px-3 py-1.5 shadow-none"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-white text-xs border border-white/20 shadow-sm"
                  style={{ background: "var(--accent)" }}
                >
                  {profile.fullName?.[0]?.toUpperCase() ?? "U"}
                </div>

                <div className="hidden min-w-0 leading-tight xl:block">
                  <div
                    className="text-xs font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {profile.fullName}
                  </div>
                  <div
                    className="text-[10px] font-semibold tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {ROLE_LABELS[profile.role]}
                  </div>
                </div>
              </div>

              <form action={signout}>
                <button
                  type="submit"
                  className="rounded-xl border border-[var(--border-accent)] hover:border-[var(--border-accent)] px-3.5 py-1.5 text-xs font-bold text-[var(--accent)] transition hover:bg-[var(--accent-glass)] dark:hover:bg-[var(--accent-glass)] active:scale-[0.97]"
                >
                  <span className="hidden sm:inline">Sign Out</span><span className="sm:hidden">Out</span>
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8 bg-base-200">
          <div className="mx-auto max-w-7xl space-y-8">{children}</div>
        </main>

        <footer
          className="border-t px-8 py-4 text-center text-xs"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-muted)",
          }}
        >
          ProcureWise v1.0 | Â© 2026 Batanes State College
        </footer>
      </div>
    </div>
  );
}
