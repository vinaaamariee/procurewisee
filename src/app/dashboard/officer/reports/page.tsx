import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import ReportsClient from "./ReportsClient";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata = {
  title: "Operational Reports — ProcureWise",
};

export default async function ReportsPage() {
  await requireRole("Procurement Officer");

  const [prs, pmrs, pos, receipts] = await Promise.all([
    prisma.purchaseRequest.findMany({
      select: {
        id: true,
        prNumber: true,
        office: true,
        department: true,
        fundingSource: true,
        purpose: true,
        totalCost: true,
        status: true,
        approvedAt: true,
        reviewedAt: true,
        submittedAt: true,
        createdAt: true,
        reviewedBy: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
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
    prisma.acknowledgementReceipt.findMany({
      include: {
        po: { select: { poNumber: true } },
        supplier: { select: { companyName: true } },
      },
      orderBy: { dateReceived: "desc" },
    }),
  ]);

  const serialized = {
    prs: prs.map((pr) => ({
      id: pr.id,
      prNumber: pr.prNumber,
      office: pr.office,
      department: pr.department,
      fundingSource: pr.fundingSource,
      purpose: pr.purpose,
      totalCost: Number(pr.totalCost),
      status: pr.status,
      decisionDate: (pr.approvedAt || pr.reviewedAt || pr.submittedAt || pr.createdAt)?.toISOString() ?? null,
      reviewedBy: pr.reviewedBy?.fullName ?? null,
    })),
    pmrs: pmrs.map((pmr) => ({
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
    pos: pos.map((po) => ({
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
    receipts: receipts.map((r) => ({
      id: r.id,
      receiptNumber: r.receiptNumber,
      poNumber: r.po?.poNumber ?? null,
      supplierName: r.supplier.companyName,
      dateReceived: r.dateReceived.toISOString(),
      deliveryStatus: r.deliveryStatus,
      receivedBy: r.receivedBy,
    })),
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Operational Reports"
        subtitle="Verification, PMR, delivery, returned, and pending reports. Export each report as PDF, Excel, or CSV."
      />

      <ReportsClient data={serialized} />
    </div>
  );
}
