'use client';

import Image from 'next/image';

interface RFQCollegeInformationProps {
  className?: string;
}

export default function RFQCollegeInformation({ className = '' }: RFQCollegeInformationProps) {
  return (
    <div className={`text-center space-y-2 pb-4 border-b-2 border-gray-900 ${className}`}>
      <div className="flex items-center justify-center gap-4">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
          <Image
            src="/images/bsc-logo.png"
            alt="Batanes State College Seal"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="text-left font-serif">
          <div className="text-xs uppercase tracking-wider text-gray-700 font-semibold">
            Republic of the Philippines
          </div>
          <div className="text-lg sm:text-xl font-bold tracking-tight text-gray-950 uppercase">
            Batanes State College
          </div>
          <div className="text-xs text-gray-600">
            Washington Ave., San Antonio, Basco, Batanes
          </div>
          <div className="text-xs font-bold text-[#800000] uppercase tracking-wide mt-0.5">
            Procurement Unit
          </div>
        </div>
      </div>
      <div className="pt-2">
        <h1 className="text-base sm:text-lg font-bold text-gray-950 tracking-widest uppercase font-serif">
          Request for Quotation
        </h1>
        <p className="text-[11px] text-gray-600 italic">
          (Official Solicitation Form for Small Value Procurement & Bidding)
        </p>
      </div>
    </div>
  );
}
