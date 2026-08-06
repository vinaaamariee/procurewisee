'use client';

import React from 'react';
import { FUND_SOURCES } from '@/lib/constants/fund-sources';

export interface PRGeneralInfo {
  entityName?: string;
  fundCluster?: string;
  office?: string;
  department?: string;
  prNumber?: string;
  date?: string;
  responsibilityCenterCode?: string;
}

interface PRGeneralInformationProps {
  info: PRGeneralInfo;
  setInfo?: (info: PRGeneralInfo) => void;
  isReadOnly?: boolean;
}

export default function PRGeneralInformation({
  info,
  setInfo,
  isReadOnly = false,
}: PRGeneralInformationProps) {
  const handleChange = (field: keyof PRGeneralInfo, value: string) => {
    if (setInfo) {
      setInfo({ ...info, [field]: value });
    }
  };

  return (
    <div className="pr-metadata-section my-2.5 border border-slate-900 font-serif text-xs break-inside-avoid" style={{pageBreakInside: 'avoid'}}>
      <div className="grid grid-cols-2 divide-x divide-slate-900">
        
        {/* Left Column: Entity, Office, Responsibility Center */}
        <div className="p-2.5 space-y-2.5">
          {/* Entity Name */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-slate-950 uppercase shrink-0">Entity Name:</span>
            {isReadOnly ? (
              <span className="border-b border-dotted border-slate-400 grow min-h-[18px] font-semibold text-slate-900">
                {info.entityName || 'Batanes State College'}
              </span>
            ) : (
              <input
                type="text"
                value={info.entityName || 'Batanes State College'}
                onChange={(e) => handleChange('entityName', e.target.value)}
                className="grow border-b border-dotted border-slate-400 px-1 py-0.5 font-serif font-semibold text-slate-900 bg-transparent focus:outline-none focus:border-slate-900"
              />
            )}
          </div>

          {/* Fund Source */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-slate-950 uppercase shrink-0">Fund Source:</span>
            {isReadOnly ? (
              <span className="border-b border-dotted border-slate-400 grow min-h-[18px]">
                {info.fundCluster || 'Not Selected'}
              </span>
            ) : (
              <select
                value={info.fundCluster || ''}
                onChange={(e) => handleChange('fundCluster', e.target.value)}
                required
                aria-label="Fund Source"
                className="grow border-b border-dotted border-slate-400 px-1 py-0.5 font-serif text-slate-900 bg-transparent focus:outline-none focus:border-slate-900 cursor-pointer"
              >
                <option value="">Select Fund Source</option>
                {FUND_SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Office / Section */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-slate-950 uppercase shrink-0">Office / Section:</span>
            {isReadOnly ? (
              <span className="border-b border-dotted border-slate-400 grow min-h-[18px]">
                {info.office || info.department || 'Procurement Unit'}
              </span>
            ) : (
              <input
                type="text"
                value={info.office || info.department || ''}
                onChange={(e) => handleChange('office', e.target.value)}
                placeholder="e.g. IT Department / College of Engineering"
                className="grow border-b border-dotted border-slate-400 px-1 py-0.5 font-serif text-slate-900 bg-transparent focus:outline-none focus:border-slate-900"
              />
            )}
          </div>
        </div>

        {/* Right Column: PR No., Date, Responsibility Code */}
        <div className="p-2.5 space-y-2.5 bg-slate-50/40">
          {/* PR Number */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-slate-950 uppercase shrink-0">PR No.:</span>
            {isReadOnly ? (
              <span className="border-b border-dotted border-slate-400 grow min-h-[18px] font-bold text-[#7B1E1E]">
                {info.prNumber || 'PR-2026-AUTO'}
              </span>
            ) : (
              <input
                type="text"
                value={info.prNumber || ''}
                onChange={(e) => handleChange('prNumber', e.target.value)}
                placeholder="e.g. PR-2026-001 (Auto-generated if empty)"
                className="grow border-b border-dotted border-slate-400 px-1 py-0.5 font-serif font-bold text-[#7B1E1E] bg-transparent focus:outline-none focus:border-slate-900"
              />
            )}
          </div>

          {/* Date */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-slate-950 uppercase shrink-0">Date:</span>
            {isReadOnly ? (
              <span className="border-b border-dotted border-slate-400 grow min-h-[18px]">
                {info.date || new Date().toISOString().split('T')[0]}
              </span>
            ) : (
              <input
                type="date"
                value={info.date || new Date().toISOString().split('T')[0]}
                onChange={(e) => handleChange('date', e.target.value)}
                className="grow border-b border-dotted border-slate-400 px-1 py-0.5 font-serif text-slate-900 bg-transparent focus:outline-none focus:border-slate-900"
              />
            )}
          </div>

          {/* Responsibility Center Code */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-slate-950 uppercase shrink-0">Responsibility Center Code:</span>
            {isReadOnly ? (
              <span className="border-b border-dotted border-slate-400 grow min-h-[18px]">
                {info.responsibilityCenterCode || 'BSC-2026-01'}
              </span>
            ) : (
              <input
                type="text"
                value={info.responsibilityCenterCode || 'BSC-2026-01'}
                onChange={(e) => handleChange('responsibilityCenterCode', e.target.value)}
                placeholder="e.g. BSC-2026-01"
                className="grow border-b border-dotted border-slate-400 px-1 py-0.5 font-serif text-slate-900 bg-transparent focus:outline-none focus:border-slate-900"
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
