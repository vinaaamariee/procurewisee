import { signout } from "@/app/actions/auth";
import { getAuthenticatedUser } from "@/lib/auth/get-user-profile";
import { ROLE_HOME } from "@/types/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import NotificationBell from "@/components/notifications/NotificationBell";
import GlobalSearch from "@/components/search/GlobalSearch";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Link from "next/link";

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

      <div className="flex flex-1 flex-col">
        <header
          className="sticky top-0 z-50 border-b shadow-sm"
          style={{
            background: "var(--bg-header)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex h-20 items-center justify-between px-8">
            <Link
              href={dashboardHome}
              className="flex items-center gap-3 no-underline"
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

              <div>
                <h1
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
                >
                  ProcureWise
                </h1>
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Batanes State College
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <span
                className="rounded px-3 py-1 text-xs font-bold uppercase tracking-wide"
                style={{
                  background: "var(--accent-glass)",
                  border: "1px solid var(--border-accent)",
                  color: "var(--accent)",
                }}
              >
                {profile.role}
              </span>

              <div
                className="flex items-center gap-3 rounded-md border px-3 py-2"
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

                <div className="hidden leading-tight md:block">
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
                  className="rounded-md border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8" style={{ background: "var(--bg-deep)" }}>
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