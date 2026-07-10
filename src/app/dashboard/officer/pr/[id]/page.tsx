import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrDetailsClient from "./PrDetailsClient";

export const metadata = { title: "Purchase Request Details — ProcureWise" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PrDetailPage({ params }: PageProps) {
  const { profile } = await requireRole("Procurement Officer");
  const { id: rawId } = await params;

  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return notFound();
  }

  // 1. Fetch full Purchase Request with deep inclusions for details and audits
  const pr = await prisma.purchaseRequest.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true
        }
      },
      ppmp: true,
      requestedBy: true,
      assignedOfficer: true
    }
  });

  if (!pr) {
    return notFound();
  }

  // 2. Fetch all department budgets to feed into the checker
  const budgetsList = await prisma.departmentBudget.findMany({});
  const budgets = budgetsList.reduce((acc, b) => {
    acc[b.department] = {
      allocatedBudget: Number(b.allocatedBudget),
      spentBudget: Number(b.spentBudget)
    };
    return acc;
  }, {} as Record<string, { allocatedBudget: number; spentBudget: number }>);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", fontFamily: '"Inter", sans-serif' }}>
      {/* Breadcrumb Navigation & Back Link */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
          <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none" }} className="hover:underline">Dashboard</Link>
          <span>&gt;</span>
          <Link href="/dashboard/officer/pr" style={{ color: "var(--text-muted)", textDecoration: "none" }} className="hover:underline">Purchase Requests</Link>
          <span>&gt;</span>
          <span style={{ color: "var(--accent)" }}>{pr.prNumber}</span>
        </div>

        <Link
          href="/dashboard/officer/pr"
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
          ← Back to Purchase Requests
        </Link>
      </div>

      <PrDetailsClient initialPr={pr as any} budgets={budgets} officerId={profile.id} />
    </div>
  );
}

// Inline Next Link to avoid additional imports on the server component
import Link from "next/link";
