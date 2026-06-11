import { getAuthenticatedUser } from '@/lib/auth/get-user-profile';
import { getCatalogProducts, getProductCategories } from '@/app/actions/catalog';
import CatalogBrowser from '@/components/catalog/CatalogBrowser';
import { ROLE_HOME } from '@/types/auth';

export const metadata = { title: 'Product Catalog — ProcureWise' };

export default async function ProductCatalogPage() {
  // Enforce session check
  const { profile } = await getAuthenticatedUser();
  const roleHome = ROLE_HOME[profile.role] || '/';

  // Load products and unique categories from DB
  const rawProducts = await getCatalogProducts();
  const categories = await getProductCategories();

  // Map database types safely to numbers
  const products = rawProducts.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    description: p.description,
    unitOfMeasure: p.unitOfMeasure,
    estimatedUnitCost: Number(p.estimatedUnitCost),
  }));

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>
            Product Catalog
          </h1>
          <p style={{ marginTop: '0.4rem', fontSize: '0.875rem', color: '#64748b' }}>
            Browse standard goods, materials, and equipment specifications used for canvassing and RFQs.
          </p>
        </div>
        <a
          href={roleHome}
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

      {/* Catalog browser */}
      <CatalogBrowser
        products={products}
        categories={categories}
        role={profile.role}
        roleHome={roleHome}
      />

    </div>
  );
}
