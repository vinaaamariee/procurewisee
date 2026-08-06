import { getAuthenticatedUser } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PRPrintDocument from "@/components/pr/PRPrintDocument";
import AutoPrint from "@/components/pr/AutoPrint";

export const metadata = { title: "Print Purchase Request — ProcureWise" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PrintPrPage({ params }: PageProps) {
  const { profile } = await getAuthenticatedUser();
  const { id: rawId } = await params;

  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return notFound();
  }

  const pr = await prisma.purchaseRequest.findUnique({
    where: { id },
    include: {
      items: { include: { product: true, unit: true } },
      requestedBy: true,
      assignedOfficer: true,
    },
  });

  if (!pr) {
    return notFound();
  }

  // Access control: End Users may only print their own Purchase Requests.
  if (profile.role === "End User" && pr.requestedById !== profile.id) {
    return notFound();
  }

  const serializedPr = {
    id: pr.id,
    prNumber: pr.prNumber,
    requestDate: pr.requestDate.toISOString(),
    department: pr.department,
    office: pr.office,
    purpose: pr.purpose,
    fundingSource: pr.fundingSource,
    totalCost: Number(pr.totalCost),
    requesterName: pr.requestedBy?.fullName || pr.requesterName || "BSC Requisitioner",
    officerName: pr.assignedOfficer?.fullName || "Procurement Officer",
    items: pr.items.map((item: any) => ({
      id: item.id,
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
      <PRPrintDocument pr={serializedPr} />
      <AutoPrint />
    </>
  );
}
