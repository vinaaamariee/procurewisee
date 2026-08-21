import { getAuthenticatedUser } from "@/lib/auth/get-user-profile";
import QuickActions from "@/components/dashboard/QuickActions";
import { CalendarDays, Zap } from "lucide-react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function HeroSection() {
  const { profile } = await getAuthenticatedUser();
  const firstName = profile.fullName?.split(" ")[0] ?? "Procurement Staff";
  const greeting = getGreeting();
  const date = formatDate();

  return (
    <div
      className="relative overflow-hidden rounded-3xl border font-sans"
      style={{
        background: `linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 60%, color-mix(in srgb, var(--accent) 80%, var(--secondary)) 100%)`,
        borderColor: "var(--border-accent)",
        boxShadow: "0 8px 40px rgba(11,45,92,0.18)",
      }}
    >
      {/* Decorative grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(255,255,255,0.04) 47px, rgba(255,255,255,0.04) 48px), repeating-linear-gradient(90deg, transparent, transparent 47px, rgba(255,255,255,0.04) 47px, rgba(255,255,255,0.04) 48px)",
        }}
      />

      {/* Decorative orbs */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-10 blur-3xl"
        style={{ background: "var(--secondary)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-12 left-32 h-48 w-48 rounded-full opacity-10 blur-3xl"
        style={{ background: "var(--secondary)" }}
      />

      {/*
        Layout fix:
        - items-start (not items-center) on mobile stack so the badge doesn't
          get vertically centered oddly when it wraps under the actions.
        - gap-8 (32px) instead of gap-12 (48px): the previous 48px gap was
          stealing width from QuickActions, forcing the whole row to wrap
          earlier than necessary.
      */}
      <div className="relative z-10 flex flex-col gap-6 px-8 py-8 md:flex-row md:items-center md:justify-between md:gap-8">
        {/* Left: Greeting — shrink-0 stops flexbox from compressing this
            column (and wrapping the badge text) when QuickActions needs
            more horizontal space. */}
        <div className="flex flex-col gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest"
              style={{
                background: "rgba(255,255,255,0.14)",
                borderColor: "rgba(255,255,255,0.25)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              <Zap className="h-3 w-3 text-[var(--secondary)]" />
              Procurement Staff Portal
            </span>
          </div>

          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              {greeting},
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white font-sans">
              {firstName}
            </h1>
          </div>

          <div
            className="flex items-center gap-1.5 text-sm"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span className="font-medium">{date}</span>
          </div>
        </div>

        {/* Right: Quick Actions — min-w-0 lets this column shrink/wrap
            internally (via QuickActions' own flex-wrap) instead of pushing
            the overall row wider than the container. */}
        <div className="flex min-w-0 flex-col gap-3">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Quick Actions
          </p>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}