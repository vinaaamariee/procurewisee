import { LucideIcon } from "lucide-react";

interface StatItem {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
  bgColor?: string;
  sublabel?: string;
}

interface StatisticsCardsProps {
  title?: string;
  subtitle?: string;
  stats: StatItem[];
}

export default function StatisticsCards({
  title = "Procurement at a Glance",
  subtitle = "Live statistics from the ProcureWise database",
  stats,
}: StatisticsCardsProps) {
  return (
    <section aria-labelledby="statistics-heading">
      {/* Section header */}
      <div className="mb-8 text-center">
        <p
          className="mb-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--gold)" }}
        >
          System Overview
        </p>
        <h2
          id="statistics-heading"
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          {subtitle}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="group rounded-md border p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-md transition-transform duration-200 group-hover:scale-105"
                  style={{ background: stat.bgColor ?? "rgba(126, 25, 27, 0.06)" }}
                >
                  {Icon ? (
                    <Icon
                      className="h-6 w-6"
                      style={{ color: stat.color ?? "var(--gold)" }}
                    />
                  ) : (
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ background: stat.color ?? "var(--gold)" }}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className="text-2xl font-black tracking-tight sm:text-3xl"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {stat.value}
                  </div>

                  <div
                    className="mt-1 text-xs font-bold uppercase tracking-wider sm:text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {stat.title}
                  </div>

                  {stat.sublabel && (
                    <div
                      className="mt-1 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {stat.sublabel}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
