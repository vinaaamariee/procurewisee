import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import PackageReviewClient from "./PackageReviewClient";

export const metadata = { title: "Package Review — ProcureWise" };

export default async function PackageReviewPage() {
  const { profile } = await requireRole("End User");

  const prs = await prisma.purchaseRequest.findMany({
    where: {
      requestedById: profile.id,
      status: { notIn: ["Draft", "Cancelled"] },
    },
    include: {
      items: { include: { product: true, unit: true } },
      ppmp: true,
      assignedOfficer: { select: { fullName: true, role: true } },
      requestedBy: { select: { fullName: true } },
      statusHistory: { include: { changedBy: true }, orderBy: { createdAt: "desc" } },
      rfqs: { include: { items: true, quotes: { include: { supplier: true } } } },
      preCanvass: {
        include: {
          suppliers: {
            include: {
              supplier: true,
              response: { include: { items: true } },
            },
          },
          abstract: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const serializedPrs = prs.map((pr: any) => ({
    id: pr.id,
    prNumber: pr.prNumber,
    department: pr.department,
    office: pr.office,
    purpose: pr.purpose,
    fundingSource: pr.fundingSource,
    totalCost: Number(pr.totalCost),
    status: pr.status,
    submittedAt: pr.submittedAt ? pr.submittedAt.toISOString() : null,
    updatedAt: pr.updatedAt.toISOString(),
    ppmp: pr.ppmp ? {
      id: pr.ppmp.id,
      ppmpNumber: pr.ppmp.ppmpNumber,
      projectTitle: pr.ppmp.projectTitle,
      status: pr.ppmp.status,
      documentUrl: pr.ppmp.documentUrl || null,
      documentName: pr.ppmp.documentName || null,
      documentSize: pr.ppmp.documentSize || null,
      documentUploadedAt: pr.ppmp.documentUploadedAt ? pr.ppmp.documentUploadedAt.toISOString() : null,
    } : null,
    items: pr.items.map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit?.abbreviation || item.unitText || "unit",
      estimatedUnitCost: Number(item.estimatedUnitCost),
      estimatedCost: Number(item.estimatedCost),
    })),
    preCanvass: pr.preCanvass ? {
      id: pr.preCanvass.id,
      preCanvassNumber: pr.preCanvass.preCanvassNumber,
      status: pr.preCanvass.status,
      suppliers: pr.preCanvass.suppliers.map((pcs: any) => ({
        id: pcs.id,
        supplierName: pcs.supplier.companyName,
        responseStatus: pcs.responseStatus,
        hasResponse: !!pcs.response,
      })),
    } : null,
    assignedOfficer: pr.assignedOfficer ? { fullName: pr.assignedOfficer.fullName } : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-base-content">
          Procurement Package Review
        </h1>
        <p className="text-sm text-base-content/60 mt-1">
          Review your complete procurement package before submitting to the Procurement Office.
        </p>
      </div>
      <PackageReviewClient prs={serializedPrs} />
    </div>
  );
}
