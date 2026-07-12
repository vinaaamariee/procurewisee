import React from 'react';

export default function ForecastSkeleton() {
  const v = {
    surface: 'var(--surface)',
    border: 'var(--border)',
    shadow: '0 4px 24px rgba(30,58,138,0.07)',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }} className="animate-pulse">
      {/* Left Skeleton: Volatility Tracker */}
      <div style={{
        background: v.surface,
        border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.5rem',
        boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: '1rem', height: '220px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ height: '1.1rem', width: '60%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
          <div style={{ height: '0.75rem', width: '80%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} className="dark:bg-slate-800" />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ height: '0.8rem', width: '40%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px' }} className="dark:bg-slate-800" />
            <div style={{ height: '0.8rem', width: '15%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px' }} className="dark:bg-slate-800" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ height: '0.8rem', width: '50%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px' }} className="dark:bg-slate-800" />
            <div style={{ height: '0.8rem', width: '15%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px' }} className="dark:bg-slate-800" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ height: '0.8rem', width: '35%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px' }} className="dark:bg-slate-800" />
            <div style={{ height: '0.8rem', width: '15%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px' }} className="dark:bg-slate-800" />
          </div>
        </div>
      </div>

      {/* Right Skeleton: Potential Savings */}
      <div style={{
        background: v.surface,
        border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.5rem',
        boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: '1rem', height: '220px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ height: '1.1rem', width: '50%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
          <div style={{ height: '0.75rem', width: '70%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} className="dark:bg-slate-800" />
        </div>

        <div style={{ margin: '1rem 0' }}>
          <div style={{ height: '2.25rem', width: '60%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
        </div>

        <div style={{ height: '2.5rem', width: '100%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '8px' }} className="dark:bg-slate-800" />
      </div>
    </div>
  );
}
