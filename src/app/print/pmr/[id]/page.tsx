import { getAuthenticatedUser } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PmrPrintDocument from "@/components/pmr/PmrPrintDocument";
import AutoPrint from "@/components/pr/AutoPrint";

export const metadata = { title: "Print Procurement Monitoring Record — ProcureWise" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PrintPmrPage({ params }: PageProps) {
  const { profile } = await getAuthenticatedUser();
  const { id: rawId } = await params;

  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return notFound();
  }

  const pmr = await prisma.procurementMonitoringRecord.findUnique({
    where: { id },
    include: {
      pr: {
        include: {
          items: { include: { unit: true } },
        },
      },
      verifiedBy: true,
    },
  });

  if (!pmr) {
    return notFound();
  }

  const serialized = {
    pmrNumber: pmr.pmrNumber,
    prNumber: pmr.pr?.prNumber || `PR #${pmr.prId}`,
    office: pmr.office,
    department: pmr.department,
    fundSource: pmr.fundSource,
    purpose: pmr.purpose,
    totalCost: Number(pmr.totalCost),
    dateReceived: pmr.dateReceived.toISOString(),
    verificationDate: pmr.verificationDate ? pmr.verificationDate.toISOString() : null,
    verifiedBy: pmr.verifiedBy?.fullName || "Procurement Officer",
    stage: pmr.stage,
    status: pmr.status,
    remarks: pmr.remarks,
    items: (pmr.pr?.items || []).map((item: any) => ({
      description: item.description,
      specification: item.specification,
      quantity: item.quantity,
      unit: item.unit?.abbreviation || item.unitText || "pcs",
      estimatedUnitCost: Number(item.estimatedUnitCost),
      estimatedCost: Number(item.estimatedCost),
    })),
  };

  return (
    <>
      <PmrPrintDocument pmr={serialized} />
      <AutoPrint />
    </>
  );
}
