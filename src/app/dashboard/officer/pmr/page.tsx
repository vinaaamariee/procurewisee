import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import PmrRegisterClient from "./PmrRegisterClient";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata = {
  title: "Procurement Monitoring Record (PMR) — ProcureWise",
};

export default async function PmrRegisterPage() {
  await requireRole("Procurement Officer");

  const [pmrs, officeRows] = await Promise.all([
    prisma.procurementMonitoringRecord.findMany({
      include: {
        pr: {
          select: {
            id: true,
            prNumber: true,
            department: true,
            purpose: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { dateReceived: "desc" },
    }),
    prisma.procurementMonitoringRecord.findMany({
      distinct: ["office"],
      select: { office: true },
      orderBy: { office: "asc" },
    }),
  ]);

  const serialized = pmrs.map((pmr) => ({
    id: pmr.id,
    pmrNumber: pmr.pmrNumber,
    prId: pmr.prId,
    prNumber: pmr.pr?.prNumber ?? null,
    office: pmr.office,
    department: pmr.department,
    fundSource: pmr.fundSource,
    purpose: pmr.purpose,
    totalCost: Number(pmr.totalCost),
    dateReceived: pmr.dateReceived.toISOString(),
    verificationDate: pmr.verificationDate ? pmr.verificationDate.toISOString() : null,
    verifiedBy: pmr.verifiedBy?.fullName ?? null,
    stage: pmr.stage,
    status: pmr.status,
    remarks: pmr.remarks,
    createdAt: pmr.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Procurement Monitoring Record"
        subtitle="Register of verified Purchase Requests with their procurement stage and status. Records are created automatically after PR verification."
      />

      <PmrRegisterClient
        initialPmrs={serialized}
        offices={officeRows.map((r) => r.office)}
      />
    </div>
  );
}
