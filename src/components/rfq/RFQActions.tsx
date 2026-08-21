'use client';

import React from 'react';
import { Save, Send, Printer, FileDown, Eye, Edit3, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RFQActionsProps {
  onSaveDraft?: () => void;
  onPublish?: () => void;
  isReadOnly?: boolean;
  setIsReadOnly?: (val: boolean) => void;
  isPending?: boolean;
  onCancel?: () => void;
}

export default function RFQActions({
  onSaveDraft,
  onPublish,
  isReadOnly = false,
  setIsReadOnly,
  isPending = false,
  onCancel,
}: RFQActionsProps) {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/dashboard/officer');
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 print:hidden transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-3 bg-gray-900/90 text-white px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-700/60 max-w-[95vw] overflow-x-auto">
        {/* Back / Cancel */}
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-700 bg-gray-800/80 text-xs font-semibold text-gray-300 hover:bg-gray-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cancel</span>
        </button>

        <div className="h-4 w-px bg-gray-700 mx-1" />

        {/* Toggle Edit / Preview */}
        {setIsReadOnly && (
          <button
            type="button"
            onClick={() => setIsReadOnly(!isReadOnly)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-700 bg-gray-800/80 text-xs font-semibold text-[var(--secondary)] hover:bg-gray-700 transition"
          >
            {isReadOnly ? (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Document</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Document</span>
              </>
            )}
          </button>
        )}

        {/* Print Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-700 bg-gray-800/80 text-xs font-semibold text-gray-200 hover:bg-gray-700 transition"
        >
          <Printer className="w-3.5 h-3.5 text-[var(--secondary)]" />
          <span>Print</span>
        </button>

        {/* Generate PDF Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-700 bg-gray-800/80 text-xs font-semibold text-gray-200 hover:bg-gray-700 transition"
        >
          <FileDown className="w-3.5 h-3.5 text-[var(--secondary)]" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>

        {/* Save Draft Button */}
        {onSaveDraft && (
          <button
            type="button"
            disabled={isPending}
            onClick={onSaveDraft}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-600 bg-gray-800 text-xs font-semibold text-white hover:bg-gray-700 transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-[var(--secondary)]" />
            <span>Save Draft</span>
          </button>
        )}

        {/* Publish Solicitation Button */}
        {onPublish && (
          <button
            type="button"
            disabled={isPending}
            onClick={onPublish}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#800000] text-xs font-bold text-white hover:bg-[#800000] transition shadow-md disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPending ? 'Processing...' : 'Publish RFQ'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
