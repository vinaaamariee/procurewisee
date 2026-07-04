import React from "react";
import { Building2, Calendar, ShoppingCart } from "lucide-react";

interface HistoryItem {
  procurementDate: Date;
  supplierName: string;
  unitPrice: number;
  quantity: number;
}

interface SupplierStatisticsProps {
  historyData: HistoryItem[];
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function SupplierStatistics({ historyData }: SupplierStatisticsProps) {
  if (historyData.length === 0) {
    return (
      <div className="py-8 text-center text-sm font-medium" style={{ color: "var(--text-muted)" }}>
        No supplier statistics available.
      </div>
    );
  }

  // Group or display raw historical transactions
  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-sm"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
        <h3
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          Historical Procurement Transactions
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className="border-b text-xs font-bold uppercase tracking-wider"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-left">Supplier</th>
              <th className="px-5 py-3 text-center">Quantity</th>
              <th className="px-5 py-3 text-right">Unit Price</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
            {historyData.map((item, idx) => {
              const formattedDate = new Date(item.procurementDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <tr
                  key={idx}
                  className="transition-colors hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.01)]"
                >
                  {/* Date */}
                  <td className="px-5 py-4 font-medium" style={{ color: "var(--text-secondary)" }}>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 opacity-60" style={{ color: "var(--text-muted)" }} />
                      {formattedDate}
                    </div>
                  </td>

                  {/* Supplier */}
                  <td className="px-5 py-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 opacity-60" style={{ color: "var(--text-muted)" }} />
                      {item.supplierName}
                    </div>
                  </td>

                  {/* Quantity */}
                  <td className="px-5 py-4 text-center font-medium tabular-nums" style={{ color: "var(--text-secondary)" }}>
                    <div className="inline-flex items-center justify-center gap-1">
                      <ShoppingCart className="h-3.5 w-3.5 opacity-60" style={{ color: "var(--text-muted)" }} />
                      {item.quantity}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-4 text-right font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                    {formatCurrency(item.unitPrice)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
