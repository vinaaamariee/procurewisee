import Link from "next/link";
import { ChevronRight, LayoutDashboard, Plus } from "lucide-react";
import type { UserProfile } from "@/types/auth";

export default function DashboardHeader({ profile }: { profile: UserProfile }) {
  const formattedToday = new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10 mb-6 font-sans">
      {/* Left: Breadcrumbs & Identity */}
      <div className="space-y-1 text-left">
        <div className="flex items-center gap-2 text-xs font-semibold text-base-content/50">
          <LayoutDashboard className="h-3.5 w-3.5 shrink-0 text-[#A6761D]" />
          <Link href="/dashboard" className="transition-colors hover:text-[#7B1E1E]">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-base-content/85">{profile.role} Portal</span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-black text-[#7B1E1E] tracking-tight">
          Procurement Dashboard
        </h1>
        
        <p className="text-xs sm:text-sm text-base-content/75 leading-relaxed">
          Welcome back, <strong className="text-base-content font-bold">{profile.fullName}</strong>. Logged in as <span className="badge badge-sm border-[#A6761D]/30 bg-[#A6761D]/10 text-[#A6761D] font-bold">{profile.role}</span> on <span className="font-semibold text-base-content">{formattedToday}</span>.
        </p>
      </div>

      {/* Right: Single Primary CTA */}
      <div className="flex-shrink-0">
        <Link
          href="/dashboard/officer/rfq/new"
          className="btn btn-sm btn-primary bg-[#7B1E1E] hover:bg-[#601717] text-white border-none font-bold rounded-lg shadow-sm flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Create RFQ</span>
        </Link>
      </div>
    </header>
  );
}