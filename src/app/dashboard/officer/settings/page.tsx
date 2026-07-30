import { requireRole } from "@/lib/auth/get-user-profile";
import SectionHeader from "@/components/ui/SectionHeader";
import { Settings, Shield, Bell, HelpCircle } from "lucide-react";

export const metadata = { title: "System Settings — ProcureWise" };

export default async function SettingsPage() {
  await requireRole("Procurement Officer");

  return (
    <div className="space-y-8 font-sans text-left">
      <SectionHeader
        title="System Settings"
        subtitle="Manage your ProcureWise notification preferences, account security options, and official procurement parameters."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Tabs Placeholder */}
        <div className="md:col-span-1 space-y-2">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-base-200 text-[#7B1E1E] font-bold text-sm text-left">
            <Settings className="h-4 w-4" />
            <span>General Config</span>
          </button>
          <button disabled className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-base-50 text-base-content/60 font-medium text-sm text-left cursor-not-allowed opacity-60">
            <Shield className="h-4 w-4" />
            <span>Security & Access</span>
          </button>
          <button disabled className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-base-50 text-base-content/60 font-medium text-sm text-left cursor-not-allowed opacity-60">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </button>
        </div>

        {/* Content Card Placeholder */}
        <div className="md:col-span-2 rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#A6761D]/10 text-[#A6761D]">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-base-content">
                Settings Module Under Development
              </h3>
              <p className="text-sm text-base-content/60 mt-1 max-w-md">
                Official configuration panels for Batanes State College procurement rules and parameters are currently being provisioned. Default policies are active.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
