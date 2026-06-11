import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import RfqCreationForm from '@/components/officer/RfqCreationForm';

export const metadata = { title: 'Create RFQ — ProcureWise' };

export default async function CreateRfqPage() {
  // Enforce role check
  await requireRole('Procurement Officer');

  // Fetch APP Items for selection in the form
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

  // Safely serialize Decimal fields to numbers
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

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header block */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
          Solicitation Management
        </h1>
        <p style={{ marginTop: '0.4rem', fontSize: '0.875rem', color: '#64748b' }}>
          Create and publish a Request for Price Quotation, linking to annual procurement item baselines.
        </p>
      </div>

      {/* RFQ Creation Form */}
      <RfqCreationForm appItems={appItems} catalogProducts={catalogProducts} />

    </div>
  );
}
