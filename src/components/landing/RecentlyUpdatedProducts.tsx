import Link from "next/link";
import { Clock, Tag, ArrowRight } from "lucide-react";
import type { RecentProduct } from "@/features/landing/server/queries";

interface RecentlyUpdatedProductsProps {
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

export default function RecentlyUpdatedProducts({ products }: RecentlyUpdatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16" style={{ background: "var(--bg-deep)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2
              className="text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ color: "var(--text-primary)" }}
            >
              Recently Updated
            </h2>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Latest products with updated pricing
            </p>
          </div>
          <Link
            href="/catalog"
            className="hidden items-center gap-1 text-sm font-bold transition-colors hover:underline sm:flex"
            style={{ color: "var(--accent)" }}
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const displayPrice =
              product.lowestSupplierPrice ?? product.estimatedUnitCost;
            return (
              <div
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-2xl border transition-all hover:shadow-lg"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                {/* Image placeholder with gradient */}
                <div
                  className="relative flex h-40 items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(126,25,27,0.08), rgba(202,138,4,0.08))",
                  }}
                >
                  <div className="text-4xl opacity-30">📦</div>
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
                    className="line-clamp-2 text-sm font-bold leading-snug"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {product.name}
                  </h3>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {product.brand}
                    </span>
                  </div>

                  <div className="mt-auto pt-3">
                    <div
                      className="text-lg font-black tabular-nums"
                      style={{ color: "var(--green)" }}
                    >
                      {formatPrice(displayPrice)}
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
                      <span className="text-[0.65rem]" style={{ color: "var(--text-muted)" }}>
                        Updated {timeAgo(product.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/catalog/${product.id}`}
                    className="mt-3 flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold transition-all hover:shadow-sm"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--accent)",
                      background: "var(--accent-glass)",
                    }}
                  >
                    View Details
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile "View all" link */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1 text-sm font-bold"
            style={{ color: "var(--accent)" }}
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
