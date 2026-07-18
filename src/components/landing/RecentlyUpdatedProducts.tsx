import Link from "next/link";
import { Clock, Tag, ArrowRight, Package } from "lucide-react";
import type { RecentProduct } from "@/features/landing/server/queries";

interface RecentlyUpdatedProductsProps {
  title?: string;
  subtitle?: string;
  products: RecentProduct[];
}

function formatPrice(price: number): string {
  return `₱${price.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

export default function RecentlyUpdatedProducts({
  title = "Recently Updated",
  subtitle = "Latest products with updated pricing",
  products,
}: RecentlyUpdatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="recent-products-heading">
      {/* Section header */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p
            className="mb-2 text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--gold)" }}
          >
            Fresh Listings
          </p>
          <h2
            id="recent-products-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        </div>

        <Link
          href="/catalog"
          className="hidden shrink-0 items-center gap-1 text-sm font-bold transition-colors hover:underline sm:inline-flex"
          style={{ color: "var(--accent)" }}
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Product cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {products.map((product) => {
          const displayPrice =
            product.lowestSupplierPrice ?? product.estimatedUnitCost;

          return (
            <Link
              key={product.id}
              href={`/catalog/${product.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border no-underline shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              {/* Image */}
              <div
                className="relative flex h-32 items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(126,25,27,0.08), rgba(202,138,4,0.08))",
                }}
              >
                <Package
                  className="h-10 w-10 opacity-30"
                  style={{ color: "var(--text-secondary)" }}
                />

                {/* Category badge */}
                <span
                  className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold"
                  style={{
                    background: "var(--surface)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Tag className="h-2.5 w-2.5" />
                  {product.category}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-4">
                <h3
                  className="line-clamp-2 text-sm font-bold leading-snug transition-colors group-hover:text-[var(--accent)]"
                  style={{ color: "var(--text-primary)" }}
                >
                  {product.name}
                </h3>

                {product.brand && (
                  <div
                    className="mt-1 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {product.brand}
                  </div>
                )}

                <div className="mt-auto pt-3">
                  <div
                    className="text-lg font-black tabular-nums"
                    style={{ color: "var(--green)" }}
                  >
                    {formatPrice(displayPrice)}
                  </div>

                  <div className="mt-1 flex items-center gap-1">
                    <Clock
                      className="h-3 w-3"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <span
                      className="text-[0.65rem]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Updated {timeAgo(product.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mobile "View all" link */}
      <div className="mt-6 text-center sm:hidden">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1 text-sm font-bold"
          style={{ color: "var(--accent)" }}
        >
          View All Products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}