import { requireRole } from "@/lib/auth/get-user-profile";
import SectionHeader from "@/components/ui/SectionHeader";
import { TrendingUp, Calendar, AlertCircle } from "lucide-react";

export const metadata = { title: "Procurement Forecasting â€” ProcureWise" };

export default async function ForecastingPage() {
  await requireRole("Procurement Officer");

  return (
    <div className="space-y-8 font-sans text-left">
      <SectionHeader
        title="Procurement Forecasting & Trend Analytics"
        subtitle="ARIMA-powered historical purchasing predictions to optimize procurement timing and budget allocations."
      />

      {/* Main visual placeholder card */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-base-200 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-base-200 text-base-content/85">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-base-content">
              ARIMA Predictive Model
            </h2>
            <p className="text-xs text-base-content/60">
              Future procurement timing suggestions based on historical data
            </p>
          </div>
        </div>

        {/* Visual Visualization Placeholder */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-base-300 rounded-lg p-12 bg-base-50/50 min-h-[350px] text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[var(--secondary-strong)]">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-base-content">
              Future ARIMA Chart Visualization Area
            </h3>
            <p className="text-xs text-base-content/60 max-w-sm">
              ARIMA forecasting calculations and visualizations will render here. The system will plot historical purchasing logs against projected demand thresholds.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#D4AF37]/10 text-[var(--secondary-strong)]">
            <AlertCircle className="h-3 w-3" />
            <span>Development Stage: Visualizing Interface</span>
          </span>
        </div>
      </div>
    </div>
  );
}
