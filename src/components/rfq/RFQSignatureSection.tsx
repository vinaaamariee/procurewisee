'use client';

import React from 'react';

interface RFQSignatureSectionProps {
  rfqNumber?: string;
  setRfqNumber?: (val: string) => void;
  printedName?: string;
  setPrintedName?: (val: string) => void;
  bacChairperson?: string;
  setBacChairperson?: (val: string) => void;
  isReadOnly?: boolean;
}

export default function RFQSignatureSection({
  rfqNumber = '2026-001',
  setRfqNumber,
  printedName = '',
  setPrintedName,
  bacChairperson = 'BAC Chairperson',
  setBacChairperson,
  isReadOnly = false,
}: RFQSignatureSectionProps) {
  return (
    <div className="font-sans text-xs text-black space-y-4 pt-2">
      {/* Conforme Statement */}
      <p className="text-center text-[11px] leading-tight text-black font-sans">
        After having carefully read and accepted your conditions, I/We have place my /our best and final price offer on the item/s listed above.
      </p>

      {/* Signature Grid */}
      <div className="grid grid-cols-2 gap-8 pt-4">
        {/* Left Side: Supplier Printed Name/Signature */}
        <div className="space-y-1 self-end">
          <div className="border-b border-black w-4/5 h-8">
            {!isReadOnly && setPrintedName && (
              <input
                type="text"
                value={printedName}
                onChange={(e) => setPrintedName(e.target.value)}
                placeholder="Printed Name / Signature..."
                className="w-full text-xs font-sans bg-transparent focus:outline-none h-full text-black pt-3"
              />
            )}
          </div>
          <div className="text-xs font-sans text-black pt-0.5">
            Printed Name/Signature
          </div>
        </div>

        {/* Right Side: Very truly yours, / BAC Chairperson */}
        <div className="space-y-1 text-right self-end">
          <div className="text-xs font-sans text-black pr-8">Very truly yours,</div>
          <div className="border-b border-black w-4/5 ml-auto h-8"></div>
          <div className="text-xs font-sans italic text-black pr-4 pt-0.5">
            {isReadOnly ? (
              bacChairperson
            ) : (
              <input
                type="text"
                value={bacChairperson}
                onChange={(e) => setBacChairperson?.(e.target.value)}
                className="text-right text-xs font-sans italic bg-transparent focus:outline-none w-full text-black"
              />
            )}
          </div>
        </div>
      </div>

      {/* Ref.# Footer Line */}
      <div className="pt-4 flex justify-between items-baseline text-xs font-sans border-t border-gray-200 mt-4">
        <div className="flex items-baseline gap-1">
          <span className="font-sans">Ref.#</span>
          {isReadOnly ? (
            <span className="font-sans border-b border-black px-2 min-w-[80px] inline-block">
              {rfqNumber}
            </span>
          ) : (
            <input
              type="text"
              value={rfqNumber}
              onChange={(e) => setRfqNumber?.(e.target.value)}
              placeholder="2026-001"
              className="border-b border-black px-1 text-xs bg-transparent focus:outline-none w-28 text-black"
            />
          )}
        </div>
      </div>
    </div>
  );
}
