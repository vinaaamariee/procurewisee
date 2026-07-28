'use client';

import React from 'react';

interface RFQSignatureSectionProps {
  preparedByName?: string;
  preparedByTitle?: string;
  setPreparedByName?: (val: string) => void;
  approvedByName?: string;
  approvedByTitle?: string;
  setApprovedByName?: (val: string) => void;
  isReadOnly?: boolean;
}

export default function RFQSignatureSection({
  preparedByName = 'Procurement Officer',
  preparedByTitle = 'Procurement Unit Head',
  setPreparedByName,
  approvedByName = 'Dr. Djovi R. Durante',
  approvedByTitle = 'Head of the Procuring Entity / SUC President',
  setApprovedByName,
  isReadOnly = false,
}: RFQSignatureSectionProps) {
  return (
    <div className="mt-8 pt-4 border-t-2 border-slate-900 font-serif text-xs space-y-6">
      <div className="text-[11px] text-slate-700 italic">
        After having carefully read and accepted your General Terms and Conditions, I / We quote you on the item(s) at prices noted above.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-center">
        {/* Prepared By Block */}
        <div className="space-y-8 flex flex-col justify-between">
          <div className="font-bold text-slate-900 uppercase text-[11px] text-left">
            Prepared By:
          </div>
          <div className="space-y-1">
            <div className="border-b border-slate-900 w-4/5 mx-auto h-8"></div>
            {isReadOnly ? (
              <div className="font-bold uppercase text-slate-950 pt-1">
                {preparedByName}
              </div>
            ) : (
              <input
                type="text"
                value={preparedByName}
                onChange={(e) => setPreparedByName?.(e.target.value)}
                placeholder="Name of Procurement Officer"
                className="w-4/5 text-center font-bold uppercase text-slate-950 border-b border-dotted border-slate-400 py-0.5 text-xs bg-transparent focus:outline-none"
              />
            )}
            <div className="text-[10px] text-slate-600 font-sans">{preparedByTitle}</div>
          </div>
        </div>

        {/* Approved By Block */}
        <div className="space-y-8 flex flex-col justify-between">
          <div className="font-bold text-slate-900 uppercase text-[11px] text-left">
            Approved By:
          </div>
          <div className="space-y-1">
            <div className="border-b border-slate-900 w-4/5 mx-auto h-8"></div>
            {isReadOnly ? (
              <div className="font-bold uppercase text-slate-950 pt-1">
                {approvedByName}
              </div>
            ) : (
              <input
                type="text"
                value={approvedByName}
                onChange={(e) => setApprovedByName?.(e.target.value)}
                placeholder="Name of Head of Procuring Entity"
                className="w-4/5 text-center font-bold uppercase text-slate-950 border-b border-dotted border-slate-400 py-0.5 text-xs bg-transparent focus:outline-none"
              />
            )}
            <div className="text-[10px] text-slate-600 font-sans">{approvedByTitle}</div>
          </div>
        </div>

        {/* Supplier Representative Conforme Block */}
        <div className="space-y-8 flex flex-col justify-between">
          <div className="font-bold text-slate-900 uppercase text-[11px] text-left">
            Supplier Conforme / Bidder:
          </div>
          <div className="space-y-1">
            <div className="border-b border-slate-900 w-4/5 mx-auto h-8"></div>
            <div className="font-bold uppercase text-slate-950 pt-1 text-[11px]">
              Signature Over Printed Name
            </div>
            <div className="text-[10px] text-slate-600 font-sans">
              Authorized Representative & Date Signed
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
