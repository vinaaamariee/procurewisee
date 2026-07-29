'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DocumentLayout from '@/components/documents/DocumentLayout';
import { numberToWords } from '@/lib/number-to-words';

export interface POItemRow {
  id: number;
  stockNo?: string | null;
  unit?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
}

export interface PODocumentData {
  id: number;
  poNumber: string;
  createdAt: string | Date;
  status: string;
  // Supplier info
  supplierId?: number;
  supplierName: string;
  supplierAddress: string;
  supplierTin: string | null;
  // Appendix 61 editable fields
  entityName?: string | null;
  modeOfProcurement?: string | null;
  placeOfDelivery?: string | null;
  dateOfDelivery?: string | null;
  deliveryTerms?: string | null;
  paymentTerms?: string | null;
  fundCluster?: string | null;
  orsBursNumber?: string | null;
  fundsAvailable?: number | null;
  dateOfOrsBurs?: string | null;
  chiefAccountantName?: string | null;
  authorizedOfficialName?: string | null;
  totalCost: number;
  items: POItemRow[];
}

interface PODocumentProps {
  initialPo: PODocumentData;
  isReadOnly?: boolean;
  onSave?: (data: Partial<PODocumentData>) => Promise<{ success: boolean; error?: string }>;
}

const MODES_OF_PROCUREMENT = [
  'Small Value Procurement',
  'Negotiated Procurement — Emergency Cases',
  'Negotiated Procurement — Two Failed Biddings',
  'Alternative Method of Procurement',
  'Public Bidding',
];

export default function PODocument({ initialPo, isReadOnly = false, onSave }: PODocumentProps) {
  const [entityName, setEntityName] = useState(initialPo.entityName || 'Batanes State College');
  const [modeOfProcurement, setModeOfProcurement] = useState(
    initialPo.modeOfProcurement || 'Small Value Procurement'
  );
  const [placeOfDelivery, setPlaceOfDelivery] = useState(
    initialPo.placeOfDelivery || 'BATANES STATE COLLEGE'
  );
  const [dateOfDelivery, setDateOfDelivery] = useState(initialPo.dateOfDelivery || '');
  const [deliveryTerms, setDeliveryTerms] = useState(initialPo.deliveryTerms || 'FOB Destination');
  const [paymentTerms, setPaymentTerms] = useState(
    initialPo.paymentTerms || '15 days upon complete delivery'
  );
  const [fundCluster, setFundCluster] = useState(initialPo.fundCluster || '101 - General Fund');
  const [orsBursNumber, setOrsBursNumber] = useState(initialPo.orsBursNumber || '');
  const [fundsAvailable, setFundsAvailable] = useState<number | ''>(
    initialPo.fundsAvailable ?? ''
  );
  const [dateOfOrsBurs, setDateOfOrsBurs] = useState(initialPo.dateOfOrsBurs || '');
  const [chiefAccountantName, setChiefAccountantName] = useState(
    initialPo.chiefAccountantName || ''
  );
  const [authorizedOfficialName, setAuthorizedOfficialName] = useState(
    initialPo.authorizedOfficialName || 'DR. ELIZABETH T. CHIARRE'
  );

  // Editable line items
  const [items, setItems] = useState<POItemRow[]>(
    initialPo.items.map((item, idx) => ({
      ...item,
      stockNo: item.stockNo || String(idx + 1).padStart(3, '0'),
      unit: item.unit || 'unit',
    }))
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live-computed total
  const computedTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [items]);

  // Auto-compute row totals when qty or unit price changes
  const handleItemChange = (id: number, field: 'quantity' | 'unitPrice' | 'unit' | 'description' | 'stockNo', value: string | number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.totalCost = updated.quantity * updated.unitPrice;
        return updated;
      })
    );
  };

  const totalInWords = useMemo(() => numberToWords(computedTotal), [computedTotal]);

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await onSave({
      entityName,
      modeOfProcurement,
      placeOfDelivery,
      dateOfDelivery: dateOfDelivery || null,
      deliveryTerms,
      paymentTerms,
      fundCluster,
      orsBursNumber,
      fundsAvailable: fundsAvailable !== '' ? Number(fundsAvailable) : null,
      dateOfOrsBurs: dateOfOrsBurs || null,
      chiefAccountantName,
      authorizedOfficialName,
    });
    setIsSaving(false);
    if (res.success) setSuccessMsg('Purchase Order saved successfully.');
    else setErrorMsg(res.error || 'Failed to save.');
  };

  const inputCls = (readOnly?: boolean) =>
    `border-b ${readOnly || isReadOnly ? 'border-transparent bg-transparent' : 'border-slate-400 focus:border-[#7B1E1E]'} outline-none bg-transparent text-xs px-0.5 w-full transition`;

  const poDate = new Date(initialPo.createdAt).toLocaleDateString('en-PH', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="relative">
      {/* Feedback */}
      {errorMsg && (
        <div className="max-w-[900px] mx-auto mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold print:hidden">
          ⚠️ {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="max-w-[900px] mx-auto mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold print:hidden">
          ✅ {successMsg}
        </div>
      )}

      <div className="w-full flex justify-center">
        <div
          id="po-document"
          className="w-full max-w-[900px] bg-white text-black shadow-xl border border-slate-300 font-sans text-xs leading-snug"
        >
          <DocumentLayout
            title="PURCHASE ORDER"
            documentRef={initialPo.poNumber}
            printAreaId="po-document"
          >
            {/* Appendix tag */}
            <div className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Appendix 61
            </div>

            {/* Title */}
            <div className="text-center mb-4 border-b-2 border-black pb-3">
              <h1 className="text-base font-black uppercase tracking-widest">Purchase Order</h1>
            </div>

            {/* Entity Name */}
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-xs whitespace-nowrap">Entity Name:</span>
              <input
                type="text"
                value={entityName}
                onChange={e => setEntityName(e.target.value)}
                readOnly={isReadOnly}
                className={inputCls()}
              />
            </div>

            {/* Supplier + PO meta 2-col table */}
            <table className="w-full border-collapse border border-black mb-3 text-xs">
              <tbody>
                <tr>
                  <td className="border border-black p-2 align-top w-1/2">
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        <span className="font-bold whitespace-nowrap">Supplier:</span>
                        <span>{initialPo.supplierName}</span>
                      </div>
                      <div className="flex gap-1">
                        <span className="font-bold whitespace-nowrap">Address:</span>
                        <span>{initialPo.supplierAddress}</span>
                      </div>
                      <div className="flex gap-1">
                        <span className="font-bold whitespace-nowrap">TIN:</span>
                        <span>{initialPo.supplierTin || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="border border-black p-2 align-top w-1/2">
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        <span className="font-bold whitespace-nowrap">P.O. No.:</span>
                        <span className="font-mono font-bold">{initialPo.poNumber}</span>
                      </div>
                      <div className="flex gap-1">
                        <span className="font-bold whitespace-nowrap">Date:</span>
                        <span>{poDate}</span>
                      </div>
                      <div className="flex gap-1">
                        <span className="font-bold whitespace-nowrap">Mode of Procurement:</span>
                        {isReadOnly ? (
                          <span>{modeOfProcurement}</span>
                        ) : (
                          <select
                            value={modeOfProcurement}
                            onChange={e => setModeOfProcurement(e.target.value)}
                            className="border-b border-slate-400 outline-none bg-transparent text-xs flex-1"
                          >
                            {MODES_OF_PROCUREMENT.map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Delivery / Payment terms */}
            <table className="w-full border-collapse border border-black mb-3 text-xs">
              <tbody>
                <tr>
                  <td className="border border-black p-2 w-1/2">
                    <span className="font-bold">Place of Delivery: </span>
                    <input
                      type="text"
                      value={placeOfDelivery}
                      onChange={e => setPlaceOfDelivery(e.target.value)}
                      readOnly={isReadOnly}
                      className={inputCls()}
                    />
                  </td>
                  <td className="border border-black p-2 w-1/2">
                    <span className="font-bold">Delivery Term: </span>
                    <input
                      type="text"
                      value={deliveryTerms}
                      onChange={e => setDeliveryTerms(e.target.value)}
                      readOnly={isReadOnly}
                      className={inputCls()}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2">
                    <span className="font-bold">Date of Delivery: </span>
                    <input
                      type="date"
                      value={dateOfDelivery}
                      onChange={e => setDateOfDelivery(e.target.value)}
                      readOnly={isReadOnly}
                      className={inputCls()}
                    />
                  </td>
                  <td className="border border-black p-2">
                    <span className="font-bold">Payment Term: </span>
                    <input
                      type="text"
                      value={paymentTerms}
                      onChange={e => setPaymentTerms(e.target.value)}
                      readOnly={isReadOnly}
                      className={inputCls()}
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Gentlemen paragraph */}
            <p className="text-xs mb-3">
              Gentlemen:<br />
              Please furnish this Office the following articles subject to the terms and conditions contained herein:
            </p>

            {/* Line-item table */}
            <table className="w-full border-collapse border border-black text-xs mb-0">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-1.5 text-center w-14">Stock/<br />Property No.</th>
                  <th className="border border-black p-1.5 text-center w-10">Unit</th>
                  <th className="border border-black p-1.5 text-left">Description</th>
                  <th className="border border-black p-1.5 text-center w-14">Quantity</th>
                  <th className="border border-black p-1.5 text-right w-24">Unit Cost</th>
                  <th className="border border-black p-1.5 text-right w-24">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="border border-black p-1 text-center font-mono">
                      <input
                        type="text"
                        value={item.stockNo || ''}
                        onChange={e => handleItemChange(item.id, 'stockNo', e.target.value)}
                        readOnly={isReadOnly}
                        className="w-full outline-none bg-transparent text-center text-xs"
                      />
                    </td>
                    <td className="border border-black p-1 text-center">
                      <input
                        type="text"
                        value={item.unit || ''}
                        onChange={e => handleItemChange(item.id, 'unit', e.target.value)}
                        readOnly={isReadOnly}
                        className="w-full outline-none bg-transparent text-center text-xs"
                      />
                    </td>
                    <td className="border border-black p-1">
                      <textarea
                        value={item.description}
                        onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                        readOnly={isReadOnly}
                        rows={2}
                        className="w-full outline-none bg-transparent text-xs resize-none"
                      />
                    </td>
                    <td className="border border-black p-1 text-center">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                        readOnly={isReadOnly}
                        className="w-full outline-none bg-transparent text-center text-xs"
                      />
                    </td>
                    <td className="border border-black p-1 text-right">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.unitPrice}
                        onChange={e => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                        readOnly={isReadOnly}
                        className="w-full outline-none bg-transparent text-right text-xs"
                      />
                    </td>
                    <td className="border border-black p-1 text-right font-bold font-mono">
                      ₱{(item.quantity * item.unitPrice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}

                {/* Total row */}
                <tr className="bg-slate-50 font-black">
                  <td className="border border-black p-2 text-right" colSpan={5}>
                    TOTAL AMOUNT
                  </td>
                  <td className="border border-black p-2 text-right font-mono text-sm text-[#7B1E1E]">
                    ₱{computedTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Total in Words — auto-generated */}
            <div className="border border-black border-t-0 p-2 mb-4">
              <span className="font-bold">(Total Amount in Words): </span>
              <span className="uppercase italic tracking-wide">{totalInWords || '—'}</span>
            </div>

            {/* Fixed legal penalty clause */}
            <p className="text-[10px] leading-relaxed mb-6 text-slate-800 border border-slate-200 bg-slate-50 p-2 rounded">
              In case of failure to make the full delivery within the time specified above, a penalty of one-tenth (1/10) of one percent (1%) for every day of delay shall be imposed on the undelivered item/s.
            </p>

            {/* Signature block — Conforme + Very truly yours */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <p className="font-bold mb-4 text-xs">Conforme:</p>
                <div className="border-b border-black h-8 w-4/5"></div>
                <p className="text-[10px] mt-1">Signature over Printed Name of Supplier</p>
                <p className="text-[10px] text-slate-500">{initialPo.supplierName}</p>
                <div className="border-b border-black h-8 w-4/5 mt-4"></div>
                <p className="text-[10px] mt-1">Date</p>
              </div>
              <div>
                <p className="mb-4 text-xs">Very truly yours,</p>
                {initialPo.status === 'Approved' ? (
                  <p className="italic font-bold text-[#7B1E1E] font-cursive h-8">✓ Digitally Signed</p>
                ) : (
                  <div className="h-8"></div>
                )}
                <div className="border-b border-black w-4/5 mt-1"></div>
                <p className="text-[10px] mt-1">
                  <input
                    type="text"
                    value={authorizedOfficialName}
                    onChange={e => setAuthorizedOfficialName(e.target.value)}
                    readOnly={isReadOnly}
                    className="font-bold outline-none bg-transparent border-b border-transparent hover:border-slate-300 w-full text-[10px]"
                    placeholder="SUC President Name"
                  />
                  SUC President I<br />
                  Batanes State College
                </p>
              </div>
            </div>

            {/* Footer block — Fund Cluster, ORS/BURS, Chief Accountant */}
            <div className="border-t-2 border-black pt-4">
              <p className="text-[10px] font-bold uppercase mb-3">For the Accounting Division:</p>
              <table className="w-full border-collapse border border-black text-[10px]">
                <tbody>
                  <tr>
                    <td className="border border-black p-2 w-1/4">
                      <div className="font-bold">Fund Cluster:</div>
                      <input
                        type="text"
                        value={fundCluster}
                        onChange={e => setFundCluster(e.target.value)}
                        readOnly={isReadOnly}
                        className="border-b border-slate-400 outline-none bg-transparent w-full mt-1"
                        placeholder="e.g. 101 - General Fund"
                      />
                    </td>
                    <td className="border border-black p-2 w-1/4">
                      <div className="font-bold">ORS/BURS No.:</div>
                      <input
                        type="text"
                        value={orsBursNumber}
                        onChange={e => setOrsBursNumber(e.target.value)}
                        readOnly={isReadOnly}
                        className="border-b border-slate-400 outline-none bg-transparent w-full mt-1"
                        placeholder="ORS/BURS number"
                      />
                    </td>
                    <td className="border border-black p-2 w-1/4">
                      <div className="font-bold">Funds Available:</div>
                      <input
                        type="number"
                        value={fundsAvailable}
                        onChange={e => setFundsAvailable(e.target.value === '' ? '' : Number(e.target.value))}
                        readOnly={isReadOnly}
                        className="border-b border-slate-400 outline-none bg-transparent w-full mt-1"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </td>
                    <td className="border border-black p-2 w-1/4">
                      <div className="font-bold">Date of ORS/BURS:</div>
                      <input
                        type="date"
                        value={dateOfOrsBurs}
                        onChange={e => setDateOfOrsBurs(e.target.value)}
                        readOnly={isReadOnly}
                        className="border-b border-slate-400 outline-none bg-transparent w-full mt-1"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2" colSpan={2}>
                      <div className="font-bold">Amount: </div>
                      <span className="font-mono font-bold text-xs">
                        ₱{computedTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="border border-black p-2" colSpan={2}>
                      <div className="font-bold mb-1">Chief Accountant:</div>
                      <div className="border-b border-black h-8 w-4/5"></div>
                      <input
                        type="text"
                        value={chiefAccountantName}
                        onChange={e => setChiefAccountantName(e.target.value)}
                        readOnly={isReadOnly}
                        className="outline-none bg-transparent w-full mt-0.5 text-[10px] border-b border-transparent hover:border-slate-300"
                        placeholder="Chief Accountant Name"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DocumentLayout>
        </div>
      </div>

      {/* Save button — screen only */}
      {!isReadOnly && onSave && (
        <div className="print:hidden mt-4 flex justify-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:opacity-90 transition shadow-md disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : '💾 Save PO Fields'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-6 py-2 rounded-xl bg-[#7B1E1E] text-white text-sm font-bold hover:opacity-90 transition shadow-md"
          >
            🖨️ Print Purchase Order
          </button>
        </div>
      )}
    </div>
  );
}
