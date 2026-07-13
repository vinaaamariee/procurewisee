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
        className="relative flex h-44 items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(126,25,27,0.06) 0%, rgba(202,138,4,0.06) 100%)",
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
        <div className="mt-auto pt-4 space-y-3.5">
          <div className="flex items-start justify-between">
            <div>
              <div
                className="text-base font-extrabold tabular-nums"
                style={{ color: "var(--accent)" }}
              >
                {formatCurrency(displayPrice)}
              </div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                {isCanvassedPrice ? "Lowest Evaluated Bid" : "Estimated Unit Cost"}
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-[11px] font-bold" style={{ color: "var(--text-secondary)" }}>
                <Users className="h-3.5 w-3.5" />
                <span>{product.availableSupplierCount} {product.availableSupplierCount === 1 ? "Supplier" : "Suppliers"}</span>
              </div>
              <span className="text-[9px] text-gray-400 font-bold block mt-0.5">{product.unit.abbreviation} unit</span>
            </div>
          </div>

          {/* Historical price highlights */}
          <div className="grid grid-cols-2 gap-2 bg-muted/10 border p-2 rounded-xl text-[10px]" style={{ borderColor: "var(--border)" }}>
            <div>
              <span className="text-gray-400 block font-bold text-[8px] uppercase tracking-wider">Hist. Average</span>
              <span className="font-extrabold tabular-nums" style={{ color: "var(--text-secondary)" }}>
                {formatCurrency(product.averageHistoricalPrice ?? displayPrice)}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block font-bold text-[8px] uppercase tracking-wider">Hist. Lowest</span>
              <span className="font-extrabold tabular-nums text-green-600">
                {formatCurrency(product.lowestHistoricalPrice ?? displayPrice)}
              </span>
            </div>
          </div>

          {/* ARIMA Forecast & Recommendation Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {product.forecastTrend && product.forecastTrend !== "unknown" && (
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase"
                style={{
                  color:
                    product.forecastTrend === "increasing"
                      ? "var(--accent)"
                      : product.forecastTrend === "decreasing"
                      ? "var(--green)"
                      : "var(--text-secondary)",
                  backgroundColor:
                    product.forecastTrend === "increasing"
                      ? "rgba(239, 68, 68, 0.05)"
                      : product.forecastTrend === "decreasing"
                      ? "rgba(34, 197, 94, 0.05)"
                      : "rgba(107, 114, 128, 0.05)",
                }}
              >
                Forecast: {product.forecastTrend === "increasing" ? "↑" : product.forecastTrend === "decreasing" ? "↓" : "→"}{" "}
                {product.forecastTrend}
              </span>
            )}
            
            {product.availableSupplierCount > 0 && (
              <span className="px-1.5 py-0.5 bg-green-500/10 border border-green-500/20 text-green-600 font-extrabold rounded text-[8px] uppercase">
                Best-Value Match
              </span>
            )}
          </div>

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
              style={{ background: "linear-gradient(135deg, var(--accent) 0%, #1e40af 100%)" }}
            >
              Add to PPMP
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
