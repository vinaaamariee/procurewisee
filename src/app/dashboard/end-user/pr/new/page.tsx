import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import PRDocument from '@/components/pr/PRDocument';
import Link from 'next/link';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';

export const metadata = { title: 'Create Purchase Request — ProcureWise' };

export default async function NewPrPage() {
  // Enforce End User role
  await requireRole('End User');

  let catalogProducts: any[] = [];
  let fetchError: string | null = null;

  try {
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
  } catch (error: any) {
    console.error('[DATABASE FETCH ERROR] Failed to load catalog data for New PR page:', error);
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
            The system was unable to fetch catalog products for the Purchase Request page.
          </p>
          <div className="mt-4 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 p-4">
            <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap break-all">
              {fetchError}
            </pre>
          </div>
          <div className="flex gap-3 mt-6">
            <Link
              href="/dashboard/end-user/pr"
              className="rounded-xl bg-[#7B1E1E] px-5 py-2 text-sm font-bold text-white hover:opacity-90"
            >
              Back to PR Tracker
            </Link>
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
          href="/dashboard/end-user/pr"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-hover)]"
        >
          ← Back to PR Tracker
        </Link>
        <SectionHeader
          title="Digital Purchase Request (PR)"
          subtitle="Official Batanes State College Purchase Request document editor. Fill out the requisition form below."
        />
      </div>

      {/* Official Digital Purchase Request Document Form */}
      <PRDocument mode="create" catalogProducts={catalogProducts} />
    </div>
  );
}
