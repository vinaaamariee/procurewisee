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
  const { data: supplier } = await supabase
    .from('suppliers')
    .select('id:supplier_id, companyName')
    .or(`companyName.eq."${profile.fullName}",contactPerson.eq."${profile.fullName}"`)
    .maybeSingle();

  if (!supplier) {
    return (
      <div style={{ maxWidth: 800, margin: '4rem auto', padding: '2rem', textAlign: 'center', background: 'rgba(15,23,42,0.6)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f87171' }}>Access Denied</h2>
        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>
          Your user profile ({profile.fullName}) is not linked to any registered Supplier in the database. 
          Please contact the BAC Secretariat to associate your account.
        </p>
      </div>
    );
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

  if (rfq.status !== 'Published') {
    return (
      <div style={{ maxWidth: 800, margin: '4rem auto', padding: '2rem', textAlign: 'center', background: 'rgba(15,23,42,0.6)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24' }}>Solicitation Closed</h2>
        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>
          This Request for Quotation (Ref: {rfq.rfqNumber}) is currently in status <strong>{rfq.status}</strong> and is not open for submission.
        </p>
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
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header with Back button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <a href="/dashboard/supplier" style={{ color: '#818cf8', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
            ← Back to Portal
          </a>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.5rem', letterSpacing: '-0.3px' }}>
            Submit Bid Quotation
          </h1>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'right' }}>
          Supplier: <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{supplier.companyName}</span>
        </div>
      </div>

      <QuoteSubmissionForm
        rfq={rfq}
        rfqItems={rfqItems || []}
        supplierId={supplier.id}
        existingQuote={existingQuote}
      />

    </div>
  );
}
