import type { Metadata } from "next";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { getCatalogPage, getCatalogFilters } from "@/features/catalog/server/queries";
import ProductGrid from "@/components/catalog/ProductGrid";
import ProductSearch from "@/components/catalog/ProductSearch";
import ProductFilters from "@/components/catalog/ProductFilters";
import CategorySidebar from "@/components/catalog/CategorySidebar";
import CatalogEmptyState from "@/components/catalog/CatalogEmptyState";
import CatalogPagination from "@/components/catalog/CatalogPagination";

export const metadata: Metadata = {
  title: "Procurement Catalog — ProcureWise | Batanes State College",
  description:
    "Browse government-standard products, compare supplier prices, and prepare procurement planning for Batanes State College.",
  keywords: [
    "procurement catalog",
    "Batanes State College",
    "government goods",
    "supplier prices",
    "PPMP",
    "purchase request",
  ],
};

export const dynamic = "force-dynamic";

interface CatalogPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    available?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  const categoryId = params.category ? parseInt(params.category, 10) : undefined;
  const brandId = params.brand ? parseInt(params.brand, 10) : undefined;
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const sortBy = (params.sort as "lowestPrice" | "highestPrice" | "recentlyUpdated" | "mostRequested" | "recentlyAdded") || "recentlyAdded";

  const [{ products, totalCount, totalPages }, filters] = await Promise.all([
    getCatalogPage({
      search: params.q,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      onlyAvailable: params.available === "true",
      sortBy,
      page,
      pageSize: 24,
    }),
    getCatalogFilters(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav
        className="mb-6 flex items-center gap-1.5 text-sm"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="font-medium transition-colors hover:underline"
          style={{ color: "var(--text-muted)" }}
        >
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
          Procurement Catalog
        </span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "var(--accent-glass)", border: "1px solid var(--border-accent)" }}
          >
            <Package className="h-5 w-5" style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h1
              className="text-2xl font-extrabold tracking-tight sm:text-3xl"
              style={{ color: "var(--text-primary)" }}
            >
              Procurement Catalog
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text-muted)" }}>
              {totalCount > 0
                ? `${totalCount.toLocaleString()} ${totalCount === 1 ? "product" : "products"} available`
                : "No products found"}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <ProductSearch initialQuery={params.q ?? ""} />
      </div>

      {/* Horizontal Category Scroller on Top */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Browse Category
          </span>
          {categoryId && (
            <Link
              href="/catalog"
              className="text-xs font-bold text-[#7e191b] dark:text-[#facc15] hover:underline"
            >
              Clear Filter
            </Link>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style dangerouslySetInnerHTML={{ __html: `
            .scrollbar-none::-webkit-scrollbar {
              display: none;
            }
          ` }} />
          <Link
            href="/catalog"
            className="flex-shrink-0 rounded-full px-4.5 py-2 text-xs font-bold transition-all duration-200 border"
            style={{
              background: categoryId === undefined ? "var(--accent)" : "var(--surface)",
              color: categoryId === undefined ? "#fff" : "var(--text-secondary)",
              borderColor: categoryId === undefined ? "transparent" : "var(--border)",
            }}
          >
            All Products
          </Link>
          {filters.categories.map((cat) => {
            const isSelected = categoryId === cat.id;
            return (
              <Link
                key={cat.id}
                href={
                  isSelected 
                    ? "/catalog" // Clear category if tapped again
                    : `/catalog?category=${cat.id}`
                }
                className="flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border"
                style={{
                  background: isSelected ? "var(--accent)" : "var(--surface)",
                  color: isSelected ? "#fff" : "var(--text-secondary)",
                  borderColor: isSelected ? "transparent" : "var(--border)",
                }}
              >
                <span>{cat.name}</span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-extrabold"
                  style={{
                    background: isSelected ? "rgba(255,255,255,0.2)" : "var(--bg-dark)",
                    color: isSelected ? "#fff" : "var(--text-muted)",
                  }}
                >
                  {cat.productCount}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <CategorySidebar
            categories={filters.categories}
            selectedCategoryId={categoryId}
          />
        </aside>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          {/* Filters & Sort */}
          <div className="mb-6">
            <ProductFilters
              brands={filters.brands}
              priceRange={filters.priceRange}
              selectedBrandId={brandId}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onlyAvailable={params.available === "true"}
              selectedSort={sortBy}
              mobileCategories={filters.categories}
              selectedCategoryId={categoryId}
            />
          </div>

          {/* Grid or Empty State */}
          {products.length === 0 ? (
            <CatalogEmptyState hasFilters={!!(params.q || categoryId || brandId)} />
          ) : (
            <>
              <ProductGrid products={products} />
              {totalPages > 1 && (
                <div className="mt-10">
                  <CatalogPagination
                    currentPage={page}
                    totalPages={totalPages}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
