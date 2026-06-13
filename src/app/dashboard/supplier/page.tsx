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

// Rewritten status styles to use inline colors
const QUOTE_STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Accepted:     { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' },
  Rejected:     { bg: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', border: '1px solid rgba(225, 29, 72, 0.2)' },
  'Under Review': { bg: 'rgba(220, 179, 83, 0.1)', color: '#b88a1b', border: '1px solid rgba(220, 179, 83, 0.3)' },
  Submitted:    { bg: 'rgba(126, 25, 27, 0.1)', color: '#7e191b', border: '1px solid rgba(126, 25, 27, 0.2)' },
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

  // Brand Colors mapped from your Login Page design
  const theme = {
    crimson: '#7e191b',
    gold: '#dcb353',
    goldDark: '#b88a1b',
    dark: '#111827',
    textMain: '#1f2937',
    textMuted: '#6b7280',
    glassBg: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.9)',
    shadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
  };

  const statCards = [
    { label: 'Open RFQs',       value: openRfqs.length, icon: '📋', color: '#1f2937', desc: 'Available to bid on' },
    { label: 'My Quotes',       value: myQuotes.length, icon: '💰', color: theme.gold, desc: 'Submitted bids' },
    { label: 'Accepted',        value: myQuotes.filter((q: any) => q.status === 'Accepted').length, icon: '✅', color: '#059669', desc: 'Winning bids' },
    { label: 'Under Review',    value: myQuotes.filter((q: any) => q.status === 'Under Review').length, icon: '⏳', color: theme.crimson, desc: 'Pending decision' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', fontFamily: '"Inter", sans-serif' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: theme.textMain, margin: 0, letterSpacing: '-0.5px' }}>
            Supplier Portal
          </h1>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: theme.textMuted, margin: '0.5rem 0 0 0' }}>
            View open solicitations, submit quotations, and track your bid status.
          </p>
        </div>
        <Link
          href="/dashboard/catalog"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem',
            backgroundColor: 'rgba(255,255,255,0.8)', border: `1px solid ${theme.glassBorder}`,
            borderRadius: '999px', color: theme.textMain, textDecoration: 'none',
            fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            cursor: 'pointer'
          }}
        >
          <span>👁️</span> Product Catalog
        </Link>
      </div>

      {/* ── Stat Cards Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            background: theme.glassBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${theme.glassBorder}`, borderRadius: '1.25rem', padding: '1.5rem',
            boxShadow: theme.shadow, position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: card.color }} />
            <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{card.icon}</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.textMain, lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: theme.textMain, marginTop: '0.5rem' }}>{card.label}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: theme.textMuted, marginTop: '0.25rem' }}>{card.desc}</div>
          </div>
        ))}
      </div>

      {/* ── Open RFQs Grid ── */}
      <div style={{
        background: theme.glassBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${theme.glassBorder}`, borderRadius: '1.25rem', overflow: 'hidden', boxShadow: theme.shadow
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.4)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.textMain, margin: 0 }}>Open Solicitations</h2>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(220, 179, 83, 0.1)', color: theme.goldDark, padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
            {openRfqs.length} available
          </span>
        </div>
        
        <div>
          {openRfqs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: theme.textMuted, fontSize: '0.9rem' }}>
              No open solicitations at this time.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', padding: '1.5rem' }}>
              {openRfqs.map((rfq: any) => (
                <div key={rfq.id} style={{
                  background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '1rem',
                  padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                }}>
                  {/* Decorative Top Gradient Line */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${theme.crimson}, ${theme.gold})` }} />
                  
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.crimson, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      {rfq.rfqNumber}
                    </div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: theme.textMain, margin: 0, lineHeight: 1.4, minHeight: '40px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {rfq.title}
                    </h3>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1rem', marginTop: 'auto' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', fontWeight: 700 }}>Budget</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#059669' }}>
                        ₱{Number(rfq.approvedBudgetContract).toLocaleString('en-PH')}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.65rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', fontWeight: 700 }}>Deadline</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.crimson }}>
                        {rfq.deadlineDate ? new Date(rfq.deadlineDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) : '—'}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/supplier/rfq/${rfq.id}`}
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer',
                      background: `linear-gradient(90deg, ${theme.crimson} 0%, ${theme.goldDark} 100%)`,
                      color: 'white', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center',
                      textDecoration: 'none', display: 'block', marginTop: '0.5rem', boxShadow: `0 4px 12px rgba(184, 138, 27, 0.2)`
                    }}
                  >
                    📝 Submit Quotation
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── My Submitted Quotes ── */}
      {myQuotes.length > 0 && (
        <div style={{
          background: theme.glassBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${theme.glassBorder}`, borderRadius: '1.25rem', overflow: 'hidden', boxShadow: theme.shadow
        }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)', backgroundColor: 'rgba(255,255,255,0.4)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.textMain, margin: 0 }}>My Submitted Quotes</h2>
          </div>
          <div>
            {myQuotes.map((quote: any) => {
              const s = QUOTE_STATUS_STYLE[quote.status] ?? QUOTE_STATUS_STYLE['Submitted'];
              return (
                <div key={quote.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.04)', gap: '1rem', flexWrap: 'wrap' }}>
                  
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.crimson, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      {(quote.rfq as any)?.rfqNumber}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: theme.textMain, marginTop: '0.25rem' }}>
                      {(quote.rfq as any)?.title}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: theme.textMain }}>
                        ₱{Number(quote.totalQuotedAmount).toLocaleString('en-PH')}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: theme.textMuted, fontWeight: 600, marginTop: '0.1rem' }}>
                        {quote.offeredDeliveryDays} day delivery
                      </div>
                    </div>
                    <span style={{ 
                      display: 'inline-block', padding: '0.35rem 0.85rem', borderRadius: '999px', 
                      fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap',
                      backgroundColor: s.bg, color: s.color, border: s.border 
                    }}>
                      {quote.status}
                    </span>
                  </div>
                  
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}