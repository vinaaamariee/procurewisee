'use client';

import React from 'react';

interface RFQTermsAndConditionsProps {
  terms?: string[];
  setTerms?: (terms: string[]) => void;
  isReadOnly?: boolean;
}

const DEFAULT_TERMS = [
  'All entries must be legibly printed or typewritten.',
  'Delivery period shall be within the specified calendar days upon receipt of the Purchase Order (PO).',
  'Warranty shall be for a minimum period of three (3) months for supplies & materials, one (1) year for equipment, from date of acceptance by the procuring entity.',
  'Price validity shall be for a period of sixty (60) calendar days.',
  'Bidders shall submit original brochures showing certifications of the product being offered if applicable.',
  'Price quotation must be inclusive of all taxes, delivery charges, and other applicable government fees.',
  'Quotations exceeding the Approved Budget for the Contract (ABC) shall be automatically rejected.',
];

export default function RFQTermsAndConditions({
  terms = DEFAULT_TERMS,
  setTerms,
  isReadOnly = false,
}: RFQTermsAndConditionsProps) {
  const handleTermChange = (index: number, value: string) => {
    if (!setTerms) return;
    const updated = [...terms];
    updated[index] = value;
    setTerms(updated);
  };

  return (
    <div className="my-4 border border-gray-800 p-3.5 bg-gray-50/60 font-serif text-xs space-y-2">
      <div className="font-bold text-gray-900 uppercase tracking-wider text-[11px] border-b border-gray-300 pb-1 font-sans">
        Terms and Conditions & General Bidding Instructions
      </div>

      <ol className="list-decimal list-inside space-y-1.5 text-gray-800 leading-relaxed text-[11px]">
        {terms.map((term, index) => (
          <li key={index} className="align-top">
            {isReadOnly ? (
              <span className="inline">{term}</span>
            ) : (
              <input
                type="text"
                value={term}
                onChange={(e) => handleTermChange(index, e.target.value)}
                className="w-[94%] border-b border-dotted border-gray-400 bg-transparent px-1 py-0.5 text-[11px] font-serif focus:outline-none focus:border-gray-900"
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
