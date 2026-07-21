import type { Metadata } from "next";

import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import QuickActions from "@/components/landing/QuickActions";
import StatisticsCards from "@/components/landing/StatisticsCards";
import CategoryGrid from "@/components/landing/CategoryGrid";
import RecentlyUpdatedProducts from "@/components/landing/RecentlyUpdatedProducts";
import WhyProcureWise from "@/components/landing/WhyProcureWise";
import Footer from "@/components/landing/Footer";
import { Boxes, Users, LayoutGrid, TrendingUp } from "lucide-react";

import {
  getLandingStats,
  getRecentProducts,
  getCategoriesWithCounts,
  getActiveRfqs,
} from "@/features/landing/server/queries";

export const metadata: Metadata = {
  title: "ProcureWise — Intelligent Procurement Analytics | Batanes State College",
  description:
    "ProcureWise: An Intelligent Procurement Analytics and Automated Canvassing System with Best-Value Recommendation Engine for Batanes State College. Browse products, compare prices, and track procurement requests.",
  keywords: [
    "ProcureWise",
    "procurement",
    "Batanes State College",
    "government procurement",
    "canvassing",
    "purchase request",
    "PPMP",
  ],
};

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [stats, recentProducts, categories, activeRfqs] = await Promise.all([
    getLandingStats(),
    getRecentProducts(),
    getCategoriesWithCounts(),
    getActiveRfqs(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA] dark:bg-slate-950 text-[#111827] dark:text-slate-100 font-sans">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <HeroSection activeRfqs={activeRfqs} />

        {/* Main Content Container */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="space-y-16 lg:space-y-20">
            {/* Quick Access */}
            <QuickActions />

            {/* Statistics */}
            <StatisticsCards
              stats={[
                {
                  title: "Total Products",
                  value: stats.totalProducts.toLocaleString(),
                  icon: Boxes,
                  color: "#7B1E1E",
                  bgColor: "rgba(123, 30, 30, 0.08)",
                },
                {
                  title: "Registered Suppliers",
                  value: stats.totalSuppliers.toLocaleString(),
                  icon: Users,
                  color: "#D4A017",
                  bgColor: "rgba(212, 160, 23, 0.08)",
                },
                {
                  title: "Categories",
                  value: stats.totalCategories.toLocaleString(),
                  icon: LayoutGrid,
                  color: "#059669",
                  bgColor: "rgba(5, 150, 105, 0.08)",
                },
                {
                  title: "Monthly Price Updates",
                  value: stats.monthlyPriceUpdates.toLocaleString(),
                  icon: TrendingUp,
                  color: "#6366f1",
                  bgColor: "rgba(99, 102, 241, 0.08)",
                },
              ]}
            />

            {/* Category Grid */}
            <CategoryGrid categories={categories} />

            {/* Bottom Two-Column Section */}
            <div className="grid gap-10 lg:grid-cols-2 items-start">
              <RecentlyUpdatedProducts products={recentProducts} />
              <WhyProcureWise />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}