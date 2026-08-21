'use client';

import React, { useState, useTransition } from 'react';
import DocumentLayout from '@/components/documents/DocumentLayout';
import {
  updateRfqAcknowledgementAction,
  addSupplierToRfqAckAction,
} from '@/app/actions/rfq-acknowledgement';

interface Supplier {
  id: number;
  companyName: string;
  contactPerson: string | null;
  contactNumber: string | null;
}

interface AckLog {
  id: number;
  rfqId: number;
  supplierId: number;
  receivedBy: string | null;
  dateReceived: Date | string | null;
  acknowledged: boolean;
  supplier: Supplier;
}

interface AcknowledgementReceiptDocumentProps {
  rfqId: number;
  rfqNumber: string;
  rfqTitle: string;
  initialLogs: AckLog[];
  allSuppliers: Supplier[];
}

export default function AcknowledgementReceiptDocument({
  rfqId,
  rfqNumber,
  rfqTitle,
  initialLogs,
  allSuppliers,
}: AcknowledgementReceiptDocumentProps) {
  const [logs, setLogs] = useState<AckLog[]>(initialLogs);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [addingSupplierId, setAddingSupplierId] = useState('');

  const today = new Date().toLocaleDateString('en-PH', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const handleFieldChange = (logId: number, field: 'receivedBy' | 'dateReceived', value: string) => {
    setLogs(prev =>
      prev.map(l => l.id === logId ? { ...l, [field]: value } : l)
    );
  };

  const handleSaveRow = (logId: number) => {
    const log = logs.find(l => l.id === logId);
    if (!log) return;
    setErrorMsg(null);
    startTransition(async () => {
      const res = await updateRfqAcknowledgementAction(logId, {
        receivedBy: log.receivedBy || '',
        dateReceived: log.dateReceived ? String(log.dateReceived) : null,
        acknowledged: log.acknowledged,
      });
      if (!res.success) setErrorMsg(res.error || 'Save failed');
    });
  };

  const handleToggleAck = (logId: number, current: boolean) => {
    const newVal = !current;
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, acknowledged: newVal } : l));
    startTransition(async () => {
      const log = logs.find(l => l.id === logId);
      if (!log) return;
      await updateRfqAcknowledgementAction(logId, {
        receivedBy: log.receivedBy || '',
        dateReceived: log.dateReceived ? String(log.dateReceived) : null,
        acknowledged: newVal,
      });
    });
  };

  const handleAddSupplier = () => {
    if (!addingSupplierId) return;
    const suppId = parseInt(addingSupplierId);
    const alreadyIn = logs.some(l => l.supplierId === suppId);
    if (alreadyIn) { setErrorMsg('Supplier already in list.'); return; }
    setErrorMsg(null);
    startTransition(async () => {
      const res = await addSupplierToRfqAckAction(rfqId, suppId);
      if (res.success && res.log) {
        const supp = allSuppliers.find(s => s.id === suppId)!;
        setLogs(prev => [
          ...prev,
          {
            ...res.log,
            supplier: supp,
          } as AckLog,
        ]);
        setAddingSupplierId('');
      } else {
        setErrorMsg(res.error || 'Failed to add supplier.');
      }
    });
  };

  const acknowledgedCount = logs.filter(l => l.acknowledged).length;

  return (
    <div className="relative pb-24">
      {/* Print CSS — delegated to DocumentLayout */}
      {errorMsg && (
        <div className="max-w-[800px] mx-auto mb-4 p-3 rounded-xl bg-[var(--accent-glass)] border border-[var(--border-accent)] text-[var(--accent)] text-xs font-semibold flex items-center gap-2 print:hidden">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="w-full flex justify-center">
        <div
          id="ack-receipt-document"
          className="w-full max-w-[800px] bg-white text-black shadow-xl border border-slate-400 font-sans text-xs leading-snug"
        >
          <DocumentLayout
            title="ACKNOWLEDGEMENT RECEIPT FOR RFQ"
            documentRef={rfqNumber}
            printAreaId="ack-receipt-document"
          >
            {/* Annex E Header */}
            <div className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Annex E
            </div>

            <div className="text-center mb-4 border-b-2 border-black pb-3">
              <h1 className="text-base font-black uppercase tracking-wide">
                Acknowledgement Receipt for RFQ
              </h1>
              <p className="text-[10px] text-slate-600 mt-1 italic">
                (To be accomplished by the Procurement Office)
              </p>
            </div>

            {/* RIS# and date row */}
            <table className="w-full border-collapse border border-black mb-4 text-xs">
              <tbody>
                <tr>
                  <td className="border border-black p-2 w-1/2">
                    <span className="font-bold">RIS#: </span>
                    <span>{rfqNumber}</span>
                    <span className="ml-2 text-[9px] text-slate-500 italic">
                      (confirm with Supply Office if different from RFQ reference)
                    </span>
                  </td>
                  <td className="border border-black p-2 w-1/2">
                    <span className="font-bold">Date: </span>
                    <span>{today}</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2" colSpan={2}>
                    <span className="font-bold">RFQ Title: </span>
                    {rfqTitle}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Status summary */}
            <div className="mb-3 flex gap-4 text-[10px] print:hidden">
              <span className="px-2 py-1 bg-[var(--accent-glass)] text-[var(--accent)] rounded font-semibold">
                ✓ Acknowledged: {acknowledgedCount}
              </span>
              <span className="px-2 py-1 bg-[var(--secondary-dim)] text-[var(--secondary)] rounded font-semibold">
                ○ Pending: {logs.length - acknowledgedCount}
              </span>
            </div>

            {/* Main table */}
            <table className="w-full border-collapse border border-black text-xs mb-4">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-2 text-center w-8">#</th>
                  <th className="border border-black p-2 text-left">Supplier / Company</th>
                  <th className="border border-black p-2 text-left w-36">Received By</th>
                  <th className="border border-black p-2 text-left w-44">Date &amp; Time</th>
                  <th className="border border-black p-2 text-center w-24">Acknowledged</th>
                  <th className="border border-black p-2 text-center w-16 print:hidden">Save</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="border border-black p-4 text-center text-slate-400 italic">
                      No suppliers on this RFQ yet. Add suppliers below or publish the RFQ to invite bids.
                    </td>
                  </tr>
                )}
                {logs.map((log, idx) => (
                  <tr
                    key={log.id}
                    className={log.acknowledged ? 'bg-[var(--accent-glass)]' : 'bg-white'}
                  >
                    <td className="border border-black p-2 text-center font-mono">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="border border-black p-2">
                      <div className="font-semibold">{log.supplier.companyName}</div>
                      {log.supplier.contactPerson && (
                        <div className="text-[10px] text-slate-500">{log.supplier.contactPerson}</div>
                      )}
                    </td>
                    <td className="border border-black p-1">
                      <input
                        type="text"
                        value={log.receivedBy || ''}
                        onChange={e => handleFieldChange(log.id, 'receivedBy', e.target.value)}
                        placeholder="Name of recipient"
                        className="w-full border-0 outline-none bg-transparent text-xs px-1 py-0.5"
                      />
                    </td>
                    <td className="border border-black p-1">
                      <input
                        type="datetime-local"
                        value={
                          log.dateReceived
                            ? new Date(log.dateReceived).toISOString().slice(0, 16)
                            : ''
                        }
                        onChange={e => handleFieldChange(log.id, 'dateReceived', e.target.value)}
                        className="w-full border-0 outline-none bg-transparent text-xs px-1 py-0.5"
                      />
                    </td>
                    <td className="border border-black p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleAck(log.id, log.acknowledged)}
                        disabled={isPending}
                        className={`w-7 h-7 rounded-full border-2 font-bold text-sm transition-all ${
                          log.acknowledged
                            ? 'bg-[var(--accent)] border-[var(--border-accent)] text-white'
                            : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-accent)]'
                        }`}
                        title={log.acknowledged ? 'Mark as not acknowledged' : 'Mark as acknowledged'}
                      >
                        {log.acknowledged ? '✓' : '○'}
                      </button>
                    </td>
                    <td className="border border-black p-1 text-center print:hidden">
                      <button
                        type="button"
                        onClick={() => handleSaveRow(log.id)}
                        disabled={isPending}
                        className="px-2 py-1 rounded bg-[#7B1E1E] text-white text-[10px] font-bold hover:opacity-80 transition"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add supplier row — hidden on print */}
            <div className="print:hidden flex gap-2 items-center mb-6">
              <select
                value={addingSupplierId}
                onChange={e => setAddingSupplierId(e.target.value)}
                className="border border-slate-300 rounded px-2 py-1.5 text-xs flex-1 bg-white"
              >
                <option value="">— Add supplier to this receipt —</option>
                {allSuppliers
                  .filter(s => !logs.some(l => l.supplierId === s.id))
                  .map(s => (
                    <option key={s.id} value={s.id}>{s.companyName}</option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddSupplier}
                disabled={!addingSupplierId || isPending}
                className="px-3 py-1.5 rounded bg-[#7B1E1E] text-white text-xs font-bold hover:opacity-80 disabled:opacity-40 transition"
              >
                + Add
              </button>
            </div>

            {/* Signature block */}
            <div className="mt-4 border-t border-black pt-4">
              <p className="text-[10px] mb-4">
                The above-named supplier representatives have received a copy of the Request for Quotation
                (RFQ No. <strong>{rfqNumber}</strong>) and have acknowledged receipt thereof.
              </p>
              <div className="grid grid-cols-2 gap-8 mt-6">
                <div>
                  <div className="border-b border-black h-8 w-4/5"></div>
                  <p className="text-[10px] mt-1">Signature over Printed Name<br />BAC Secretariat / Procurement Staff</p>
                </div>
                <div>
                  <div className="border-b border-black h-8 w-4/5"></div>
                  <p className="text-[10px] mt-1">Date</p>
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
          className="px-6 py-2 rounded-xl bg-[#7B1E1E] text-white text-sm font-bold hover:opacity-90 transition shadow-md"
        >
          🖨️ Print Acknowledgement Receipt
        </button>
      </div>
    </div>
  );
}
