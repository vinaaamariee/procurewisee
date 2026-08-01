"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface ReviewPrModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "approve" | "return";
  onConfirm: (remarks?: string) => Promise<void>;
  isProcessing: boolean;
  prNumber: string;
}

export default function ReviewPrModal({
  isOpen,
  onClose,
  mode,
  onConfirm,
  isProcessing,
  prNumber,
}: ReviewPrModalProps) {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "return" && !remarks.trim()) {
      setError("Return reason comment is required to return a Purchase Request.");
      return;
    }
    setError(null);
    await onConfirm(mode === "return" ? remarks.trim() : undefined);
    setRemarks("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl space-y-5 text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            {mode === "approve" ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle className="h-6 w-6" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <AlertCircle className="h-6 w-6" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                {mode === "approve" ? "Approve Purchase Request" : "Return Purchase Request"}
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-medium">
                {prNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "approve" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 text-sm space-y-2">
              <p className="font-semibold">Approve Purchase Request?</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                This Purchase Request has passed Procurement Office validation and will become eligible for RFQ generation. The document will be locked from further End User modifications.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-300">
                Return this Purchase Request to the End User for revision. A clear explanation is required.
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Reason for Returning <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={remarks}
                  onChange={(e) => {
                    setRemarks(e.target.value);
                    if (e.target.value.trim()) setError(null);
                  }}
                  placeholder="Explain what corrections or missing documents (e.g. PPMP, item specs) are required..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--text-primary)]"
                  autoFocus
                />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="btn btn-ghost btn-sm rounded-xl text-sm text-[var(--text-muted)]"
            >
              Cancel
            </button>
            {mode === "approve" ? (
              <button
                type="submit"
                disabled={isProcessing}
                className="btn btn-success btn-sm rounded-xl px-5 text-white shadow-xs"
              >
                {isProcessing ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Approve Purchase Request"
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isProcessing || !remarks.trim()}
                className="btn btn-error btn-sm rounded-xl px-5 text-white shadow-xs disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Return Request"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
