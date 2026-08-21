'use client';

import React, { useState, useTransition, useMemo } from 'react';
import DocumentLayout from '@/components/documents/DocumentLayout';

interface Supplier {
  id: number;
  companyName: string;
}

interface RfqItem {
  id: number;
  itemNumber: string;
  particulars: string;
  quantity: number;
  unit: { abbreviation: string; name: string };
}

interface QuoteDetail {
  id: number;
  rfqItemId: number;
  unitPrice: number | string;
  isAvailable: boolean;
}

interface SupplierQuote {
  id: number;
  supplierId: number;
  supplier: Supplier;
  totalQuotedAmount: number | string;
  quoteDetails: QuoteDetail[];
}

interface AOQDocumentProps {
  rfqId: number;
  rfqNumber: string;
  rfqTitle: string;
  rfqItems: RfqItem[];
  supplierQuotes: SupplierQuote[];
  openingDate?: string;
}

const PROCUREMENT_TYPES = [
  'Furnishing and delivery of supplies, materials or equipment',
  'Furnishing of labor and materials in the performance of services',
  'Rental of facilities',
] as const;

export default function AOQDocument({
  rfqId,
  rfqNumber,
  rfqTitle,
  rfqItems,
  supplierQuotes,
  openingDate,
}: AOQDocumentProps) {
  const [procurementType, setProcurementType] = useState<(typeof PROCUREMENT_TYPES)[number]>(
    PROCUREMENT_TYPES[0]
  );
  const [placeOfDelivery, setPlaceOfDelivery] = useState('BATANES STATE COLLEGE');
  const [openedAt] = useState(
    openingDate || new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
  );

  // Build price matrix: rfqItemId → supplierId → unitPrice
  const priceMatrix = useMemo(() => {
    const matrix: Record<number, Record<number, number>> = {};
    rfqItems.forEach(item => { matrix[item.id] = {}; });
    supplierQuotes.forEach(quote => {
      quote.quoteDetails.forEach(detail => {
        if (!matrix[detail.rfqItemId]) matrix[detail.rfqItemId] = {};
        matrix[detail.rfqItemId][quote.supplierId] = Number(detail.unitPrice);
      });
    });
    return matrix;
  }, [rfqItems, supplierQuotes]);

  // Column totals per supplier
  const supplierTotals = useMemo(() => {
    const totals: Record<number, number> = {};
    supplierQuotes.forEach(q => {
      totals[q.supplierId] = rfqItems.reduce((sum, item) => {
        const price = priceMatrix[item.id]?.[q.supplierId] ?? 0;
        return sum + price * item.quantity;
      }, 0);
    });
    return totals;
  }, [rfqItems, supplierQuotes, priceMatrix]);

  // Find lowest price per row for highlighting
  const lowestPerRow = useMemo(() => {
    const lowest: Record<number, number> = {};
    rfqItems.forEach(item => {
      const prices = supplierQuotes
        .map(q => priceMatrix[item.id]?.[q.supplierId])
        .filter((p): p is number => p !== undefined && p > 0);
      if (prices.length > 0) lowest[item.id] = Math.min(...prices);
    });
    return lowest;
  }, [rfqItems, supplierQuotes, priceMatrix]);

  const lowestTotal = useMemo(() => {
    const totals = Object.values(supplierTotals).filter(t => t > 0);
    return totals.length > 0 ? Math.min(...totals) : 0;
  }, [supplierTotals]);

  return (
    <div className="relative pb-16">
      <div className="w-full flex justify-center">
        <div
          id="aoq-document"
          className="w-full max-w-[900px] bg-white text-black shadow-xl border border-gray-400 font-sans text-xs leading-snug"
        >
          <DocumentLayout
            title="ABSTRACT OF QUOTATION"
            documentRef={rfqNumber}
            printAreaId="aoq-document"
          >
            {/* Annex F label */}
            <div className="text-right text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Annex F
            </div>

            {/* Title */}
            <div className="text-center mb-4 border-b-2 border-black pb-3">
              <h1 className="text-base font-black uppercase tracking-wide">Abstract of Quotation</h1>
            </div>

            {/* Procurement type checkboxes */}
            <div className="mb-4 p-3 border border-black">
              <div className="text-[10px] font-bold uppercase mb-2">Procurement Type:</div>
              <div className="space-y-1 print:hidden">
                {PROCUREMENT_TYPES.map(type => (
                  <label key={type} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="procurementType"
                      checked={procurementType === type}
                      onChange={() => setProcurementType(type)}
                      className="mt-0.5 accent-[#800000]"
                    />
                    <span className="text-xs">{type}</span>
                  </label>
                ))}
              </div>
              {/* Print-only static display */}
              <div className="hidden print:block text-xs">
                {PROCUREMENT_TYPES.map(type => (
                  <div key={type} className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 border border-black inline-block text-center text-[8px]">
                      {procurementType === type ? '✓' : ''}
                    </span>
                    <span>{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta row */}
            <table className="w-full border-collapse border border-black mb-4 text-xs">
              <tbody>
                <tr>
                  <td className="border border-black p-2 w-1/2">
                    <span className="font-bold">Bids opened at: </span>
                    Basco, Batanes
                  </td>
                  <td className="border border-black p-2 w-1/2">
                    <span className="font-bold">Date: </span>{openedAt}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2" colSpan={2}>
                    <span className="font-bold">Place of Delivery: </span>
                    <input
                      type="text"
                      value={placeOfDelivery}
                      onChange={e => setPlaceOfDelivery(e.target.value)}
                      className="border-b border-gray-400 outline-none bg-transparent ml-1 w-64 text-xs"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2" colSpan={2}>
                    <span className="font-bold">RFQ No.: </span>{rfqNumber}&nbsp;&nbsp;
                    <span className="font-bold">Title: </span>{rfqTitle}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Main comparison matrix */}
            <div className="overflow-x-auto">
              <table className="border-collapse border border-black text-[10px] w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-2 text-center w-8" rowSpan={2}>#</th>
                    <th className="border border-black p-2 text-center w-8" rowSpan={2}>Qty</th>
                    <th className="border border-black p-2 text-center w-10" rowSpan={2}>Unit</th>
                    <th className="border border-black p-2 text-left" rowSpan={2}>Particular / Description</th>
                    {supplierQuotes.map(q => (
                      <th
                        key={q.supplierId}
                        className="border border-black p-1 text-center"
                        colSpan={1}
                      >
                        {q.supplier.companyName}
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    {supplierQuotes.map(q => (
                      <th key={q.supplierId} className="border border-black p-1 text-center text-[9px] font-normal italic">
                        Unit Price
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rfqItems.map((item, idx) => {
                    const lowest = lowestPerRow[item.id];
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border border-black p-1 text-center font-mono">
                          {String(idx + 1).padStart(3, '0')}
                        </td>
                        <td className="border border-black p-1 text-center">{item.quantity}</td>
                        <td className="border border-black p-1 text-center">{item.unit.abbreviation}</td>
                        <td className="border border-black p-1">{item.particulars}</td>
                        {supplierQuotes.map(q => {
                          const price = priceMatrix[item.id]?.[q.supplierId];
                          const isLowest = price !== undefined && price > 0 && price === lowest;
                          return (
                            <td
                              key={q.supplierId}
                              className={`border border-black p-1 text-right font-mono ${
                                isLowest ? 'bg-[var(--accent-glass)] text-[var(--accent)] font-bold' : ''
                              }`}
                            >
                              {price !== undefined && price > 0
                                ? `₱${Number(price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                                : <span className="text-gray-300">—</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Totals row */}
                  <tr className="bg-gray-100 font-bold">
                    <td className="border border-black p-2 text-right" colSpan={4}>
                      TOTAL (Unit Price × Quantity)
                    </td>
                    {supplierQuotes.map(q => {
                      const total = supplierTotals[q.supplierId];
                      const isLowestTotal = total > 0 && total === lowestTotal;
                      return (
                        <td
                          key={q.supplierId}
                          className={`border border-black p-2 text-right font-mono text-xs ${
                            isLowestTotal ? 'bg-[var(--secondary-dim)] text-[var(--text-primary)]' : ''
                          }`}
                        >
                          {total > 0
                            ? `₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                            : '—'}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* No bids state */}
            {supplierQuotes.length === 0 && (
              <div className="text-center text-gray-400 italic p-6 border border-dashed border-gray-300 mt-2">
                No supplier quotes have been submitted for this RFQ yet.
                <br />
                The comparison matrix will populate once bids are received.
              </div>
            )}

            {/* BAC signatures */}
            <div className="mt-8 border-t border-black pt-4">
              <p className="text-[10px] font-semibold mb-4 uppercase">
                Name of BAC Members who participated in the canvassing:
              </p>
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map(n => (
                  <div key={n}>
                    <div className="border-b border-black h-8"></div>
                    <p className="text-[10px] mt-1 text-center">Member {n}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-8 mt-6">
                <div>
                  <div className="border-b border-black h-8"></div>
                  <p className="text-[10px] mt-1">BAC Chairperson</p>
                </div>
                <div>
                  <div className="border-b border-black h-8"></div>
                  <p className="text-[10px] mt-1">Date Signed</p>
                </div>
              </div>
            </div>
          </DocumentLayout>
        </div>
      </div>

      {/* Print button */}
      <div className="print:hidden mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => window.print()}
          className="px-6 py-2 rounded-xl bg-[#800000] text-white text-sm font-bold hover:opacity-90 transition shadow-md"
        >
          🖨️ Print Abstract of Quotation
        </button>
      </div>
    </div>
  );
}
