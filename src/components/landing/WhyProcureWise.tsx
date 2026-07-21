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
    color: "#7B1E1E",
    bg: "rgba(123, 30, 30, 0.08)",
  },
  {
    icon: TrendingDown,
    title: "Historical Prices",
    description:
      "Track price trends across suppliers over time to identify cost-saving opportunities.",
    color: "#D4A017",
    bg: "rgba(212, 160, 23, 0.08)",
  },
  {
    icon: BrainCircuit,
    title: "Decision Support",
    description:
      "MCDM-powered best-value recommendations balancing price, delivery, and reliability.",
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.08)",
  },
  {
    icon: FileSearch,
    title: "Automated Canvassing",
    description:
      "Streamlined RFQ management and automated canvas abstract generation.",
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.08)",
  },
  {
    icon: Shield,
    title: "Transparent Procurement",
    description:
      "Full visibility into procurement workflows for compliance and accountability.",
    color: "#0891b2",
    bg: "rgba(8, 145, 178, 0.08)",
  },
  {
    icon: ScrollText,
    title: "Audit Logs",
    description:
      "Immutable, timestamped audit trail for every procurement action and decision.",
    color: "#d97706",
    bg: "rgba(217, 119, 6, 0.08)",
  },
];

export default function WhyProcureWise() {
  return (
    <section id="about" aria-labelledby="why-procurewise-heading">
      {/* Section header */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#D4A017]">
          Platform Highlights
        </p>
        <h2
          id="why-procurewise-heading"
          className="text-3xl font-bold tracking-tight text-[#111827] dark:text-white"
        >
          Why ProcureWise?
        </h2>
        <p className="mt-1 text-sm text-[#6B7280] dark:text-slate-400">
          Built to modernize procurement at Batanes State College
        </p>
      </div>

      {/* Feature list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="group bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-start gap-4"
            >
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
                style={{ background: feature.bg }}
              >
                <Icon className="h-6 w-6" style={{ color: feature.color }} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-[#111827] dark:text-white leading-snug">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400 leading-relaxed">
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