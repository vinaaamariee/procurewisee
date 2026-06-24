import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import WorkflowsBuilderClient from "./WorkflowsBuilderClient";

export const metadata = { title: "Workflow Configurations — ProcureWise" };

export default async function WorkflowBuilderPage() {
  await requireRole("Administrative Approver");

  // Fetch all existing configurations
  const configs = await prisma.workflowConfig.findMany({
    orderBy: { moduleName: "asc" }
  });

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", fontFamily: '"Inter", sans-serif' }}>
      <div>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#1f2937", margin: 0, letterSpacing: "-0.5px" }}>
          Dynamic Workflow Configurator
        </h1>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7280", margin: "0.5rem 0 0 0" }}>
          Configure approval paths, hierarchies, parallel verifications, and escalation limits for PPMP, PR, and PO modules.
        </p>
      </div>

      <WorkflowsBuilderClient initialConfigs={configs as any} />
    </div>
  );
}
