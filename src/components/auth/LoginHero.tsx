"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  FileText, 
  CheckSquare, 
  Send, 
  Award, 
  FileCheck, 
  Truck, 
  GraduationCap 
} from 'lucide-react';

export default function LoginHero() {
  const [imgError, setImgError] = useState(false);

  const workflowSteps = [
    {
      title: "Purchase Request",
      desc: "End-user office requisition & fund cluster tagging",
      icon: FileText,
    },
    {
      title: "Procurement Review",
      desc: "Officer verification & administrative approval",
      icon: CheckSquare,
    },
    {
      title: "Request for Quotation",
      desc: "Supplier canvassing & competitive bidding",
      icon: Send,
    },
    {
      title: "Supplier Evaluation",
      desc: "AOQ generation & best-value algorithm scoring",
      icon: Award,
    },
    {
      title: "Purchase Order",
      desc: "Official PO generation & award confirmation",
      icon: FileCheck,
    },
    {
      title: "Delivery & Inspection",
      desc: "Property inspection & inventory acceptance",
      icon: Truck,
    },
  ];

  return (
    <div className="flex flex-col justify-between p-8 lg:p-14 bg-base-100 border-b lg:border-b-0 lg:border-r border-base-300 min-h-full">
      <div className="space-y-8">
        {/* Top College Logo & Branding Header */}
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

          <div>
            <span className="badge badge-secondary badge-outline text-[11px] font-bold tracking-widest uppercase mb-1">
              Official Portal
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#7B1E1E] tracking-tight leading-tight">
              Batanes State College
            </h1>
            <h2 className="text-base sm:text-lg font-bold text-base-content leading-snug">
              Procurement Management Information System
            </h2>
            <p className="text-xs font-semibold text-[#A6761D] tracking-wide mt-0.5">
              Powered by ProcureWise
            </p>
          </div>
        </div>

        {/* Institutional System Description */}
        <div className="p-4 rounded-xl bg-base-200/70 border border-base-300 text-xs sm:text-sm text-base-content/80 leading-relaxed space-y-2">
          <p>
            Welcome to the official procurement portal of Batanes State College. This system manages purchase requests, procurement planning, supplier quotations, and purchase orders for College departments and administrative units.
          </p>
        </div>

        {/* Vertical Procurement Workflow Steps */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
            Institutional Procurement Workflow
          </h3>
          
          <ul className="steps steps-vertical w-full text-left text-xs font-medium">
            {workflowSteps.map((step, idx) => {
              const IconComp = step.icon;
              return (
                <li key={idx} className="step step-primary" data-content={idx + 1}>
                  <div className="flex flex-col text-left py-1 ml-2">
                    <div className="flex items-center gap-2 font-bold text-base-content text-xs sm:text-sm">
                      <IconComp className="w-3.5 h-3.5 text-[#7B1E1E]" />
                      <span>{step.title}</span>
                    </div>
                    <span className="text-[11px] text-base-content/60 leading-tight">
                      {step.desc}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="pt-8 mt-8 border-t border-base-300/60 flex items-center justify-between text-[11px] text-base-content/50">
        <span>© 2026 Batanes State College</span>
        <span className="font-mono text-[10px]">v0.1.0 • BSC-PMIS</span>
      </div>
    </div>
  );
}
