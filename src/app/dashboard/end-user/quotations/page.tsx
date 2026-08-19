import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import QuotationsClient from "./QuotationsClient";

export const metadata = { title: "Supplier Quotations — ProcureWise" };

export default async function QuotationsPage() {
  const { profile } = await requireRole("End User");

  const prs = await prisma.purchaseRequest.findMany({
    where: {
      requestedById: profile.id,
      status: { notIn: ["Draft", "Cancelled"] },
    },
    include: {
      preCanvass: {
        include: {
          suppliers: {
            include: {
              supplier: true,
              response: {
                include: { items: true },
              },
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
    status: pr.status,
    totalCost: Number(pr.totalCost),
    preCanvass: pr.preCanvass ? {
      id: pr.preCanvass.id,
      preCanvassNumber: pr.preCanvass.preCanvassNumber,
      status: pr.preCanvass.status,
      suppliers: pr.preCanvass.suppliers.map((pcs: any) => ({
        id: pcs.id,
        supplierId: pcs.supplierId,
        supplierName: pcs.supplier.companyName,
        responseStatus: pcs.responseStatus,
        hasResponse: !!pcs.response,
        responseDate: pcs.response?.submittedAt ? pcs.response.submittedAt.toISOString() : null,
        quotationNumber: pcs.response?.quotationNumber || null,
        totalAmount: pcs.response?.items ? pcs.response.items.reduce((sum: number, ri: any) => sum + (Number(ri.unitPrice) * (ri.quantityQuoted || 1)), 0) : 0,
      })),
      hasAbstract: !!pr.preCanvass.abstract,
    } : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-base-content">
          Supplier Quotations / AOQ
        </h1>
        <p className="text-sm text-base-content/60 mt-1">
          Track supplier quotation responses for your Purchase Requests. Three quotations are required before submission.
        </p>
      </div>
      <QuotationsClient prs={serializedPrs} />
    </div>
  );
}
