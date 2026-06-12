import { requireRole } from '@/lib/auth/get-user-profile';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const metadata = { title: 'Supplier Portal — ProcureWise' };

async function getSupplierData(supplierId?: number) {
  const supabase = await createClient();

  const [openRfqs, allQuotes] = await Promise.all([
    supabase
      .from('requests_for_quote')
      .select('id:rfq_id, rfqNumber, title, approvedBudgetContract, deadlineDate, status')
      .eq('status', 'Published')
      .order('rfq_id', { ascending: false })
      .limit(6),
    supplierId
      ? supabase
          .from('supplier_quotes')
          .select('id:quote_id, status, totalQuotedAmount, offeredDeliveryDays, rfq:requests_for_quote(rfqNumber, title)')
          .eq('supplierId', supplierId)
          .limit(5)
      : Promise.resolve({ data: [] }),
  ]);

  return {
    openRfqs: openRfqs.data ?? [],
    myQuotes: allQuotes.data ?? [],
  };
}

const QUOTE_STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Accepted:     { bg: 'rgba(16,185,129,0.15)',  text: '#34d399' },
  Rejected:     { bg: 'rgba(239,68,68,0.15)',   text: '#f87171' },
  'Under Review': { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  Submitted:    { bg: 'rgba(56,189,248,0.15)',  text: '#38bdf8' },
};

export default async function SupplierDashboard() {
  const { profile } = await requireRole('Supplier');
  const supabase = await createClient();

  // Match the supplier by company name or contact person
  let { data: supplier } = await supabase
    .from('suppliers')
    .select('id:supplier_id')
    .or(`companyName.eq."${profile.fullName}",contactPerson.eq."${profile.fullName}"`)
    .maybeSingle();

  if (!supplier) {
    // Fallback to the first supplier in development/testing mode
    const { data: firstSupplier } = await supabase
      .from('suppliers')
      .select('id:supplier_id')
      .order('supplier_id', { ascending: true })
      .limit(1)
      .single();
    supplier = firstSupplier;
  }

  const { openRfqs, myQuotes } = await getSupplierData(supplier?.id);

  const statCards = [
    { label: 'Open RFQs',       value: openRfqs.length, icon: '📋', color: '#38bdf8', desc: 'Available to bid on' },
    { label: 'My Quotes',       value: myQuotes.length, icon: '💰', color: '#6366f1', desc: 'Submitted bids' },
    { label: 'Accepted',        value: myQuotes.filter((q: any) => q.status === 'Accepted').length, icon: '✅', color: '#34d399', desc: 'Winning bids' },
    { label: 'Under Review',    value: myQuotes.filter((q: any) => q.status === 'Under Review').length, icon: '⏳', color: '#fbbf24', desc: 'Pending decision' },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            Supplier Portal
          </h1>
          <p style={{ marginTop: '0.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            View open solicitations, submit quotations, and track your bid status.
          </p>
        </div>
        <Link
          href="/dashboard/catalog"
          style={{
            padding: '0.55rem 1.25rem',
            borderRadius: 8,
            background: 'var(--bg-dark)',
            border: '1px solid var(--border)',
            color: '#bae6fd',
            fontSize: '0.82rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
        >
          👁️ Product Catalog
        </Link>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            padding: '1.25rem', borderRadius: 16,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(12px)',
            boxShadow: 'var(--shadow-card)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: card.color, borderRadius: '16px 16px 0 0' }} />
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{card.desc}</div>
          </div>
        ))}
      </div>

      {/* Open RFQs */}
      <div style={{ borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Open Solicitations</h2>
          <span style={{ fontSize: '0.7rem', background: 'var(--secondary-dim)', color: 'var(--secondary)', padding: '0.25rem 0.65rem', borderRadius: 999, border: '1px solid var(--border-gold)', fontWeight: 700 }}>
            {openRfqs.length} available
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1px', background: 'var(--border)' }}>
          {openRfqs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', gridColumn: '1/-1', background: 'var(--surface)' }}>
              No open solicitations at this time.
            </div>
          ) : (
            openRfqs.map((rfq: any) => (
              <div key={rfq.id} style={{ padding: '1.25rem', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700, marginBottom: '0.25rem' }}>{rfq.rfqNumber}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{rfq.title}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Budget</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669' }}>
                      ₱{Number(rfq.approvedBudgetContract).toLocaleString('en-PH')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Deadline</div>
                    <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>
                      {rfq.deadlineDate ? new Date(rfq.deadlineDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) : '—'}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/dashboard/supplier/rfq/${rfq.id}`}
                  style={{
                    display: 'block', textDecoration: 'none', textAlign: 'center',
                    width: '100%', padding: '0.5rem', borderRadius: 8,
                    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                    color: '#818cf8', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Submit Quote
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* My Submitted Quotes */}
      {myQuotes.length > 0 && (
        <div style={{ borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Submitted Quotes</h2>
          </div>
          {myQuotes.map((quote: any) => {
            const s = QUOTE_STATUS_STYLE[quote.status] ?? QUOTE_STATUS_STYLE['Submitted'];
            return (
              <div key={quote.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700 }}>{(quote.rfq as any)?.rfqNumber}</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>{(quote.rfq as any)?.title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>₱{Number(quote.totalQuotedAmount).toLocaleString('en-PH')}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{quote.offeredDeliveryDays} day delivery</div>
                </div>
                <span style={{ padding: '0.25rem 0.65rem', borderRadius: 999, background: s.bg, color: s.text, fontSize: '0.7rem', fontWeight: 700, border: `1px solid ${s.text}33`, whiteSpace: 'nowrap' }}>
                  {quote.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
