import React from "react";
import { getAuthenticatedUser } from "@/lib/auth/get-user-profile";
import { redirect } from "next/navigation";
import { getIntelligentProcurementAnalytics } from "@/app/actions/analytics";
import AnalyticsDashboardClient from "./AnalyticsDashboardClient";

export const metadata = {
  title: "Procurement Analytics Dashboard — ProcureWise",
  description: "Executive analytics, supplier intelligence, market price forecasting, and budget monitoring insights.",
};

export const dynamic = "force-dynamic";

export default async function OfficerAnalyticsPage() {
  const { profile } = await getAuthenticatedUser();
  if (profile.role !== "Procurement Officer" && profile.role !== "Administrative Approver") {
    return redirect("/unauthorized");
  }

  const data = await getIntelligentProcurementAnalytics();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AnalyticsDashboardClient initialData={data} />
    </div>
  );
}
