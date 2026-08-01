import { PrStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import PrAuditClient from "./PrAuditClient";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata = {
  title: "Purchase Request Approval and Validation Hub — ProcureWise",
};

export default async function PrAuditingPage() {
  await requireRole("Procurement Officer");

  const prs = await prisma.purchaseRequest.findMany({
    where: {
      status: {
        in: [
          (PrStatus as any).PendingProcurementReview || "Submitted",
          PrStatus.Submitted,
          PrStatus.UnderReview,
          (PrStatus as any).Returned || "ReturnedForRevision",
          PrStatus.ReturnedForRevision,
          PrStatus.Approved,
        ] as any[],
      },
    },
    select: {
      id: true,
      prNumber: true,
      department: true,
      office: true,
      requestDate: true,
      submittedAt: true,
      totalCost: true,
      status: true,
      purpose: true,
      requestedBy: {
        select: {
          fullName: true,
          email: true,
        },
      },
      requesterName: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const serializedPrs = prs.map((pr) => ({
    ...pr,
    totalCost: Number(pr.totalCost),
    requestDate: pr.requestDate.toISOString(),
    submittedAt: pr.submittedAt ? pr.submittedAt.toISOString() : pr.requestDate.toISOString(),
    requestorName: pr.requestedBy?.fullName || pr.requesterName || "End User",
  }));

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Purchase Request Approval and Validation Hub"
        subtitle="Validate department requisitions, perform 5-point compliance verification, and authorize eligible Purchase Requests for RFQ generation."
      />

      <PrAuditClient initialPrs={(serializedPrs as any)} />
    </div>
  );
}