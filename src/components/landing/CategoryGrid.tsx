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

// Map known category names to icons; fallback to Package
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

// Rotating accent colors for category cards
const accentColors = [
  { color: "#7e191b", bg: "rgba(126, 25, 27, 0.06)" },
  { color: "#ca8a04", bg: "rgba(202, 138, 4, 0.06)" },
  { color: "#059669", bg: "rgba(5, 150, 105, 0.06)" },
  { color: "#6366f1", bg: "rgba(99, 102, 241, 0.06)" },
  { color: "#d97706", bg: "rgba(217, 119, 6, 0.06)" },
  { color: "#0891b2", bg: "rgba(8, 145, 178, 0.06)" },
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
        <p
          className="mb-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--gold)" }}
        >
          Explore Catalog
        </p>
        <h2
          id="categories-heading"
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          {subtitle}
        </p>
      </div>

      {/* Category cards */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {categories.map((cat, index) => {
          const accent = accentColors[index % accentColors.length];
          const Icon = categoryIconMap[cat.category] || Package;

          return (
            <Link
              key={cat.category}
              href={`/catalog?category=${cat.id}`}
              className="group flex items-center gap-4 rounded-2xl border p-5 no-underline shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              {/* Icon */}
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                style={{ background: accent.bg }}
              >
                <Icon className="h-6 w-6" style={{ color: accent.color }} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-sm font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {cat.category}
                </div>
                <div
                  className="mt-0.5 text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  {cat._count} {cat._count === 1 ? "product" : "products"}
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight
                className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: accent.color }}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}