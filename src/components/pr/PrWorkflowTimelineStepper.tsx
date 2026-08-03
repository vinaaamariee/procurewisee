import React from 'react';

interface PrWorkflowTimelineStepperProps {
  currentStatus: string;
}

export default function PrWorkflowTimelineStepper({ currentStatus }: PrWorkflowTimelineStepperProps) {
  // Official Batanes State College Requisition stages
  const steps = [
    { id: 'Draft', label: 'Draft' },
    { id: 'Submitted', label: 'Submitted' },
    { id: 'PendingVerification', label: 'Verification' },
    { id: 'Verified', label: 'Verified' },
    { id: 'RecordedToPmr', label: 'Recorded to PMR' },
    { id: 'RfqPrep', label: 'RFQ Prep' },
    { id: 'ConvertedToRfq', label: 'Converted to RFQ' }
  ];

  const getStepActiveState = (stepId: string) => {
    const status = currentStatus.toLowerCase();
    if (status === 'convertedtorfq' || status === 'converted to rfq') {
      return true;
    }
    if (status === 'approved') {
      return ['draft', 'submitted', 'pendingverification', 'verified'].includes(stepId.toLowerCase());
    }
    if (['pendingprocurementreview', 'pending procurement review', 'underreview', 'under review'].includes(status)) {
      return ['draft', 'submitted', 'pendingverification'].includes(stepId.toLowerCase());
    }
    if (status === 'submitted') {
      return ['draft', 'submitted'].includes(stepId.toLowerCase());
    }
    return stepId === 'Draft';
  };

  return (
    <div className="pt-4 border-t border-[var(--border)]">
      <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">
        Official Requisition Stage Timeline
      </div>
      <div className="flex items-center justify-between w-full py-2 overflow-x-auto gap-2">
        {steps.map((step, idx, arr) => {
          const isActive = getStepActiveState(step.id);
          const isLast = idx === arr.length - 1;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5 shrink-0 relative min-w-[75px]">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                    isActive
                      ? 'bg-[#7B1E1E] text-white border-[#7B1E1E] shadow-sm font-extrabold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`text-[9px] font-bold text-center leading-tight ${
                    isActive
                      ? 'text-[#7B1E1E] font-extrabold'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`flex-1 min-w-[15px] h-0.5 -mt-4 transition-all duration-355 ${
                    getStepActiveState(arr[idx + 1].id)
                      ? 'bg-[#7B1E1E]'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
