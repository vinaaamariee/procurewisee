import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrDetailsClient from "@/app/dashboard/officer/pr/[id]/PrDetailsClient";
import { startTimer } from "@/lib/performance-logger";
import { Link } from "lucide-react";

export const metadata = { title: "Purchase Request Details — ProcureWise" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PrDetailPage({ params }: PageProps) {
  const { profile } = await requireRole("Administrative Approver");
  const { id: rawId } = await params;

  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return notFound();
  }

  const timer = startTimer(`ApproverPrDetailPageQueries-id-${id}`);
  const [pr, budgetsList] = await Promise.all([
    prisma.purchaseRequest.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            unit: true,
          },
        },
        ppmp: true,
        requestedBy: true,
        assignedOfficer: true,
        statusHistory: {
          include: {
            changedBy: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    }),
    prisma.departmentBudget.findMany({}),
  ]);
  timer.end();

  if (!pr) {
    return notFound();
  }

  const budgets = budgetsList.reduce((acc: Record<string, { allocatedBudget: number; spentBudget: number }>, b: { department: string; allocatedBudget: any; spentBudget: any }) => {
    acc[b.department] = {
      allocatedBudget: Number(b.allocatedBudget),
      spentBudget: Number(b.spentBudget),
    };
    return acc;
  }, {} as Record<string, { allocatedBudget: number; spentBudget: number }>);

  const serializedPr = {
    ...pr,
    estimatedBudget: pr.estimatedBudget ? Number(pr.estimatedBudget) : null,
    totalCost: pr.totalCost ? Number(pr.totalCost) : 0,
    items: pr.items.map((item: any) => ({
      ...item,
      estimatedUnitCost: Number(item.estimatedUnitCost),
      estimatedCost: Number(item.estimatedCost),
      unit: item.unit?.abbreviation || item.unitText || "pcs",
    })),
    requestDate: pr.requestDate.toISOString(),
    createdAt: pr.createdAt.toISOString(),
    updatedAt: pr.updatedAt.toISOString(),
    statusHistory: pr.statusHistory?.map((sh: any) => ({
      ...sh,
      createdAt: sh.createdAt.toISOString(),
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Breadcrumb Navigation & Back Link */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-base-content/50">
          <Link href="/dashboard" className="hover:text-base-content transition-colors">Dashboard</Link>
          <span>&gt;</span>
          <Link href="/dashboard/approver/pr" className="hover:text-base-content transition-colors">Purchase Requests</Link>
          <span>&gt;</span>
          <span className="text-primary">{pr.prNumber}</span>
        </div>

        <Link
          href="/dashboard/approver/pr"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline w-fit"
        >
          ← Back to Purchase Requests
        </Link>
      </div>

      <PrDetailsClient
        initialPr={serializedPr as any}
        budgets={budgets}
        officerId={profile.id}
        canVerify
        verifierLabel="Procurement Officer II"
      />
    </div>
  );
}
