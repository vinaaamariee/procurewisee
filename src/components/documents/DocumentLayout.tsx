import React from 'react';

interface DocumentLayoutProps {
  children: React.ReactNode;
  title?: string;
  documentRef?: string;
  printAreaId?: string; // Optional print area selector, defaults to 'printArea'
}

export default function DocumentLayout({ 
  children, 
  title, 
  documentRef,
  printAreaId = 'printArea'
}: DocumentLayoutProps) {
  return (
    <div className="relative w-full">
      {/* Universal Print Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide all screen components */
          body * {
            visibility: hidden;
            background: #fff !important;
            color: #000 !important;
          }
          
          /* Only make the printable area visible */
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
            background: #fff !important;
            color: #000 !important;
          }
          
          header.bsc-print-header {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 110px !important;
            display: block !important;
            visibility: visible !important;
            z-index: 9999 !important;
            border-bottom: 2px solid #7e191b !important;
          }
          
          footer.bsc-print-footer {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 90px !important;
            display: block !important;
            visibility: visible !important;
            z-index: 9999 !important;
            border-top: 1px solid #cbd5e1 !important;
          }
          
          .bsc-print-content {
            margin-top: 130px !important;
            margin-bottom: 110px !important;
            visibility: visible !important;
            display: block !important;
          }
          
          .no-print {
            display: none !important;
          }
        }
      ` }} />

      <div id={printAreaId} className="print-section-wrapper w-full">
        {/* Printable Fixed Header */}
        <header className="bsc-print-header hidden print:block w-full">
          <img 
            src="/bsc-header.png" 
            alt="Batanes State College Header" 
            className="w-full h-auto object-contain max-h-[105px]"
            style={{ display: 'block', margin: '0 auto', width: '100%' }}
          />
        </header>

        {/* Printable Content Container */}
        <div className="bsc-print-content w-full">
          {title && (
            <div className="text-center mb-6 hidden print:block">
              <h1 className="text-xl font-black uppercase tracking-wider text-[#7e191b]">{title}</h1>
              {documentRef && (
                <p className="text-xs font-mono font-bold mt-1 text-slate-700">
                  Ref No: {documentRef}
                </p>
              )}
            </div>
          )}
          {children}
        </div>

        {/* Printable Fixed Footer */}
        <footer className="bsc-print-footer hidden print:block w-full">
          <img 
            src="/bsc-footer.png" 
            alt="Batanes State College Footer" 
            className="w-full h-auto object-contain max-h-[85px]"
            style={{ display: 'block', margin: '0 auto', width: '100%' }}
          />
        </footer>
      </div>
    </div>
  );
}
