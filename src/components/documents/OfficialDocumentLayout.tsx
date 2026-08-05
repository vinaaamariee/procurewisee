'use client';

import React from 'react';
import Image from 'next/image';

interface OfficialDocumentLayoutProps {
  children: React.ReactNode;
  printAreaId?: string; // Defaults to 'pr-document'
}

export default function OfficialDocumentLayout({
  children,
  printAreaId = 'pr-document',
}: OfficialDocumentLayoutProps) {
  return (
    <div className="w-full text-black bg-white">
      {/* Universal Print & Screen Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 10mm 10mm 10mm;
          }
          
          /* Hide all screen components */
          body * {
            visibility: hidden;
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
          }
          
          /* Only make the printable area visible */
          #${printAreaId}, #${printAreaId} * {
            visibility: visible !important;
          }
          
          #${printAreaId} {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            display: block !important;
            background: #fff !important;
            color: #000 !important;
          }
          
          #${printAreaId}-container {
            display: block !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Neutralize positioned ancestors so the absolute print area anchors to the page */
          .pr-print-root {
            position: static !important;
            padding-bottom: 0 !important;
          }
          
          header {
            position: static !important;
          }
          
          aside {
            display: none !important;
          }
          
          #prPrintArea {
            padding-top: 115px !important;
            padding-bottom: 80px !important;
          }
          
          /* Official fixed header & footer */
          .official-print-header {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 110px !important;
            display: block !important;
            z-index: 9999 !important;
            background: #fff !important;
          }
          
          .official-print-footer {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 75px !important;
            display: block !important;
            z-index: 9999 !important;
            background: #fff !important;
          }
          
          /* Spacers inside print table groups */
          .print-header-spacer {
            height: 115px !important;
            display: block !important;
          }
          
          .print-footer-spacer {
            height: 80px !important;
            display: block !important;
          }
          
          .official-layout-table {
            width: 100% !important;
            border: none !important;
            border-collapse: collapse !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .official-layout-table td {
            border: none !important;
            padding: 0 !important;
          }
          
          .no-print {
            display: none !important;
          }

          /* General spacing and print optimizations */
          #${printAreaId} .my-4,
          #${printAreaId} .mt-6,
          #${printAreaId} .mb-6 {
            margin-top: 8px !important;
            margin-bottom: 8px !important;
          }

          #${printAreaId} .space-y-6 > * + * {
            margin-top: 8px !important;
          }
          
          #${printAreaId} .space-y-6 {
            margin-top: 8px !important;
            margin-bottom: 8px !important;
          }

          #${printAreaId} .p-3,
          #${printAreaId} .p-3.5,
          #${printAreaId} .p-4 {
            padding: 6px 10px !important;
          }

          #${printAreaId} .p-8 {
            padding: 10px !important;
          }

          #${printAreaId} .pt-6 {
            padding-top: 12px !important;
          }

          #${printAreaId} .pb-4 {
            padding-bottom: 8px !important;
          }

          /* Prevent signature block breaking */
          #${printAreaId} [class*="PRSignatureSection"],
          #${printAreaId} div[id="prPrintArea"] > div:last-child {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-top: 12px !important;
          }

          #${printAreaId} textarea,
          #${printAreaId} input,
          #${printAreaId} select {
            padding-top: 2px !important;
            padding-bottom: 2px !important;
          }
        }
        
        @media screen {
          .official-print-header {
            display: block;
            width: 100%;
            margin-bottom: 1.5rem;
          }
          
          .official-print-footer {
            display: block;
            width: 100%;
            margin-top: 2rem;
            border-top: 1px solid #e2e8f0;
            padding-top: 1rem;
          }
          
          .print-header-spacer,
          .print-footer-spacer {
            display: none;
          }
          
          .official-layout-table {
            width: 100%;
          }
        }
      ` }} />

      {/* Repeating Fixed Header for Print & Block Header for Screen */}
      <div className="official-print-header print:fixed print:top-0 print:left-0 print:right-0 w-full">
        <Image
          src="/images/bsc-header.png"
          alt="Official Batanes State College Header"
          width={1200}
          height={180}
          priority
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Layout Table */}
      <table className="official-layout-table border-none border-collapse w-full">
        <thead>
          <tr>
            <td className="border-none p-0">
              <div className="print-header-spacer w-full"></div>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-none p-0">
              {/* Document Content */}
              <div className="w-full text-black">
                {children}
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td className="border-none p-0">
              <div className="print-footer-spacer w-full"></div>
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Repeating Fixed Footer for Print & Block Footer for Screen */}
      <div className="official-print-footer print:fixed print:bottom-0 print:left-0 print:right-0 w-full">
        <Image
          src="/images/bsc-footer.png"
          alt="Official Batanes State College Footer"
          width={1200}
          height={120}
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  );
}
