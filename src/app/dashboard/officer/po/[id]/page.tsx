import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PoDetailsClient from "./PoDetailsClient";

export const metadata = { title: "Purchase Order Details — ProcureWise" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PoDetailPage({ params }: PageProps) {
  await requireRole("Procurement Officer");
  const { id: rawId } = await params;

  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return notFound();
  }

  // Fetch full Purchase Order with supplier, items, and linked documents
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: true,
      rfq: true,
      pr: true,
    }
  });

  if (!po) {
    return notFound();
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", fontFamily: '"Inter", sans-serif' }}>
      {/* Breadcrumb Navigation & Back Link */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }} className="no-print">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
          <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none" }} className="hover:underline">Dashboard</Link>
          <span>&gt;</span>
          <Link href="/dashboard/officer/po" style={{ color: "var(--text-muted)", textDecoration: "none" }} className="hover:underline">Purchase Orders</Link>
          <span>&gt;</span>
          <span style={{ color: "var(--accent)" }}>{po.poNumber}</span>
        </div>

        <Link
          href="/dashboard/officer/po"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "var(--accent)",
            textDecoration: "none",
            width: "fit-content"
          }}
          className="hover:underline"
        >
          ← Back to Purchase Orders
        </Link>
      </div>

      <PoDetailsClient initialPo={po as any} />
    </div>
  );
}

// Inline Next Link to avoid extra imports on the server component
import Link from "next/link";
