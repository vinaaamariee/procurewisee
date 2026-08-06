import { requireRole } from "@/lib/auth/get-user-profile";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = {
  title: "Letters of Notice — Procurement Staff — ProcureWise",
};

export default async function LetterOfNoticePage() {
  await requireRole("Procurement Officer");

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Letters of Notice"
        subtitle="Prepare and serve Letters of Notice to winning suppliers following the BAC resolution and award."
      />

      <EmptyState
        preset="generic"
        title="Letters of Notice Module Coming Soon"
        description="This module will let you generate Letters of Notice for awarded suppliers once the BAC resolution is recorded. Award data from the RFQ evaluation will flow in automatically."
      />
    </div>
  );
}
