"use client";

import { UserCheck, ShieldAlert, Award, Wrench } from "lucide-react";

export default function UserRolesSection() {
  const roles = [
    {
      title: "End User",
      subtitle: "Faculty, Department Heads & Offices",
      badge: "Requisition Originator",
      icon: UserCheck,
      description: "College faculty, office heads, and administrative units originating procurement requests via official Appendix 60 PR digital forms.",
      responsibilities: [
        "Create & submit Purchase Requests",
        "Upload PR items via Excel/CSV templates",
        "Track requisition status & delivery",
        "Submit supplier evaluation scorecards",
      ],
    },
    {
      title: "Procurement Officer",
      subtitle: "Procurement Office Personnel",
      badge: "Procurement Manager",
      icon: ShieldAlert,
      description: "Procurement Office personnel responsible for reviewing PRs, publishing RFQs, managing supplier biddings, and issuing PO awards.",
      responsibilities: [
        "Review PR specs & PPMP budget compliance",
        "Generate & publish Requests for Quotation",
        "Encode supplier biddings & Appendix 61 POs",
        "Monitor market prices & supplier reliability",
      ],
    },
    {
      title: "BAC Secretariat",
      subtitle: "Bids and Awards Committee",
      badge: "Bidding Oversight",
      icon: Award,
      description: "Bids and Awards Committee members overseeing competitive bidding, reviewing Abstract of Quotations, and approving awards.",
      responsibilities: [
        "Oversee competitive bidding & canvassing",
        "Verify Abstract of Quotations (AOQ)",
        "Review MCDM best-value recommendations",
        "Ensure RA 9184 compliance",
      ],
    },
    {
      title: "Administrator",
      subtitle: "System Administrators & IT Staff",
      badge: "System Governance",
      icon: Wrench,
      description: "IT Administrators managing system user accounts, institutional catalog master lists, role permissions, and audit log trails.",
      responsibilities: [
        "Provision user accounts & role access",
        "Maintain item & price catalog master lists",
        "Monitor system performance & database health",
        "Audit transaction logs & security trails",
      ],
    },
  ];

  return (
    <section id="roles" className="py-14 lg:py-20 bg-base-200/40 border-b border-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <div className="badge badge-outline border-[#7B1E1E] text-[#7B1E1E] font-bold uppercase tracking-wider text-xs py-2 px-3">
            Governance & Access
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#7B1E1E] tracking-tight">
            Institutional User Roles
          </h2>
          <p className="text-sm sm:text-base text-base-content/70">
            Strictly role-based permissions aligned with Batanes State College organizational structure.
          </p>
        </div>

        {/* Roles Grid using daisyUI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between"
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

                  <p className="text-xs text-base-content/70 leading-normal">
                    {role.description}
                  </p>

                  <div className="divider my-1"></div>

                  <ul className="space-y-1.5 text-xs text-base-content/80">
                    {role.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
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
