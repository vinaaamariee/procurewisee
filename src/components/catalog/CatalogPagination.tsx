"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function CatalogPagination({
  currentPage,
  totalPages,
}: CatalogPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigateTo(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  // Generate page numbers with ellipsis
  function getPageNumbers(): (number | "...")[] {
    const pages: (number | "...")[] = [];
    const delta = 2;
    const range: number[] = [];

    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      range.push(i);
    }

    if (range[0] > 1) {
      pages.push(1);
      if (range[0] > 2) pages.push("...");
    }
    pages.push(...range);
    if (range[range.length - 1] < totalPages) {
      if (range[range.length - 1] < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1.5">
      {/* Prev */}
      <button
        onClick={() => navigateTo(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border transition-all hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text-secondary)",
        }}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Pages */}
      {pageNumbers.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => navigateTo(p)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition-all"
            style={{
              background: p === currentPage ? "var(--accent)" : "var(--surface)",
              borderColor: p === currentPage ? "var(--accent)" : "var(--border)",
              color: p === currentPage ? "#fff" : "var(--text-secondary)",
              fontWeight: p === currentPage ? 800 : 500,
            }}
            aria-label={`Go to page ${p}`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => navigateTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg border transition-all hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text-secondary)",
        }}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
