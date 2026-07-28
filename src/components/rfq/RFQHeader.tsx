'use client';

import React from 'react';

interface RFQHeaderProps {
  date?: string;
  setDate?: (val: string) => void;
  isReadOnly?: boolean;
}

export default function RFQHeader({
  date = new Date().toISOString().split('T')[0],
  setDate,
  isReadOnly = false,
}: RFQHeaderProps) {
  return (
    <div className="font-sans text-xs text-black space-y-1 mb-2">
      {/* Top Header Row: Annex D & Date */}
      <div className="flex justify-between items-baseline font-sans text-xs">
        <div className="font-sans text-xs text-slate-900 font-normal">Annex D</div>
        <div className="flex items-baseline gap-1 text-xs">
          <span className="font-sans">Date:</span>
          {isReadOnly ? (
            <span className="border-b border-black px-2 min-w-[100px] inline-block font-sans text-center">
              {date}
            </span>
          ) : (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate?.(e.target.value)}
              className="border-b border-black px-1 text-xs bg-transparent focus:outline-none font-sans"
            />
          )}
        </div>
      </div>

      {/* Main Document Title */}
      <div className="text-center pt-1 pb-2">
        <h1 className="text-base font-bold text-black tracking-wide uppercase font-sans">
          REQUEST FOR PRICE QUOTATION
        </h1>
      </div>
    </div>
  );
}
