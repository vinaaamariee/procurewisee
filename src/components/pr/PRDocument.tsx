'use client';

import React, { useState, useTransition } from 'react';
import PRHeader from './PRHeader';
import PRGeneralInformation, { PRGeneralInfo } from './PRGeneralInformation';
import PRItemsTable, { CatalogProductOption, PRItemRow } from './PRItemsTable';
import PRPurposeSection from './PRPurposeSection';
import PRSignatureSection from './PRSignatureSection';
import PRToolbar from './PRToolbar';
import { createPrFromCartAction } from '@/app/actions/pr';
import { useRouter } from 'next/navigation';

export interface PRDocumentData {
  id?: number;
  prNumber?: string;
  department?: string;
  office?: string;
  purpose?: string;
  fundingSource?: string;
  entityName?: string;
  fundCluster?: string;
  responsibilityCenterCode?: string;
  date?: string;
  requestedByName?: string;
  requestedByTitle?: string;
  approvedByName?: string;
  approvedByTitle?: string;
  items?: PRItemRow[];
}

interface PRDocumentProps {
  mode?: 'create' | 'edit' | 'view';
  initialData?: PRDocumentData;
  catalogProducts?: CatalogProductOption[];
  onSave?: (data: PRDocumentData, status: 'Draft' | 'Submitted') => Promise<{ success: boolean; error?: string }>;
}

export default function PRDocument({
  mode = 'create',
  initialData = {},
  catalogProducts = [],
  onSave,
}: PRDocumentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // General Information State
  const [info, setInfo] = useState<PRGeneralInfo>({
    entityName: initialData.entityName || 'Batanes State College',
    fundCluster: initialData.fundCluster || '101 - General Fund',
    office: initialData.office || initialData.department || 'Procurement Unit',
    department: initialData.department || 'General Administration',
    prNumber: initialData.prNumber || '',
    date: initialData.date || new Date().toISOString().split('T')[0],
    responsibilityCenterCode: initialData.responsibilityCenterCode || 'BSC-2026-01',
  });

  // Purpose State
  const [purpose, setPurpose] = useState(initialData.purpose || '');

  // Line Items State
  const [items, setItems] = useState<PRItemRow[]>(
    initialData.items && initialData.items.length > 0
      ? initialData.items
      : [
          {
            id: 'initial-pr-item-1',
            stockNo: '001',
            unit: 'pcs',
            description: '',
            quantity: 1,
            estimatedUnitCost: 0,
            estimatedCost: 0,
            productId: null,
          },
        ]
  );

  // Signatures State
  const [requestedByName, setRequestedByName] = useState(initialData.requestedByName || 'Requisitioning Officer');
  const [approvedByName, setApprovedByName] = useState(initialData.approvedByName || 'Dr. Djovi R. Durante');

  // Read-only state
  const [isReadOnly, setIsReadOnly] = useState(mode === 'view');

  // Alerts
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (submitStatus: 'Draft' | 'Submitted') => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!purpose.trim()) {
      setErrorMsg('Please enter the purpose/justification for this Purchase Request.');
      return;
    }

    // Line item validations
    for (const item of items) {
      if (!item.description.trim()) {
        setErrorMsg(`Stock No. ${item.stockNo} item description cannot be empty.`);
        return;
      }
      if (item.quantity <= 0) {
        setErrorMsg(`Stock No. ${item.stockNo} quantity must be 1 or more.`);
        return;
      }
      if (!item.unit.trim()) {
        setErrorMsg(`Stock No. ${item.stockNo} unit is required.`);
        return;
      }
      if (item.estimatedUnitCost < 0) {
        setErrorMsg(`Stock No. ${item.stockNo} unit cost cannot be negative.`);
        return;
      }
    }

    startTransition(async () => {
      const prData: PRDocumentData = {
        prNumber: info.prNumber,
        department: info.office || info.department || 'General Administration',
        office: info.office || 'Procurement Unit',
        purpose,
        fundingSource: info.fundCluster || '101 - General Fund',
        entityName: info.entityName,
        fundCluster: info.fundCluster,
        responsibilityCenterCode: info.responsibilityCenterCode,
        date: info.date,
        requestedByName,
        approvedByName,
        items,
      };

      if (onSave) {
        const res = await onSave(prData, submitStatus);
        if (res.success) {
          setSuccessMsg(
            submitStatus === 'Submitted'
              ? 'Purchase Request successfully submitted for officer review!'
              : 'Purchase Request draft saved successfully!'
          );
          setTimeout(() => {
            router.push('/dashboard/end-user/pr');
            router.refresh();
          }, 1500);
        } else {
          setErrorMsg(res.error || 'Failed to save Purchase Request.');
        }
      } else {
        // Default action calling createPrFromCartAction
        const res = await createPrFromCartAction({
          department: info.office || info.department || 'General Administration',
          office: info.office || 'Procurement Unit',
          purpose,
          fundingSource: info.fundCluster || '101 - General Fund',
          items: items.map((item) => ({
            productId: item.productId || undefined,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            estimatedUnitCost: item.estimatedUnitCost,
            specification: item.description,
          })),
        });

        if (res.success) {
          setSuccessMsg('Purchase Request successfully created and submitted!');
          setTimeout(() => {
            router.push('/dashboard/end-user/pr');
            router.refresh();
          }, 1500);
        } else {
          setErrorMsg(res.error || 'Failed to create Purchase Request.');
        }
      }
    });
  };

  return (
    <div className="relative pb-24">
      {/* Print Media CSS Rules */}
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
          #pr-document-container {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          #pr-document {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Alert Banners */}
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

      {/* Centered Digital PR Document */}
      <div id="pr-document-container" className="w-full flex justify-center">
        <div
          id="pr-document"
          className="w-full max-w-[850px] min-h-[1056px] bg-white text-slate-950 shadow-2xl border border-slate-300 p-6 sm:p-10 md:p-12 font-serif text-xs leading-snug rounded-sm"
        >
          {/* 1. Official Header */}
          <PRHeader />

          {/* 2. General Information Block */}
          <PRGeneralInformation
            info={info}
            setInfo={setInfo}
            isReadOnly={isReadOnly}
          />

          {/* 3. Items Schedule Table */}
          <PRItemsTable
            items={items}
            setItems={setItems}
            catalogProducts={catalogProducts}
            isReadOnly={isReadOnly}
          />

          {/* 4. Purpose Section */}
          <PRPurposeSection
            purpose={purpose}
            setPurpose={setPurpose}
            isReadOnly={isReadOnly}
          />

          {/* 5. Signature Section */}
          <PRSignatureSection
            requestedByName={requestedByName}
            setRequestedByName={setRequestedByName}
            approvedByName={approvedByName}
            setApprovedByName={setApprovedByName}
            isReadOnly={isReadOnly}
          />
        </div>
      </div>

      {/* Floating Action Toolbar */}
      <PRToolbar
        onSaveDraft={() => handleSubmit('Draft')}
        onSubmitPR={() => handleSubmit('Submitted')}
        isReadOnly={isReadOnly}
        setIsReadOnly={setIsReadOnly}
        isPending={isPending}
        onCancel={() => router.push('/dashboard/end-user/pr')}
      />
    </div>
  );
}
