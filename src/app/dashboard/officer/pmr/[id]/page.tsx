import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import PmrDetailClient from "./PmrDetailClient";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata = {
  title: "PMR Record Detail — ProcureWise",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PmrDetailPage({ params }: PageProps) {
  await requireRole("Procurement Officer");
  const { id: rawId } = await params;

  const id = parseInt(rawId, 10);
  if (isNaN(id)) return notFound();

  const pmr = await prisma.procurementMonitoringRecord.findUnique({
    where: { id },
    include: {
      pr: {
        include: {
          items: { include: { unit: true } },
          requestedBy: true,
        },
      },
      verifiedBy: true,
    },
  });

  if (!pmr) return notFound();

  const serialized = {
    id: pmr.id,
    pmrNumber: pmr.pmrNumber,
    prId: pmr.prId,
    office: pmr.office,
    department: pmr.department,
    fundSource: pmr.fundSource,
    purpose: pmr.purpose,
    totalCost: Number(pmr.totalCost),
    dateReceived: pmr.dateReceived.toISOString(),
    verificationDate: pmr.verificationDate ? pmr.verificationDate.toISOString() : null,
    verifiedBy: pmr.verifiedBy?.fullName ?? null,
    stage: pmr.stage,
    status: pmr.status,
    remarks: pmr.remarks,
    createdAt: pmr.createdAt.toISOString(),
    updatedAt: pmr.updatedAt.toISOString(),
    pr: pmr.pr
      ? {
          prNumber: pmr.pr.prNumber,
          department: pmr.pr.department,
          office: pmr.pr.office,
          purpose: pmr.pr.purpose,
          fundingSource: pmr.pr.fundingSource,
          requestDate: pmr.pr.requestDate.toISOString(),
          requesterName: pmr.pr.requestedBy?.fullName || pmr.pr.requesterName || "BSC Requisitioner",
          items: pmr.pr.items.map((i) => ({
            id: i.id,
            description: i.description,
            specification: i.specification,
            quantity: i.quantity,
            unit: i.unit?.abbreviation || i.unitText || "unit",
            estimatedUnitCost: Number(i.estimatedUnitCost),
            estimatedCost: Number(i.estimatedCost),
          })),
        }
      : null,
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title={`Procurement Monitoring Record — ${serialized.pmrNumber}`}
        subtitle="Update the procurement stage and status of this monitoring record, or export it as an official document."
      />

      <PmrDetailClient pmr={serialized} />
    </div>
  );
}
