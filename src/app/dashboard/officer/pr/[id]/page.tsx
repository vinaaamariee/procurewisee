import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrDetailsClient from "./PrDetailsClient";
import { startTimer } from "@/lib/performance-logger";

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

  // 1. Fetch full Purchase Request and budgets in parallel
  const timer = startTimer(`PrDetailPageQueries-id-${id}`);
  const [pr, budgetsList] = await Promise.all([
    prisma.purchaseRequest.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            unit: true
          }
        },
        ppmp: true,
        requestedBy: true,
        assignedOfficer: true,
        statusHistory: {
          include: {
            changedBy: true
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    }),
    prisma.departmentBudget.findMany({})
  ]);
  timer.end();

  if (!pr) {
    return notFound();
  }

  const budgets = budgetsList.reduce((acc: Record<string, { allocatedBudget: number; spentBudget: number }>, b: { department: string; allocatedBudget: any; spentBudget: any }) => {
    acc[b.department] = {
      allocatedBudget: Number(b.allocatedBudget),
      spentBudget: Number(b.spentBudget)
    };
    return acc;
  }, {} as Record<string, { allocatedBudget: number; spentBudget: number }>);

  // Mapped/Serialized PR to plain JSON types (resolves Prisma Decimals and Dates passing to Client Component)
  const serializedPr = {
    ...pr,
    estimatedBudget: pr.estimatedBudget ? Number(pr.estimatedBudget) : null,
    totalCost: pr.totalCost ? Number(pr.totalCost) : 0,
    items: pr.items.map((item: any) => ({
      ...item,
      estimatedUnitCost: Number(item.estimatedUnitCost),
      estimatedCost: Number(item.estimatedCost),
      unit: item.unit?.abbreviation || item.unitText || "pcs"
    })),
    requestDate: pr.requestDate.toISOString(),
    createdAt: pr.createdAt.toISOString(),
    updatedAt: pr.updatedAt.toISOString(),
    statusHistory: pr.statusHistory?.map((sh: any) => ({
      ...sh,
      createdAt: sh.createdAt.toISOString()
    }))
  };

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

      <PrDetailsClient initialPr={(serializedPr as any)} budgets={budgets} officerId={profile.id} />
    </div>
  );
}

// Inline Next Link to avoid additional imports on the server component
import Link from "next/link";
