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
    <div className="flex min-h-screen flex-col bg-[var(--bg-deep)] text-[var(--text-primary)]">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <HeroSection activeRfqs={activeRfqs} />

        {/* Main content */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-16">
            <QuickActions />
            <StatisticsCards
  stats={[
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: Boxes,
      color: "#7e191b",
      bgColor: "rgba(126, 25, 27, 0.06)",
    },
    {
      title: "Registered Suppliers",
      value: stats.totalSuppliers.toLocaleString(),
      icon: Users,
      color: "#ca8a04",
      bgColor: "rgba(202, 138, 4, 0.06)",
    },
    {
      title: "Categories",
      value: stats.totalCategories.toLocaleString(),
      icon: LayoutGrid,
      color: "#059669",
      bgColor: "rgba(5, 150, 105, 0.06)",
    },
    {
      title: "Monthly Price Updates",
      value: stats.monthlyPriceUpdates.toLocaleString(),
      icon: TrendingUp,
      color: "#6366f1",
      bgColor: "rgba(99, 102, 241, 0.06)",
    },
  ]}
/>
            <CategoryGrid categories={categories} />

            {/* Bottom section: two-column layout on large screens */}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
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