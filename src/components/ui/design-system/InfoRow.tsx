import React from "react";

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export default function InfoRow({
  label,
  value,
  className = "",
}: InfoRowProps) {
  return (
    <div className={`grid grid-cols-3 gap-2 py-2 border-b border-base-200 text-left text-xs ${className}`}>
      <span className="col-span-1 font-bold text-base-content/60">
        {label}
      </span>
      <div className="col-span-2 font-semibold text-base-content whitespace-pre-wrap">
        {value || "—"}
      </div>
    </div>
  );
}
