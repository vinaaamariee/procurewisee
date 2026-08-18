import { Clock } from "lucide-react";

export default function SupplierComparisonTable() {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <Clock className="mb-3 h-8 w-8 opacity-30" style={{ color: "var(--text-muted)" }} />
      <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
        Supplier pricing is managed through the Pre-Canvass process
      </p>
      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
        Prices are collected from exactly 3 suppliers during pre-canvassing
      </p>
    </div>
  );
}
