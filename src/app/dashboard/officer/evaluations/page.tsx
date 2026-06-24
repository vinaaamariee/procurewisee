import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import OfficerEvaluationsClient from "./OfficerEvaluationsClient";

export const metadata = { title: "Supplier Evaluations & Scorecards — ProcureWise" };

export default async function OfficerEvaluationsPage() {
  const { profile } = await requireRole("Procurement Officer");

  // Fetch active suppliers
  const suppliers = await prisma.supplier.findMany({
    orderBy: { companyName: "asc" },
    select: {
      id: true,
      companyName: true,
    }
  });

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", fontFamily: '"Inter", sans-serif' }}>
      <div>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#1f2937", margin: 0, letterSpacing: "-0.5px" }}>
          Supplier Scorecard Analytics & Evaluation
        </h1>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7280", margin: "0.5rem 0 0 0" }}>
          Monitor supplier reliability indexes, view historical evaluation timelines, and file official performance reviews.
        </p>
      </div>

      <OfficerEvaluationsClient suppliers={suppliers} officerName={profile.fullName} />
    </div>
  );
}
