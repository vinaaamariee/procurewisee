'use client';

import React, { useState, useEffect, useTransition } from 'react';
import RFQHeader from './RFQHeader';
import RFQSupplierSection from './RFQSupplierSection';
import RFQTerms from './RFQTerms';
import RFQItemsTable, { AppItem, CatalogProduct, ItemRow } from './RFQItemsTable';
import RFQSignatureSection from './RFQSignatureSection';
import RFQToolbar from './RFQToolbar';
import DocumentLayout from '@/components/documents/DocumentLayout';
import { createRfqAction } from '@/app/actions/rfq-actions';
import { useRouter } from 'next/navigation';

export interface RFQDocumentData {
  id?: number;
  rfqNumber?: string;
  title?: string;
  date?: string;
  supplierName?: string;
  approvedBudgetContract?: number | '';
  deadlineDate?: string;
  deliveryPeriod?: string;
  status?: 'Draft' | 'Published' | 'Closed' | 'Evaluated';
  items?: ItemRow[];
  printedName?: string;
  bacChairperson?: string;
}

interface RFQDocumentProps {
  mode?: 'create' | 'edit' | 'view';
  initialData?: RFQDocumentData;
  appItems?: AppItem[];
  catalogProducts?: CatalogProduct[];
  nextRfqNumber?: string;
  onSave?: (data: RFQDocumentData, status: 'Draft' | 'Published') => Promise<{ success: boolean; error?: string }>;
}

export default function RFQDocument({
  mode = 'create',
  initialData = {},
  appItems = [],
  catalogProducts = [],
  nextRfqNumber = '',
  onSave,
}: RFQDocumentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const getDefaultDeadlineDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  // State
  const [rfqNumber, setRfqNumber] = useState(initialData.rfqNumber || nextRfqNumber);
  const [date, setDate] = useState(initialData.date || new Date().toISOString().split('T')[0]);
  const [supplierName, setSupplierName] = useState(
    initialData.supplierName || 'MOJR Construction Trading & General Services, Ltd, Co.'
  );
  const [approvedBudget, setApprovedBudget] = useState<number | ''>(initialData.approvedBudgetContract ?? '');
  const [deadlineDate, setDeadlineDate] = useState(initialData.deadlineDate || getDefaultDeadlineDate());
  const [deliveryPeriod, setDeliveryPeriod] = useState(initialData.deliveryPeriod || 'Thirty (30) calendar days.');
  const [title, setTitle] = useState(initialData.title || 'Procurement of Goods & Infrastructure Services');

  // Items State
  const [items, setItems] = useState<ItemRow[]>(
    initialData.items && initialData.items.length > 0
      ? initialData.items
      : [
          {
            id: 'initial-item-1',
            itemNumber: '001',
            particulars: '',
            quantity: 1,
            unit: 'pcs',
            unitCost: 0,
            totalCost: 0,
            appItemId: null,
            productId: null,
          },
        ]
  );

  // Signature State
  const [printedName, setPrintedName] = useState(initialData.printedName || '');
  const [bacChairperson, setBacChairperson] = useState(initialData.bacChairperson || 'BAC Chairperson');

  // Read-only Toggle
  const [isReadOnly, setIsReadOnly] = useState(mode === 'view');

  // Sync nextRfqNumber
  useEffect(() => {
    if (nextRfqNumber && mode === 'create' && !rfqNumber) {
      setRfqNumber(nextRfqNumber);
    }
  }, [nextRfqNumber, mode, rfqNumber]);

  // Alerts
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (submitStatus: 'Draft' | 'Published') => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!rfqNumber.trim()) {
      setErrorMsg('Please enter an RFQ reference number.');
      return;
    }
    if (!approvedBudget || approvedBudget <= 0) {
      setErrorMsg('Please enter the Approved Budget for this Procurement (ABC).');
      return;
    }

    // Filter non-empty items
    const activeItems = items.filter((item) => item.particulars.trim() !== '');

    if (activeItems.length === 0) {
      setErrorMsg('Please enter at least one line item particular/specification.');
      return;
    }

    startTransition(async () => {
      if (onSave) {
        const res = await onSave(
          {
            rfqNumber,
            title,
            date,
            supplierName,
            approvedBudgetContract: Number(approvedBudget),
            deadlineDate,
            deliveryPeriod,
            items: activeItems,
            printedName,
            bacChairperson,
          },
          submitStatus
        );
        if (res.success) {
          setSuccessMsg(
            submitStatus === 'Published'
              ? 'RFQ successfully published and sent to suppliers!'
              : 'RFQ draft saved successfully!'
          );
          setTimeout(() => {
            router.push('/dashboard/officer');
            router.refresh();
          }, 1500);
        } else {
          setErrorMsg(res.error || 'Failed to save RFQ.');
        }
      } else {
        const res = await createRfqAction({
          rfqNumber,
          title: title || 'Procurement Solicitation',
          approvedBudgetContract: Number(approvedBudget),
          deadlineDate,
          status: submitStatus,
          items: activeItems.map((item) => ({
            itemNumber: item.itemNumber,
            particulars: item.particulars,
            quantity: item.quantity,
            unit: item.unit || 'pcs',
            appItemId: item.appItemId,
            productId: item.productId,
          })),
        });

        if (res.success) {
          setSuccessMsg(
            submitStatus === 'Published'
              ? 'RFQ successfully published and sent to suppliers!'
              : 'RFQ draft saved successfully!'
          );
          setTimeout(() => {
            router.push('/dashboard/officer');
            router.refresh();
          }, 1500);
        } else {
          setErrorMsg(res.error || 'Failed to save RFQ.');
        }
      }
    });
  };

  return (
    <div className="relative pb-24">

      {/* Alert Notifications */}
      {errorMsg && (
        <div className="max-w-[800px] mx-auto mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 print:hidden shadow-sm">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="max-w-[800px] mx-auto mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 print:hidden shadow-sm">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Centered Digital Official Annex D Document — routed through DocumentLayout for BSC print header/footer */}
      <div id="rfq-document-container" className="w-full flex justify-center">
        <div
          id="rfq-document"
          className="w-full max-w-[800px] min-h-[1056px] bg-white text-black shadow-xl border border-slate-400 p-6 sm:p-10 font-sans text-xs leading-snug rounded-none"
        >
          <DocumentLayout
            title="REQUEST FOR PRICE QUOTATION"
            documentRef={rfqNumber}
            printAreaId="rfq-document"
          >
            {/* 1. Header (Annex D & Date) */}
            <RFQHeader date={date} setDate={setDate} isReadOnly={isReadOnly} />

            {/* 2. Supplier Section */}
            <RFQSupplierSection
              supplierName={supplierName}
              setSupplierName={setSupplierName}
              isReadOnly={isReadOnly}
            />

            {/* 3. Official NOTE Instructions (1 to 6) */}
            <RFQTerms
              approvedBudget={approvedBudget}
              setApprovedBudget={setApprovedBudget}
              deliveryPeriod={deliveryPeriod}
              setDeliveryPeriod={setDeliveryPeriod}
              isReadOnly={isReadOnly}
            />

            {/* 4. Table Grid */}
            <RFQItemsTable
              items={items}
              setItems={setItems}
              appItems={appItems}
              catalogProducts={catalogProducts}
              isReadOnly={isReadOnly}
            />

            {/* 5. Signature Section & Ref.# Footer */}
            <RFQSignatureSection
              rfqNumber={rfqNumber}
              setRfqNumber={setRfqNumber}
              printedName={printedName}
              setPrintedName={setPrintedName}
              bacChairperson={bacChairperson}
              setBacChairperson={setBacChairperson}
              isReadOnly={isReadOnly}
            />
          </DocumentLayout>
        </div>
      </div>

      {/* Floating Action Bar */}
      <RFQToolbar
        onSaveDraft={() => handleSubmit('Draft')}
        onPublish={() => handleSubmit('Published')}
        isReadOnly={isReadOnly}
        setIsReadOnly={setIsReadOnly}
        isPending={isPending}
        onCancel={() => router.push('/dashboard/officer')}
      />
    </div>
  );
}
