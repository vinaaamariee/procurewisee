import { getAuthenticatedUser } from "@/lib/auth/get-user-profile";
import { ROLE_HOME } from "@/types/auth";
import { redirect } from "next/navigation";

export default async function DashboardRootRedirect() {
  const { profile } = await getAuthenticatedUser();
  const dashboardHome = ROLE_HOME[profile.role] || "/login";
  redirect(dashboardHome);
}
