import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import PreCanvassListClient from "./PreCanvassListClient";

export const metadata = { title: "Pre-Canvassing — ProcureWise" };

export default async function PreCanvassListPage() {
  const { profile } = await requireRole("Procurement Officer");

  const preCanvasses = await prisma.preCanvass.findMany({
    include: {
      purchaseRequest: {
        select: {
          prNumber: true,
          department: true,
          office: true,
          purpose: true,
          totalCost: true,
          status: true,
        },
      },
      suppliers: {
        include: {
          supplier: {
            select: {
              companyName: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          fullName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = preCanvasses.map((pc) => ({
    id: pc.id,
    preCanvassNumber: pc.preCanvassNumber,
    status: pc.status,
    createdAt: pc.createdAt.toISOString(),
    sentAt: pc.sentAt?.toISOString() || null,
    closedAt: pc.closedAt?.toISOString() || null,
    remarks: pc.remarks,
    purchaseRequest: {
      prNumber: pc.purchaseRequest.prNumber,
      department: pc.purchaseRequest.department,
      office: pc.purchaseRequest.office,
      purpose: pc.purchaseRequest.purpose,
      totalCost: Number(pc.purchaseRequest.totalCost),
      status: pc.purchaseRequest.status,
    },
    suppliers: pc.suppliers.map((s) => ({
      companyName: s.supplier.companyName,
      responseStatus: s.responseStatus,
    })),
    createdBy: pc.createdBy?.fullName || "Unknown",
    supplierCount: pc.suppliers.length,
    respondedCount: pc.suppliers.filter((s) => s.responseStatus === "Submitted").length,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <PreCanvassListClient preCanvasses={serialized} />
    </div>
  );
}
