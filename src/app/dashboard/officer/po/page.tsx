import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import PoDraftingClient from "./PoDraftingClient";

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
      createdAt: true
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
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", fontFamily: '"Inter", sans-serif' }}>
      <div className="no-print">
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#1f2937", margin: 0, letterSpacing: "-0.5px" }}>
          Purchase Order Workspace
        </h1>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7280", margin: "0.5rem 0 0 0" }}>
          Convert awarded RFQ recommendations into formal POs, finalize payment/delivery clauses, and sign digitally.
        </p>
      </div>

      <PoDraftingClient pendingAwards={pendingAwards as any} initialPos={pos as any} />
    </div>
  );
}
