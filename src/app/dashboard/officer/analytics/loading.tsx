import React from 'react';

export default function AnalyticsLoading() {
  const v = {
    surface: 'var(--surface)',
    border: 'var(--border)',
    shadow: '0 4px 24px rgba(30,58,138,0.07)',
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }} className="animate-pulse">
      {/* Page Header */}
      <div style={{ borderBottom: `1px solid ${v.border}`, paddingBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ height: '2rem', width: '30%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '6px' }} className="dark:bg-slate-700" />
        <div style={{ height: '1rem', width: '50%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} className="dark:bg-slate-800" />
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ background: v.surface, border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.5rem', boxShadow: v.shadow, height: '120px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ height: '0.8rem', width: '40%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px' }} className="dark:bg-slate-800" />
            <div style={{ height: '2rem', width: '60%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
            <div style={{ height: '0.7rem', width: '70%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} className="dark:bg-slate-800" />
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem' }}>
        {[1, 2].map(i => (
          <div key={i} style={{ background: v.surface, border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.5rem', boxShadow: v.shadow, height: '350px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ height: '1.2rem', width: '40%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
            <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="dark:bg-slate-800/40">
              <div style={{ height: '1rem', width: '20%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
