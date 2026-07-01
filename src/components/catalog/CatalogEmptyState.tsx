import Link from "next/link";
import { PackageSearch, RotateCcw } from "lucide-react";

interface CatalogEmptyStateProps {
  hasFilters: boolean;
}

export default function CatalogEmptyState({ hasFilters }: CatalogEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border py-20 text-center"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "var(--accent-glass)", border: "1px solid var(--border-accent)" }}
      >
        <PackageSearch className="h-8 w-8" style={{ color: "var(--accent)" }} />
      </div>

      <h2
        className="text-lg font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {hasFilters ? "No Products Found" : "No Products Available"}
      </h2>

      <p
        className="mx-auto mt-2 max-w-sm text-sm leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        {hasFilters
          ? "Your current search or filter criteria didn't match any products. Try adjusting the filters or clearing your search."
          : "The procurement catalog is currently empty. Products are added and maintained by the Procurement Office."}
      </p>

      {hasFilters && (
        <Link
          href="/catalog"
          className="mt-6 flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition-all hover:shadow-md"
          style={{
            borderColor: "var(--border-accent)",
            color: "var(--accent)",
            background: "var(--accent-glass)",
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Clear All Filters
        </Link>
      )}
    </div>
  );
}
