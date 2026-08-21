"use client";

import Link from "next/link";
import { Mail, Phone, HelpCircle, LogIn, ArrowRight } from "lucide-react";

export default function HelpSection() {
  const faqs = [
    {
      question: "Who can access ProcureWise?",
      answer: "Access is restricted to registered Batanes State College institutional users. Accounts must be provisioned by an Administrator before sign-in.",
    },
    {
      question: "How do I create an account?",
      answer: "Account registration is managed by the System Administrator. Contact the Procurement Office or ICT Office to request an account.",
    },
    {
      question: "I forgot my password. What should I do?",
      answer: "Use the 'Forgot Password' link on the sign-in page to reset your credentials using your registered institutional email address.",
    },
    {
      question: "What role will I be assigned?",
      answer: "Roles are assigned by the Administrator based on your position: End User for faculty/offices, Procurement Staff for procurement personnel, and Administrator for IT/system administrators.",
    },
  ];

  return (
    <section id="help" className="py-14 lg:py-20 bg-base-100 border-b border-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left: FAQs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="badge badge-outline border-[#7B1E1E] text-[#7B1E1E] font-bold uppercase tracking-wider text-xs py-2 px-3">
                Help & Support
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#7B1E1E] tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-sm sm:text-base text-base-content/70">
                Common questions about accessing and using the ProcureWise system.
              </p>
            </div>

            {/* daisyUI Collapse FAQ */}
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="collapse collapse-arrow rounded-box border border-base-300 bg-base-100">
                  <input type="radio" name="faq-accordion" defaultChecked={idx === 0} />
                  <div className="collapse-title text-sm font-extrabold text-base-content pr-8">
                    {faq.question}
                  </div>
                  <div className="collapse-content text-xs text-base-content/80 leading-relaxed font-normal">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Sign-In CTA */}
            <div className="flex items-center gap-3 rounded-xl bg-[#7B1E1E]/5 border border-[#7B1E1E]/20 p-4">
              <HelpCircle className="h-5 w-5 text-[#7B1E1E] flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-extrabold text-base-content">
                  Ready to access the system?
                </div>
                <div className="text-xs text-base-content/70">
                  Sign in with your institutional account to access procurement modules.
                </div>
              </div>
              <Link
                href="/login"
                className="btn btn-sm btn-primary rounded-lg bg-[#7B1E1E] hover:bg-[#601717] text-white border-none font-bold flex-shrink-0"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          </div>

          {/* Right: Contact Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="card card-border rounded-box bg-base-100 p-6 space-y-5">
              <h3 className="text-base font-extrabold text-[#7B1E1E] border-b border-base-200 pb-3">
                Contact for Support
              </h3>

              <div className="space-y-4 text-xs text-base-content/80">
                <div className="space-y-1">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#A6761D]">
                    Procurement Office
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#7B1E1E]" />
                    <span>procurement@bsc.edu.ph</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#A6761D]" />
                    <span>(078) 533-3000</span>
                  </div>
                </div>

                <div className="divider my-1"></div>

                <div className="space-y-1">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#A6761D]">
                    ICT / System Administration
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#7B1E1E]" />
                    <span>ict@bsc.edu.ph</span>
                  </div>
                  <div className="text-[11px] text-base-content/60 mt-1 leading-snug">
                    For account provisioning, role assignment, and technical issues.
                  </div>
                </div>
              </div>
            </div>

            {/* New Account Card */}
            <div className="card rounded-box bg-primary text-primary-content p-6 space-y-3">
              <h3 className="text-base font-extrabold">Need an Account?</h3>
              <p className="text-xs text-white/80 leading-relaxed">
                New institutional users must request account provisioning through the ICT Office or
                System Administrator. Accounts are only created for Batanes State College personnel.
              </p>
              <Link
                href="/login"
                className="btn btn-sm bg-white text-[#7B1E1E] hover:bg-gray-100 border-none font-bold rounded-lg w-full"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
