import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import ReportsClient from "./ReportsClient";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata = {
  title: "Operational Reports — Procurement Officer — ProcureWise",
};

export default async function ReportsPage() {
  await requireRole("Procurement Officer");

  const [pmrs, pos, rfqs] = await Promise.all([
    prisma.procurementMonitoringRecord.findMany({
      include: {
        pr: { select: { prNumber: true } },
        verifiedBy: { select: { fullName: true } },
      },
      orderBy: { dateReceived: "desc" },
    }),
    prisma.purchaseOrder.findMany({
      include: {
        supplier: { select: { companyName: true } },
        pr: { select: { prNumber: true, office: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.requestForQuote.findMany({
      select: {
        id: true,
        rfqNumber: true,
        title: true,
        status: true,
        approvedBudgetContract: true,
        deadlineDate: true,
        createdAt: true,
        pr: { select: { prNumber: true } },
        _count: { select: { quotes: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const serialized = {
    pmrs: pmrs.map((pmr: any) => ({
      id: pmr.id,
      pmrNumber: pmr.pmrNumber,
      prNumber: pmr.pr?.prNumber ?? null,
      office: pmr.office,
      fundSource: pmr.fundSource,
      totalCost: Number(pmr.totalCost),
      dateReceived: pmr.dateReceived.toISOString(),
      verificationDate: pmr.verificationDate ? pmr.verificationDate.toISOString() : null,
      verifiedBy: pmr.verifiedBy?.fullName ?? null,
      stage: pmr.stage,
      status: pmr.status,
    })),
    pos: pos.map((po: any) => ({
      id: po.id,
      poNumber: po.poNumber,
      supplierName: po.supplier.companyName,
      prNumber: po.pr?.prNumber ?? null,
      office: po.pr?.office ?? null,
      totalCost: Number(po.totalCost),
      status: po.status,
      createdAt: po.createdAt.toISOString(),
      dateOfDelivery: po.dateOfDelivery ? po.dateOfDelivery.toISOString() : null,
    })),
    rfqs: rfqs.map((rfq: any) => ({
      id: rfq.id,
      rfqNumber: rfq.rfqNumber,
      title: rfq.title,
      status: rfq.status,
      budget: Number(rfq.approvedBudgetContract),
      deadlineDate: rfq.deadlineDate ? rfq.deadlineDate.toISOString() : null,
      createdAt: rfq.createdAt.toISOString(),
      prNumber: rfq.pr?.prNumber ?? null,
      quoteCount: rfq._count.quotes,
    })),
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Operational Reports"
        subtitle="Live view of PMR, RFQ, BAC Transmittal, Letter of Notice, and Purchase Order records. Search and filter inline — export to CSV, Excel, or PDF as needed."
      />

      <ReportsClient data={serialized} />
    </div>
  );
}
