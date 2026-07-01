"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, ChevronDown, LayoutGrid } from "lucide-react";
import { useState } from "react";

interface Brand {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  productCount: number;
}

interface ProductFiltersProps {
  brands: Brand[];
  priceRange: { min: number; max: number };
  selectedBrandId?: number;
  minPrice?: number;
  maxPrice?: number;
  onlyAvailable?: boolean;
  selectedSort: string;
  mobileCategories: Category[];
  selectedCategoryId?: number;
}

const SORT_OPTIONS = [
  { value: "recentlyUpdated", label: "Recently Updated" },
  { value: "lowestPrice", label: "Lowest Price" },
  { value: "highestPrice", label: "Highest Price" },
  { value: "mostRequested", label: "Most Requested" },
] as const;

export default function ProductFilters({
  brands,
  priceRange,
  selectedBrandId,
  minPrice,
  maxPrice,
  onlyAvailable,
  selectedSort,
  mobileCategories,
  selectedCategoryId,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  function updateParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeFilterCount = [
    selectedBrandId,
    minPrice !== undefined,
    maxPrice !== undefined,
    onlyAvailable,
  ].filter(Boolean).length;

  return (
    <div>
      {/* Desktop Filter Bar */}
      <div
        className="hidden flex-wrap items-center gap-3 rounded-xl border p-4 lg:flex"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Brand */}
        <div className="relative">
          <select
            value={selectedBrandId ?? ""}
            onChange={(e) =>
              updateParam("brand", e.target.value || undefined)
            }
            className="h-9 cursor-pointer appearance-none rounded-lg border py-0 pl-3 pr-8 text-xs font-medium outline-none transition-all focus:ring-2"
            style={{
              background: "var(--bg-dark)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            aria-label="Filter by brand"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
        </div>

        {/* Min Price */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            ₱
          </span>
          <input
            type="number"
            min={0}
            max={priceRange.max}
            step={100}
            defaultValue={minPrice ?? ""}
            placeholder={`Min (${priceRange.min.toLocaleString()})`}
            onBlur={(e) => updateParam("minPrice", e.target.value || undefined)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                updateParam("minPrice", (e.target as HTMLInputElement).value || undefined);
            }}
            className="h-9 w-32 rounded-lg border px-3 text-xs outline-none focus:ring-2"
            style={{
              background: "var(--bg-dark)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            aria-label="Minimum price"
          />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            –
          </span>
          <input
            type="number"
            min={0}
            max={priceRange.max}
            step={100}
            defaultValue={maxPrice ?? ""}
            placeholder={`Max (${priceRange.max.toLocaleString()})`}
            onBlur={(e) => updateParam("maxPrice", e.target.value || undefined)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                updateParam("maxPrice", (e.target as HTMLInputElement).value || undefined);
            }}
            className="h-9 w-32 rounded-lg border px-3 text-xs outline-none focus:ring-2"
            style={{
              background: "var(--bg-dark)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            aria-label="Maximum price"
          />
        </div>

        {/* Available Only Toggle */}
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={onlyAvailable ?? false}
            onChange={(e) =>
              updateParam("available", e.target.checked ? "true" : undefined)
            }
            className="h-4 w-4 cursor-pointer rounded"
            style={{ accentColor: "var(--accent)" }}
            aria-label="Show only available products"
          />
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            Available only
          </span>
        </label>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort */}
        <div className="relative flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Sort:
          </span>
          <select
            value={selectedSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="h-9 cursor-pointer appearance-none rounded-lg border py-0 pl-3 pr-8 text-xs font-medium outline-none"
            style={{
              background: "var(--bg-dark)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
          aria-expanded={mobileOpen}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full text-[0.6rem] font-black text-white"
              style={{ background: "var(--accent)" }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Mobile Sort */}
        <div className="relative flex-1">
          <select
            value={selectedSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="h-10 w-full cursor-pointer appearance-none rounded-xl border py-0 pl-3 pr-8 text-sm font-medium outline-none"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
        </div>
      </div>

      {/* Mobile Filter Panel */}
      {mobileOpen && (
        <div
          className="mt-3 space-y-4 rounded-xl border p-4 lg:hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          {/* Mobile Category */}
          <div>
            <label
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Category
            </label>
            <div className="relative">
              <select
                value={selectedCategoryId ?? ""}
                onChange={(e) => updateParam("category", e.target.value || undefined)}
                className="h-10 w-full cursor-pointer appearance-none rounded-lg border py-0 pl-3 pr-8 text-sm outline-none"
                style={{
                  background: "var(--bg-dark)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">All Categories</option>
                {mobileCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.productCount})
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
          </div>

          {/* Mobile Brand */}
          <div>
            <label
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Brand
            </label>
            <div className="relative">
              <select
                value={selectedBrandId ?? ""}
                onChange={(e) => updateParam("brand", e.target.value || undefined)}
                className="h-10 w-full cursor-pointer appearance-none rounded-lg border py-0 pl-3 pr-8 text-sm outline-none"
                style={{
                  background: "var(--bg-dark)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
          </div>

          {/* Mobile Price Range */}
          <div>
            <label
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Price Range (₱)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step={100}
                defaultValue={minPrice ?? ""}
                placeholder="Min"
                onBlur={(e) => updateParam("minPrice", e.target.value || undefined)}
                className="h-10 flex-1 rounded-lg border px-3 text-sm outline-none"
                style={{
                  background: "var(--bg-dark)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              />
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>–</span>
              <input
                type="number"
                min={0}
                step={100}
                defaultValue={maxPrice ?? ""}
                placeholder="Max"
                onBlur={(e) => updateParam("maxPrice", e.target.value || undefined)}
                className="h-10 flex-1 rounded-lg border px-3 text-sm outline-none"
                style={{
                  background: "var(--bg-dark)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {/* Mobile Available Toggle */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={onlyAvailable ?? false}
              onChange={(e) => updateParam("available", e.target.checked ? "true" : undefined)}
              className="h-4 w-4 cursor-pointer"
              style={{ accentColor: "var(--accent)" }}
            />
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Show available products only
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
