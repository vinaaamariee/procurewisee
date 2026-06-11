import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import RfqCreationForm from '@/components/officer/RfqCreationForm';

export const metadata = { title: 'Create RFQ — ProcureWise' };

export default async function NewRfqPage() {
  // Enforce Procurement Officer role
  await requireRole('Procurement Officer');

  // Fetch Annual Procurement Plan (APP) items
  const appItems = await prisma.appItem.findMany({
    select: {
      id: true,
      papCode: true,
      projectTitle: true,
      generalDescription: true,
      estimatedBudget: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  // Convert Decimals to numbers for cleaner serialization/props handling
  const serializedAppItems = appItems.map(item => ({
    id: item.id,
    papCode: item.papCode,
    projectTitle: item.projectTitle,
    generalDescription: item.generalDescription,
    estimatedBudget: Number(item.estimatedBudget),
  }));

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ── Page Header ── */}
      <div>
        <a href="/dashboard/officer" style={{ color: '#818cf8', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
          ← Back to Dashboard
        </a>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.5rem', letterSpacing: '-0.3px' }}>
          Create New Request for Quotation (RFQ)
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
          Fill in the details to digitally generate and publish a solicitation for suppliers.
        </p>
      </div>

      {/* ── Creation Form ── */}
      <RfqCreationForm appItems={serializedAppItems} />
      
    </div>
  );
}
