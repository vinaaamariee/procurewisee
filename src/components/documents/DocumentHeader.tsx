import React from 'react';

export default function DocumentHeader() {
  return (
    <div className="w-full border-b-2 border-[#800000] pb-2 mb-4 hidden print:block">
      <img 
        src="/bsc-header.png" 
        alt="Batanes State College Header" 
        className="w-full h-auto object-contain max-h-[110px]"
        style={{ display: 'block', margin: '0 auto', width: '100%' }}
      />
    </div>
  );
}
