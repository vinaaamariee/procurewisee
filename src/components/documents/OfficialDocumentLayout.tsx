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
    <div className="print-document w-full bg-white text-black">
      {/* Universal Print & Screen Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* ============================================================
           PURCHASE REQUEST — OFFICIAL A4 PRINT STYLESHEET
           A4 Portrait | Margin: 10mm
           Single natural-flow document: header → content → footer.
           No artificial page heights and no forced footer anchoring.
        ============================================================ */
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
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

          /* Suppress site header/footer — the BSC branding comes from the document itself */
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

          /* ── The actual printable page shell (natural flow, no fixed height) ── */
          #${printAreaId} {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #fff !important;
            color: #000 !important;
          }

          /* ── Single document wrapper ── */
          .print-document {
            width: 100% !important;
            box-sizing: border-box !important;
            background: #fff !important;
          }

          /* ── Official branding images — full printable width ── */
          .print-header img,
          .print-footer img,
          .official-print-header img,
          .official-print-footer img {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            object-fit: contain !important;
          }

          /* ── Content flows naturally; footer renders right after the signatures ── */
          .document-content {
            width: 100% !important;
          }

          .print-footer,
          .official-print-footer {
            margin-top: 24px !important;
          }

          /* ── Prevent page breaks inside key sections and the footer image ── */
          .pr-metadata-section,
          .pr-items-section,
          .pr-purpose-section,
          .pr-signature-section,
          .official-print-header,
          .official-print-footer {
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
        }
      ` }} />

      {/* Official header — top of the document */}
      <div className="official-print-header print-header w-full">
        <Image
          src="/images/bsc-header.png"
          alt="Official Batanes State College Header"
          width={1024}
          height={159}
          priority
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Document body — flows naturally between header and footer */}
      <div className="document-content w-full text-black">
        {children}
      </div>

      {/* Official footer — normal document flow, directly after the content */}
      <div className="official-print-footer print-footer w-full">
        <Image
          src="/images/bsc-footer.png"
          alt="Official Batanes State College Footer"
          width={1024}
          height={118}
          priority
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  );
}
