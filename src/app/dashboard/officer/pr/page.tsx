import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import PrAuditClient from "./PrAuditClient";

export const metadata = { title: "Purchase Request Auditing — ProcureWise" };

export default async function PrAuditingPage() {
  const { profile } = await requireRole("Procurement Officer");

  // Fetch all Purchase Requests that are submitted or being audited
  const prs = await prisma.purchaseRequest.findMany({
    where: {
      status: {
        in: ["Submitted", "UnderReview", "ReturnedForRevision", "Approved", "Received"]
      }
    },
    include: {
      items: {
        include: {
          product: true
        }
      },
      ppmp: true,
      requestedBy: true,
      assignedOfficer: true
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  // Fetch all department budgets to feed into the checker
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
      <div>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#1f2937", margin: 0, letterSpacing: "-0.5px" }}>
          Requisitions Auditing Hub
        </h1>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7280", margin: "0.5rem 0 0 0" }}>
          Verify requisitions, validate product specifications/quantities, modify units of measure, and award approval markers.
        </p>
      </div>

      <PrAuditClient initialPrs={prs as any} officerId={profile.id} budgets={budgets} />
    </div>
  );
}
