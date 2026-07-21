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
  const firstName = profile.fullName?.split(" ")[0] ?? "Officer";
  const greeting = getGreeting();
  const date = formatDate();

  return (
    <div
      className="relative overflow-hidden rounded-3xl border"
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

      <div className="relative z-10 flex flex-col gap-6 px-8 py-8 md:flex-row md:items-center md:justify-between">
        {/* Left: Greeting */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
              style={{
                background: "rgba(255,255,255,0.12)",
                borderColor: "rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              <Zap className="h-3 w-3" />
              Procurement Officer Portal
            </span>
          </div>

          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              {greeting},
            </p>
            <h1
              className="text-4xl font-black tracking-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {firstName}
            </h1>
          </div>

          <div
            className="flex items-center gap-1.5 text-sm"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span className="font-medium">{date}</span>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex flex-col gap-3">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Quick Actions
          </p>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
