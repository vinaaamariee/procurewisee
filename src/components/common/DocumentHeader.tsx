import React from 'react';

interface DocumentHeaderProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function DocumentHeader({ className, style }: DocumentHeaderProps) {
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
        marginBottom: '1.5rem',
        ...style
      }}
    >
      <img
        src="/bsc-header.png"
        alt="Batanes State College Header"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
        }}
      />
    </div>
  );
}
