import { requireRole } from "@/lib/auth/get-user-profile";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = {
  title: "BAC Transmittals — Procurement Staff — ProcureWise",
};

export default async function BacTransmittalsPage() {
  await requireRole("Procurement Officer");

  return (
    <div className="space-y-8">
      <SectionHeader
        title="BAC Transmittals"
        subtitle="Prepare and transmit solicitation documents to the Bids and Awards Committee for canvassing and supplier selection."
      />

      <EmptyState
        preset="generic"
        title="BAC Transmittals Module Coming Soon"
        description="This module will let you compile canvass documents and transmit them to the BAC for review. Solicitation and award data from the RFQ process will flow in automatically."
      />
    </div>
  );
}
