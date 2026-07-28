'use client';

import React from 'react';

interface PRSignatureSectionProps {
  requestedByName?: string;
  requestedByTitle?: string;
  setRequestedByName?: (val: string) => void;
  approvedByName?: string;
  approvedByTitle?: string;
  setApprovedByName?: (val: string) => void;
  isReadOnly?: boolean;
}

export default function PRSignatureSection({
  requestedByName = 'Requisitioning Officer',
  requestedByTitle = 'End-User Unit Head',
  setRequestedByName,
  approvedByName = 'Dr. Djovi R. Durante',
  approvedByTitle = 'Head of the Procuring Entity / SUC President',
  setApprovedByName,
  isReadOnly = false,
}: PRSignatureSectionProps) {
  return (
    <div className="mt-6 border border-slate-900 font-serif text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-900">
        
        {/* Requested By Block */}
        <div className="p-4 space-y-6 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-slate-300 pb-1">
            <span className="font-bold text-slate-950 uppercase text-[11px] font-sans">
              Requested by:
            </span>
          </div>

          <div className="space-y-1 text-center pt-4">
            <div className="border-b border-slate-900 w-3/4 mx-auto h-8"></div>
            <div className="pt-1">
              <span className="font-bold text-slate-950 uppercase text-xs font-sans">
                Signature over Printed Name
              </span>
            </div>
            {isReadOnly ? (
              <div className="font-bold uppercase text-slate-950 text-xs">
                {requestedByName}
              </div>
            ) : (
              <input
                type="text"
                value={requestedByName}
                onChange={(e) => setRequestedByName?.(e.target.value)}
                placeholder="Printed Name of Requisitioner"
                className="w-3/4 text-center font-bold uppercase text-slate-950 border-b border-dotted border-slate-400 py-0.5 text-xs bg-transparent focus:outline-none"
              />
            )}
            <div className="text-[10px] text-slate-600 font-sans">{requestedByTitle}</div>
          </div>
        </div>

        {/* Approved By Block */}
        <div className="p-4 space-y-6 flex flex-col justify-between bg-slate-50/40">
          <div className="flex justify-between items-center border-b border-slate-300 pb-1">
            <span className="font-bold text-slate-950 uppercase text-[11px] font-sans">
              Approved by:
            </span>
          </div>

          <div className="space-y-1 text-center pt-4">
            <div className="border-b border-slate-900 w-3/4 mx-auto h-8"></div>
            <div className="pt-1">
              <span className="font-bold text-slate-950 uppercase text-xs font-sans">
                Signature over Printed Name
              </span>
            </div>
            {isReadOnly ? (
              <div className="font-bold uppercase text-slate-950 text-xs">
                {approvedByName}
              </div>
            ) : (
              <input
                type="text"
                value={approvedByName}
                onChange={(e) => setApprovedByName?.(e.target.value)}
                placeholder="Printed Name of Approver"
                className="w-3/4 text-center font-bold uppercase text-slate-950 border-b border-dotted border-slate-400 py-0.5 text-xs bg-transparent focus:outline-none"
              />
            )}
            <div className="text-[10px] text-slate-600 font-sans">{approvedByTitle}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
