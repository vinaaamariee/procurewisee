import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import DeliveriesClient from "@/app/dashboard/officer/deliveries/DeliveriesClient";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata = {
  title: "Delivery Monitoring — Procurement Officer II — ProcureWise",
};

export default async function DeliveriesPage() {
  await requireRole("Administrative Approver");

  const [pos, receipts] = await Promise.all([
    prisma.purchaseOrder.findMany({
      include: {
        supplier: { select: { id: true, companyName: true } },
        pr: { select: { id: true, prNumber: true, office: true, department: true } },
        acknowledgementReceipts: {
          select: {
            id: true,
            receiptNumber: true,
            dateReceived: true,
            deliveryStatus: true,
            receivedBy: true,
            remarks: true,
          },
          orderBy: { dateReceived: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.acknowledgementReceipt.findMany({
      include: {
        po: { select: { poNumber: true } },
        supplier: { select: { companyName: true } },
      },
      orderBy: { dateReceived: "desc" },
      take: 200,
    }),
  ]);

  const serializedPos = pos.map((po) => ({
    id: po.id,
    poNumber: po.poNumber,
    supplierName: po.supplier.companyName,
    prNumber: po.pr?.prNumber ?? null,
    office: po.pr?.office ?? po.pr?.department ?? null,
    totalCost: Number(po.totalCost),
    status: po.status,
    dateOfDelivery: po.dateOfDelivery ? po.dateOfDelivery.toISOString() : null,
    createdAt: po.createdAt.toISOString(),
    receipts: po.acknowledgementReceipts.map((r) => ({
      id: r.id,
      receiptNumber: r.receiptNumber,
      dateReceived: r.dateReceived.toISOString(),
      deliveryStatus: r.deliveryStatus,
      receivedBy: r.receivedBy,
    })),
  }));

  const serializedReceipts = receipts.map((r) => ({
    id: r.id,
    receiptNumber: r.receiptNumber,
    poNumber: r.po?.poNumber ?? null,
    supplierName: r.supplier.companyName,
    dateReceived: r.dateReceived.toISOString(),
    deliveryStatus: r.deliveryStatus,
    receivedBy: r.receivedBy,
  }));

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Delivery Monitoring"
        subtitle="Monitor purchase order delivery status and acknowledgement receipts recorded against each supplier."
      />

      <DeliveriesClient initialPos={serializedPos} initialReceipts={serializedReceipts} />
    </div>
  );
}
