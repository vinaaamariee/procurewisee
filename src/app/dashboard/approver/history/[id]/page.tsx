import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrReviewClient from "./PrReviewClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Review Purchase Request — ProcureWise" };

export default async function PrReviewPage({ params }: PageProps) {
  await requireRole("Administrative Approver");

  const resolvedParams = await params;
  const prId = parseInt(resolvedParams.id, 10);
  if (isNaN(prId)) {
    return notFound();
  }

  // Fetch PR details with deep inclusions
  const pr = await prisma.purchaseRequest.findUnique({
    where: { id: prId },
    include: {
      items: {
        include: {
          product: true,
          unit: true
        }
      },
      requestedBy: true,
      assignedOfficer: true,
      statusHistory: {
        include: {
          changedBy: true
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  if (!pr) {
    return notFound();
  }

  // Fetch department budget info
  const deptBudgetRaw = await prisma.departmentBudget.findUnique({
    where: { department: pr.department }
  });

  const deptBudget = deptBudgetRaw ? {
    allocated: Number(deptBudgetRaw.allocatedBudget),
    spent: Number(deptBudgetRaw.spentBudget)
  } : null;

  // Serialize the PR
  const serializedPr = {
    id: pr.id,
    prNumber: pr.prNumber,
    trackingNumber: pr.trackingNumber,
    requestDate: pr.requestDate.toISOString(),
    department: pr.department,
    office: pr.office,
    purpose: pr.purpose,
    fundingSource: pr.fundingSource,
    estimatedBudget: Number(pr.estimatedBudget),
    totalCost: Number(pr.totalCost),
    status: pr.status,
    remarks: pr.remarks,
    attachments: pr.attachments,
    requesterName: pr.requestedBy?.fullName || pr.requesterName || "Requisitioner",
    requesterEmail: pr.requestedBy?.email || pr.requesterEmail || "N/A",
    officerName: pr.assignedOfficer?.fullName || "Not Assigned",
    items: pr.items.map(item => ({
      id: item.id,
      description: item.description,
      brand: item.brand || "N/A",
      quantity: item.quantity,
      unit: item.unit.abbreviation,
      estimatedUnitCost: Number(item.estimatedUnitCost),
      estimatedCost: Number(item.estimatedCost),
      specification: item.specification || "None"
    })),
    statusHistory: pr.statusHistory.map(history => ({
      id: history.id,
      status: history.status,
      remarks: history.remarks || "No remarks provided.",
      changedByName: history.changedBy?.fullName || "System",
      createdAt: history.createdAt.toISOString()
    }))
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem", fontFamily: '"Inter", sans-serif' }}>
      <PrReviewClient pr={serializedPr} deptBudget={deptBudget} />
    </div>
  );
}
