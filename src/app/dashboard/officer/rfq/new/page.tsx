import { requireRole } from '@/lib/auth/get-user-profile';
import { prisma } from '@/lib/prisma';
import RFQDocument from '@/components/rfq/RFQDocument';
import Link from 'next/link';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';
import TableContainer from '@/components/ui/TableContainer';
import { FileText, ClipboardCopy } from 'lucide-react';

export const metadata = { title: 'Create RFQ — ProcureWise' };

interface PageProps {
  searchParams: Promise<{ prId?: string }>;
}

export default async function NewRfqPage({ searchParams }: PageProps) {
  // Enforce Procurement Officer role
  await requireRole('Procurement Officer');

  const { prId } = await searchParams;

  // Mode 1: Display Approved Purchase Request Selector
  if (!prId) {
    let approvedPrs: any[] = [];
    let fetchError: string | null = null;

    try {
      // Query only approved PRs (exclude draft, submitted, pending, converted, cancelled, etc.)
      const rawApprovedPrs = await prisma.purchaseRequest.findMany({
        where: {
          status: 'Approved',
        },
        orderBy: {
          approvedAt: 'desc',
        },
      });

      approvedPrs = rawApprovedPrs.map((pr) => ({
        id: pr.id,
        prNumber: pr.prNumber,
        department: pr.department,
        office: pr.office,
        purpose: pr.purpose,
        estimatedBudget: Number(pr.estimatedBudget),
        totalCost: Number(pr.totalCost),
        approvedAt: pr.approvedAt ? new Date(pr.approvedAt).toLocaleDateString('en-PH', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) : 'N/A',
      }));
    } catch (error: any) {
      console.error('[DATABASE FETCH ERROR] Failed to load approved PRs:', error);
      fetchError = error.message || String(error);
    }

    if (fetchError) {
      return (
        <div className="max-w-3xl mx-auto space-y-6 mt-16 p-4">
          <Card className="p-8 border-red-500/20 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <span className="text-2xl">⚠️</span>
              <h2 className="text-xl font-bold">Database Connection Error</h2>
            </div>
            <p className="text-sm text-[var(--text-primary)] mt-4">
              Unable to load Approved Purchase Requests from the database. Please try again.
            </p>
            <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap break-all mt-4 p-4 border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 rounded-xl">
              {fetchError}
            </pre>
          </Card>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
        <SectionHeader
          title="Select Approved Purchase Request"
          subtitle="Generate a Request for Quotation (RFQ) directly from an approved Purchase Request to ensure complete institutional compliance."
        />

        <TableContainer>
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <FileText className="h-5 w-5 text-[var(--accent)]" />
              Eligible Purchase Requests
            </h2>
            <span className="rounded-full bg-[var(--bg-dark)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
              {approvedPrs.length} Approved PRs
            </span>
          </div>

          <div className="overflow-x-auto">
            {approvedPrs.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <ClipboardCopy className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">No Approved Purchase Requests</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm">
                    There are no approved purchase requests waiting for RFQ conversion. Once a Purchase Request is approved by administrative reviewers, it will be listed here.
                  </p>
                </div>
                <Link
                  href="/dashboard/officer/rfq"
                  className="rounded-xl border border-[var(--border)] px-5 py-2 text-xs font-semibold hover:bg-[var(--surface-hover)] bg-[var(--surface)] text-[var(--text-primary)] transition active:scale-[0.98]"
                >
                  Return to RFQs
                </Link>
              </div>
            ) : (
              <table className="w-full min-w-[800px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg-dark)]">
                    {['PR Number', 'Office / Department', 'Purpose', 'ABC (₱)', 'Date Approved', 'Action'].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {approvedPrs.map((pr) => (
                    <tr
                      key={pr.id}
                      className="border-b border-[var(--border)] transition hover:bg-[var(--surface-hover)]"
                    >
                      <td className="px-5 py-4 font-bold text-[var(--accent)] whitespace-nowrap">
                        {pr.prNumber}
                      </td>
                      <td className="px-5 py-4 text-[var(--text-primary)] font-medium">
                        {pr.office || pr.department}
                      </td>
                      <td className="px-5 py-4 text-[var(--text-secondary)] max-w-xs truncate">
                        {pr.purpose}
                      </td>
                      <td className="px-5 py-4 font-semibold text-[var(--text-primary)] whitespace-nowrap">
                        ₱{pr.estimatedBudget.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4 text-[var(--text-secondary)] whitespace-nowrap">
                        {pr.approvedAt}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <Link
                          href={`/dashboard/officer/rfq/new?prId=${pr.id}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white transition hover:opacity-90 active:scale-[0.97]"
                        >
                          Generate RFQ
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TableContainer>
      </div>
    );
  }

  // Mode 2: Pre-populate and edit RFQ
  let appItems: any[] = [];
  let catalogProducts: any[] = [];
  let nextRfqNumber = '';
  let initialData: any = null;
  let fetchError: string | null = null;

  try {
    const prIdNum = parseInt(prId, 10);
    if (isNaN(prIdNum)) {
      throw new Error('Invalid Purchase Request reference ID.');
    }

    const pr = await prisma.purchaseRequest.findUnique({
      where: { id: prIdNum },
      include: {
        items: {
          include: {
            unit: true,
            product: true,
          },
        },
      },
    });

    if (!pr) {
      throw new Error('Purchase Request not found.');
    }

    if (pr.status !== 'Approved') {
      throw new Error(`Purchase Request ${pr.prNumber} is currently "${pr.status}" and cannot be converted to an RFQ. Only Approved PRs are eligible.`);
    }

    // Populate initialData from selected PR
    initialData = {
      title: `Procurement of goods/services for: ${pr.purpose}`,
      approvedBudgetContract: Number(pr.estimatedBudget || pr.totalCost || 0),
      items: pr.items.map((item, index) => ({
        id: `pr-item-${item.id}-${index}`,
        itemNumber: String(index + 1).padStart(3, '0'),
        particulars: item.description + (item.specification ? ` (${item.specification})` : ''),
        quantity: item.quantity,
        unit: item.unit?.abbreviation || item.unitText || 'pcs',
        unitCost: Number(item.estimatedUnitCost || item.unitCost || 0),
        totalCost: Number(item.estimatedCost || 0),
        productId: item.productId || null,
        appItemId: null,
      })),
    };

    // Fetch APP items
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
      estimatedUnitCost: 0,
    }));

    // Fetch total RFQ count for sequencing
    const rfqCount = await prisma.requestForQuote.count();
    const currentYear = new Date().getFullYear();
    nextRfqNumber = `${currentYear}-${String(rfqCount + 1).padStart(3, '0')}`;
  } catch (error: any) {
    console.error('[DATABASE FETCH ERROR] Failed to load data for selected PR:', error);
    fetchError = error.message || String(error);
  }

  if (fetchError) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 mt-16 p-4">
        <Card className="p-8 border-red-500/20 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <span className="text-2xl">⚠️</span>
            <h2 className="text-xl font-bold">Error Pre-populating RFQ</h2>
          </div>
          <p className="text-sm text-[var(--text-primary)] mt-4">
            {fetchError}
          </p>
          <div className="flex gap-3 mt-6">
            <Link
              href="/dashboard/officer/rfq/new"
              className="rounded-xl bg-[#7B1E1E] px-5 py-2 text-sm font-bold text-white hover:opacity-90 active:scale-[0.97] transition"
            >
              Back to PR Selector
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
          href="/dashboard/officer/rfq/new"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-hover)] active:scale-[0.98]"
        >
          ← Back to PR Selector
        </Link>
        <SectionHeader
          title="Digital Request for Quotation (RFQ)"
          subtitle="Official Batanes State College RFQ document editor. Complete the form fields below to generate and publish solicitations."
        />
      </div>

      {/* Official Digital RFQ Document Editor */}
      <RFQDocument
        mode="create"
        initialData={initialData}
        appItems={appItems}
        catalogProducts={catalogProducts}
        nextRfqNumber={nextRfqNumber}
        prId={parseInt(prId, 10)}
      />
    </div>
  );
}