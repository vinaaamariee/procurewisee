import React from 'react';

interface DocumentFooterProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function DocumentFooter({ className, style }: DocumentFooterProps) {
  return (
    <div 
      className={className}
      style={{
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        marginTop: '2rem',
        ...style
      }}
    >
      <img
        src="/bsc-footer.png"
        alt="Batanes State College Footer"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
        }}
      />
    </div>
  );
}
