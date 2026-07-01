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
  const sortBy = (params.sort as "lowestPrice" | "highestPrice" | "recentlyUpdated" | "mostRequested") || "recentlyUpdated";

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
