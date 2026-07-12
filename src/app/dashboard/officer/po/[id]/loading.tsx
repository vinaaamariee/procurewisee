import React from 'react';

export default function PoDetailLoading() {
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
        <div style={{ height: '2.25rem', width: '35%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '6px', marginTop: '0.25rem' }} className="dark:bg-slate-700" />
      </div>

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Side: General PO info, Delivery status, Items breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Card: PO details */}
          <div style={{ background: v.surface, border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.75rem', boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ height: '1.2rem', width: '30%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ height: '0.75rem', width: '45%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} className="dark:bg-slate-800" />
                  <div style={{ height: '0.9rem', width: '70%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px' }} className="dark:bg-slate-800" />
                </div>
              ))}
            </div>
          </div>

          {/* Card: Order Lines Table */}
          <div style={{ background: v.surface, border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.75rem', boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ height: '1.2rem', width: '25%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2].map(i => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: `1px solid ${v.border}` }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '60%' }}>
                    <div style={{ height: '0.9rem', width: '80%', backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: '4px' }} className="dark:bg-slate-800" />
                  </div>
                  <div style={{ height: '1rem', width: '10%', backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: '4px' }} className="dark:bg-slate-800" />
                  <div style={{ height: '1rem', width: '15%', backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: '4px' }} className="dark:bg-slate-800" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Vendor Info and Acknowledgements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Card: Supplier Card */}
          <div style={{ background: v.surface, border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.5rem', boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ height: '1.1rem', width: '60%', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} className="dark:bg-slate-700" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ height: '0.8rem', width: '80%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} className="dark:bg-slate-800" />
              <div style={{ height: '0.8rem', width: '90%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} className="dark:bg-slate-800" />
              <div style={{ height: '0.8rem', width: '50%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} className="dark:bg-slate-800" />
            </div>
          </div>

          {/* Card: Actions / Print PO */}
          <div style={{ background: v.surface, border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.5rem', boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ height: '2.5rem', width: '100%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '8px' }} className="dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
