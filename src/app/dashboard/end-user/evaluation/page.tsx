import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import EvaluationFormClient from "./EvaluationFormClient";

export const metadata = { title: "Supplier Evaluation — ProcureWise" };

export default async function SupplierEvaluationPage() {
  const { profile } = await requireRole("End User");

  // Fetch registered suppliers
  const suppliers = await prisma.supplier.findMany({
    orderBy: { companyName: "asc" },
    select: {
      id: true,
      companyName: true,
      contactPerson: true
    }
  });

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", fontFamily: '"Inter", sans-serif' }}>
      <div>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#1f2937", margin: 0, letterSpacing: "-0.5px" }}>
          Supplier Evaluation Sheet
        </h1>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7280", margin: "0.5rem 0 0 0" }}>
          Rate the supplier on product quality, delivery compliance, responsiveness, and communication flow.
        </p>
      </div>

      <EvaluationFormClient suppliers={suppliers} evaluatorName={profile.fullName} />
    </div>
  );
}
