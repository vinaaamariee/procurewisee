import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import RFQDocument from '@/components/rfq/RFQDocument';
import Link from 'next/link';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';

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
      include: {
        category: true,
        unit: true,
      },
    });

    catalogProducts = rawCatalogProducts.map((p) => ({
      id: p.id,
      sku: p.productCode || '',
      name: p.name,
      category: p.category.name,
      description: p.description,
      unitOfMeasure: p.unit.abbreviation,
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

  if (fetchError) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 mt-16">
        <Card className="p-8 border-red-500/20 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <span className="text-2xl">⚠️</span>
            <h2 className="text-xl font-bold">Database Connection Error</h2>
          </div>

          <p className="text-sm text-[var(--text-primary)] mt-4">
            The system was unable to fetch required procurement data (APP Items or Product Catalog) from the database. 
            This usually indicates a database connectivity issue.
          </p>

          <div className="mt-4 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">
              System Error Message
            </div>
            <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap break-all">
              {fetchError}
            </pre>
          </div>

          <div className="flex gap-3 mt-6">
            <Link
              href="/dashboard/officer"
              className="rounded-xl bg-[#7B1E1E] px-5 py-2 text-sm font-bold text-white hover:opacity-90"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl border border-[var(--border)] px-5 py-2 text-sm font-semibold hover:bg-[var(--surface-hover)] bg-[var(--surface)] text-[var(--text-primary)]"
            >
              🔄 Retry Connection
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Page Header */}
      <div className="space-y-2 print:hidden">
        <Link
          href="/dashboard/officer/rfq"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-hover)]"
        >
          ← Back to RFQs
        </Link>
        <SectionHeader
          title="Digital Request for Quotation (RFQ)"
          subtitle="Official Batanes State College RFQ document editor. Complete the form fields below to generate and publish solicitations."
        />
      </div>

      {/* Official Digital RFQ Document Editor */}
      <RFQDocument
        mode="create"
        appItems={appItems}
        catalogProducts={catalogProducts}
        nextRfqNumber={nextRfqNumber}
      />
    </div>
  );
}