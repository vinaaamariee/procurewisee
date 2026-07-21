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
  title = "Recently Updated Supplies",
  subtitle = "Latest catalog products with verified market pricing",
  products,
}: RecentlyUpdatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="recent-products-heading">
      {/* Section header */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#D4A017]">
            Fresh Listings
          </p>
          <h2
            id="recent-products-heading"
            className="text-3xl font-bold tracking-tight text-[#111827] dark:text-white"
          >
            {title}
          </h2>
          <p className="mt-1 text-sm text-[#6B7280] dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        <Link
          href="/catalog"
          className="hidden shrink-0 items-center gap-1.5 text-xs font-bold text-[#7B1E1E] dark:text-red-400 hover:underline sm:inline-flex"
        >
          <span>View Catalog</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Product cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {products.map((product) => {
          const displayPrice =
            product.lowestSupplierPrice ?? product.estimatedUnitCost;

          return (
            <Link
              key={product.id}
              href={`/catalog/${product.id}`}
              className="group bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 no-underline shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              {/* Top Banner */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#7B1E1E]/10 dark:bg-[#7B1E1E]/20 px-3 py-1 text-[10px] font-bold text-[#7B1E1E] dark:text-red-400 uppercase tracking-wide">
                    <Tag className="h-3 w-3" />
                    {product.category}
                  </span>
                  <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo(product.updatedAt)}
                  </span>
                </div>

                <h3 className="line-clamp-2 text-base font-bold text-[#111827] dark:text-white group-hover:text-[#7B1E1E] dark:group-hover:text-red-300 transition-colors leading-snug">
                  {product.name}
                </h3>

                {product.brand && (
                  <p className="text-xs font-semibold text-gray-400">
                    Brand: {product.brand}
                  </p>
                )}
              </div>

              {/* Price & Unit */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-baseline justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Est. Unit Cost
                  </p>
                  <p className="text-xl font-black text-[#111827] dark:text-white mt-0.5">
                    {formatPrice(displayPrice)}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mobile "View all" button */}
      <div className="mt-6 text-center sm:hidden">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1 text-sm font-bold text-[#7B1E1E] dark:text-red-400"
        >
          <span>View All Products</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}