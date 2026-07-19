import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import PrAuditClient from "./PrAuditClient";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata = {
  title: "Purchase Request Auditing — ProcureWise",
};

export default async function PrAuditingPage() {
  await requireRole("Procurement Officer");

  const prs = await prisma.purchaseRequest.findMany({
    where: {
      status: {
        in: ["Submitted", "UnderReview", "Approved", "Received"],
      },
    },
    select: {
      id: true,
      prNumber: true,
      department: true,
      requestDate: true,
      totalCost: true,
      status: true,
      purpose: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Requisitions Auditing Hub"
        subtitle="Verify requisitions, validate product specifications and quantities, modify units of measure, and approve workflow transitions."
      />

      <PrAuditClient initialPrs={prs as any} />
    </div>
  );
}