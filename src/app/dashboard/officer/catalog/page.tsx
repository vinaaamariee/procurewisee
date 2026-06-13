import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import CatalogManager from '@/components/catalog/CatalogManager';

export const metadata = { title: 'Manage Product Catalog — ProcureWise' };

export default async function ManageCatalogPage() {
  // Enforce role guard
  await requireRole('Procurement Officer');

  // Load all products in the catalog
  const rawProducts = await prisma.catalogProduct.findMany({
    orderBy: { sku: 'asc' },
  });

  // Map database types safely to numbers
  const products = rawProducts.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    description: p.description,
    unitOfMeasure: p.unitOfMeasure,
    estimatedUnitCost: Number(p.estimatedUnitCost),
    isActive: p.isActive,
  }));

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

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', fontFamily: '"Inter", sans-serif' }}>
      
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: theme.textMain, margin: 0, letterSpacing: '-0.5px' }}>
            Manage Product Catalog
          </h1>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: theme.textMuted, margin: '0.5rem 0 0 0' }}>
            Add, update, or deactivate standard product definitions and benchmark prices for solicitations.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href="/dashboard/catalog"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem',
              backgroundColor: 'rgba(255,255,255,0.8)', border: `1px solid ${theme.glassBorder}`,
              borderRadius: '999px', color: theme.textMain, textDecoration: 'none',
              fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              cursor: 'pointer'
            }}
          >
            <span>👁️</span> View Public Catalog
          </a>
          <a
            href="/dashboard/officer"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem',
              backgroundColor: 'rgba(255,255,255,0.8)', border: `1px solid ${theme.glassBorder}`,
              borderRadius: '999px', color: theme.textMain, textDecoration: 'none',
              fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              cursor: 'pointer'
            }}
          >
            <span>←</span> Back to Dashboard
          </a>
        </div>
      </div>

      {/* ── Catalog Manager Component ── */}
      {/* Wrapped in the ProcureWise Glassmorphic Card Style */}
      <div style={{
        background: theme.glassBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${theme.glassBorder}`, borderRadius: '1.25rem', overflow: 'hidden', 
        boxShadow: theme.shadow, padding: '2rem'
      }}>
        <CatalogManager products={products} />
      </div>

    </div>
  );
}