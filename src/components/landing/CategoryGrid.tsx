import Link from "next/link";
import {
  Monitor,
  Printer,
  Pen,
  FileBox,
  Wrench,
  Armchair,
  Lightbulb,
  Package,
  ArrowRight,
} from "lucide-react";
import type { CategoryCount } from "@/features/landing/server/queries";

interface CategoryGridProps {
  title?: string;
  subtitle?: string;
  categories: CategoryCount[];
}

const categoryIconMap: Record<string, typeof Monitor> = {
  "IT Equipment": Monitor,
  "Office Supplies": Pen,
  "Printing": Printer,
  "Print & Signage": Printer,
  "Furniture": Armchair,
  "Tools": Wrench,
  "Electrical": Lightbulb,
  "Paper & Filing": FileBox,
};

const accentColors = [
  { color: "#7B1E1E", bg: "rgba(123, 30, 30, 0.08)" },
  { color: "#D4A017", bg: "rgba(212, 160, 23, 0.08)" },
  { color: "#059669", bg: "rgba(5, 150, 105, 0.08)" },
  { color: "#6366f1", bg: "rgba(99, 102, 241, 0.08)" },
  { color: "#d97706", bg: "rgba(217, 119, 6, 0.08)" },
  { color: "#0891b2", bg: "rgba(8, 145, 178, 0.08)" },
];

export default function CategoryGrid({
  title = "Browse by Category",
  subtitle = "Find products organized by procurement category",
  categories,
}: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="categories-heading">
      {/* Section header */}
      <div className="mb-8 text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#D4A017]">
          Explore Catalog
        </p>
        <h2
          id="categories-heading"
          className="text-3xl font-bold tracking-tight text-[#111827] dark:text-white"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-[#6B7280] dark:text-slate-400">
          {subtitle}
        </p>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat, index) => {
          const accent = accentColors[index % accentColors.length];
          const Icon = categoryIconMap[cat.category] || Package;

          return (
            <Link
              key={cat.category}
              href={`/catalog?category=${cat.id}`}
              className="group bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 no-underline shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-4"
            >
              {/* Icon */}
              <div
                className="flex h-13 w-13 flex-shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
                style={{ background: accent.bg }}
              >
                <Icon className="h-6 w-6" style={{ color: accent.color }} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold text-[#111827] dark:text-white group-hover:text-[#7B1E1E] dark:group-hover:text-red-400 transition-colors">
                  {cat.category}
                </h3>
                <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400 font-medium">
                  {cat._count} {cat._count === 1 ? "product" : "products"}
                </p>
              </div>

              {/* Arrow */}
              <ArrowRight
                className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                style={{ color: accent.color }}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}