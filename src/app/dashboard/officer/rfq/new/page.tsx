import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import RfqCreationForm from '@/components/officer/RfqCreationForm';

export const metadata = { title: 'Create RFQ — ProcureWise' };

export default async function NewRfqPage() {
  // Enforce Procurement Officer role
  await requireRole('Procurement Officer');

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
  const appItems = rawAppItems.map((item) => ({
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

  const catalogProducts = rawCatalogProducts.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    description: p.description,
    unitOfMeasure: p.unitOfMeasure,
    estimatedUnitCost: Number(p.estimatedUnitCost),
  }));

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
        <RfqCreationForm appItems={appItems} catalogProducts={catalogProducts} />
      </div>
      
    </div>
  );
}