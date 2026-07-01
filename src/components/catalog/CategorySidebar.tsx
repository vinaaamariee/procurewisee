import Link from "next/link";
import { LayoutGrid, ChevronRight } from "lucide-react";

interface Category {
  id: number;
  name: string;
  productCount: number;
}

interface CategorySidebarProps {
  categories: Category[];
  selectedCategoryId?: number;
}

export default function CategorySidebar({
  categories,
  selectedCategoryId,
}: CategorySidebarProps) {
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: "var(--border)" }}
      >
        <LayoutGrid className="h-4 w-4" style={{ color: "var(--accent)" }} />
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--text-secondary)" }}
        >
          Categories
        </span>
      </div>

      <nav className="py-2" aria-label="Product categories">
        {/* All Categories */}
        <Link
          href="/catalog"
          className="flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors"
          style={{
            color: selectedCategoryId === undefined ? "var(--accent)" : "var(--text-secondary)",
            background: selectedCategoryId === undefined ? "var(--accent-glass)" : "transparent",
            fontWeight: selectedCategoryId === undefined ? 700 : 500,
          }}
          aria-current={selectedCategoryId === undefined ? "page" : undefined}
        >
          <span>All Products</span>
          <ChevronRight
            className="h-3.5 w-3.5 opacity-0 transition-opacity"
            style={{
              opacity: selectedCategoryId === undefined ? 1 : 0,
              color: "var(--accent)",
            }}
          />
        </Link>

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.id}`}
              className="flex items-center justify-between px-4 py-2.5 text-sm transition-colors"
              style={{
                color: isSelected ? "var(--accent)" : "var(--text-secondary)",
                background: isSelected ? "var(--accent-glass)" : "transparent",
                fontWeight: isSelected ? 700 : 400,
              }}
              aria-current={isSelected ? "page" : undefined}
            >
              <span className="flex-1 truncate">{cat.name}</span>
              <span
                className="ml-2 flex-shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-bold"
                style={{
                  background: isSelected ? "var(--accent)" : "var(--bg-dark)",
                  color: isSelected ? "#fff" : "var(--text-muted)",
                  border: isSelected ? "none" : "1px solid var(--border)",
                }}
              >
                {cat.productCount}
              </span>
            </Link>
          );
        })}

        {categories.length === 0 && (
          <div className="px-4 py-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>
            No categories yet
          </div>
        )}
      </nav>
    </div>
  );
}
