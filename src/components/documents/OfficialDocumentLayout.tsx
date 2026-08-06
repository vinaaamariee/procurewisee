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
        /* ============================================================
           PURCHASE REQUEST — OFFICIAL A4 PRINT STYLESHEET
           A4 Portrait | Margins: 10mm top/bottom, 12mm left/right
        ============================================================ */
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }

          /* Hide all screen chrome */
          body * {
            visibility: hidden;
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
          }

          /* Make printable area and its descendants visible */
          #${printAreaId},
          #${printAreaId} * {
            visibility: visible !important;
          }

          /* Make official header/footer images visible */
          .official-print-header,
          .official-print-header *,
          .official-print-footer,
          .official-print-footer * {
            visibility: visible !important;
          }

          /* Collapse dashboard chrome */
          .pr-print-root {
            position: static !important;
            padding-bottom: 0 !important;
          }

          aside {
            display: none !important;
          }

          /* Suppress site header/footer — the BSC branding comes from the document table */
          body > header,
          body > footer,
          nav {
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

          /* ── Outer PR document wrapper ── */
          #${printAreaId}-container {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* ── The actual printable page shell ── */
          #${printAreaId} {
            display: flex !important;
            flex-direction: column !important;
            position: static !important;
            width: 100% !important;
            max-width: none !important;
            min-height: 277mm !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #fff !important;
            color: #000 !important;
          }

          /* ── Layout table: header repeats on every page via thead/tfoot ── */
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

          /* ── Official branding images — full printable width ── */
          .official-print-header img,
          .official-print-footer img {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            object-fit: contain !important;
          }

          /* ── Document body fills remaining vertical space ── */
          .document-content {
            flex: 1 !important;
            width: 100% !important;
          }

          /* ── print-page / print-content / print-footer helpers ── */
          .print-page {
            width: 100% !important;
            min-height: 277mm !important;
            display: flex !important;
            flex-direction: column !important;
            background: #fff !important;
          }

          .print-content {
            flex: 1 !important;
          }

          .print-footer {
            margin-top: auto !important;
          }

          /* ── Prevent page breaks inside key sections ── */
          .pr-metadata-section,
          .pr-items-section,
          .pr-purpose-section,
          .pr-signature-section {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          /* ── Compact spacing for print ── */
          #${printAreaId} .my-4,
          #${printAreaId} .mt-6,
          #${printAreaId} .mb-6 {
            margin-top: 6px !important;
            margin-bottom: 6px !important;
          }

          #${printAreaId} .my-2\.5 {
            margin-top: 5px !important;
            margin-bottom: 5px !important;
          }

          #${printAreaId} .space-y-6 > * + * {
            margin-top: 6px !important;
          }

          #${printAreaId} .p-3,
          #${printAreaId} .p-3\.5,
          #${printAreaId} .p-4 {
            padding: 5px 8px !important;
          }

          #${printAreaId} .p-8 {
            padding: 8px !important;
          }

          #${printAreaId} .pt-6 {
            padding-top: 10px !important;
          }

          #${printAreaId} .pb-4 {
            padding-bottom: 6px !important;
          }

          #${printAreaId} .mb-3 {
            margin-bottom: 6px !important;
          }

          #${printAreaId} .mt-3 {
            margin-top: 6px !important;
          }

          /* ── Form element padding reduction ── */
          #${printAreaId} textarea,
          #${printAreaId} input,
          #${printAreaId} select {
            padding-top: 1px !important;
            padding-bottom: 1px !important;
          }

          /* ── Hide non-print elements ── */
          .no-print,
          .print\:hidden {
            display: none !important;
          }
        }

        /* ── Screen: show header/footer normally ── */
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
