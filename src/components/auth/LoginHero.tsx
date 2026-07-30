"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, Users, Layers, Lock, GraduationCap, Mail, Phone } from 'lucide-react';

export default function LoginHero() {
  const [imgError, setImgError] = useState(false);

  const securityFeatures = [
    {
      icon: Lock,
      label: "Secure Authentication",
      desc: "SSL-encrypted institutional login",
    },
    {
      icon: Users,
      label: "Role-Based Access Control",
      desc: "Permissions tied to institutional roles",
    },
    {
      icon: Layers,
      label: "Institutional Procurement System",
      desc: "End-to-end internal procurement management",
    },
    {
      icon: ShieldCheck,
      label: "RA 9184 Compliant Workflow",
      desc: "Government Procurement Reform Act standards",
    },
  ];

  return (
    <div className="flex flex-col justify-between p-8 lg:p-14 bg-base-100 border-b lg:border-b-0 lg:border-r border-base-300 min-h-full">
      <div className="space-y-7">
        {/* College Logo & Branding */}
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-base-200 border border-base-300 p-2 flex items-center justify-center shrink-0 shadow-sm">
            {!imgError ? (
              <Image
                src="/images/bsc-logo.png"
                alt="Batanes State College Logo"
                width={80}
                height={80}
                className="w-full h-full object-contain"
                onError={() => setImgError(true)}
                priority
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-[#7B1E1E] text-white flex flex-col items-center justify-center p-1 text-center">
                <GraduationCap className="w-8 h-8 text-[#A6761D]" />
                <span className="text-[9px] font-bold uppercase tracking-tighter mt-0.5">BSC</span>
              </div>
            )}
          </div>

          <div className="space-y-0.5">
            <span className="badge badge-secondary badge-outline text-[11px] font-bold tracking-widest uppercase mb-1">
              Official Portal
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#7B1E1E] tracking-tight leading-tight">
              Batanes State College
            </h1>
            <h2 className="text-sm sm:text-base font-bold text-base-content leading-snug">
              Procurement Management Information System
            </h2>
            <p className="text-xs font-semibold text-[#A6761D] tracking-wide mt-0.5">
              Powered by ProcureWise
            </p>
          </div>
        </div>

        {/* Short Institutional Description */}
        <div className="p-4 rounded-xl bg-base-200/70 border border-base-300 text-xs sm:text-sm text-base-content/80 leading-relaxed">
          Access the official Procurement Management Information System of Batanes State College.
          Sign in using your authorized institutional account to manage procurement activities
          securely and efficiently.
        </div>

        {/* Security & Access Feature Cards */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-extrabold text-base-content/50 uppercase tracking-wider">
            System Security & Access
          </h3>

          <div className="grid grid-cols-1 gap-2">
            {securityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.label}
                  className="flex items-center gap-3 p-3 rounded-xl bg-base-200/50 border border-base-300 hover:border-[#7B1E1E]/30 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7B1E1E]/10 text-[#7B1E1E] flex-shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-base-content leading-tight">
                      {feature.label}
                    </div>
                    <div className="text-[11px] text-base-content/60 leading-tight">
                      {feature.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* New to ProcureWise? */}
        <div className="space-y-2 pt-2 border-t border-base-300/60">
          <p className="text-xs font-extrabold text-base-content/60">
            New to ProcureWise?
          </p>
          <div className="rounded-xl bg-base-200/70 border border-base-300 p-3.5 space-y-2">
            <p className="text-[11px] text-base-content/70 leading-relaxed">
              Account access is provisioned by the System Administrator. Self-registration is not available.
              Contact the Procurement Office or ICT Office to request an account.
            </p>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-base-content/70">
                <Mail className="h-3.5 w-3.5 text-[#A6761D] flex-shrink-0" />
                <span className="font-semibold">procurement@bsc.edu.ph</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-base-content/70">
                <Phone className="h-3.5 w-3.5 text-[#7B1E1E] flex-shrink-0" />
                <span className="font-semibold">(078) 533-3000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 mt-8 border-t border-base-300/60 flex items-center justify-between text-[11px] text-base-content/50">
        <span>© {new Date().getFullYear()} Batanes State College</span>
        <span className="font-mono text-[10px]">BSC-PMIS</span>
      </div>
    </div>
  );
}
