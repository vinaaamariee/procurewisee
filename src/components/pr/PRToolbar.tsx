'use client';

import React from 'react';
import { Save, Send, Printer, FileDown, Eye, Edit3, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PRToolbarProps {
  onSaveDraft?: () => void;
  onSubmitPR?: () => void;
  isReadOnly?: boolean;
  setIsReadOnly?: (val: boolean) => void;
  isPending?: boolean;
  onCancel?: () => void;
}

export default function PRToolbar({
  onSaveDraft,
  onSubmitPR,
  isReadOnly = false,
  setIsReadOnly,
  isPending = false,
  onCancel,
}: PRToolbarProps) {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/dashboard/end-user/pr');
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 print:hidden transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/90 text-white px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700/60 max-w-[95vw] overflow-x-auto">
        {/* Back / Cancel */}
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cancel</span>
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        {/* Toggle Edit / Preview */}
        {setIsReadOnly && (
          <button
            type="button"
            onClick={() => setIsReadOnly(!isReadOnly)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 text-xs font-semibold text-[var(--secondary)] hover:bg-slate-700 transition cursor-pointer"
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-[var(--secondary)]" />
          <span>Print</span>
        </button>

        {/* Generate PDF Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-600 bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-[var(--secondary)]" />
            <span>Save Draft</span>
          </button>
        )}

        {/* Submit PR Button */}
        {onSubmitPR && (
          <button
            type="button"
            disabled={isPending}
            onClick={onSubmitPR}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#7B1E1E] text-xs font-bold text-white hover:bg-[#7B1E1E] transition shadow-md cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPending ? 'Processing...' : 'Submit PR'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
