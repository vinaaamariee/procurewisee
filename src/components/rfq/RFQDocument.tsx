'use client';

import React, { useState, useEffect, useTransition } from 'react';
import RFQCollegeInformation from './RFQCollegeInformation';
import RFQHeader from './RFQHeader';
import RFQSupplierInformation, { SupplierInfo } from './RFQSupplierInformation';
import RFQItemsTable, { AppItem, CatalogProduct, ItemRow } from './RFQItemsTable';
import RFQTermsAndConditions from './RFQTermsAndConditions';
import RFQSignatureSection from './RFQSignatureSection';
import RFQActions from './RFQActions';
import { createRfqAction } from '@/app/actions/rfq-actions';
import { useRouter } from 'next/navigation';

export interface RFQDocumentData {
  id?: number;
  rfqNumber?: string;
  title?: string;
  date?: string;
  modeOfProcurement?: string;
  approvedBudgetContract?: number | '';
  deadlineDate?: string;
  deliveryPeriod?: string;
  status?: 'Draft' | 'Published' | 'Closed' | 'Evaluated';
  supplier?: SupplierInfo;
  items?: ItemRow[];
  termsAndConditions?: string[];
  preparedByName?: string;
  preparedByTitle?: string;
  approvedByName?: string;
  approvedByTitle?: string;
  isManualOverride?: boolean;
  overrideCategory?: string;
  overrideDetails?: string;
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

  // Form State
  const [title, setTitle] = useState(initialData.title || '');
  const [rfqNumber, setRfqNumber] = useState(initialData.rfqNumber || nextRfqNumber);
  const [isManualOverride, setIsManualOverride] = useState(initialData.isManualOverride || false);
  const [overrideCategory, setOverrideCategory] = useState(initialData.overrideCategory || 'Urgent Operational Requirement');
  const [overrideDetails, setOverrideDetails] = useState(initialData.overrideDetails || '');
  const [date, setDate] = useState(initialData.date || new Date().toISOString().split('T')[0]);
  const [modeOfProcurement, setModeOfProcurement] = useState(initialData.modeOfProcurement || 'Small Value Procurement (Sec. 53.9)');
  const [approvedBudget, setApprovedBudget] = useState<number | ''>(initialData.approvedBudgetContract ?? '');
  const [deadlineDate, setDeadlineDate] = useState(initialData.deadlineDate || getDefaultDeadlineDate());
  const [deliveryPeriod, setDeliveryPeriod] = useState(initialData.deliveryPeriod || '15 Calendar Days');

  // Supplier Information
  const [supplier, setSupplier] = useState<SupplierInfo>(initialData.supplier || {});

  // Line Items State
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

  // Terms and Signature State
  const [terms, setTerms] = useState<string[] | undefined>(initialData.termsAndConditions);
  const [preparedByName, setPreparedByName] = useState(initialData.preparedByName || 'Procurement Officer');
  const [approvedByName, setApprovedByName] = useState(initialData.approvedByName || 'Dr. Djovi R. Durante');

  // Mode Read-Only Toggle
  const [isReadOnly, setIsReadOnly] = useState(mode === 'view');

  // Sync nextRfqNumber when not manual override
  useEffect(() => {
    if (!isManualOverride && nextRfqNumber && mode === 'create') {
      setRfqNumber(nextRfqNumber);
    }
  }, [nextRfqNumber, isManualOverride, mode]);

  // Alerts
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Submit Handler
  const handleSubmit = (submitStatus: 'Draft' | 'Published') => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!rfqNumber.trim()) {
      setErrorMsg('Please enter an RFQ reference number.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter an RFQ title/subject.');
      return;
    }
    if (!approvedBudget || approvedBudget <= 0) {
      setErrorMsg('Please enter a valid Approved Budget for the Contract (ABC).');
      return;
    }
    if (!deadlineDate) {
      setErrorMsg('Please select a submission deadline.');
      return;
    }

    if (isManualOverride) {
      if (overrideCategory === 'Other (specify below)' && !overrideDetails.trim()) {
        setErrorMsg('Please specify details for your sequence override reason.');
        return;
      }
    }

    // Line items validation
    for (const item of items) {
      if (!item.particulars.trim()) {
        setErrorMsg(`Item ${item.itemNumber} description / specification cannot be empty.`);
        return;
      }
      if (item.quantity <= 0) {
        setErrorMsg(`Item ${item.itemNumber} quantity must be 1 or more.`);
        return;
      }
      if (!item.unit.trim()) {
        setErrorMsg(`Item ${item.itemNumber} unit (e.g. pcs, reams) is required.`);
        return;
      }
    }

    startTransition(async () => {
      if (onSave) {
        const res = await onSave(
          {
            rfqNumber,
            title,
            date,
            modeOfProcurement,
            approvedBudgetContract: Number(approvedBudget),
            deadlineDate,
            deliveryPeriod,
            supplier,
            items,
            termsAndConditions: terms,
            preparedByName,
            approvedByName,
            isManualOverride,
            overrideCategory,
            overrideDetails,
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
        // Default execution calling createRfqAction
        const res = await createRfqAction({
          rfqNumber,
          title,
          approvedBudgetContract: Number(approvedBudget),
          deadlineDate,
          status: submitStatus,
          items: items.map((item) => ({
            itemNumber: item.itemNumber,
            particulars: item.particulars,
            quantity: item.quantity,
            unit: item.unit,
            appItemId: item.appItemId,
            productId: item.productId,
          })),
          overrideReason: isManualOverride
            ? overrideCategory === 'Other (specify below)'
              ? `Other: ${overrideDetails.trim()}`
              : overrideCategory
            : undefined,
          originalRfqNumber: isManualOverride ? nextRfqNumber : undefined,
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
      {/* Print Media Styles */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .print\\:hidden,
          nav,
          header,
          aside,
          footer {
            display: none !important;
          }
          #rfq-document-container {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          #rfq-document {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Alert Notifications */}
      {errorMsg && (
        <div className="max-w-[850px] mx-auto mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 print:hidden shadow-sm">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="max-w-[850px] mx-auto mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 print:hidden shadow-sm">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Centered A4 Digital RFQ Document Container */}
      <div id="rfq-document-container" className="w-full flex justify-center">
        <div
          id="rfq-document"
          className="w-full max-w-[850px] min-h-[1056px] bg-white text-slate-950 shadow-2xl border border-slate-300 p-6 sm:p-10 md:p-12 font-serif text-xs leading-snug rounded-sm"
        >
          {/* 1. College Institutional Header */}
          <RFQCollegeInformation />

          {/* 2. RFQ Metadata & Header */}
          <RFQHeader
            title={title}
            setTitle={setTitle}
            rfqNumber={rfqNumber}
            setRfqNumber={setRfqNumber}
            isManualOverride={isManualOverride}
            setIsManualOverride={setIsManualOverride}
            overrideCategory={overrideCategory}
            setOverrideCategory={setOverrideCategory}
            overrideDetails={overrideDetails}
            setOverrideDetails={setOverrideDetails}
            nextRfqNumber={nextRfqNumber}
            date={date}
            setDate={setDate}
            modeOfProcurement={modeOfProcurement}
            setModeOfProcurement={setModeOfProcurement}
            approvedBudget={approvedBudget}
            setApprovedBudget={setApprovedBudget}
            deadlineDate={deadlineDate}
            setDeadlineDate={setDeadlineDate}
            deliveryPeriod={deliveryPeriod}
            setDeliveryPeriod={setDeliveryPeriod}
            isReadOnly={isReadOnly}
          />

          {/* 3. Supplier Information Block */}
          <RFQSupplierInformation
            supplier={supplier}
            setSupplier={setSupplier}
            isReadOnly={isReadOnly}
          />

          {/* 4. RFQ Items Table */}
          <RFQItemsTable
            items={items}
            setItems={setItems}
            appItems={appItems}
            catalogProducts={catalogProducts}
            isReadOnly={isReadOnly}
          />

          {/* 5. Terms & Conditions Section */}
          <RFQTermsAndConditions
            terms={terms}
            setTerms={setTerms}
            isReadOnly={isReadOnly}
          />

          {/* 6. Signature Section */}
          <RFQSignatureSection
            preparedByName={preparedByName}
            setPreparedByName={setPreparedByName}
            approvedByName={approvedByName}
            setApprovedByName={setApprovedByName}
            isReadOnly={isReadOnly}
          />
        </div>
      </div>

      {/* Floating Action Bar */}
      <RFQActions
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
