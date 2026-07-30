"use client";

import { FileCheck, Layers, Users, FileText, Search, BarChart3 } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "Digital Purchase Requests",
      badge: "Appendix 60 PR",
      description: "Submit official Appendix 60 Purchase Requests with digital line items, budget validation, Responsibility Center Codes, and item catalog integration. Requires End User login.",
      icon: FileText,
    },
    {
      title: "Official RFQ Generation",
      badge: "PR-to-RFQ",
      description: "Automated PR-to-RFQ conversion that builds Request for Quotation documents from approved purchase requests without re-encoding data. Managed by Procurement Officers.",
      icon: Layers,
    },
    {
      title: "Supplier Quotation Management",
      badge: "Sealed Bidding",
      description: "Secured submission and management of supplier quotes, with automatic Abstract of Quotation (AOQ) generation and price canvassing tools for BAC evaluation.",
      icon: Users,
    },
    {
      title: "Purchase Order Processing",
      badge: "Appendix 61 PO",
      description: "Official Philippine Government Appendix 61 Purchase Order document generation, including print-ready layout and compliant delivery term management.",
      icon: FileCheck,
    },
    {
      title: "Procurement Tracking",
      badge: "Real-Time Status",
      description: "End-to-end requisition lifecycle tracking with unique tracking codes, status timelines, and tamper-evident audit logs across every stage of the procurement workflow.",
      icon: Search,
    },
    {
      title: "Reports & Analytics",
      badge: "Executive Dashboard",
      description: "Comprehensive procurement analytics dashboards, department budget utilization, supplier reliability ratings, and PPMP vs. actual expenditure reports.",
      icon: BarChart3,
    },
  ];

  return (
    <section id="features" className="py-14 lg:py-20 bg-base-100 border-b border-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <div className="badge badge-outline border-[#A6761D] text-[#A6761D] font-bold uppercase tracking-wider text-xs py-2 px-3">
            System Modules
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#7B1E1E] tracking-tight">
            Institutional Procurement Features
          </h2>
          <p className="text-sm sm:text-base text-base-content/70">
            All modules are accessible exclusively to authenticated institutional users based on their assigned role within Batanes State College.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden"
              >
                <div className="card-body p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7B1E1E]/10 text-[#7B1E1E]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="badge badge-sm border-[#7B1E1E]/20 bg-[#7B1E1E]/5 text-[#7B1E1E] font-bold">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="card-title text-lg font-extrabold text-[#7B1E1E] pt-1">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
