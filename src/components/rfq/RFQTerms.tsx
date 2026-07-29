'use client';

import React from 'react';

interface RFQTermsProps {
  approvedBudget: number | '';
  setApprovedBudget?: (val: number | '') => void;
  deliveryPeriod?: string;
  setDeliveryPeriod?: (val: string) => void;
  isReadOnly?: boolean;
}

export default function RFQTerms({
  approvedBudget,
  setApprovedBudget,
  deliveryPeriod = 'Thirty (30) calendar days.',
  setDeliveryPeriod,
  isReadOnly = false,
}: RFQTermsProps) {
  return (
    <div className="font-sans text-[10.5px] leading-snug text-black space-y-0.5 my-2 pl-1">
      <div className="flex gap-1">
        <span className="font-bold text-black shrink-0">NOTE: 1.</span>
        <p className="uppercase text-black">
          THE DEFAULT MODE OF PRICE EVALUATION SHALL BE ON A LOT BASIS, OTHERWISE PER ITEMS EVALUATION SHALL BE USED IF THERE WILL BE LACKING ITEMS IN ALL RFQ'S AND SUBJECT TO END-USER APPROVAL., <span className="italic normal-case text-slate-900">(Clause 15.2, Section I, Instruction to Bidders of the Philippine Bidding Documents for goods and infrastructure projects)</span>
        </p>
      </div>

      <div className="flex items-baseline gap-1 pl-6">
        <span className="font-bold shrink-0">2.</span>
        <span>DELIVERY PERIOD:</span>
        {isReadOnly ? (
          <span className="border-b border-black font-semibold px-1">{deliveryPeriod}</span>
        ) : (
          <input
            type="text"
            value={deliveryPeriod}
            onChange={(e) => setDeliveryPeriod?.(e.target.value)}
            className="border-b border-black text-[10.5px] bg-transparent focus:outline-none px-1 text-black font-semibold"
          />
        )}
      </div>

      <div className="pl-6">
        <span className="font-bold">3. </span>
        <span>Submission of price quotation shall be in <span className="font-bold">sealed envelope</span>.</span>
      </div>

      <div className="pl-6 flex items-baseline gap-1">
        <span className="font-bold">4. </span>
        <span className="uppercase font-bold">THE APPROVED BUDGET FOR THIS PROCUREMENT IS</span>
      </div>
      <div className="pl-10 flex items-baseline gap-1 font-bold">
        <span>₱</span>
        {isReadOnly ? (
          <span className="border-b border-black px-2 min-w-[120px] inline-block font-bold">
            {typeof approvedBudget === 'number' ? approvedBudget.toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '__________________'}
          </span>
        ) : (
          <input
            type="number"
            step="0.01"
            min="0"
            value={approvedBudget}
            onChange={(e) => setApprovedBudget?.(e.target.value === '' ? '' : parseFloat(e.target.value))}
            placeholder="0.00"
            className="border-b border-black text-[10.5px] font-bold bg-transparent focus:outline-none px-1 w-36 text-black"
          />
        )}
      </div>

      <div className="pl-6 uppercase text-[10px] text-black leading-tight pt-0.5">
        <span className="font-bold">5. </span>
        <span>PURSUANT TO ANNEX &quot;H&quot;, APPENDIX A, SECTION II, SUBMISSION OF APPLICABLE DOCUMENTS <span className="italic normal-case font-normal">(e.g.MAYORS/BUSINESS PERMIT, PROFESSIONAL LICENSE/CURRICULUM VITAE (CONSULTING SEERVICES),PHILGEPS CERT. NO., PCAB LICENSE (INFRA), INCOME/BUSINESS TAX RETURN,OMNIBUS SWORN STATEMENT SHALL BE REQUIRED</span></span>
      </div>

      <div className="pl-6 pt-0.5">
        <span className="font-bold">6. </span>
        <span>In case the item is not availble, please write <span className="font-bold">&quot;None&quot;</span>.</span>
      </div>
    </div>
  );
}
