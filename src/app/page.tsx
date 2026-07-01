import type { Metadata } from "next";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import QuickActions from "@/components/landing/QuickActions";
import StatisticsCards from "@/components/landing/StatisticsCards";
import CategoryGrid from "@/components/landing/CategoryGrid";
import RecentlyUpdatedProducts from "@/components/landing/RecentlyUpdatedProducts";
import WhyProcureWise from "@/components/landing/WhyProcureWise";
import Footer from "@/components/landing/Footer";
import {
  getLandingStats,
  getRecentProducts,
  getCategoriesWithCounts,
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

/**
 * Landing Page — Server Component
 *
 * Fetches real data from the database and passes it to
 * server-rendered sections. No placeholder data.
 */
export default async function LandingPage() {
  // Parallel data fetching — all queries run simultaneously
  const [stats, recentProducts, categories] = await Promise.all([
    getLandingStats(),
    getRecentProducts(),
    getCategoriesWithCounts(),
  ]);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--bg-deep)" }}
    >
      <Header />

      <main className="flex-1">
        <HeroSection />
        <QuickActions />
        <StatisticsCards stats={stats} />
        <CategoryGrid categories={categories} />
        <RecentlyUpdatedProducts products={recentProducts} />
        <WhyProcureWise />
      </main>

      <Footer />
    </div>
  );
}
