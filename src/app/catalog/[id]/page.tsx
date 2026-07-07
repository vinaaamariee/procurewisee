import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Package,
  Tag,
  Building2,
  Ruler,
  Barcode,
  CalendarClock,
  ClipboardList,
  ShoppingBag,
} from "lucide-react";
import { getProductDetail, getRelatedProducts } from "@/features/catalog/server/queries";
import SupplierComparisonTable from "@/components/catalog/SupplierComparisonTable";
import HistoricalPriceChart from "@/components/catalog/HistoricalPriceChart";
import RelatedProducts from "@/components/catalog/RelatedProducts";
import AvailabilityBadge from "@/components/catalog/AvailabilityBadge";
import HistoricalPriceCard from "@/components/procurement/HistoricalPriceCard";
import PriceTrend from "@/components/procurement/PriceTrend";
import SupplierStatistics from "@/components/procurement/SupplierStatistics";
import ForecastCard from "@/components/procurement/ForecastCard";
import {
  getAveragePrice,
  getLowestPrice,
  getHighestPrice,
  getLatestPrice,
  getSupplierCount,
  getMonthlyTrend,
  getPriceHistory,
  getPriceVariance,
} from "@/lib/historical-price-queries";
import { forecastProductPrice } from "@/lib/forecast/engine";
import { recommendBestSupplier } from "@/lib/recommendation-engine";
import RecommendationCard from "@/components/recommendation/RecommendationCard";


interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductDetail(parseInt(id, 10));
  if (!product) {
    return { title: "Product Not Found — ProcureWise" };
  }
  return {
    title: `${product.name} — ProcureWise Catalog`,
    description: `View procurement details, supplier prices, and specifications for ${product.name}. ${product.description.slice(0, 120)}`,
  };
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) notFound();

  const product = await getProductDetail(productId);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.id, product.category.id);

  const latestCanvassedPrice =
    product.supplierPrices.length > 0
      ? Math.min(...product.supplierPrices.filter((sp) => sp.available).map((sp) => sp.unitPrice))
      : null;

  // Fetch Historical Price Analytics data
  const avgHistPrice = await getAveragePrice(product.id);
  const minHistPrice = await getLowestPrice(product.id);
  const maxHistPrice = await getHighestPrice(product.id);
  const latestHistPrice = await getLatestPrice(product.id);
  const histSupplierCount = await getSupplierCount(product.id);
  const histTrend = await getMonthlyTrend(product.id);
  const histHistory = await getPriceHistory(product.id);
  const histVariance = await getPriceVariance(product.id);
  const latestProcurementDate = histHistory.length > 0 ? histHistory[0].procurementDate : null;

  // ARIMA price forecast
  const priceForecast = await forecastProductPrice(product.id);

  // Fetch best-value recommendation
  const supplierRecommendation = await recommendBestSupplier(product.id);


  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
        <Link
          href="/"
          className="font-medium transition-colors hover:underline"
          style={{ color: "var(--text-muted)" }}
        >
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
        <Link
          href="/catalog"
          className="font-medium transition-colors hover:underline"
          style={{ color: "var(--text-muted)" }}
        >
          Procurement Catalog
        </Link>
        <ChevronRight className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
        <Link
          href={`/catalog?category=${product.category.id}`}
          className="font-medium transition-colors hover:underline"
          style={{ color: "var(--text-muted)" }}
        >
          {product.category.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
        <span
          className="max-w-[200px] truncate font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {product.name}
        </span>
      </nav>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Left: Image + Procurement Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Product Image */}
          <div
            className="overflow-hidden rounded-2xl border"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div
              className="relative flex h-72 items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(126,25,27,0.05) 0%, rgba(202,138,4,0.05) 100%)",
              }}
            >
              <Package
                className="h-24 w-24 opacity-20"
                style={{ color: "var(--accent)" }}
              />
              <div
                className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: "var(--surface)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <Tag className="h-3 w-3" />
                {product.category.name}
              </div>
              <div className="absolute right-3 top-3">
                <AvailabilityBadge availability={product.availability} />
              </div>
            </div>
          </div>

          {/* Procurement Information Card */}
          <div
            className="overflow-hidden rounded-2xl border"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div
              className="border-b px-5 py-4"
              style={{ borderColor: "var(--border)" }}
            >
              <h2
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: "var(--text-secondary)" }}
              >
                Procurement Information
              </h2>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {/* Current Price */}
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Current Price
                </span>
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: "var(--text-primary)" }}
                >
                  {formatCurrency(product.estimatedUnitCost)}
                </span>
              </div>

              {/* Average Price */}
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Average Price
                </span>
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: "var(--text-primary)" }}
                >
                  {avgHistPrice ? formatCurrency(avgHistPrice) : "—"}
                </span>
              </div>

              {/* Lowest Price */}
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Lowest Price
                </span>
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: minHistPrice ? "var(--green)" : "var(--text-muted)" }}
                >
                  {minHistPrice ? formatCurrency(minHistPrice) : "—"}
                </span>
              </div>

              {/* Highest Price */}
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Highest Price
                </span>
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: maxHistPrice ? "var(--accent)" : "var(--text-muted)" }}
                >
                  {maxHistPrice ? formatCurrency(maxHistPrice) : "—"}
                </span>
              </div>

              {/* Supplier Count */}
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Supplier Count
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {histSupplierCount} {histSupplierCount === 1 ? "supplier" : "suppliers"}
                </span>
              </div>

              {/* Last Updated */}
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Last Updated
                </span>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {timeAgo(product.updatedAt)}
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
              <Link
                href={`/end-user/ppmp?add_product=${product.id}`}
                className="flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all hover:shadow-md"
                style={{
                  borderColor: "var(--accent)",
                  color: "var(--accent)",
                  background: "var(--accent-glass)",
                }}
              >
                <ClipboardList className="h-4 w-4" />
                Add to PPMP
              </Link>
              <Link
                href={`/end-user?product=${product.id}`}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all hover:shadow-md"
                style={{ background: "var(--accent)" }}
              >
                <ShoppingBag className="h-4 w-4" />
                Create PR
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="space-y-6 lg:col-span-3">
          {/* Product Header */}
          <div>
            {product.productCode && (
              <div
                className="mb-2 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-semibold"
                style={{
                  background: "var(--bg-dark)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                <Barcode className="h-3 w-3" />
                {product.productCode}
              </div>
            )}
            <h1
              className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl"
              style={{ color: "var(--text-primary)" }}
            >
              {product.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {product.brand && (
                <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <Building2 className="h-3.5 w-3.5" />
                  {product.brand.name}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                <Ruler className="h-3.5 w-3.5" />
                per {product.unit.abbreviation} ({product.unit.name})
              </span>
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                <CalendarClock className="h-3.5 w-3.5" />
                Updated {timeAgo(product.updatedAt)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div
            className="rounded-xl border p-5"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <h2
              className="mb-2 text-sm font-bold uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Description
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {product.description}
            </p>
          </div>

          {/* Technical Specifications */}
          {product.specifications.length > 0 && (
            <div
              className="overflow-hidden rounded-xl border"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <div
                className="border-b px-5 py-4"
                style={{ borderColor: "var(--border)" }}
              >
                <h2
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Technical Specifications
                </h2>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {product.specifications.map((spec, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-4 px-5 py-3"
                  >
                    <span
                      className="min-w-0 flex-1 text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {spec.specificationName}
                    </span>
                    <span
                      className="text-right text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {spec.specificationValue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best-Value Recommendation Section */}
          {supplierRecommendation && supplierRecommendation.topSupplier && (
            <div className="space-y-2">
              <RecommendationCard recommendation={supplierRecommendation} />
            </div>
          )}

          {/* Supplier Price Comparison / Historical Price Analytics */}
          <div className="space-y-6">
            {product.supplierPrices.length > 0 ? (
              <div
                className="overflow-hidden rounded-xl border"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <div
                  className="border-b px-5 py-4"
                  style={{ borderColor: "var(--border)" }}
                >
                  <h2
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Supplier Price Comparison
                  </h2>
                </div>
                <SupplierComparisonTable
                  supplierPrices={product.supplierPrices}
                  lowestPrice={product.lowestPrice}
                />
              </div>
            ) : (
              // Historical Price Analytics UI
              <div className="space-y-6">
                {avgHistPrice === null ? (
                  <div
                    className="rounded-xl border p-10 text-center"
                    style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                  >
                    <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                      No historical procurement records found.
                    </p>
                  </div>
                ) : (
                  <>
                    <HistoricalPriceCard
                      currentPrice={product.estimatedUnitCost}
                      averagePrice={avgHistPrice}
                      lowestPrice={minHistPrice}
                      highestPrice={maxHistPrice}
                      supplierCount={histSupplierCount}
                      latestProcurementDate={latestProcurementDate}
                    />
                    <PriceTrend trendData={histTrend} />
                    <ForecastCard
                      forecast={priceForecast}
                      currentPrice={product.estimatedUnitCost}
                    />
                    <SupplierStatistics historyData={histHistory} />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Historical Price Chart */}
          {product.priceHistory.length > 1 && (
            <div
              className="overflow-hidden rounded-xl border"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <div
                className="border-b px-5 py-4"
                style={{ borderColor: "var(--border)" }}
              >
                <h2
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Historical Price Trend
                </h2>
              </div>
              <div className="p-5">
                <HistoricalPriceChart data={product.priceHistory} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
    </div>
  );
}
