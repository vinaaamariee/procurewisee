import Link from "next/link";
import { Plus } from "lucide-react";
import type { UserProfile } from "@/types/auth";

export default function DashboardHeader({ profile, displayRole }: { profile: UserProfile; displayRole?: string }) {
  const formattedToday = new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-base-300">
      {/* Left: Identity & Metadata */}
      <div className="space-y-1 text-left">
        <h1 className="text-xl font-bold tracking-tight text-primary font-display uppercase">
          Procurement Dashboard
        </h1>
        
        <div className="text-xs text-base-content/70 flex flex-wrap items-center gap-x-3 gap-y-1 font-medium">
          <div>
            <span>User:</span>{" "}
            <strong className="text-base-content font-semibold">{profile.fullName}</strong>
          </div>
          <div className="hidden sm:block h-3.5 w-px bg-base-300"></div>
          <div className="flex items-center gap-1">
            <span>Role:</span>{" "}
            <span className="badge badge-sm rounded border-base-300 bg-base-200 text-base-content font-bold">
              {displayRole || profile.role}
            </span>
          </div>
          <div className="hidden sm:block h-3.5 w-px bg-base-300"></div>
          <div>
            <span>Date:</span>{" "}
            <span className="text-base-content font-semibold">{formattedToday}</span>
          </div>
        </div>
      </div>

      {/* Right: Low-Prominence Action Button */}
      <div className="flex-shrink-0">
        <Link
          href="/dashboard/officer/rfq/new"
          className="btn btn-sm btn-outline border-base-300 hover:bg-base-200 text-base-content font-bold rounded-md flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Create RFQ</span>
        </Link>
      </div>
    </header>
  );
}