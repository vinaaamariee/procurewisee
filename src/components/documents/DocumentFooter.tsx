import React from 'react';

export default function DocumentFooter() {
  return (
    <div className="w-full border-t border-slate-300 pt-2 mt-6 hidden print:block print:fixed print:bottom-0 print:left-0 print:right-0">
      <img 
        src="/bsc-footer.png" 
        alt="Batanes State College Footer" 
        className="w-full h-auto object-contain max-h-[90px]"
        style={{ display: 'block', margin: '0 auto', width: '100%' }}
      />
    </div>
  );
}
