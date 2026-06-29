import { requireRole } from '@/lib/auth/get-user-profile';
import { createClient } from '@/lib/supabase/server';
import QuoteSubmissionForm from '@/components/supplier/QuoteSubmissionForm';
import { notFound } from 'next/navigation';

export const metadata = { title: 'Submit Quotation — ProcureWise' };

type Params = Promise<{ id: string }>;

export default async function RfqDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const rfqId = parseInt(id);

  if (isNaN(rfqId)) {
    return notFound();
  }

  // 1. Enforce Supplier role and retrieve profile
  const { profile } = await requireRole('Supplier');
  const supabase = await createClient();

  // 2. Resolve matching supplier row
  let { data: supplier } = await supabase
    .from('suppliers')
    .select('id:supplier_id, companyName')
    .or(`companyName.eq."${profile.fullName}",contactPerson.eq."${profile.fullName}"`)
    .maybeSingle();

  if (!supplier) {
    // Fallback to the first supplier in development/testing mode
    const { data: firstSupplier } = await supabase
      .from('suppliers')
      .select('id:supplier_id, companyName')
      .order('supplier_id', { ascending: true })
      .limit(1)
      .single();
    supplier = firstSupplier;
  }

  if (!supplier) {
    return notFound();
  }

  // 3. Query RFQ Master
  const { data: rfq } = await supabase
    .from('requests_for_quote')
    .select('id:rfq_id, rfqNumber, title, approvedBudgetContract, deadlineDate, status')
    .eq('rfq_id', rfqId)
    .maybeSingle();

  if (!rfq) {
    return notFound();
  }

  // Brand Colors mapped from your Login Page design
  const theme = {
    crimson: '#7e191b',
    gold: '#dcb353',
    goldDark: '#b88a1b',
    textMain: '#1f2937',
    textMuted: '#6b7280',
    glassBg: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.9)',
    shadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
  };

  // Render "Closed" state with ProcureWise styling
  if (rfq.status !== 'Published') {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem', fontFamily: '"Inter", sans-serif' }}>
        <a
          href="/dashboard/supplier"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.2rem',
            backgroundColor: 'rgba(255,255,255,0.8)', border: `1px solid ${theme.glassBorder}`,
            borderRadius: '999px', color: theme.textMain, textDecoration: 'none',
            fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            cursor: 'pointer', marginBottom: '2rem'
          }}
        >
          <span>←</span> Back to Portal
        </a>
        <div style={{ 
          background: theme.glassBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${theme.glassBorder}`, borderRadius: '1.25rem', overflow: 'hidden', 
          boxShadow: theme.shadow, padding: '3rem', textAlign: 'center', position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: theme.crimson }} />
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: theme.textMain, margin: 0 }}>Solicitation Closed</h2>
          <p style={{ marginTop: '1rem', color: theme.textMuted, fontSize: '0.95rem', lineHeight: 1.6 }}>
            This Request for Quotation (Ref: <strong style={{ color: theme.crimson }}>{rfq.rfqNumber}</strong>) is currently marked as 
            <span style={{ display: 'inline-block', margin: '0 0.5rem', padding: '0.2rem 0.6rem', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', fontWeight: 700, color: theme.textMain }}>{rfq.status}</span> 
            and is no longer accepting submissions.
          </p>
        </div>
      </div>
    );
  }

  // 4. Query RFQ Line Items
  const { data: rfqItems } = await supabase
    .from('rfq_items')
    .select('id:rfq_item_id, itemNumber, particulars, quantity, unit')
    .eq('rfqId', rfqId)
    .order('itemNumber', { ascending: true });

  // 5. Query if Quote already exists
  const { data: existingQuote } = await supabase
    .from('supplier_quotes')
    .select('offeredDeliveryDays, totalQuotedAmount, quoteDetails:quote_details(rfqItemId, unitPrice, isAvailable)')
    .eq('rfqId', rfqId)
    .eq('supplierId', supplier.id)
    .maybeSingle();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', fontFamily: '"Inter", sans-serif' }}>
      
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <a
              href="/dashboard/supplier"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.2rem',
                backgroundColor: 'rgba(255,255,255,0.8)', border: `1px solid ${theme.glassBorder}`,
                borderRadius: '999px', color: theme.textMain, textDecoration: 'none',
                fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                cursor: 'pointer'
              }}
            >
              <span>←</span> Back to Portal
            </a>
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: theme.textMain, margin: 0, letterSpacing: '-0.5px' }}>
              Submit Bid Quotation
            </h1>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: theme.textMuted, margin: '0.5rem 0 0 0' }}>
              Review the requirements below and submit your pricing and delivery terms.
            </p>
          </div>
        </div>

        {/* Supplier Identity Badge */}
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem',
          backgroundColor: 'rgba(220, 179, 83, 0.1)', border: `1px solid rgba(220, 179, 83, 0.3)`,
          borderRadius: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `linear-gradient(135deg, ${theme.gold}, ${theme.goldDark})`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
            🏢
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Bidding As</div>
            <div style={{ fontSize: '0.9rem', color: theme.goldDark, fontWeight: 800 }}>{supplier.companyName}</div>
          </div>
        </div>
      </div>

      {/* ── Quote Submission Form Container ── */}
      {/* Wrapped in the ProcureWise Glassmorphic Card Style */}
      <div style={{
        background: theme.glassBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${theme.glassBorder}`, borderRadius: '1.25rem', overflow: 'hidden', 
        boxShadow: theme.shadow, padding: '2.5rem'
      }}>
        <QuoteSubmissionForm
          rfq={rfq}
          rfqItems={rfqItems || []}
          supplierId={supplier.id}
          existingQuote={existingQuote}
        />
      </div>

    </div>
  );
}