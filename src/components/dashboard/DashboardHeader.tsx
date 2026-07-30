import Link from "next/link";
import { Plus } from "lucide-react";
import type { UserProfile } from "@/types/auth";

export default function DashboardHeader({ profile }: { profile: UserProfile }) {
  const formattedToday = new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10 mb-6 font-sans border-b border-base-200 pb-4">
      {/* Left: Identity & Metadata (No breadcrumb, high contrast, no conversational greeting) */}
      <div className="space-y-2 text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-[#7B1E1E] tracking-tight">
          Procurement Dashboard
        </h1>
        
        <div className="text-xs sm:text-sm text-base-content flex flex-wrap items-center gap-x-4 gap-y-2 font-medium">
          <div>
            <span className="text-base-content/70">Current User:</span>{" "}
            <strong className="text-base-content font-bold">{profile.fullName}</strong>
          </div>
          <div className="hidden sm:block h-3 w-px bg-base-300"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-base-content/70">Role:</span>{" "}
            <span className="badge badge-sm border-[#A6761D]/30 bg-[#A6761D]/10 text-[#A6761D] font-bold rounded">
              {profile.role}
            </span>
          </div>
          <div className="hidden sm:block h-3 w-px bg-base-300"></div>
          <div>
            <span className="text-base-content/70">Date:</span>{" "}
            <span className="text-base-content font-semibold">{formattedToday}</span>
          </div>
        </div>
      </div>

      {/* Right: Low-Prominence Action Button */}
      <div className="flex-shrink-0">
        <Link
          href="/dashboard/officer/rfq/new"
          className="btn btn-xs sm:btn-sm btn-outline border-base-300 hover:border-[#7B1E1E] hover:bg-[#7B1E1E]/5 hover:text-[#7B1E1E] text-base-content font-bold rounded-lg flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create RFQ</span>
        </Link>
      </div>
    </header>
  );
}