"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

interface ProductSearchProps {
  initialQuery: string;
}

export default function ProductSearch({ initialQuery }: ProductSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local state in sync when browser navigates (back/forward)
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function updateSearch(value: string) {
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      // Reset to page 1 on new search
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }, 350);
  }

  function clearSearch() {
    setQuery("");
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
        style={{ color: "var(--text-muted)" }}
      />
      <input
        type="search"
        value={query}
        onChange={(e) => updateSearch(e.target.value)}
        placeholder="Search by product name, brand, or category..."
        className="h-11 w-full rounded-xl border pl-11 pr-10 text-sm outline-none transition-all focus:ring-2"
                style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text-primary)",
        }}
        aria-label="Search catalog"
      />
      {query && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
        </button>
      )}
    </div>
  );
}
