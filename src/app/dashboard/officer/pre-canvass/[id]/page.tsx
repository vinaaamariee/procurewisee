import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PreCanvassDetailClient from "./PreCanvassDetailClient";

export const metadata = { title: "Pre-Canvass Details — ProcureWise" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PreCanvassDetailPage({ params }: PageProps) {
  const { profile } = await requireRole("Procurement Officer");
  const { id: rawId } = await params;

  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return notFound();
  }

  const preCanvass = await prisma.preCanvass.findUnique({
    where: { id },
    include: {
      purchaseRequest: {
        include: {
          items: {
            include: {
              unit: true,
              product: true,
            },
          },
          ppmp: true,
          requestedBy: true,
        },
      },
      suppliers: {
        include: {
          supplier: true,
          selectedBy: true,
          response: {
            include: {
              items: true,
            },
          },
        },
      },
      abstract: true,
      createdBy: true,
    },
  });

  if (!preCanvass) {
    return notFound();
  }

  const serialized = {
    id: preCanvass.id,
    preCanvassNumber: preCanvass.preCanvassNumber,
    status: preCanvass.status,
    createdAt: preCanvass.createdAt.toISOString(),
    sentAt: preCanvass.sentAt?.toISOString() || null,
    closedAt: preCanvass.closedAt?.toISOString() || null,
    remarks: preCanvass.remarks,
    purchaseRequest: {
      id: preCanvass.purchaseRequest.id,
      prNumber: preCanvass.purchaseRequest.prNumber,
      department: preCanvass.purchaseRequest.department,
      office: preCanvass.purchaseRequest.office,
      purpose: preCanvass.purchaseRequest.purpose,
      totalCost: Number(preCanvass.purchaseRequest.totalCost),
      status: preCanvass.purchaseRequest.status,
      requestedBy: preCanvass.purchaseRequest.requestedBy?.fullName || null,
      items: preCanvass.purchaseRequest.items.map((item) => ({
        id: item.id,
        itemNo: item.itemNo,
        description: item.description,
        specification: item.specification,
        quantity: item.quantity,
        unit: item.unit?.abbreviation || item.unitText || "unit",
        estimatedUnitCost: Number(item.estimatedUnitCost),
        estimatedCost: Number(item.estimatedCost),
        productId: item.productId,
      })),
    },
    suppliers: preCanvass.suppliers.map((s) => ({
      id: s.id,
      supplierId: s.supplierId,
      companyName: s.supplier.companyName,
      contactPerson: s.supplier.contactPerson,
      contactNumber: s.supplier.contactNumber,
      responseStatus: s.responseStatus,
      invitedAt: s.invitedAt?.toISOString() || null,
      respondedAt: s.respondedAt?.toISOString() || null,
      selectedBy: s.selectedBy?.fullName || null,
      response: s.response
        ? {
            id: s.response.id,
            quotationNumber: s.response.quotationNumber,
            quotationDate: s.response.quotationDate?.toISOString() || null,
            remarks: s.response.remarks,
            submittedAt: s.response.submittedAt?.toISOString() || null,
            items: s.response.items.map((item) => ({
              id: item.id,
              prItemId: item.prItemId,
              unitPrice: Number(item.unitPrice),
              quantityQuoted: item.quantityQuoted,
              quantityAvailable: item.quantityAvailable,
              isAvailable: item.isAvailable,
              deliveryDays: item.deliveryDays,
              remarks: item.remarks,
            })),
          }
        : null,
    })),
    abstract: preCanvass.abstract
      ? {
          id: preCanvass.abstract.id,
          status: preCanvass.abstract.status,
          generatedAt: preCanvass.abstract.generatedAt.toISOString(),
          remarks: preCanvass.abstract.remarks,
        }
      : null,
    createdBy: preCanvass.createdBy?.fullName || "Unknown",
    userProfileId: profile.id,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <PreCanvassDetailClient preCanvass={serialized} />
    </div>
  );
}
