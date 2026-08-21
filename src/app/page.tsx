import type { Metadata } from "next";

import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
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
      className="public-site flex min-h-screen flex-col bg-base-100 text-base-content font-sans antialiased"
      data-theme="bsc"
    >
      {/* Sticky Institutional Navbar */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {/* Concise institutional sign-in hero */}
        <HeroSection />

        {/* Essential procurement services */}
        <FeaturesSection />
      </main>

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
