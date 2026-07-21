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
    <section id="about" aria-labelledby="why-procurewise-heading">
      {/* Section header */}
      <div className="mb-6">
        <p
          className="mb-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--gold)" }}
        >
          Platform Highlights
        </p>
        <h2
          id="why-procurewise-heading"
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: "var(--text-primary)" }}
        >
          Why ProcureWise?
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Built to modernize procurement at Batanes State College
        </p>
      </div>

      {/* Feature list */}
      <div className="grid gap-3 sm:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="group flex gap-3 rounded-md border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md transition-transform duration-200 group-hover:scale-105"
                style={{ background: feature.bg }}
              >
                <Icon className="h-5 w-5" style={{ color: feature.color }} />
              </div>

              <div className="min-w-0 flex-1">
                <h3
                  className="text-sm font-bold leading-snug"
                  style={{ color: "var(--text-primary)" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="mt-1 text-xs leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
