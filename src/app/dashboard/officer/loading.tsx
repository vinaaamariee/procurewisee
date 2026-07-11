import React from 'react';

export default function Loading() {
  const v = {
    surface: 'var(--surface)',
    border: 'var(--border)',
    shadow: '0 4px 24px rgba(30,58,138,0.07)',
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', fontFamily: '"Inter", sans-serif' }} className="animate-pulse">
      {/* Header Placeholder */}
      <div style={{ borderBottom: `1px solid ${v.border}`, paddingBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 5, height: 48, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.08)' }} className="dark:bg-slate-700" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '30%' }}>
          <div style={{ height: '1.5rem', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
          <div style={{ height: '0.8rem', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px', width: '60%' }} className="dark:bg-slate-800" />
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {[1, 2, 3].map((idx) => (
          <div key={idx} style={{
            background: v.surface,
            border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.5rem',
            boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '120px'
          }}>
            <div style={{ height: '0.8rem', width: '40%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} className="dark:bg-slate-800" />
            <div style={{ height: '1.8rem', width: '25%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
            <div style={{ height: '0.7rem', width: '70%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} className="dark:bg-slate-800" />
          </div>
        ))}
      </div>

      {/* Main List Placeholder */}
      <div style={{
        background: v.surface,
        border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '2rem',
        boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: '1.5rem'
      }}>
        <div style={{ height: '1.2rem', width: '20%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '40%' }}>
                <div style={{ height: '0.9rem', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px' }} className="dark:bg-slate-800" />
                <div style={{ height: '0.7rem', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px', width: '50%' }} className="dark:bg-slate-900" />
              </div>
              <div style={{ height: '1rem', width: '15%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px' }} className="dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
