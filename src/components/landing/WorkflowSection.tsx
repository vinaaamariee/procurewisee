"use client";

import { FileText, CheckSquare, Megaphone, Inbox, Award, ShoppingCart, Truck } from "lucide-react";

export default function WorkflowSection() {
  const steps = [
    {
      title: "Purchase Request",
      subtitle: "Appendix 60 PR Form",
      description: "End Users originate requisitions with digital line items, specs, and budget details.",
      icon: FileText,
    },
    {
      title: "Review & Approval",
      subtitle: "Procurement Verification",
      description: "Procurement Officer II runs the 5-point compliance verification; approved requests flow to Procurement Staff for PMR recording.",
      icon: CheckSquare,
    },
    {
      title: "Request for Quotation",
      subtitle: "Official RFQ Publication",
      description: "Automated one-click PR-to-RFQ conversion and portal publication for bidding.",
      icon: Megaphone,
    },
    {
      title: "Supplier Quotations",
      subtitle: "Sealed Bid Submission",
      description: "Registered suppliers submit competitive price offers & compliance terms.",
      icon: Inbox,
    },
    {
      title: "Supplier Evaluation",
      subtitle: "MCDM Best-Value Scoring",
      description: "Multi-Criteria Decision-Making engine calculates best-value award rankings.",
      icon: Award,
    },
    {
      title: "Purchase Order",
      subtitle: "Appendix 61 PO Form",
      description: "Official PO document generated for winning supplier following BAC review.",
      icon: ShoppingCart,
    },
    {
      title: "Delivery & Inspection",
      subtitle: "Receipt & Completion",
      description: "Goods delivered, inspected, and acknowledged with complete audit trail.",
      icon: Truck,
    },
  ];

  return (
    <section id="workflow" className="py-16 lg:py-24 bg-base-100 border-b border-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <div className="badge badge-outline border-[#800000] text-[#800000] font-bold uppercase tracking-wider text-xs py-2 px-3">
            Procurement Lifecycle
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#800000] tracking-tight">
            Institutional Procurement Workflow
          </h2>
          <p className="text-sm sm:text-base text-base-content/70">
            A transparent 7-step digital workflow enforcing Republic Act No. 9184 standards across Batanes State College.
          </p>
        </div>

        {/* daisyUI Steps Container */}
        <div className="w-full overflow-x-auto pb-4">
          <ul className="steps steps-vertical lg:steps-horizontal w-full min-w-[700px] lg:min-w-0">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  data-content={idx + 1}
                  className="step step-primary font-bold text-xs"
                >
                  <div className="flex flex-col items-center text-center p-2 space-y-1 max-w-[140px] mx-auto">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#800000]/10 text-[#800000] mb-1">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-extrabold text-sm text-base-content leading-tight">
                      {step.title}
                    </span>
                    <span className="text-[11px] font-bold text-[var(--secondary-strong)]">
                      {step.subtitle}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Detailed Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {steps.slice(0, 4).map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="card bg-base-200/50 p-4 border border-base-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#800000] text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-base-content leading-tight">{step.title}</h3>
                    <p className="text-[11px] font-bold text-[var(--secondary-strong)]">{step.subtitle}</p>
                  </div>
                </div>
                <p className="text-xs text-base-content/70 leading-normal">{step.description}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {steps.slice(4, 7).map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="card bg-base-200/50 p-4 border border-base-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#800000] text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-base-content leading-tight">{step.title}</h3>
                    <p className="text-[11px] font-bold text-[var(--secondary-strong)]">{step.subtitle}</p>
                  </div>
                </div>
                <p className="text-xs text-base-content/70 leading-normal">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
