import { CheckCircle2, ShieldCheck, Clock, TrendingDown } from "lucide-react";
import type { SupplierPrice } from "@/features/catalog/server/queries";

interface SupplierComparisonTableProps {
  supplierPrices: SupplierPrice[];
  lowestPrice: number | null;
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return <span style={{ color: "var(--text-muted)" }}>—</span>;
  const filled = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < filled ? "#f59e0b" : "var(--border)" }}>
          ★
        </span>
      ))}
      <span
        className="ml-1 text-xs tabular-nums"
        style={{ color: "var(--text-muted)" }}
      >
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

export default function SupplierComparisonTable({
  supplierPrices,
  lowestPrice,
}: SupplierComparisonTableProps) {
  if (supplierPrices.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <Clock className="mb-3 h-8 w-8 opacity-30" style={{ color: "var(--text-muted)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          No supplier prices recorded yet
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          Prices are updated by the Procurement Office
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr
            className="border-b text-xs font-bold uppercase tracking-wider"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <th className="px-5 py-3 text-left">Supplier</th>
            <th className="px-5 py-3 text-right">Unit Price</th>
            <th className="px-5 py-3 text-center">Delivery Days</th>
            <th className="px-5 py-3 text-center">Reliability</th>
            <th className="px-5 py-3 text-right">Last Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
          {supplierPrices.map((sp) => {
            const isLowest =
              lowestPrice !== null && sp.unitPrice === lowestPrice && sp.available;
            return (
              <tr
                key={sp.id}
                className="transition-colors"
                style={{
                  background: isLowest ? "var(--green-dim)" : "transparent",
                }}
              >
                {/* Supplier Name */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <div
                        className="flex items-center gap-1.5 font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {sp.supplier.companyName}
                        {sp.supplier.isVerified && (
                          <ShieldCheck
                            className="h-3.5 w-3.5"
                            style={{ color: "var(--green)" }}
                            aria-label="Verified supplier"
                          />
                        )}
                        {isLowest && (
                          <span
                            className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold"
                            style={{
                              background: "var(--green)",
                              color: "#fff",
                            }}
                          >
                            <TrendingDown className="h-2.5 w-2.5" />
                            Best Price
                          </span>
                        )}
                      </div>
                      {!sp.available && (
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Currently unavailable
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="px-5 py-4 text-right">
                  <span
                    className="font-black tabular-nums"
                    style={{
                      color: isLowest ? "var(--green)" : "var(--text-primary)",
                      fontSize: isLowest ? "0.95rem" : "0.875rem",
                    }}
                  >
                    {formatCurrency(sp.unitPrice)}
                  </span>
                </td>

                {/* Delivery Days */}
                <td className="px-5 py-4 text-center">
                  <span
                    className="font-medium tabular-nums"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {sp.supplier.historicalDeliveryDays > 0
                      ? `${sp.supplier.historicalDeliveryDays}d`
                      : "—"}
                  </span>
                </td>

                {/* Reliability */}
                <td className="px-5 py-4 text-center">
                  <StarRating rating={sp.supplier.reliabilityRating} />
                </td>

                {/* Last Updated */}
                <td
                  className="px-5 py-4 text-right text-xs tabular-nums"
                  style={{ color: "var(--text-muted)" }}
                >
                  {new Date(sp.updatedAt).toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
