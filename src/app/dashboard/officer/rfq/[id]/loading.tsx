import React from 'react';

export default function RfqEvaluationLoading() {
  const v = {
    surface: 'var(--surface)',
    border: 'var(--border)',
    shadow: '0 4px 24px rgba(30,58,138,0.07)',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }} className="animate-pulse">
      {/* Header and Back Link */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ height: '0.9rem', width: '10%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} className="dark:bg-slate-800" />
        <div style={{ height: '2.25rem', width: '45%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '6px', marginTop: '0.25rem' }} className="dark:bg-slate-700" />
      </div>

      {/* MCDM Weights and General Parameters Panel */}
      <div style={{ background: v.surface, border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.75rem', boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ height: '1.2rem', width: '25%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '0.75rem' }} className="dark:bg-slate-800/40">
              <div style={{ height: '0.75rem', width: '50%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} className="dark:bg-slate-800" />
              <div style={{ height: '1.25rem', width: '70%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Supplier Evaluation Matrix */}
      <div style={{ background: v.surface, border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.75rem', boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ height: '1.2rem', width: '30%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', border: `1px solid ${v.border}`, borderRadius: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '40%' }}>
                <div style={{ height: '1rem', width: '75%', backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: '4px' }} className="dark:bg-slate-700" />
                <div style={{ height: '0.75rem', width: '40%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} className="dark:bg-slate-800" />
              </div>
              <div style={{ height: '1.5rem', width: '15%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px' }} className="dark:bg-slate-800" />
              <div style={{ height: '1.5rem', width: '15%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px' }} className="dark:bg-slate-800" />
              <div style={{ height: '2rem', width: '10%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '6px' }} className="dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
