import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/get-user-profile';
import AOQDocument from '@/components/aoq/AOQDocument';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AOQPage({ params }: PageProps) {
  const { id } = await params;
  const rfqId = parseInt(id);
  if (isNaN(rfqId)) notFound();

  await requireRole('Procurement Officer');

  const rfq = await prisma.requestForQuote.findUnique({
    where: { id: rfqId },
    include: {
      items: {
        include: { unit: true },
        orderBy: { itemNumber: 'asc' },
      },
      quotes: {
        include: {
          supplier: { select: { id: true, companyName: true } },
          quoteDetails: {
            select: { id: true, rfqItemId: true, unitPrice: true, isAvailable: true },
          },
        },
        where: { status: { not: 'Rejected' } },
        orderBy: { totalQuotedAmount: 'asc' },
      },
      canvasAbstracts: {
        orderBy: { openingDate: 'desc' },
        take: 1,
      },
    },
  });

  if (!rfq) notFound();

  // Shape data for the AOQDocument component
  const rfqItems = rfq.items.map(item => ({
    id: item.id,
    itemNumber: item.itemNumber,
    particulars: item.particulars,
    quantity: item.quantity,
    unit: { abbreviation: item.unit.abbreviation, name: item.unit.name },
  }));

  const supplierQuotes = rfq.quotes.map(q => ({
    id: q.id,
    supplierId: q.supplierId,
    supplier: q.supplier,
    totalQuotedAmount: Number(q.totalQuotedAmount),
    quoteDetails: q.quoteDetails.map(d => ({
      id: d.id,
      rfqItemId: d.rfqItemId,
      unitPrice: Number(d.unitPrice),
      isAvailable: d.isAvailable,
    })),
  }));

  const openingDate = rfq.canvasAbstracts[0]?.openingDate
    ? new Date(rfq.canvasAbstracts[0].openingDate).toLocaleDateString('en-PH', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : undefined;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 print:hidden">
        <Link href="/dashboard/officer" className="hover:underline">Dashboard</Link>
        <span>/</span>
        <Link href={`/dashboard/officer/rfq/${rfqId}`} className="hover:underline">
          RFQ {rfq.rfqNumber}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Abstract of Quotation (Annex F)</span>
      </div>

      {rfq.quotes.length === 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold print:hidden">
          ⚠️ No supplier quotes yet. The comparison matrix will populate once bids are submitted.
          Publish the RFQ to receive bids.
        </div>
      )}

      <AOQDocument
        rfqId={rfqId}
        rfqNumber={rfq.rfqNumber}
        rfqTitle={rfq.title}
        rfqItems={rfqItems}
        supplierQuotes={supplierQuotes}
        openingDate={openingDate}
      />
    </div>
  );
}
