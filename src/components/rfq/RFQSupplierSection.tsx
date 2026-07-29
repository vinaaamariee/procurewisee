'use client';

import React from 'react';

interface RFQSupplierSectionProps {
  supplierName?: string;
  setSupplierName?: (val: string) => void;
  isReadOnly?: boolean;
}

export default function RFQSupplierSection({
  supplierName = 'MOJR Construction Trading & General Services, Ltd, Co.',
  setSupplierName,
  isReadOnly = false,
}: RFQSupplierSectionProps) {
  return (
    <div className="font-sans text-xs text-black space-y-1.5 mb-2">
      {/* Supplier / Addressee Line */}
      <div className="font-bold text-xs text-black">
        {isReadOnly ? (
          <div className="border-b border-black pb-0.5 font-bold">
            {supplierName || '____________________________________________________'}
          </div>
        ) : (
          <input
            type="text"
            value={supplierName}
            onChange={(e) => setSupplierName?.(e.target.value)}
            placeholder="Supplier / Company Name..."
            className="w-full border-b border-black font-bold text-xs bg-transparent focus:outline-none py-0.5 text-black"
          />
        )}
      </div>

      {/* Subtitle / Instruction Paragraph */}
      <p className="text-[11px] leading-tight text-black font-sans pl-4">
        Please give us your best and final price offer for the item/s listed below, have this signed and submit this by you or by your duly authorized representative <span className="font-bold">WITHIN SEVEN (7) CALENDAR DAYS</span>
      </p>
    </div>
  );
}
