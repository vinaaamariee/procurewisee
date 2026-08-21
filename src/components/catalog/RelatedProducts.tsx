import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import type { ProductListItem } from "@/features/catalog/server/queries";

interface RelatedProductsProps {
  products: ProductListItem[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Related Products
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Other products in the same category
          </p>
        </div>
        <Link
          href="/catalog"
          className="hidden items-center gap-1 text-sm font-bold transition-colors hover:underline sm:flex"
          style={{ color: "var(--accent)" }}
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="group overflow-hidden rounded-xl border transition-all hover:shadow-md"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            {/* Image */}
            <div
              className="flex h-32 items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(123, 30, 30, 0.05), rgba(166, 118, 29, 0.05))",
              }}
            >
              <Package
                className="h-10 w-10 transition-transform group-hover:scale-105"
                style={{ color: "var(--accent)", opacity: 0.2 }}
              />
            </div>

            {/* Content */}
            <div className="p-4">
              <h3
                className="line-clamp-2 text-sm font-bold leading-snug"
                style={{ color: "var(--text-primary)" }}
              >
                {product.name}
              </h3>

              {product.brand && (
                <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  {product.brand.name}
                </p>
              )}

              <p className="mt-2 text-xs line-clamp-2" style={{ color: "var(--text-muted)" }}>
                {product.description}
              </p>

              <Link
                href={`/catalog/${product.id}`}
                className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border py-2 text-xs font-bold transition-all hover:shadow-sm"
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
        ))}
      </div>
    </section>
  );
}
