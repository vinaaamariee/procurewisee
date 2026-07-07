"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getRequisitionTokenAction } from "@/app/actions/requisitions";
import { Search, Loader2 } from "lucide-react";

export default function TrackingForm() {
  const router = useRouter();
  const [trackingCode, setTrackingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await getRequisitionTokenAction(trackingCode);
      if (res.success && res.secureToken) {
        router.push(`/track/${res.secureToken}`);
      } else {
        setErrorMsg(res.message || "Failed to find tracking token.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="tracking-code"
          className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2"
        >
          Tracking Reference Code
        </label>
        <div className="relative">
          <input
            id="tracking-code"
            type="text"
            required
            placeholder="E.g., PR-2026-F982C9"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            className="w-full pl-4 pr-11 py-3 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:border-[#ca8a04] bg-[#FAF9F6] dark:bg-slate-900 text-xs transition text-gray-900 dark:text-white"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="h-4 w-4" />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl">
          ⚠️ {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !trackingCode.trim()}
        className="w-full bg-[#7e191b] hover:bg-[#962124] disabled:bg-gray-400 text-white py-3 rounded-xl font-bold text-xs transition uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching Database...
          </>
        ) : (
          "Track Requisition"
        )}
      </button>
    </form>
  );
}
