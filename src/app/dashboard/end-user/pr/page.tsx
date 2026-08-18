import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import PrTrackerClient from "./PrTrackerClient";

export const metadata = { title: "Purchase Request Tracker — ProcureWise" };

export default async function PrTrackerPage() {
  const { profile } = await requireRole("End User");

  // Fetch all Purchase Requests prepared by this user
  const prs = await prisma.purchaseRequest.findMany({
    where: {
      requestedById: profile.id
    },
    include: {
      items: {
        include: {
          product: true
        }
      },
      ppmp: true,
      assignedOfficer: true,
      requestedBy: true,
      statusHistory: {
        include: {
          changedBy: true
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const serializedPrs = prs.map((pr: any) => ({
    ...pr,
    estimatedBudget: pr.estimatedBudget ? Number(pr.estimatedBudget) : null,
    totalCost: pr.totalCost ? Number(pr.totalCost) : 0,
    requestDate: pr.requestDate.toISOString(),
    prDate: pr.prDate ? pr.prDate.toISOString() : pr.requestDate.toISOString(),
    createdAt: pr.createdAt.toISOString(),
    updatedAt: pr.updatedAt.toISOString(),
    submittedAt: pr.submittedAt ? pr.submittedAt.toISOString() : null,
    items: pr.items.map((item: any) => ({
      ...item,
      unitCost: item.unitCost ? Number(item.unitCost) : 0,
      estimatedUnitCost: item.estimatedUnitCost ? Number(item.estimatedUnitCost) : 0,
      estimatedCost: item.estimatedCost ? Number(item.estimatedCost) : 0,
      product: item.product ? {
        ...item.product,
      } : null,
    })),
    statusHistory: pr.statusHistory?.map((sh: { createdAt: { toISOString: () => any; }; }) => ({
      ...sh,
      createdAt: sh.createdAt.toISOString(),
    })),
  }));

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", fontFamily: '"Inter", sans-serif' }}>
      <div>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#1f2937", margin: 0, letterSpacing: "-0.5px" }}>
          Purchase Request Tracker
        </h1>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7280", margin: "0.5rem 0 0 0" }}>
          Track procurement status, assigned officers, and submit drafts for review.
        </p>
      </div>

      <PrTrackerClient initialPrs={(serializedPrs as any)} />
    </div>
  );
}
