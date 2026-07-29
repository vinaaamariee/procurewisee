import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/get-user-profile';
import AcknowledgementReceiptDocument from '@/components/rfq/AcknowledgementReceiptDocument';
import { initRfqAcknowledgementsAction } from '@/app/actions/rfq-acknowledgement';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RfqAckReceiptPage({ params }: PageProps) {
  const { id } = await params;
  const rfqId = parseInt(id);
  if (isNaN(rfqId)) notFound();

  const { profile } = await requireRole('Procurement Officer');

  const rfq = await prisma.requestForQuote.findUnique({
    where: { id: rfqId },
    include: {
      acknowledgementLogs: {
        include: {
          supplier: {
            select: { id: true, companyName: true, contactPerson: true, contactNumber: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!rfq) notFound();

  // Auto-initialize acknowledgement rows from existing quotes if none exist yet
  if (rfq.acknowledgementLogs.length === 0) {
    await initRfqAcknowledgementsAction(rfqId);
    // Re-fetch after init
    const refreshed = await prisma.requestForQuote.findUnique({
      where: { id: rfqId },
      include: {
        acknowledgementLogs: {
          include: {
            supplier: { select: { id: true, companyName: true, contactPerson: true, contactNumber: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    rfq.acknowledgementLogs.length = 0;
    refreshed?.acknowledgementLogs.forEach(l => rfq.acknowledgementLogs.push(l as any));
  }

  // Load all available suppliers for the "add supplier" dropdown
  const allSuppliers = await prisma.supplier.findMany({
    select: { id: true, companyName: true, contactPerson: true, contactNumber: true },
    orderBy: { companyName: 'asc' },
  });

  const logs = rfq.acknowledgementLogs.map(l => ({
    id: l.id,
    rfqId: l.rfqId,
    supplierId: l.supplierId,
    receivedBy: l.receivedBy,
    dateReceived: l.dateReceived ? l.dateReceived.toISOString() : null,
    acknowledged: l.acknowledged,
    supplier: l.supplier,
  }));

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
        <span className="text-slate-800 font-semibold">Acknowledgement Receipt (Annex E)</span>
      </div>

      <AcknowledgementReceiptDocument
        rfqId={rfqId}
        rfqNumber={rfq.rfqNumber}
        rfqTitle={rfq.title}
        initialLogs={logs}
        allSuppliers={allSuppliers}
      />
    </div>
  );
}
