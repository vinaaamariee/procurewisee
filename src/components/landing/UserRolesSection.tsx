"use client";

import { UserCheck, ShieldAlert, Wrench, Lock } from "lucide-react";

export default function UserRolesSection() {
  // Roles sourced from schema: EndUser, ProcurementOfficer, Administrator
  const roles = [
    {
      title: "End User",
      subtitle: "Faculty, Department Heads & College Offices",
      badge: "Requisition Originator",
      icon: UserCheck,
      description: "Authenticated college faculty, office heads, and department staff who create and submit purchase requests, track their requisitions, and provide supplier feedback after delivery.",
      access: [
        "Browse the internal procurement catalog",
        "Create & submit Appendix 60 Purchase Requests",
        "Track own purchase request status",
        "Submit supplier evaluation scorecards",
        "Manage PPMP (Project Procurement Management Plan)",
      ],
    },
    {
      title: "Procurement Officer",
      subtitle: "Procurement Office Personnel",
      badge: "Procurement Manager",
      icon: ShieldAlert,
      description: "Procurement Office staff responsible for reviewing purchase requests, publishing RFQs, managing supplier bids, issuing purchase orders, and monitoring the full procurement lifecycle.",
      access: [
        "Review & process Purchase Requests",
        "Generate & publish Requests for Quotation",
        "Manage supplier quotes and canvassing",
        "Issue Appendix 61 Purchase Orders",
        "Monitor procurement analytics & price trends",
      ],
    },
    {
      title: "Administrator",
      subtitle: "System Administrators & IT Staff",
      badge: "System Governance",
      icon: Wrench,
      description: "IT Administrators and system managers responsible for user account provisioning, role-based access control, system configuration, and maintaining the institutional procurement catalog.",
      access: [
        "Provision & manage user accounts",
        "Assign and modify user roles",
        "Maintain institutional item catalog",
        "Configure system settings & permissions",
        "Review system audit trails & security logs",
      ],
    },
  ];

  return (
    <section id="roles" className="py-14 lg:py-20 bg-base-200/40 border-b border-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <div className="badge badge-outline border-[#7B1E1E] text-[#7B1E1E] font-bold uppercase tracking-wider text-xs py-2 px-3">
            Role-Based Access
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#7B1E1E] tracking-tight">
            Institutional User Roles
          </h2>
          <p className="text-sm sm:text-base text-base-content/70">
            ProcureWise enforces strict role-based access control. Each user's access to procurement modules is
            determined solely by their assigned institutional role.
          </p>
        </div>

        {/* Auth Gate Banner */}
        <div className="flex items-center gap-3 rounded-xl border border-[#A6761D]/30 bg-[#A6761D]/5 px-4 py-3 mb-8 text-sm font-semibold text-[#A6761D]">
          <Lock className="h-5 w-5 flex-shrink-0" />
          <span>
            All role-specific modules are protected behind institutional authentication. Users must sign in to access any procurement function.
          </span>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="card-body p-6 space-y-3 flex-1">
                  {/* Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7B1E1E]/10 text-[#7B1E1E]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="badge badge-sm border-[#A6761D]/30 bg-[#A6761D]/10 text-[#A6761D] font-bold">
                      {role.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="card-title text-lg font-extrabold text-[#7B1E1E]">
                      {role.title}
                    </h3>
                    <p className="text-xs font-semibold text-base-content/60">
                      {role.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-base-content/70 leading-normal">
                    {role.description}
                  </p>

                  <div className="divider my-1 text-xs text-base-content/40 uppercase tracking-wider font-bold">
                    Access Includes
                  </div>

                  {/* Access List */}
                  <ul className="space-y-1.5 text-xs text-base-content/80">
                    {role.access.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#7B1E1E] font-bold mt-0.5">•</span>
                        <span>{item}</span>
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
