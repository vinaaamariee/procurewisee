import Link from "next/link";
import {
  ShoppingBag,
  ClipboardList,
  FileText,
  Search,
  ArrowRight,
} from "lucide-react";

const defaultActions = [
  {
    icon: ShoppingBag,
    title: "Browse Products",
    description:
      "Explore the procurement catalog with detailed specs and supplier pricing.",
    href: "/catalog",
    buttonLabel: "View Catalog",
    color: "#7B1E1E",
    bgColor: "rgba(123, 30, 30, 0.08)",
  },
  {
    icon: ClipboardList,
    title: "Create PPMP",
    description:
      "Prepare your Project Procurement Management Plan for budget allocation.",
    href: "/end-user/ppmp",
    buttonLabel: "Start Planning",
    color: "#D4A017",
    bgColor: "rgba(212, 160, 23, 0.08)",
  },
  {
    icon: FileText,
    title: "Submit Purchase Request",
    description:
      "File a purchase request for items needed by your department or office.",
    href: "/end-user",
    buttonLabel: "Submit PR",
    color: "#059669",
    bgColor: "rgba(5, 150, 105, 0.08)",
  },
  {
    icon: Search,
    title: "Track Request",
    description:
      "Track the status of your procurement request using your tracking code.",
    href: "/track",
    buttonLabel: "Track Now",
    color: "#6366f1",
    bgColor: "rgba(99, 102, 241, 0.08)",
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
    <section aria-labelledby="quick-access-heading">
      <div className="mb-8 text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#D4A017]">
          Workflow Shortcuts
        </p>
        <h2
          id="quick-access-heading"
          className="text-3xl font-bold tracking-tight text-[#111827] dark:text-white"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-[#6B7280] dark:text-slate-400">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.title}
              className="group bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Icon Container */}
                <div
                  className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
                  style={{ background: action.bgColor }}
                >
                  <Icon className="h-7 w-7" style={{ color: action.color }} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-[#111827] dark:text-white group-hover:text-[#7B1E1E] dark:group-hover:text-red-400 transition-colors">
                  {action.title}
                </h3>
                <p className="mt-2 text-sm text-[#6B7280] dark:text-slate-400 leading-relaxed">
                  {action.description}
                </p>
              </div>

              {/* Action Link */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                <Link
                  href={action.href}
                  className="inline-flex items-center gap-2 text-xs font-bold transition-all duration-200"
                  style={{ color: action.color }}
                >
                  <span>{action.buttonLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
