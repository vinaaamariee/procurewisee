import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import SupplierPoClient from "./SupplierPoClient";

export const metadata = { title: "My Purchase Orders — ProcureWise" };

export default async function SupplierPoPage() {
  const { profile } = await requireRole("Supplier");

  // Resolve supplierId based on companyName or contactPerson match (same as dashboard/supplier/page.tsx)
  let supplier = await prisma.supplier.findFirst({
    where: {
      OR: [
        { companyName: profile.fullName },
        { contactPerson: profile.fullName }
      ]
    },
    select: { id: true }
  });

  if (!supplier) {
    // Fallback to first supplier in dev mode
    supplier = await prisma.supplier.findFirst({
      orderBy: { id: "asc" },
      select: { id: true }
    });
  }

  const supplierId = supplier?.id ?? 1;

  // Fetch Purchase Orders for this supplier
  const pos = await prisma.purchaseOrder.findMany({
    where: {
      supplierId
    },
    include: {
      supplier: true,
      items: true,
      rfq: true,
      pr: true,
      acknowledgementReceipts: {
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", fontFamily: '"Inter", sans-serif' }}>
      <div>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#1f2937", margin: 0, letterSpacing: "-0.5px" }}>
          Contract Agreements & POs
        </h1>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7280", margin: "0.5rem 0 0 0" }}>
          Review awarded Purchase Orders, inspect delivery parameters, and submit signed shipment acknowledgements.
        </p>
      </div>

      <SupplierPoClient initialPos={pos as any} supplierId={supplierId} />
    </div>
  );
}
