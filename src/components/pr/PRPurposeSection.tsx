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
    <div className="pr-purpose-section my-2.5 border border-gray-900 p-3 bg-white font-serif text-xs space-y-1.5 break-inside-avoid" style={{pageBreakInside: 'avoid'}}>
      <div className="font-bold text-gray-950 uppercase tracking-wider text-[11px] font-sans">
        Purpose / Justification of Request: <span className="text-[var(--accent)]">*</span>
      </div>

      {isReadOnly ? (
        <div className="whitespace-pre-wrap leading-relaxed text-gray-900 border-b border-dotted border-gray-400 pb-2 pt-1 font-serif min-h-[48px]">
          {purpose || 'N/A'}
        </div>
      ) : (
        <textarea
          required
          rows={3}
          value={purpose}
          onChange={(e) => setPurpose?.(e.target.value)}
          placeholder="State the detailed justification, intended usage, project, or event for this purchase request..."
          className="w-full p-2 border border-gray-300 rounded font-serif text-xs text-gray-900 bg-[var(--secondary-dim)]/50 focus:outline-none focus:ring-1 focus:ring-[#800000] resize-y"
        />
      )}
    </div>
  );
}
