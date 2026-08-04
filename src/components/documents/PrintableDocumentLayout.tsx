import React from "react";

interface PrintableDocumentLayoutProps {
  children: React.ReactNode;
  title: string;
  documentRef?: string;
  printAreaId?: string; // Optional print area selector, defaults to 'printable-area'
}

export default function PrintableDocumentLayout({
  children,
  title,
  documentRef,
  printAreaId = "printable-area",
}: PrintableDocumentLayoutProps) {
  return (
    <div className="relative w-full text-slate-950 bg-white">
      {/* Reusable Print Stylesheet */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: A4 portrait;
                margin: 20mm 15mm 20mm 15mm;
              }
              
              /* Hide screen-only elements */
              body * {
                visibility: hidden;
                background: #ffffff !important;
                color: #000000 !important;
                box-shadow: none !important;
              }
              
              /* Make print layout container visible */
              #${printAreaId}, #${printAreaId} * {
                visibility: visible !important;
              }
              
              #${printAreaId} {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
                display: block !important;
                background: #ffffff !important;
                color: #000000 !important;
                font-family: 'Source Serif 4', Georgia, serif !important;
                font-size: 11pt !important;
              }
              
              /* Printable Fixed Header and Footer */
              header.bsc-print-header {
                position: running(header) !important;
                display: block !important;
                visibility: visible !important;
                width: 100% !important;
                border-bottom: 2px solid #7b1e1e !important;
                margin-bottom: 20px !important;
              }
              
              footer.bsc-print-footer {
                position: running(footer) !important;
                display: block !important;
                visibility: visible !important;
                width: 100% !important;
                border-top: 1px solid #cbd5e1 !important;
                margin-top: 20px !important;
              }
              
              /* CSS Paged Media spec for headers and footers */
              @page {
                @top-center {
                  content: element(header);
                }
                @bottom-center {
                  content: element(footer);
                }
              }

              /* Fallback positioning for browsers that don't support page margins fully */
              header.bsc-print-header-fallback {
                display: block !important;
                visibility: visible !important;
                border-bottom: 2px solid #7b1e1e !important;
                margin-bottom: 6mm !important;
              }
              
              footer.bsc-print-footer-fallback {
                display: block !important;
                visibility: visible !important;
                border-top: 1px solid #cbd5e1 !important;
                margin-top: 8mm !important;
              }
              
              /* Standardize Table Styles for Print */
              table {
                width: 100% !important;
                border-collapse: collapse !important;
                page-break-inside: auto !important;
              }
              tr {
                page-break-inside: avoid !important;
                page-break-after: auto !important;
              }
              thead {
                display: table-header-group !important;
              }
              tfoot {
                display: table-footer-group !important;
              }
              th, td {
                border: 1px solid #000000 !important;
                padding: 6px 8px !important;
                font-size: 10pt !important;
              }
              
              .no-print {
                display: none !important;
                height: 0 !important;
                width: 0 !important;
                overflow: hidden !important;
              }
              
              .page-break {
                page-break-before: always !important;
              }
            }
          `,
        }}
      />

      <div id={printAreaId} className="w-full font-serif p-6 md:p-8 bg-white border border-base-300 rounded-sm">
        {/* Printable Fixed Header (Visible in print fallback and preview) */}
        <header className="bsc-print-header-fallback w-full pb-4">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
            <div className="flex items-center gap-4">
              <img
                src="/images/bsc-logo.png"
                alt="Batanes State College Logo"
                className="w-16 h-16 object-contain"
              />
              <div className="text-left font-serif">
                <p className="text-[10px] uppercase tracking-wider text-slate-700 font-semibold">
                  Republic of the Philippines
                </p>
                <p className="text-sm font-bold uppercase text-slate-950">
                  Batanes State College
                </p>
                <p className="text-[10px] text-slate-600">
                  Washington Ave., San Antonio, Basco, Batanes
                </p>
              </div>
            </div>
            {documentRef && (
              <div className="text-right text-[10px] font-mono font-bold text-slate-700">
                Ref No: {documentRef}
              </div>
            )}
          </div>
        </header>

        {/* Printable Content Header */}
        <div className="text-center my-4">
          <h1 className="text-base font-bold uppercase tracking-wider text-slate-950">
            {title}
          </h1>
        </div>

        {/* Content */}
        <div className="w-full text-slate-950">
          {children}
        </div>

        {/* Printable Fixed Footer */}
        <footer className="bsc-print-footer-fallback w-full pt-4 mt-6 text-center text-[9px] text-slate-500">
          <div className="border-t border-slate-300 pt-2 flex justify-between items-center">
            <span>ProcureWise Procurement Information System</span>
            <span>Batanes State College | Washington Ave., Basco, Batanes</span>
            <span>Page 1 of 1</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
