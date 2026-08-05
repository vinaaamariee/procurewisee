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
    <div className="print-page w-full bg-white text-black">
      {/* Universal Print & Screen Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 10mm 10mm 10mm;
          }
          
          body {
            background: #fff !important;
          }
          
          /* Hide all screen components */
          body * {
            visibility: hidden;
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
          }
          
          /* Only make the printable area (and its official header/footer) visible */
          #${printAreaId}, #${printAreaId} * {
            visibility: visible !important;
          }
          
          .official-print-header, .official-print-header *,
          .official-print-footer, .official-print-footer * {
            visibility: visible !important;
          }
          
          #${printAreaId} {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
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
          
          /* Collapse the dashboard chrome so the document spans the printable area */
          .pr-print-root {
            position: static !important;
            padding-bottom: 0 !important;
          }
          
          aside,
          header,
          footer {
            display: none !important;
          }
          
          main {
            padding: 0 !important;
          }
          
          main > div,
          main > div > div {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* A4 sheet container */
          .print-page {
            width: 100% !important;
            background: #fff !important;
          }
          
          /* Official header & footer repeat on every page via thead/tfoot */
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
            vertical-align: top !important;
          }
          
          .official-print-header img,
          .official-print-footer img {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            object-fit: contain !important;
          }
          
          /* Body expands to fill the remaining page height above the footer */
          .document-content {
            min-height: 225mm !important;
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
          #prPrintArea .space-y-6 > div:last-child {
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
          
          .official-layout-table {
            width: 100%;
          }
        }
      ` }} />

      {/* Official header — repeats on every printed page */}
      <table className="official-layout-table border-none border-collapse w-full">
        <thead>
          <tr>
            <td className="border-none p-0">
              <div className="official-print-header w-full">
                <Image
                  src="/images/bsc-header.png"
                  alt="Official Batanes State College Header"
                  width={1024}
                  height={159}
                  priority
                  className="w-full h-auto object-contain"
                />
              </div>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-none p-0">
              <div className="document-content w-full text-black">
                {children}
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td className="border-none p-0">
              <div className="official-print-footer w-full">
                <Image
                  src="/images/bsc-footer.png"
                  alt="Official Batanes State College Footer"
                  width={1024}
                  height={118}
                  priority
                  className="w-full h-auto object-contain"
                />
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
