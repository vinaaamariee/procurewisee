import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import HistoryClient from "./HistoryClient";

export const metadata = { title: "Approval History — ProcureWise" };

export default async function HistoryPage() {
  await requireRole("Administrative Approver");

  const prs = await prisma.purchaseRequest.findMany({
    where: {
      status: {
        in: ["Submitted", "UnderReview", "Approved", "Received", "ReturnedForRevision", "Rejected"]
      }
    },
    include: {
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
      updatedAt: "desc"
    }
  });

  // Serialize for client component props
  const serializedPrs = prs.map(pr => {
    // Find the latest decision entry in the history for this PR (from an approver)
    const latestDecision = pr.statusHistory.find(h => 
      h.status === 'Approved' || 
      h.status === 'ReturnedForRevision' || 
      h.status === 'Rejected' ||
      h.status === 'UnderReview'
    );

    return {
      id: pr.id,
      prNumber: pr.prNumber,
      department: pr.department,
      office: pr.office,
      purpose: pr.purpose,
      totalCost: Number(pr.totalCost),
      status: pr.status,
      createdAt: pr.createdAt.toISOString(),
      updatedAt: pr.updatedAt.toISOString(),
      requesterName: pr.requestedBy?.fullName || pr.requesterName || "N/A",
      decisionDate: latestDecision ? latestDecision.createdAt.toISOString() : null,
      reviewedBy: latestDecision?.changedBy?.fullName || "N/A"
    };
  });

  return <HistoryClient prs={serializedPrs} />;
}
