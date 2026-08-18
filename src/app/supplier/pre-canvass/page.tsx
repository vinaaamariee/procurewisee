import { getAuthenticatedUser } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SupplierPreCanvassClient from "./SupplierPreCanvassClient";

export const metadata = { title: "Pre-Canvass Response — ProcureWise" };

export default async function SupplierPreCanvassPage() {
  let profile;
  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
  } catch {
    redirect("/login?error=Please log in to access pre-canvass responses.");
  }

  // Find supplier record linked to this user (in a real system, UserProfile would have a supplierId)
  // For now, we'll query by email matching or redirect
  const supplier = await prisma.supplier.findFirst({
    where: {
      contactPerson: profile.fullName,
    },
  });

  if (!supplier) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">No Supplier Account Found</h1>
        <p className="mt-2 text-base-content/60">
          Your account is not linked to a supplier profile. Please contact the Procurement Office.
        </p>
      </div>
    );
  }

  const preCanvassSuppliers = await prisma.preCanvassSupplier.findMany({
    where: { supplierId: supplier.id },
    include: {
      preCanvass: {
        include: {
          purchaseRequest: {
            include: {
              items: {
                include: {
                  unit: true,
                  product: true,
                },
              },
            },
          },
        },
      },
      response: {
        include: {
          items: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = preCanvassSuppliers.map((pcs) => ({
    id: pcs.id,
    preCanvassId: pcs.preCanvassId,
    responseStatus: pcs.responseStatus,
    invitedAt: pcs.invitedAt?.toISOString() || null,
    respondedAt: pcs.respondedAt?.toISOString() || null,
    preCanvass: {
      id: pcs.preCanvass.id,
      preCanvassNumber: pcs.preCanvass.preCanvassNumber,
      status: pcs.preCanvass.status,
      sentAt: pcs.preCanvass.sentAt?.toISOString() || null,
      purchaseRequest: {
        prNumber: pcs.preCanvass.purchaseRequest.prNumber,
        department: pcs.preCanvass.purchaseRequest.department,
        office: pcs.preCanvass.purchaseRequest.office,
        purpose: pcs.preCanvass.purchaseRequest.purpose,
        totalCost: Number(pcs.preCanvass.purchaseRequest.totalCost),
        items: pcs.preCanvass.purchaseRequest.items.map((item) => ({
          id: item.id,
          itemNo: item.itemNo,
          description: item.description,
          specification: item.specification,
          quantity: item.quantity,
          unit: item.unit?.abbreviation || item.unitText || "unit",
          estimatedUnitCost: Number(item.estimatedUnitCost),
        })),
      },
    },
    response: pcs.response
      ? {
          id: pcs.response.id,
          quotationNumber: pcs.response.quotationNumber,
          quotationDate: pcs.response.quotationDate?.toISOString() || null,
          remarks: pcs.response.remarks,
          submittedAt: pcs.response.submittedAt?.toISOString() || null,
          items: pcs.response.items.map((item) => ({
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
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <SupplierPreCanvassClient
        preCanvassSuppliers={serialized}
        supplierId={supplier.id}
        supplierName={supplier.companyName}
      />
    </div>
  );
}
