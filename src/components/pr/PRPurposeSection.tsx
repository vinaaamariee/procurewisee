'use client';

import React from 'react';

interface PRPurposeSectionProps {
  purpose: string;
  setPurpose?: (val: string) => void;
  isReadOnly?: boolean;
}

export default function PRPurposeSection({
  purpose,
  setPurpose,
  isReadOnly = false,
}: PRPurposeSectionProps) {
  return (
    <div className="pr-purpose-section my-2.5 border border-slate-900 p-3 bg-white font-serif text-xs space-y-1.5 break-inside-avoid" style={{pageBreakInside: 'avoid'}}>
      <div className="font-bold text-slate-950 uppercase tracking-wider text-[11px] font-sans">
        Purpose / Justification of Request: <span className="text-red-500">*</span>
      </div>

      {isReadOnly ? (
        <div className="whitespace-pre-wrap leading-relaxed text-slate-900 border-b border-dotted border-slate-400 pb-2 pt-1 font-serif min-h-[48px]">
          {purpose || 'N/A'}
        </div>
      ) : (
        <textarea
          required
          rows={3}
          value={purpose}
          onChange={(e) => setPurpose?.(e.target.value)}
          placeholder="State the detailed justification, intended usage, project, or event for this purchase request..."
          className="w-full p-2 border border-slate-300 rounded font-serif text-xs text-slate-900 bg-amber-50/50 focus:outline-none focus:ring-1 focus:ring-[#7B1E1E] resize-y"
        />
      )}
    </div>
  );
}
