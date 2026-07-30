import type { Metadata } from "next";

import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import UserRolesSection from "@/components/landing/UserRolesSection";
import AboutSection from "@/components/landing/AboutSection";
import HelpSection from "@/components/landing/HelpSection";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "ProcureWise — Batanes State College Procurement Management Information System",
  description:
    "The official internal Procurement Management Information System (PMIS) of Batanes State College. Manages institutional purchase requests, RFQs, supplier evaluation, and purchase orders in compliance with Republic Act No. 9184. Access restricted to authenticated users.",
  keywords: [
    "ProcureWise",
    "Batanes State College",
    "Procurement Management Information System",
    "Government Procurement",
    "Republic Act 9184",
    "Purchase Request",
    "Request for Quotation",
    "Purchase Order",
    "PPMP",
    "Internal System",
  ],
};

export const dynamic = "force-dynamic";

export default function LandingPage() {
  return (
    <div
      className="flex min-h-screen flex-col bg-base-100 text-base-content font-sans antialiased selection:bg-[#7B1E1E] selection:text-white"
      data-theme="bsc"
    >
      {/* Sticky Institutional Navbar */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero: Two-Column Layout — Institution Title + Workflow Steps (auth-gated) */}
        <HeroSection />

        {/* Institutional Stats — RA 9184, 7-Step Process, Role-Based Access, Appendix 60/61 */}
        <StatsSection />

        {/* Core Procurement Modules — all auth-gated descriptions */}
        <FeaturesSection />

        {/* Role-Based Access — End User, Procurement Officer, Administrator */}
        <UserRolesSection />

        {/* About the System — institutional description + BSC background */}
        <AboutSection />

        {/* Help & Contact — FAQs, contact, and sign-in CTA */}
        <HelpSection />
      </main>

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
