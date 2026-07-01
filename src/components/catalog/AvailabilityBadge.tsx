import type { MarketAvailability } from "@/features/catalog/server/queries";

const CONFIG: Record<
  MarketAvailability,
  { label: string; dotColor: string; textColor: string; bg: string; border: string }
> = {
  Available: {
    label: "Available",
    dotColor: "#10b981",
    textColor: "#059669",
    bg: "rgba(5, 150, 105, 0.08)",
    border: "rgba(5, 150, 105, 0.2)",
  },
  Limited: {
    label: "Limited",
    dotColor: "#f59e0b",
    textColor: "#d97706",
    bg: "rgba(217, 119, 6, 0.08)",
    border: "rgba(217, 119, 6, 0.2)",
  },
  Unavailable: {
    label: "Unavailable",
    dotColor: "#ef4444",
    textColor: "#dc2626",
    bg: "rgba(220, 38, 38, 0.08)",
    border: "rgba(220, 38, 38, 0.2)",
  },
};

interface AvailabilityBadgeProps {
  availability: MarketAvailability;
}

export default function AvailabilityBadge({ availability }: AvailabilityBadgeProps) {
  const config = CONFIG[availability];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-bold"
      style={{
        background: config.bg,
        color: config.textColor,
        border: `1px solid ${config.border}`,
      }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: config.dotColor }}
      />
      {config.label}
    </span>
  );
}
