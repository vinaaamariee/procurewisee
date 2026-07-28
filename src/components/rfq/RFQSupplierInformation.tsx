'use client';

import React from 'react';

export interface SupplierInfo {
  companyName?: string;
  businessAddress?: string;
  tin?: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  quotationDate?: string;
}

interface RFQSupplierInformationProps {
  supplier?: SupplierInfo;
  setSupplier?: (supplier: SupplierInfo) => void;
  isReadOnly?: boolean;
}

export default function RFQSupplierInformation({
  supplier = {},
  setSupplier,
  isReadOnly = false,
}: RFQSupplierInformationProps) {
  const handleChange = (field: keyof SupplierInfo, value: string) => {
    if (setSupplier) {
      setSupplier({ ...supplier, [field]: value });
    }
  };

  return (
    <div className="my-4 border border-slate-800 p-3 bg-white text-xs font-serif space-y-2">
      <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-300 pb-1 flex justify-between items-center">
        <span>Supplier / Bidder Information</span>
        <span className="text-[10px] text-slate-500 font-sans normal-case italic">
          (To be filled out by bidding supplier upon quotation submission)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        {/* Company Name */}
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-slate-900 shrink-0">Company Name:</span>
          {isReadOnly ? (
            <span className="border-b border-dotted border-slate-400 grow min-h-[20px] px-1 font-semibold">
              {supplier.companyName || '_____________________________________'}
            </span>
          ) : (
            <input
              type="text"
              value={supplier.companyName || ''}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="e.g. Batanes General Supplies Inc."
              className="grow border-b border-dotted border-slate-400 px-1 py-0.5 text-xs font-serif bg-transparent focus:outline-none focus:border-slate-900"
            />
          )}
        </div>

        {/* TIN */}
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-slate-900 shrink-0">TIN:</span>
          {isReadOnly ? (
            <span className="border-b border-dotted border-slate-400 grow min-h-[20px] px-1">
              {supplier.tin || '___________________________'}
            </span>
          ) : (
            <input
              type="text"
              value={supplier.tin || ''}
              onChange={(e) => handleChange('tin', e.target.value)}
              placeholder="000-000-000-000"
              className="grow border-b border-dotted border-slate-400 px-1 py-0.5 text-xs font-serif bg-transparent focus:outline-none focus:border-slate-900"
            />
          )}
        </div>

        {/* Business Address */}
        <div className="flex items-baseline gap-2 md:col-span-2">
          <span className="font-bold text-slate-900 shrink-0">Business Address:</span>
          {isReadOnly ? (
            <span className="border-b border-dotted border-slate-400 grow min-h-[20px] px-1">
              {supplier.businessAddress || '____________________________________________________________________'}
            </span>
          ) : (
            <input
              type="text"
              value={supplier.businessAddress || ''}
              onChange={(e) => handleChange('businessAddress', e.target.value)}
              placeholder="Address, Municipality, Province"
              className="grow border-b border-dotted border-slate-400 px-1 py-0.5 text-xs font-serif bg-transparent focus:outline-none focus:border-slate-900"
            />
          )}
        </div>

        {/* Contact Person */}
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-slate-900 shrink-0">Contact Person:</span>
          {isReadOnly ? (
            <span className="border-b border-dotted border-slate-400 grow min-h-[20px] px-1">
              {supplier.contactPerson || '___________________________'}
            </span>
          ) : (
            <input
              type="text"
              value={supplier.contactPerson || ''}
              onChange={(e) => handleChange('contactPerson', e.target.value)}
              placeholder="Authorized Representative Name"
              className="grow border-b border-dotted border-slate-400 px-1 py-0.5 text-xs font-serif bg-transparent focus:outline-none focus:border-slate-900"
            />
          )}
        </div>

        {/* Telephone / Mobile */}
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-slate-900 shrink-0">Tel / Mobile No.:</span>
          {isReadOnly ? (
            <span className="border-b border-dotted border-slate-400 grow min-h-[20px] px-1">
              {supplier.contactNumber || '___________________________'}
            </span>
          ) : (
            <input
              type="text"
              value={supplier.contactNumber || ''}
              onChange={(e) => handleChange('contactNumber', e.target.value)}
              placeholder="(09xx) xxx-xxxx"
              className="grow border-b border-dotted border-slate-400 px-1 py-0.5 text-xs font-serif bg-transparent focus:outline-none focus:border-slate-900"
            />
          )}
        </div>

        {/* Email Address */}
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-slate-900 shrink-0">Email Address:</span>
          {isReadOnly ? (
            <span className="border-b border-dotted border-slate-400 grow min-h-[20px] px-1">
              {supplier.email || '___________________________'}
            </span>
          ) : (
            <input
              type="email"
              value={supplier.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="supplier@company.com"
              className="grow border-b border-dotted border-slate-400 px-1 py-0.5 text-xs font-serif bg-transparent focus:outline-none focus:border-slate-900"
            />
          )}
        </div>

        {/* Date Quoted */}
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-slate-900 shrink-0">Quotation Date:</span>
          {isReadOnly ? (
            <span className="border-b border-dotted border-slate-400 grow min-h-[20px] px-1">
              {supplier.quotationDate || '___________________________'}
            </span>
          ) : (
            <input
              type="date"
              value={supplier.quotationDate || ''}
              onChange={(e) => handleChange('quotationDate', e.target.value)}
              className="grow border-b border-dotted border-slate-400 px-1 py-0.5 text-xs font-serif bg-transparent focus:outline-none focus:border-slate-900"
            />
          )}
        </div>
      </div>
    </div>
  );
}
