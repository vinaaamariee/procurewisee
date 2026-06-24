import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import FormTemplatesClient from "./FormTemplatesClient";

export const metadata = { title: "Form Templates Builder — ProcureWise" };

export default async function FormTemplatesPage() {
  await requireRole("Administrative Approver");

  // Fetch all Form Templates
  const templates = await prisma.formTemplate.findMany({
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", fontFamily: '"Inter", sans-serif' }}>
      <div>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#1f2937", margin: 0, letterSpacing: "-0.5px" }}>
          Solicitation & Evaluation Form Builder
        </h1>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7280", margin: "0.5rem 0 0 0" }}>
          Design, preview, version, and manage custom form specifications used throughout Batanes State College's procurement cycles.
        </p>
      </div>

      <FormTemplatesClient initialTemplates={templates as any} />
    </div>
  );
}
