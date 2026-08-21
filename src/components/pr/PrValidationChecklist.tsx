"use client";

import React from "react";
import { CheckSquare, Square, ShieldCheck, AlertCircle } from "lucide-react";

export interface ValidationItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
}

interface PrValidationChecklistProps {
  items: ValidationItem[];
  onToggle: (id: string) => void;
  isLocked?: boolean;
}

export default function PrValidationChecklist({
  items,
  onToggle,
  isLocked = false,
}: PrValidationChecklistProps) {
  const completedCount = items.filter((i) => i.checked).length;
  const isAllPassed = completedCount === items.length;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`h-5 w-5 ${isAllPassed ? "text-[var(--accent)]" : "text-[var(--secondary)]"}`} />
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Procurement Compliance & Validation Checklist
          </h3>
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-bold rounded-full ${
            isAllPassed
              ? "bg-[var(--accent-glass)] text-[var(--accent)] dark:bg-[var(--accent-glass)] dark:text-[var(--secondary)]"
              : "bg-[var(--secondary-dim)] text-[var(--secondary)] dark:bg-[var(--secondary-dim)] dark:text-[var(--secondary)]"
          }`}
        >
          {completedCount} of {items.length} Passed
        </span>
      </div>

      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
        Verify that this Purchase Request complies with Batanes State College procurement guidelines before final approval.
      </p>

      <div className="space-y-2.5">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            disabled={isLocked}
            onClick={() => !isLocked && onToggle(item.id)}
            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
              item.checked
                ? "border-[var(--border-accent)] bg-[var(--accent-glass)]/50 dark:border-[var(--border-accent)] dark:bg-[var(--accent-glass)]"
                : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]"
            } ${isLocked ? "cursor-default opacity-80" : "cursor-pointer"}`}
          >
            {item.checked ? (
              <CheckSquare className="h-5 w-5 text-[var(--accent)] dark:text-[var(--secondary)] mt-0.5 shrink-0" />
            ) : (
              <Square className="h-5 w-5 text-[var(--text-muted)] mt-0.5 shrink-0" />
            )}
            <div className="space-y-0.5">
              <span className={`text-xs font-bold block ${item.checked ? "text-[var(--text-primary)] dark:text-[var(--secondary)]" : "text-[var(--text-primary)]"}`}>
                {item.label}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] block leading-snug">
                {item.description}
              </span>
            </div>
          </button>
        ))}
      </div>

      {!isAllPassed && !isLocked && (
        <div className="flex items-center gap-2 rounded-xl bg-[var(--secondary-dim)] p-3 text-xs text-[var(--secondary)] dark:bg-[var(--secondary-dim)]/40 dark:text-[var(--secondary)]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>All 5 validation checks must pass before the Approve action can be executed.</span>
        </div>
      )}
    </div>
  );
}
