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
} from "lucide-react";
import type { CategoryCount } from "@/features/landing/server/queries";

interface CategoryGridProps {
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

export default function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-16" style={{ background: "var(--bg-dark)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            Browse by Category
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Find products organized by procurement category
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, index) => {
            const accent = accentColors[index % accentColors.length];
            const Icon = categoryIconMap[cat.category] || Package;
            return (
              <Link
                key={cat.category}
                href={`/catalog?category=${cat.id}`}
                className="group flex items-center gap-4 rounded-2xl border p-5 no-underline transition-all hover:shadow-md"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                  style={{ background: accent.bg }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: accent.color }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className="truncate text-sm font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {cat.category}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {cat._count} {cat._count === 1 ? "product" : "products"}
                  </div>
                </div>
                <span
                  className="text-xs opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color: accent.color }}
                >
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
