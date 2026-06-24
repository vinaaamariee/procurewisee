import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import RfqCreationForm from '@/components/officer/RfqCreationForm';

export const metadata = { title: 'Create RFQ — ProcureWise' };

export default async function NewRfqPage() {
  // Enforce Procurement Officer role
  await requireRole('Procurement Officer');
  let appItems: any[] = [];
  let catalogProducts: any[] = [];
  let nextRfqNumber = '';
  let fetchError: string | null = null;

  try {
    // Fetch Annual Procurement Plan (APP) items
    const rawAppItems = await prisma.appItem.findMany({
      select: {
        id: true,
        papCode: true,
        projectTitle: true,
        generalDescription: true,
        estimatedBudget: true,
      },
      orderBy: {
        projectTitle: 'asc',
      },
    });

    // Convert Decimals to numbers for cleaner serialization/props handling
    appItems = rawAppItems.map((item) => ({
      id: item.id,
      papCode: item.papCode,
      projectTitle: item.projectTitle,
      generalDescription: item.generalDescription,
      estimatedBudget: Number(item.estimatedBudget),
    }));

    // Fetch active catalog products
    const rawCatalogProducts = await prisma.catalogProduct.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    catalogProducts = rawCatalogProducts.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      description: p.description,
      unitOfMeasure: p.unitOfMeasure,
      estimatedUnitCost: Number(p.estimatedUnitCost),
    }));

    // Fetch total RFQ count for sequencing
    const rfqCount = await prisma.requestForQuote.count();
    const currentYear = new Date().getFullYear();
    nextRfqNumber = `${currentYear}-${String(rfqCount + 1).padStart(3, '0')}`;
  } catch (error: any) {
    console.error('[DATABASE FETCH ERROR] Failed to load data for New RFQ page:', error);
    fetchError = error.message || String(error);
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

  if (fetchError) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '2.5rem', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1.25rem', boxShadow: theme.shadow, fontFamily: '"Inter", sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#7e191b' }}>
            <span style={{ fontSize: '2rem' }}>⚠️</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Database Connection Error</h2>
          </div>
          
          <p style={{ color: theme.textMain, fontSize: '0.95rem', margin: 0, lineHeight: '1.6' }}>
            The application was unable to fetch necessary procurement data (APP Items or Product Catalog) from the database. 
            This usually indicates a database connection issue or that required database tables are missing/out of sync in the production environment.
          </p>

          <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
               System Error Message
            </div>
            <pre style={{ margin: 0, fontSize: '0.85rem', color: '#7e191b', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', lineHeight: '1.5' }}>
              {fetchError}
            </pre>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <a
              href="/dashboard/officer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem',
                backgroundColor: theme.crimson, border: 'none',
                borderRadius: '999px', color: '#fff', textDecoration: 'none',
                fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(126, 25, 27, 0.2)',
                cursor: 'pointer'
              }}
            >
              Back to Dashboard
            </a>
            <button
              onClick={() => { if (typeof window !== 'undefined') window.location.reload(); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem',
                backgroundColor: 'rgba(255,255,255,0.8)', border: `1px solid ${theme.glassBorder}`,
                borderRadius: '999px', color: theme.textMain, textDecoration: 'none',
                fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                cursor: 'pointer'
              }}
            >
              🔄 Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', fontFamily: '"Inter", sans-serif' }}>
      
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <a
            href="/dashboard/officer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.2rem',
              backgroundColor: 'rgba(255,255,255,0.8)', border: `1px solid ${theme.glassBorder}`,
              borderRadius: '999px', color: theme.textMain, textDecoration: 'none',
              fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              cursor: 'pointer'
            }}
          >
            <span>←</span> Back to Dashboard
          </a>
        </div>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: theme.textMain, margin: 0, letterSpacing: '-0.5px' }}>
            Create New Request for Quotation (RFQ)
          </h1>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: theme.textMuted, margin: '0.5rem 0 0 0' }}>
            Fill in the details to digitally generate and publish a solicitation for suppliers.
          </p>
        </div>
      </div>

      {/* ── Creation Form Container ── */}
      {/* Wrapped in the ProcureWise Glassmorphic Card Style */}
      <div style={{
        background: theme.glassBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${theme.glassBorder}`, borderRadius: '1.25rem', overflow: 'hidden', 
        boxShadow: theme.shadow, padding: '2.5rem'
      }}>
        <RfqCreationForm appItems={appItems} catalogProducts={catalogProducts} nextRfqNumber={nextRfqNumber} />
      </div>
      
    </div>
  );
}