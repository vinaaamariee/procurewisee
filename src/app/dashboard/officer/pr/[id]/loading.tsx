import React from 'react';

export default function PrDetailLoading() {
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
        <div style={{ height: '2.25rem', width: '40%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '6px', marginTop: '0.25rem' }} className="dark:bg-slate-700" />
      </div>

      {/* Main Details and Side Panels Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: '2rem' }}>
        {/* Left Side: General PR Details and Items list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Card: PR Metadata Info */}
          <div style={{ background: v.surface, border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.75rem', boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ height: '1.2rem', width: '30%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ height: '0.75rem', width: '40%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} className="dark:bg-slate-800" />
                  <div style={{ height: '0.9rem', width: '75%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px' }} className="dark:bg-slate-800" />
                </div>
              ))}
            </div>
          </div>

          {/* Card: Items Table */}
          <div style={{ background: v.surface, border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.75rem', boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ height: '1.2rem', width: '25%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: `1px solid ${v.border}` }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '60%' }}>
                    <div style={{ height: '0.9rem', width: '80%', backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: '4px' }} className="dark:bg-slate-800" />
                    <div style={{ height: '0.7rem', width: '40%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} className="dark:bg-slate-800" />
                  </div>
                  <div style={{ height: '1rem', width: '10%', backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: '4px' }} className="dark:bg-slate-800" />
                  <div style={{ height: '1rem', width: '15%', backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: '4px' }} className="dark:bg-slate-800" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Budget and Officer Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Card: Budget Panel */}
          <div style={{ background: v.surface, border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.5rem', boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ height: '1.1rem', width: '50%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ height: '1.75rem', width: '70%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
              <div style={{ height: '0.5rem', width: '100%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} className="dark:bg-slate-800" />
              <div style={{ height: '0.75rem', width: '90%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} className="dark:bg-slate-800" />
            </div>
          </div>

          {/* Card: Decision/Approval actions */}
          <div style={{ background: v.surface, border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.5rem', boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ height: '2.5rem', width: '100%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '8px' }} className="dark:bg-slate-800" />
            <div style={{ height: '2.5rem', width: '100%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '8px' }} className="dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
