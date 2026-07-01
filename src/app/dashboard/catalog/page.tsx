import { getAuthenticatedUser } from '@/lib/auth/get-user-profile';
import { getCatalogProducts, getProductCategories } from '@/app/actions/catalog';
import CatalogBrowser from '@/components/catalog/CatalogBrowser';
import { ROLE_HOME } from '@/types/auth';

import { BackButton } from '@/components/back-button';

export const metadata = { title: 'Product Catalog — ProcureWise' };

export default async function ProductCatalogPage() {
  // Enforce session check
  const { profile } = await getAuthenticatedUser();
  const roleHome = ROLE_HOME[profile.role] || '/';

  // Load products and unique categories from DB
  const products = await getCatalogProducts();
  const categories = await getProductCategories();


  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Navigation Persistence - Back Button pinned to upper left */}
      <div className="flex justify-start">
        <BackButton href={roleHome} label="Back to Dashboard" />
      </div>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }} className="font-extrabold">
            Product Catalog
          </h1>
          <p style={{ marginTop: '0.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Browse standard goods, materials, and equipment specifications used for canvassing and RFQs.
          </p>
        </div>
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
