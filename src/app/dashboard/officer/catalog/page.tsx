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

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>
            Manage Product Catalog
          </h1>
          <p style={{ marginTop: '0.4rem', fontSize: '0.875rem', color: '#64748b' }}>
            Add, update, or deactivate standard product definitions and benchmark prices for solicitations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a
            href="/dashboard/catalog"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            👁️ View Public Catalog
          </a>
          <a
            href="/dashboard/officer"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>

      {/* Catalog Manager Component */}
      <CatalogManager products={products} />

    </div>
  );
}
