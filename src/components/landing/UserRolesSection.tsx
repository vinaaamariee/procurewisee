"use client";

import { UserCheck, ShieldAlert, Award, Wrench } from "lucide-react";

export default function UserRolesSection() {
  const roles = [
    {
      title: "End User",
      subtitle: "Faculty, Department Heads & Offices",
      badge: "Requisition Originator",
      icon: UserCheck,
      responsibilities: [
        "Create & submit Appendix 60 Purchase Requests",
        "Upload PR line items via CSV/Excel templates",
        "Track requisition status & delivery progress",
        "Submit supplier evaluation feedback scorecards",
      ],
    },
    {
      title: "Procurement Officer",
      subtitle: "Procurement Office Personnel",
      badge: "Procurement Manager",
      icon: ShieldAlert,
      responsibilities: [
        "Review PR specifications & PPMP budget compliance",
        "Generate & publish official Requests for Quotation (RFQ)",
        "Encode supplier biddings & generate Appendix 61 POs",
        "Monitor market price trends & supplier reliability",
      ],
    },
    {
      title: "BAC Secretariat",
      subtitle: "Bids and Awards Committee",
      badge: "Bidding Oversight",
      icon: Award,
      responsibilities: [
        "Oversee competitive bidding & canvassing activities",
        "Generate & verify Abstract of Quotations (AOQ)",
        "Review MCDM best-value recommendation rankings",
        "Ensure compliance with RA 9184 procurement rules",
      ],
    },
    {
      title: "Administrator",
      subtitle: "System Administrators & IT Staff",
      badge: "System Governance",
      icon: Wrench,
      responsibilities: [
        "Manage user role permissions & account provisioning",
        "Maintain institutional item & price catalog master lists",
        "Monitor system performance & database health",
        "Audit system transaction logs & audit trails",
      ],
    },
  ];

  return (
    <section id="roles" className="py-16 lg:py-24 bg-base-100 border-b border-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <div className="badge badge-outline border-[#7B1E1E] text-[#7B1E1E] font-bold uppercase tracking-wider text-xs py-2 px-3">
            Governance & Access
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#7B1E1E] tracking-tight">
            Institutional User Roles
          </h2>
          <p className="text-sm sm:text-base text-base-content/70">
            Strictly role-based access controls mapped to Batanes State College operational hierarchy.
          </p>
        </div>

        {/* Roles Grid using daisyUI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                className="card bg-base-100 shadow-md border border-base-200 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div className="card-body p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7B1E1E]/10 text-[#7B1E1E]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="badge badge-sm border-[#A6761D]/30 bg-[#A6761D]/10 text-[#A6761D] font-bold">
                      {role.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="card-title text-base sm:text-lg font-extrabold text-[#7B1E1E]">
                      {role.title}
                    </h3>
                    <p className="text-xs font-semibold text-base-content/60">
                      {role.subtitle}
                    </p>
                  </div>

                  <div className="divider my-1"></div>

                  <ul className="space-y-2 text-xs text-base-content/80">
                    {role.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#7B1E1E] font-bold">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
