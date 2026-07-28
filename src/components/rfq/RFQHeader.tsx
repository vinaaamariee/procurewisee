'use client';

import React from 'react';

interface RFQHeaderProps {
  title: string;
  setTitle?: (val: string) => void;
  rfqNumber: string;
  setRfqNumber?: (val: string) => void;
  isManualOverride?: boolean;
  setIsManualOverride?: (val: boolean) => void;
  overrideCategory?: string;
  setOverrideCategory?: (val: string) => void;
  overrideDetails?: string;
  setOverrideDetails?: (val: string) => void;
  nextRfqNumber?: string;
  date?: string;
  setDate?: (val: string) => void;
  modeOfProcurement?: string;
  setModeOfProcurement?: (val: string) => void;
  approvedBudget: number | '';
  setApprovedBudget?: (val: number | '') => void;
  deadlineDate: string;
  setDeadlineDate?: (val: string) => void;
  deliveryPeriod?: string;
  setDeliveryPeriod?: (val: string) => void;
  isReadOnly?: boolean;
}

export default function RFQHeader({
  title,
  setTitle,
  rfqNumber,
  setRfqNumber,
  isManualOverride = false,
  setIsManualOverride,
  overrideCategory = 'Urgent Operational Requirement',
  setOverrideCategory,
  overrideDetails = '',
  setOverrideDetails,
  nextRfqNumber = '',
  date = new Date().toISOString().split('T')[0],
  setDate,
  modeOfProcurement = 'Small Value Procurement (Sec. 53.9)',
  setModeOfProcurement,
  approvedBudget,
  setApprovedBudget,
  deadlineDate,
  setDeadlineDate,
  deliveryPeriod = '15 Calendar Days',
  setDeliveryPeriod,
  isReadOnly = false,
}: RFQHeaderProps) {
  return (
    <div className="space-y-4 my-4">
      {/* Subject / Title of Solicitation */}
      <div className="border-b border-slate-300 pb-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-sans">
          Title / Subject of Solicitation <span className="text-red-500">*</span>
        </label>
        {isReadOnly ? (
          <div className="text-sm font-semibold text-slate-900 border-b border-dotted border-slate-400 py-1 font-serif">
            {title || 'N/A'}
          </div>
        ) : (
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle?.(e.target.value)}
            placeholder="e.g. Procurement of Office Supplies & Equipment Wrap with Print"
            className="w-full text-sm font-semibold text-slate-900 bg-amber-50/50 border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#7B1E1E] font-serif"
          />
        )}
      </div>

      {/* Grid of Official Document Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-xs text-slate-800 font-serif">
        
        {/* RFQ Number & Sequence Override */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 uppercase">RFQ No.:</span>
            {!isReadOnly && setIsManualOverride && (
              <label className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-sans cursor-pointer print:hidden">
                <input
                  type="checkbox"
                  checked={isManualOverride}
                  onChange={(e) => {
                    setIsManualOverride(e.target.checked);
                    if (!e.target.checked && setRfqNumber && nextRfqNumber) {
                      setRfqNumber(nextRfqNumber);
                    }
                  }}
                  className="rounded text-[#7B1E1E] focus:ring-0 cursor-pointer"
                />
                <span>Override Sequence</span>
              </label>
            )}
          </div>
          {isReadOnly ? (
            <div className="font-bold text-slate-900 border-b border-slate-400 py-0.5">
              {rfqNumber || 'N/A'}
            </div>
          ) : (
            <input
              type="text"
              required
              disabled={!isManualOverride}
              value={rfqNumber}
              onChange={(e) => setRfqNumber?.(e.target.value)}
              className={`w-full font-bold px-2 py-1 border rounded text-xs ${
                isManualOverride
                  ? 'bg-amber-50 border-amber-400 text-slate-900'
                  : 'bg-slate-100 border-slate-300 text-slate-600 cursor-not-allowed'
              }`}
            />
          )}
        </div>

        {/* Date of Issuance */}
        <div className="space-y-1">
          <span className="font-bold text-slate-900 uppercase">Date:</span>
          {isReadOnly ? (
            <div className="border-b border-slate-400 py-0.5">{date}</div>
          ) : (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate?.(e.target.value)}
              className="w-full px-2 py-1 border border-slate-300 rounded bg-amber-50/50 text-slate-900 text-xs font-serif"
            />
          )}
        </div>

        {/* Mode of Procurement */}
        <div className="space-y-1">
          <span className="font-bold text-slate-900 uppercase">Mode of Procurement:</span>
          {isReadOnly ? (
            <div className="border-b border-slate-400 py-0.5">{modeOfProcurement}</div>
          ) : (
            <input
              type="text"
              value={modeOfProcurement}
              onChange={(e) => setModeOfProcurement?.(e.target.value)}
              placeholder="e.g. Small Value Procurement (Sec. 53.9)"
              className="w-full px-2 py-1 border border-slate-300 rounded bg-amber-50/50 text-slate-900 text-xs font-serif"
            />
          )}
        </div>

        {/* Approved Budget for Contract (ABC) */}
        <div className="space-y-1">
          <span className="font-bold text-slate-900 uppercase">
            Approved Budget (ABC): <span className="text-red-500">*</span>
          </span>
          {isReadOnly ? (
            <div className="font-bold text-[#7B1E1E] border-b border-slate-400 py-0.5">
              ₱ {typeof approvedBudget === 'number' ? approvedBudget.toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}
            </div>
          ) : (
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₱</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={approvedBudget}
                onChange={(e) => setApprovedBudget?.(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0.00"
                className="w-full pl-6 pr-2 py-1 border border-slate-300 rounded bg-amber-50/50 text-slate-900 text-xs font-bold text-[#7B1E1E]"
              />
            </div>
          )}
        </div>

        {/* Submission Deadline */}
        <div className="space-y-1">
          <span className="font-bold text-slate-900 uppercase">
            Submission Deadline: <span className="text-red-500">*</span>
          </span>
          {isReadOnly ? (
            <div className="border-b border-slate-400 py-0.5">{deadlineDate}</div>
          ) : (
            <input
              type="date"
              required
              value={deadlineDate}
              onChange={(e) => setDeadlineDate?.(e.target.value)}
              className="w-full px-2 py-1 border border-slate-300 rounded bg-amber-50/50 text-slate-900 text-xs font-serif"
            />
          )}
        </div>

        {/* Delivery Period */}
        <div className="space-y-1">
          <span className="font-bold text-slate-900 uppercase">Delivery Period:</span>
          {isReadOnly ? (
            <div className="border-b border-slate-400 py-0.5">{deliveryPeriod}</div>
          ) : (
            <input
              type="text"
              value={deliveryPeriod}
              onChange={(e) => setDeliveryPeriod?.(e.target.value)}
              placeholder="e.g. 15 Calendar Days"
              className="w-full px-2 py-1 border border-slate-300 rounded bg-amber-50/50 text-slate-900 text-xs font-serif"
            />
          )}
        </div>

      </div>

      {/* Manual Override Reason Container (Audited) */}
      {!isReadOnly && isManualOverride && setOverrideCategory && setOverrideDetails && (
        <div className="mt-3 p-3 bg-amber-50/80 border border-amber-300 rounded-md text-xs space-y-2 print:hidden">
          <div className="font-bold text-[#7B1E1E] uppercase tracking-wide text-[11px] flex items-center gap-1.5">
            <span>⚠️</span> Sequence Override Justification (Audited)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Override Reason Category *</label>
              <select
                value={overrideCategory}
                onChange={(e) => setOverrideCategory(e.target.value)}
                className="w-full p-1 border border-slate-300 rounded bg-white text-xs"
              >
                <option value="Emergency Procurement">Emergency Procurement</option>
                <option value="Urgent Operational Requirement">Urgent Operational Requirement</option>
                <option value="Other (specify below)">Other (specify below)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Reason Details / Justification *</label>
              <textarea
                rows={1}
                value={overrideDetails}
                onChange={(e) => setOverrideDetails(e.target.value)}
                placeholder="Provide detailed justification for manually setting the RFQ sequence number..."
                className="w-full p-1 border border-slate-300 rounded bg-white text-xs resize-y"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
