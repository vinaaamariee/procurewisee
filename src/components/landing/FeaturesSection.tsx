"use client";

import { FileCheck, Layers, FileText, Search } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "Digital Purchase Requests",
      badge: "Appendix 60 PR",
      description: "Prepare and submit official purchase requests with validated line items and budget details.",
      icon: FileText,
    },
    {
      title: "Official RFQ Generation",
      badge: "PR-to-RFQ",
      description: "Convert approved requests into quotation documents without re-encoding information.",
      icon: Layers,
    },
    {
      title: "Purchase Order Processing",
      badge: "Appendix 61 PO",
      description: "Generate print-ready purchase orders and manage compliant delivery terms.",
      icon: FileCheck,
    },
    {
      title: "Procurement Tracking",
      badge: "Real-Time Status",
      description: "Follow request status and review the recorded activity at every procurement stage.",
      icon: Search,
    },
  ];

  return (
    <section id="features" className="border-b border-base-300 bg-base-200 py-10 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 max-w-3xl space-y-2">
          <div className="badge badge-outline badge-secondary px-3 py-2 text-xs font-bold uppercase tracking-wider">
            System Modules
          </div>
          <h2 className="text-2xl font-black tracking-tight text-primary sm:text-3xl lg:text-4xl">
            Institutional Procurement Features
          </h2>
          <p className="text-sm sm:text-base text-base-content/70">
            Core services available after institutional sign-in.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-base-300 bg-base-300 md:grid-cols-2">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="card rounded-none border-0 bg-base-100"
              >
                <div className="card-body p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-field bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="badge badge-sm border-primary/20 bg-primary/5 font-bold text-primary">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="card-title pt-1 text-lg font-extrabold text-primary">
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
