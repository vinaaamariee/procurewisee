import type { Metadata } from "next";

import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import WorkflowSection from "@/components/landing/WorkflowSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import UserRolesSection from "@/components/landing/UserRolesSection";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Batanes State College — Procurement Management Information System",
  description:
    "Official digital portal for managing institutional purchase requests, procurement activities, supplier quotations, price monitoring, and purchase orders for Batanes State College in compliance with Republic Act No. 9184.",
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
  ],
};

export const dynamic = "force-dynamic";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-base-100 text-base-content font-sans antialiased selection:bg-[#7B1E1E] selection:text-white" data-theme="bsc">
      {/* Sticky Institutional Navbar */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* 7-Step Procurement Workflow Lifecycle (daisyUI Steps) */}
        <WorkflowSection />

        {/* Core Institutional Features (daisyUI Cards) */}
        <FeaturesSection />

        {/* System User Roles & Access Control */}
        <UserRolesSection />
      </main>

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
