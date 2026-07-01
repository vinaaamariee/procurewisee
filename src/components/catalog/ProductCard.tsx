import Link from "next/link";
import { Package, ArrowRight, Clock, Users, Tag } from "lucide-react";
import type { ProductListItem } from "@/features/catalog/server/queries";
import AvailabilityBadge from "./AvailabilityBadge";

interface ProductCardProps {
  product: ProductListItem;
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
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
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const displayPrice = product.lowestPrice ?? product.estimatedUnitCost;
  const isCanvassedPrice = product.lowestPrice !== null;

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
        className="relative flex h-44 items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(126,25,27,0.06) 0%, rgba(202,138,4,0.06) 100%)",
        }}
      >
        <Package
          className="h-16 w-16 transition-transform duration-200 group-hover:scale-105"
          style={{ color: "var(--accent)", opacity: 0.18 }}
        />

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

        {/* Availability */}
        <div className="absolute right-3 top-3">
          <AvailabilityBadge availability={product.availability} />
        </div>
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

        {/* Price & Meta */}
        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between">
            <div>
              <div
                className="text-lg font-black tabular-nums"
                style={{ color: isCanvassedPrice ? "var(--green)" : "var(--text-primary)" }}
              >
                {formatCurrency(displayPrice)}
              </div>
              <div className="mt-0.5 text-[0.65rem]" style={{ color: "var(--text-muted)" }}>
                {isCanvassedPrice ? "Lowest canvassed" : "Est. unit cost"}
                {" / "}
                {product.unit.abbreviation}
              </div>
            </div>
            <div className="text-right">
              <div
                className="flex items-center gap-1 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <Users className="h-3 w-3" />
                {product.availableSupplierCount}{" "}
                {product.availableSupplierCount === 1 ? "supplier" : "suppliers"}
              </div>
              <div
                className="mt-0.5 flex items-center gap-1 text-[0.65rem]"
                style={{ color: "var(--text-muted)" }}
              >
                <Clock className="h-2.5 w-2.5" />
                {timeAgo(product.updatedAt)}
              </div>
            </div>
          </div>

          {/* View Details */}
          <Link
            href={`/catalog/${product.id}`}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border px-4 py-2.5 text-xs font-bold transition-all hover:shadow-sm"
            style={{
              borderColor: "var(--border-accent)",
              color: "var(--accent)",
              background: "var(--accent-glass)",
            }}
          >
            View Details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
