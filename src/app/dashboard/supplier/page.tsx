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
  const { data: supplier } = await supabase
    .from('suppliers')
    .select('id:supplier_id')
    .or(`companyName.eq."${profile.fullName}",contactPerson.eq."${profile.fullName}"`)
    .maybeSingle();

  const { openRfqs, myQuotes } = await getSupplierData(supplier?.id);

  const statCards = [
    { label: 'Open RFQs',       value: openRfqs.length, icon: '📋', color: '#38bdf8', desc: 'Available to bid on' },
    { label: 'My Quotes',       value: myQuotes.length, icon: '💰', color: '#6366f1', desc: 'Submitted bids' },
    { label: 'Accepted',        value: myQuotes.filter((q: any) => q.status === 'Accepted').length, icon: '✅', color: '#34d399', desc: 'Winning bids' },
    { label: 'Under Review',    value: myQuotes.filter((q: any) => q.status === 'Under Review').length, icon: '⏳', color: '#fbbf24', desc: 'Pending decision' },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
          Supplier Portal
        </h1>
        <p style={{ marginTop: '0.4rem', fontSize: '0.875rem', color: '#64748b' }}>
          View open solicitations, submit quotations, and track your bid status.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            padding: '1.25rem', borderRadius: 16,
            background: 'rgba(15,23,42,0.65)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: card.color, borderRadius: '16px 16px 0 0' }} />
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-1px', lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</div>
            <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.15rem' }}>{card.desc}</div>
          </div>
        ))}
      </div>

      {/* Open RFQs */}
      <div style={{ borderRadius: 16, background: 'rgba(15,23,42,0.65)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>Open Solicitations</h2>
          <span style={{ fontSize: '0.7rem', background: 'rgba(56,189,248,0.12)', color: '#38bdf8', padding: '0.25rem 0.65rem', borderRadius: 999, border: '1px solid rgba(56,189,248,0.25)', fontWeight: 700 }}>
            {openRfqs.length} available
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
          {openRfqs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#475569', fontSize: '0.875rem', gridColumn: '1/-1', background: 'rgba(15,23,42,0.65)' }}>
              No open solicitations at this time.
            </div>
          ) : (
            openRfqs.map((rfq: any) => (
              <div key={rfq.id} style={{ padding: '1.25rem', background: 'rgba(15,23,42,0.65)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700, marginBottom: '0.25rem' }}>{rfq.rfqNumber}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.4 }}>{rfq.title}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#475569' }}>Budget</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>
                      ₱{Number(rfq.approvedBudgetContract).toLocaleString('en-PH')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: '#475569' }}>Deadline</div>
                    <div style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>
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
        <div style={{ borderRadius: 16, background: 'rgba(15,23,42,0.65)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>My Submitted Quotes</h2>
          </div>
          {myQuotes.map((quote: any) => {
            const s = QUOTE_STATUS_STYLE[quote.status] ?? QUOTE_STATUS_STYLE['Submitted'];
            return (
              <div key={quote.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700 }}>{(quote.rfq as any)?.rfqNumber}</div>
                  <div style={{ fontSize: '0.84rem', color: '#f1f5f9', marginTop: '0.15rem' }}>{(quote.rfq as any)?.title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>₱{Number(quote.totalQuotedAmount).toLocaleString('en-PH')}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{quote.offeredDeliveryDays} day delivery</div>
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
