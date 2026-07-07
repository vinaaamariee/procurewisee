import Link from "next/link";
import {
  ShoppingBag,
  ClipboardList,
  FileText,
  Search,
} from "lucide-react";

const defaultActions = [
  {
    icon: ShoppingBag,
    title: "Browse Products",
    description:
      "Explore the procurement catalog with detailed specs and supplier pricing.",
    href: "/catalog",
    buttonLabel: "View Catalog",
    color: "#7e191b",
    bgColor: "rgba(126, 25, 27, 0.06)",
  },
  {
    icon: ClipboardList,
    title: "Create PPMP",
    description:
      "Prepare your Project Procurement Management Plan for budget allocation.",
    href: "/end-user/ppmp",
    buttonLabel: "Start Planning",
    color: "#ca8a04",
    bgColor: "rgba(202, 138, 4, 0.06)",
  },
  {
    icon: FileText,
    title: "Submit Purchase Request",
    description:
      "File a purchase request for items needed by your department or office.",
    href: "/end-user",
    buttonLabel: "Submit PR",
    color: "#059669",
    bgColor: "rgba(5, 150, 105, 0.06)",
  },
  {
    icon: Search,
    title: "Track Request",
    description:
      "Track the status of your procurement request using your tracking code.",
    href: "/track",
    buttonLabel: "Track Now",
    color: "#6366f1",
    bgColor: "rgba(99, 102, 241, 0.06)",
  },
];

interface QuickActionsProps {
  title?: string;
  subtitle?: string;
  actions?: Array<{
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    title: string;
    description: string;
    href: string;
    buttonLabel: string;
    color: string;
    bgColor: string;
  }>;
}

export default function QuickActions({
  title = "Quick Access",
  subtitle = "Start your procurement workflow in one click",
  actions = defaultActions,
}: QuickActionsProps) {
  return (
    <section className="py-16" style={{ background: "var(--bg-dark)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            {subtitle}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.title}
                className="group flex flex-col rounded-2xl border p-6 transition-all hover:shadow-lg"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                {/* Icon */}
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: action.bgColor }}
                >
                  <Icon className="h-6 w-6" style={{ color: action.color }} />
                </div>

                {/* Content */}
                <h3
                  className="text-base font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {action.title}
                </h3>
                <p
                  className="mt-1.5 flex-1 text-sm leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {action.description}
                </p>

                {/* Button */}
                <Link
                  href={action.href}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-bold transition-all hover:shadow-sm"
                  style={{
                    borderColor: action.color + "30",
                    color: action.color,
                    background: action.bgColor,
                  }}
                >
                  {action.buttonLabel}
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
