import Link from "next/link";
import { Package, Tag } from "lucide-react";
import type { ProductListItem } from "@/features/catalog/server/queries";

interface ProductCardProps {
  product: ProductListItem;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Image */}
      <div
        className="relative flex h-44 items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(128, 0, 0, 0.06) 0%, rgba(212, 175, 55, 0.06) 100%)",
        }}
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Package
            className="h-16 w-16 transition-transform duration-200 group-hover:scale-105"
            style={{ color: "var(--accent)", opacity: 0.18 }}
          />
        )}

        {/* Category Badge */}
        <span
          className="absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold"
          style={{
            background: "var(--surface)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <Tag className="h-2.5 w-2.5" />
          {product.category.name}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Name */}
        <h3
          className="line-clamp-2 text-sm font-bold leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {product.name}
        </h3>

        {/* Brand */}
        {product.brand && (
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            {product.brand.name}
          </p>
        )}

        {/* Description */}
        <p
          className="mt-2 line-clamp-2 text-xs leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          {product.description}
        </p>

        {/* Meta */}
        <div className="mt-auto pt-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
              {product.unit.abbreviation}
            </span>
            <span className="text-[10px] text-gray-400 font-bold">
              Updated {timeAgo(product.updatedAt)}
            </span>
          </div>

          {/* Remarks */}
          {product.remarks && (
            <p className="text-[10px] text-gray-500 italic line-clamp-1">
              {product.remarks}
            </p>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              href={`/catalog/${product.id}`}
              className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg border font-bold text-[10px] hover:bg-muted/10 transition duration-150 cursor-pointer"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              Details
            </Link>
            <Link
              href={`/end-user/ppmp?add_product=${product.id}`}
              className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-white font-bold text-[10px] hover:opacity-90 transition duration-150 cursor-pointer"
              style={{ background: "linear-gradient(135deg, var(--accent) 0%, #800000 100%)" }}
            >
              Add to PPMP
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
