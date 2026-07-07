import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import TrackingForm from "./TrackingForm";

export const metadata: Metadata = {
  title: "Track Request — ProcureWise | Batanes State College",
  description: "Track the status of your procurement requisitions at Batanes State College.",
};

export default function TrackPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg-deep)" }}>
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div 
          className="w-full max-w-md border rounded-2xl p-8 shadow-xl space-y-6"
          style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}
        >
          {/* Header Banner */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#7e191b] to-[#ca8a04] flex items-center justify-center text-white font-black text-sm mx-auto shadow-md">
              PW
            </div>
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Requisition Tracker
            </h2>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Batanes State College &bull; Real-Time Procurement Status
            </p>
          </div>

          {/* Form */}
          <TrackingForm />

          {/* Helper Link */}
          <div className="text-center pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <Link 
              href="/catalog" 
              className="text-xs font-bold transition hover:underline"
              style={{ color: "var(--accent)" }}
            >
              ← Back to Procurement Catalog
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
