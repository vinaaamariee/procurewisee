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

const QUOTE_STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  Accepted:     { bg: 'bg-emerald-50 dark:bg-emerald-950/30',  text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-950/50' },
  Rejected:     { bg: 'bg-rose-50 dark:bg-rose-950/30',   text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-950/50' },
  'Under Review': { bg: 'bg-[#ca8a04]/10 dark:bg-[#ca8a04]/5', text: 'text-[#ca8a04] dark:text-[#f59e0b]', border: 'border-[#ca8a04]/30' },
  Submitted:    { bg: 'bg-[#7e191b]/10 dark:bg-[#7e191b]/5',  text: 'text-[#7e191b] dark:text-[#fb7185]', border: 'border-[#7e191b]/20' },
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
    { label: 'Open RFQs',       value: openRfqs.length, icon: '📋', color: 'var(--accent)', desc: 'Available to bid on' },
    { label: 'My Quotes',       value: myQuotes.length, icon: '💰', color: 'var(--secondary)', desc: 'Submitted bids' },
    { label: 'Accepted',        value: myQuotes.filter((q: any) => q.status === 'Accepted').length, icon: '✅', color: '#10b981', desc: 'Winning bids' },
    { label: 'Under Review',    value: myQuotes.filter((q: any) => q.status === 'Under Review').length, icon: '⏳', color: 'var(--secondary-light)', desc: 'Pending decision' },
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
          className="px-5 py-2.5 rounded-xl border border-[#ca8a04]/30 bg-[#ca8a04]/10 hover:bg-[#ca8a04] text-[#7e191b] dark:text-[#f59e0b] hover:text-white font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ca8a04]/20 cursor-pointer text-center"
          style={{ textDecoration: 'none' }}
        >
          👁️ Product Catalog
        </Link>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
        {statCards.map(card => (
          <div key={card.label} className="summary-card">
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: card.color, borderRadius: '16px 16px 0 0' }} />
            <div className="summary-card-icon" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <div className="summary-card-value">{card.value}</div>
            <div className="summary-card-label">{card.label}</div>
            <div className="summary-card-sublabel">{card.desc}</div>
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
        <div>
          {openRfqs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', background: 'var(--surface)' }}>
              No open solicitations at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {openRfqs.map((rfq: any) => (
                <div 
                  key={rfq.id} 
                  className="p-5 bg-white dark:bg-[#1e293b] border border-[#ca8a04]/20 hover:border-[#ca8a04]/50 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-[#ca8a04]/5 hover:-translate-y-1 cursor-default relative group overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7e191b] to-[#ca8a04] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div>
                    <div className="text-xs font-black text-[#7e191b] dark:text-[#f59e0b] tracking-wider uppercase mb-1.5">{rfq.rfqNumber}</div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-relaxed min-h-[40px]">{rfq.title}</h3>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-semibold">Budget</span>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        ₱{Number(rfq.approvedBudgetContract).toLocaleString('en-PH')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-semibold">Deadline</span>
                      <span className="text-xs font-bold text-red-600 dark:text-red-400">
                        {rfq.deadlineDate ? new Date(rfq.deadlineDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) : '—'}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/supplier/rfq/${rfq.id}`}
                    className="w-full py-2.5 rounded-xl border border-[#ca8a04]/30 bg-[#ca8a04]/10 hover:bg-[#ca8a04] text-[#7e191b] dark:text-[#f59e0b] hover:text-white font-bold text-xs text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#ca8a04]/10 cursor-pointer block"
                    style={{ textDecoration: 'none' }}
                  >
                    📝 Submit Quotation
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Submitted Quotes */}
      {myQuotes.length > 0 && (
        <div style={{ borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Submitted Quotes</h2>
          </div>
          <div>
            {myQuotes.map((quote: any) => {
              const s = QUOTE_STATUS_STYLE[quote.status] ?? QUOTE_STATUS_STYLE['Submitted'];
              return (
                <div key={quote.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <div style={{ flex: 1 }}>
                    <div className="text-xs font-black text-[#7e191b] dark:text-[#f59e0b] tracking-wider uppercase">{(quote.rfq as any)?.rfqNumber}</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{(quote.rfq as any)?.title}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-800 dark:text-slate-100">₱{Number(quote.totalQuotedAmount).toLocaleString('en-PH')}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{quote.offeredDeliveryDays} day delivery</div>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border} white-space-nowrap`}>
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
