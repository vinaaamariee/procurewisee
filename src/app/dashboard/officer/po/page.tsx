import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import PoDraftingClient from "./PoDraftingClient";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata = { title: "Purchase Order Drafting — ProcureWise" };

export default async function PoDraftingPage() {
  await requireRole("Procurement Officer");

  // 1. Fetch only lightweight summary Purchase Orders
  const pos = await prisma.purchaseOrder.findMany({
    select: {
      id: true,
      poNumber: true,
      supplierId: true,
      supplier: {
        select: {
          companyName: true
        }
      },
      rfq: {
        select: {
          rfqNumber: true
        }
      },
      totalCost: true,
      status: true,
      createdAt: true,
      deliveryTerms: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // 2. Fetch all approved recommendations to find those that need a PO drafted
  const approvedRecommendations = await prisma.recommendation.findMany({
    where: {
      approvalStatus: "Approved"
    },
    include: {
      supplier: true,
      supplierQuote: true,
      canvas: {
        include: {
          rfq: true
        }
      }
    }
  });

  // Filter recommendations that don't have a PO drafted yet
  const pendingAwards = approvedRecommendations.filter((rec) => {
    return !pos.some(
      (po) => po.supplierId === rec.supplierId && po.rfq?.rfqNumber === rec.canvas.rfq.rfqNumber
    );
  });

 return (
  <div className="space-y-8">
    <SectionHeader
      title="Purchase Order Workspace"
      subtitle="Convert awarded RFQ recommendations into formal Purchase Orders, finalize payment and delivery clauses, and complete digital authorization."
    />

    <PoDraftingClient
      pendingAwards={pendingAwards as any}
      initialPos={pos as any}
    />
  </div>
);
}
