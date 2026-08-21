import React from 'react';
import OfficialDocumentLayout from '@/components/documents/OfficialDocumentLayout';

export interface PRPrintItem {
  id: number;
  description: string;
  specification?: string | null;
  quantity: number;
  unit: string;
  estimatedUnitCost: number;
  estimatedCost: number;
}

export interface PRPrintData {
  id: number;
  prNumber: string;
  requestDate: string;
  department: string;
  office: string;
  purpose: string;
  fundingSource: string;
  totalCost: number;
  requesterName: string;
  officerName: string;
  items: PRPrintItem[];
}

interface PRPrintDocumentProps {
  pr: PRPrintData;
  printAreaId?: string;
}

export default function PRPrintDocument({ pr, printAreaId = 'prPrintArea' }: PRPrintDocumentProps) {
  return (
    <OfficialDocumentLayout printAreaId={printAreaId}>
      <div
        id={printAreaId}
        className="bg-white border border-black p-8 max-w-4xl mx-auto rounded-none font-serif text-black space-y-6"
        style={{ color: '#000', backgroundColor: '#fff' }}
      >
        {/* Document Title & Reference Number */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold uppercase tracking-wider text-black font-serif">
            PURCHASE REQUEST
          </h1>
          {pr.prNumber && (
            <p className="text-xs font-mono font-bold mt-1 text-gray-700">
              Ref No: {pr.prNumber}
            </p>
          )}
        </div>

        {/* Agency Metadata Grid */}
        <div className="grid grid-cols-2 border border-gray-800 divide-x divide-gray-800 text-[11px] font-bold">
          <div className="p-2 space-y-1">
            <div>Entity Name: <span className="font-extrabold underline">BATANES STATE COLLEGE</span></div>
            <div>Office/Section: <span className="underline">{pr.department} ({pr.office})</span></div>
          </div>
          <div className="p-2 space-y-1">
            <div>PR No.: <span className="font-extrabold underline">{pr.prNumber}</span></div>
            <div>Date: <span className="underline">{new Date(pr.requestDate).toLocaleDateString()}</span></div>
            <div>Fund Source: <span className="underline">{pr.fundingSource || "GAA"}</span></div>
          </div>
        </div>

        {/* Items Table Grid */}
        <div className="border border-gray-800 overflow-hidden">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-100 text-center font-extrabold divide-x divide-gray-800">
                <th className="p-2 w-12">Item No</th>
                <th className="p-2 w-16">Unit</th>
                <th className="p-2">Item Description</th>
                <th className="p-2 w-16">Qty</th>
                <th className="p-2 w-28 text-right">Unit Cost</th>
                <th className="p-2 w-28 text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {pr.items.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-400 divide-x divide-gray-800 font-semibold text-[10px]">
                  <td className="p-2 text-center">{idx + 1}</td>
                  <td className="p-2 text-center">{item.unit}</td>
                  <td className="p-2">
                    <div className="font-extrabold">{item.description}</div>
                    {item.specification && (
                      <div className="text-[9px] text-gray-600 mt-0.5 whitespace-pre-wrap">{item.specification}</div>
                    )}
                  </td>
                  <td className="p-2 text-center">{item.quantity}</td>
                  <td className="p-2 text-right tabular-nums">₱{Number(item.estimatedUnitCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                  <td className="p-2 text-right tabular-nums font-bold">₱{Number(item.estimatedCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
              {/* Purpose row */}
              <tr className="border-t border-gray-800 font-extrabold text-[11px]">
                <td colSpan={6} className="p-3 bg-gray-50 text-left border-b border-gray-800">
                  Purpose: <span className="underline normal-case italic font-bold">{pr.purpose}</span>
                </td>
              </tr>
              {/* Summary row */}
              <tr className="font-black text-xs">
                <td colSpan={5} className="p-2 text-right uppercase">Total Estimated Budget:</td>
                <td className="p-2 text-right tabular-nums text-[var(--accent)]">₱{Number(pr.totalCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures block */}
        <div className="grid grid-cols-2 border border-gray-800 divide-x divide-gray-800 text-[11px] font-bold">
          <div className="p-4 space-y-4">
            <span>Requested By:</span>
            <div className="pt-6 text-center">
              <span className="block font-black underline uppercase">
                {pr.requesterName || "BSC Requisitioner"}
              </span>
              <span className="text-[9px] text-gray-500 font-bold">End-User Unit Head / Requisitioner</span>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <span>Approved By:</span>
            <div className="pt-6 text-center">
              <span className="block font-black underline uppercase">
                {pr.officerName || "Procurement Staff"}
              </span>
              <span className="text-[9px] text-gray-500 font-bold">Procurement Staff (Verification)</span>
            </div>
          </div>
        </div>
      </div>
    </OfficialDocumentLayout>
  );
}
