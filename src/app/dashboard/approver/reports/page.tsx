import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import ReportsExporterClient from "./ReportsExporterClient";

export const metadata = { title: "Procurement Reports — ProcureWise" };

export default async function ReportsPage() {
  await requireRole("Administrative Approver");

  // Fetch all datasets in parallel
  const [ppmps, prs, rfqs, pos, suppliers] = await Promise.all([
    // 1. PPMPs
    prisma.ppmp.findMany({
      include: { preparedBy: true },
      orderBy: { createdAt: "desc" }
    }),
    // 2. PRs
    prisma.purchaseRequest.findMany({
      include: { requestedBy: true },
      orderBy: { createdAt: "desc" }
    }),
    // 3. RFQs
    prisma.requestForQuote.findMany({
      include: { createdBy: true },
      orderBy: { createdAt: "desc" }
    }),
    // 4. POs
    prisma.purchaseOrder.findMany({
      include: { supplier: true, rfq: true },
      orderBy: { createdAt: "desc" }
    }),
    // 5. Suppliers
    prisma.supplier.findMany({
      orderBy: { companyName: "asc" }
    })
  ]);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", fontFamily: '"Inter", sans-serif' }}>
      <div>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#1f2937", margin: 0, letterSpacing: "-0.5px" }}>
          Reporting & Data Exports
        </h1>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7280", margin: "0.5rem 0 0 0" }}>
          Compile, filter, and extract core procurement modules into CSV spreadsheets for compliance audit reviews and offline data manipulation.
        </p>
      </div>

      <ReportsExporterClient
        ppmps={ppmps}
        prs={prs}
        rfqs={rfqs}
        pos={pos}
        suppliers={suppliers}
      />
    </div>
  );
}
