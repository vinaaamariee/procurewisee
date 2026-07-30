"use client";

import { FileText, Layers, FileCheck, Search, BarChart3, ShieldCheck } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "Digital Purchase Requests",
      badge: "Appendix 60 PR",
      description: "Official BSC digital Purchase Request form supporting Excel/CSV line item uploads, budget validation, Responsibility Center Codes, and digital signatures.",
      icon: FileText,
    },
    {
      title: "Official RFQ Generation",
      badge: "One-Click Conversion",
      description: "Automated PR-to-RFQ conversion that builds official Request for Quotation documents, auto-populating specifications, line items, and quantities without re-encoding.",
      icon: Layers,
    },
    {
      title: "Supplier Quotation Management",
      badge: "Sealed Bidding",
      description: "Secure supplier quote submission, price entry, and automatic generation of the Abstract of Quotations (AOQ) for BAC evaluation.",
      icon: ShieldCheck,
    },
    {
      title: "Purchase Order Generation",
      badge: "Appendix 61 PO",
      description: "Official Philippine Government Appendix 61 Purchase Order document generation with compliant print preview, line item editing, and delivery terms.",
      icon: FileCheck,
    },
    {
      title: "Procurement Tracking",
      badge: "Real-Time Tracking",
      description: "End-to-end requisition tracking with unique tracking numbers, status indicators, and tamper-evident audit logs across every workflow stage.",
      icon: Search,
    },
    {
      title: "Reports & Analytics",
      badge: "Executive Insights",
      description: "Comprehensive procurement analytics, department budget utilization dashboards, supplier performance evaluation scorecards, and price trends.",
      icon: BarChart3,
    },
  ];

  return (
    <section id="features" className="py-16 lg:py-24 bg-base-200/50 border-b border-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <div className="badge badge-outline border-[#A6761D] text-[#A6761D] font-bold uppercase tracking-wider text-xs py-2 px-3">
            System Modules
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#7B1E1E] tracking-tight">
            Institutional Procurement Modules
          </h2>
          <p className="text-sm sm:text-base text-base-content/70">
            Tailored specifically for State Universities and Colleges (SUCs) to meet Philippine government procurement standards.
          </p>
        </div>

        {/* Feature Cards Grid using daisyUI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="card bg-base-100 shadow-md border border-base-200 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
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

                  <h3 className="card-title text-lg font-extrabold text-[#7B1E1E] pt-2">
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
