import {
  BarChart3,
  TrendingDown,
  BrainCircuit,
  FileSearch,
  Shield,
  ScrollText,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Procurement Analytics",
    description:
      "Real-time dashboards with data-driven insights for smarter procurement decisions.",
    color: "#7e191b",
    bg: "rgba(126, 25, 27, 0.06)",
  },
  {
    icon: TrendingDown,
    title: "Historical Prices",
    description:
      "Track price trends across suppliers over time to identify cost-saving opportunities.",
    color: "#ca8a04",
    bg: "rgba(202, 138, 4, 0.06)",
  },
  {
    icon: BrainCircuit,
    title: "Decision Support",
    description:
      "MCDM-powered best-value recommendations balancing price, delivery, and reliability.",
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.06)",
  },
  {
    icon: FileSearch,
    title: "Automated Canvassing",
    description:
      "Streamlined RFQ management and automated canvas abstract generation.",
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.06)",
  },
  {
    icon: Shield,
    title: "Transparent Procurement",
    description:
      "Full visibility into procurement workflows for compliance and accountability.",
    color: "#0891b2",
    bg: "rgba(8, 145, 178, 0.06)",
  },
  {
    icon: ScrollText,
    title: "Audit Logs",
    description:
      "Immutable, timestamped audit trail for every procurement action and decision.",
    color: "#d97706",
    bg: "rgba(217, 119, 6, 0.06)",
  },
];

export default function WhyProcureWise() {
  return (
    <section
      id="about"
      className="py-16"
      style={{ background: "var(--bg-dark)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            Why ProcureWise?
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Built to modernize government procurement at Batanes State College
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border p-6 transition-all hover:shadow-md"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                  style={{ background: feature.bg }}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{ color: feature.color }}
                  />
                </div>
                <h3
                  className="text-base font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
