import { LucideIcon, TrendingUp } from "lucide-react";

interface StatItem {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
  bgColor?: string;
  sublabel?: string;
  trend?: string;
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
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--secondary)]">
          System Overview
        </p>
        <h2
          id="statistics-heading"
          className="text-3xl font-bold tracking-tight text-[#111827] dark:text-white"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-[#6B7280] dark:text-slate-400">
          {subtitle}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-gray-200/80 dark:border-slate-800 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden"
            >
              {/* Top accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl"
                style={{ background: stat.color ?? "#7B1E1E" }}
              />
              <div className="flex items-start justify-between gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: stat.bgColor ?? "rgba(123, 30, 30, 0.08)",
                  }}
                >
                  {Icon ? (
                    <Icon
                      className="h-7 w-7"
                      style={{ color: stat.color ?? "#7B1E1E" }}
                    />
                  ) : (
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ background: stat.color ?? "#7B1E1E" }}
                    />
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] dark:text-[var(--secondary)] bg-[var(--accent-glass)] dark:bg-emerald-950/40 rounded-full px-2.5 py-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{stat.trend || "Live"}</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-3xl font-black tracking-tight text-[#111827] dark:text-white">
                  {stat.value}
                </div>

                <div className="mt-1 text-sm font-semibold text-[#6B7280] dark:text-slate-400">
                  {stat.title}
                </div>

                {stat.sublabel && (
                  <div className="mt-1 text-xs text-[#6B7280] dark:text-slate-500">
                    {stat.sublabel}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
