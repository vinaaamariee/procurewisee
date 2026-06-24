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
    },
    orderBy: {
      createdAt: "desc"
    }
  });

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

      <PrTrackerClient initialPrs={prs as any} />
    </div>
  );
}
