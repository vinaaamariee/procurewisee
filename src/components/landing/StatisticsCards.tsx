import { Package, Users, LayoutGrid, TrendingUp } from "lucide-react";
import type { LandingStats } from "@/features/landing/server/queries";

interface StatisticsCardsProps {
  stats: LandingStats;
}

const statConfig = [
  {
    key: "totalProducts" as const,
    label: "Total Products",
    icon: Package,
    color: "#7e191b",
    bgColor: "rgba(126, 25, 27, 0.06)",
  },
  {
    key: "totalSuppliers" as const,
    label: "Registered Suppliers",
    icon: Users,
    color: "#ca8a04",
    bgColor: "rgba(202, 138, 4, 0.06)",
  },
  {
    key: "totalCategories" as const,
    label: "Categories",
    icon: LayoutGrid,
    color: "#059669",
    bgColor: "rgba(5, 150, 105, 0.06)",
  },
  {
    key: "monthlyPriceUpdates" as const,
    label: "Monthly Price Updates",
    icon: TrendingUp,
    color: "#6366f1",
    bgColor: "rgba(99, 102, 241, 0.06)",
  },
];

export default function StatisticsCards({ stats }: StatisticsCardsProps) {
  return (
    <section className="py-16" style={{ background: "var(--bg-deep)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            Procurement at a Glance
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Live statistics from the ProcureWise database
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statConfig.map((stat) => {
            const Icon = stat.icon;
            const value = stats[stat.key];
            return (
              <div
                key={stat.key}
                className="flex items-center gap-4 rounded-2xl border p-5 transition-all hover:shadow-md"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: stat.bgColor }}
                >
                  <Icon className="h-7 w-7" style={{ color: stat.color }} />
                </div>
                <div>
                  <div
                    className="text-3xl font-black tabular-nums tracking-tight"
                    style={{ color: stat.color }}
                  >
                    {value.toLocaleString()}
                  </div>
                  <div
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
