import React from 'react';
import OfficialDocumentLayout from '@/components/documents/OfficialDocumentLayout';

export interface PmrPrintItem {
  description: string;
  specification?: string | null;
  quantity: number;
  unit: string;
  estimatedUnitCost: number;
  estimatedCost: number;
}

export interface PmrPrintData {
  pmrNumber: string;
  prNumber: string;
  office: string;
  department: string | null;
  fundSource: string | null;
  purpose: string | null;
  totalCost: number;
  dateReceived: string;
  verificationDate: string | null;
  verifiedBy: string | null;
  stage: string;
  status: string;
  remarks: string | null;
  items: PmrPrintItem[];
}

interface PmrPrintDocumentProps {
  pmr: PmrPrintData;
  printAreaId?: string;
}

export default function PmrPrintDocument({ pmr, printAreaId = 'pmrPrintArea' }: PmrPrintDocumentProps) {
  return (
    <OfficialDocumentLayout printAreaId={printAreaId}>
      <div
        id={printAreaId}
        className="bg-white border border-black p-8 max-w-4xl mx-auto rounded-none font-serif text-black space-y-6"
        style={{ color: '#000', backgroundColor: '#fff' }}
      >
        {/* Document Title */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold uppercase tracking-wider text-black font-serif">
            PROCUREMENT MONITORING RECORD
          </h1>
          <p className="text-xs font-mono font-bold mt-1 text-slate-700">
            Ref No: {pmr.pmrNumber}
          </p>
        </div>

        {/* PMR Metadata Grid */}
        <div className="grid grid-cols-2 border border-slate-800 divide-x divide-slate-800 text-[11px] font-bold">
          <div className="p-2 space-y-1">
            <div>Entity Name: <span className="font-extrabold underline">BATANES STATE COLLEGE</span></div>
            <div>Office: <span className="underline">{pmr.office}</span></div>
            {pmr.department && (
              <div>Department: <span className="underline">{pmr.department}</span></div>
            )}
          </div>
          <div className="p-2 space-y-1">
            <div>PR No.: <span className="font-extrabold underline">{pmr.prNumber}</span></div>
            <div>Date Received: <span className="underline">{new Date(pmr.dateReceived).toLocaleDateString()}</span></div>
            <div>Verification Date: <span className="underline">{pmr.verificationDate ? new Date(pmr.verificationDate).toLocaleDateString() : "—"}</span></div>
            <div>Fund Source: <span className="underline">{pmr.fundSource || "GAA"}</span></div>
          </div>
        </div>

        {/* Stage / Status strip */}
        <div className="grid grid-cols-2 border border-slate-800 divide-x divide-slate-800 text-[11px] font-bold">
          <div className="p-2">Current Stage: <span className="font-extrabold underline uppercase">{pmr.stage}</span></div>
          <div className="p-2">Status: <span className="font-extrabold underline uppercase">{pmr.status}</span></div>
        </div>

        {/* Items Table */}
        <div className="border border-slate-800 overflow-hidden">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-100 text-center font-extrabold divide-x divide-slate-800">
                <th className="p-2 w-12">Item No</th>
                <th className="p-2 w-16">Unit</th>
                <th className="p-2">Item Description</th>
                <th className="p-2 w-16">Qty</th>
                <th className="p-2 w-28 text-right">Unit Cost</th>
                <th className="p-2 w-28 text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {pmr.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-400 divide-x divide-slate-800 font-semibold text-[10px]">
                  <td className="p-2 text-center">{idx + 1}</td>
                  <td className="p-2 text-center">{item.unit}</td>
                  <td className="p-2">
                    <div className="font-extrabold">{item.description}</div>
                    {item.specification && (
                      <div className="text-[9px] text-slate-600 mt-0.5 whitespace-pre-wrap">{item.specification}</div>
                    )}
                  </td>
                  <td className="p-2 text-center">{item.quantity}</td>
                  <td className="p-2 text-right tabular-nums">₱{Number(item.estimatedUnitCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                  <td className="p-2 text-right tabular-nums font-bold">₱{Number(item.estimatedCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
              {pmr.purpose && (
                <tr className="border-t border-slate-800 font-extrabold text-[11px]">
                  <td colSpan={6} className="p-3 bg-slate-50 text-left border-b border-slate-800">
                    Purpose: <span className="underline normal-case italic font-bold">{pmr.purpose}</span>
                  </td>
                </tr>
              )}
              <tr className="font-black text-xs">
                <td colSpan={5} className="p-2 text-right uppercase">Total Cost:</td>
                <td className="p-2 text-right tabular-nums text-[var(--accent)]">₱{Number(pmr.totalCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Remarks */}
        {pmr.remarks && (
          <div className="border border-slate-800 p-3 text-[11px] font-bold">
            Remarks: <span className="font-semibold">{pmr.remarks}</span>
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-2 border border-slate-800 divide-x divide-slate-800 text-[11px] font-bold">
          <div className="p-4 space-y-4">
            <span>Recorded By:</span>
            <div className="pt-6 text-center">
              <span className="block font-black underline uppercase">
                {pmr.verifiedBy || "Procurement Staff"}
              </span>
              <span className="text-[9px] text-slate-500 font-bold">Procurement Staff (Verification)</span>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <span>Prepared / Acknowledged By:</span>
            <div className="pt-6 text-center">
              <span className="block font-black underline uppercase">
                {pmr.prNumber ? "BSC Requisitioner" : "Batanes State College"}
              </span>
              <span className="text-[9px] text-slate-500 font-bold">Requisitioning Office</span>
            </div>
          </div>
        </div>
      </div>
    </OfficialDocumentLayout>
  );
}
