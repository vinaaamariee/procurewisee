import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import PrAuditClient from "./PrAuditClient";

export const metadata = { title: "Purchase Request Auditing — ProcureWise" };

export default async function PrAuditingPage() {
  await requireRole("Procurement Officer");

  // Fetch only lightweight Purchase Request summary data for the cards grid
  const prs = await prisma.purchaseRequest.findMany({
    where: {
      status: {
        in: ["Submitted", "UnderReview", "Approved", "Received"]
      }
    },
    select: {
      id: true,
      prNumber: true,
      department: true,
      requestDate: true,
      totalCost: true,
      status: true,
      purpose: true,
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

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

      <PrAuditClient initialPrs={prs as any} />
    </div>
  );
}
