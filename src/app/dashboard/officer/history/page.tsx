import { PrStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import VerificationHistoryClient from "./VerificationHistoryClient";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata = {
  title: "Verification History — ProcureWise",
};

export default async function VerificationHistoryPage() {
  await requireRole("Procurement Officer");

  const prs = await prisma.purchaseRequest.findMany({
    where: {
      status: {
        in: [
          PrStatus.Approved,
          PrStatus.Received,
          PrStatus.ConvertedToRfq,
          (PrStatus as any).Returned || "ReturnedForRevision",
          PrStatus.ReturnedForRevision,
          PrStatus.Rejected,
        ] as any[],
      },
    },
    select: {
      id: true,
      prNumber: true,
      office: true,
      department: true,
      fundingSource: true,
      purpose: true,
      totalCost: true,
      status: true,
      reviewedAt: true,
      approvedAt: true,
      submittedAt: true,
      reviewedBy: {
        select: { fullName: true },
      },
      requesterName: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const serialized = prs.map((pr) => ({
    id: pr.id,
    prNumber: pr.prNumber,
    office: pr.office,
    department: pr.department,
    fundingSource: pr.fundingSource,
    purpose: pr.purpose,
    totalCost: Number(pr.totalCost),
    status: pr.status,
    decisionDate: (pr.approvedAt || pr.reviewedAt || pr.submittedAt)?.toISOString() ?? null,
    reviewedBy: pr.reviewedBy?.fullName ?? null,
  }));

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Verification History"
        subtitle="Complete record of every Purchase Request verification decision — verified, returned for compliance, and rejected — with date, office, and fund source filters."
      />

      <VerificationHistoryClient initialPrs={serialized} />
    </div>
  );
}
