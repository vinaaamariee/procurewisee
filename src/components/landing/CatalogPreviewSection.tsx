"use client";

import Link from "next/link";
import { Search, ArrowRight, PackageCheck, Tag, ShoppingBag } from "lucide-react";

export default function CatalogPreviewSection() {
  return (
    <section className="py-14 lg:py-20 bg-base-100 border-b border-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card bg-gradient-to-r from-base-200/60 via-base-100 to-base-200/60 p-6 sm:p-10 rounded-3xl border border-base-200 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Description & CTAs */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="badge badge-outline border-[#A6761D] text-[#A6761D] font-bold uppercase tracking-wider text-xs py-2 px-3">
                Transparent Public Catalog
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#7B1E1E] tracking-tight">
                Institutional Public Procurement Catalog
              </h2>

              <p className="text-sm sm:text-base text-base-content/80 leading-relaxed font-normal">
                Explore approved supplies, equipment, specifications, standard unit costs, and verified supplier
                product price histories across Batanes State College. Empowering faculty and offices to create accurate
                purchase requests with verified market price benchmarks.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/catalog"
                  className="btn btn-primary btn-md rounded-xl bg-[#7B1E1E] hover:bg-[#7B1E1E] text-white border-none font-bold shadow-md px-6"
                >
                  <Search className="h-4 w-4" />
                  <span>Browse Public Catalog</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/track"
                  className="btn btn-outline btn-md rounded-xl border-[#7B1E1E] text-[#7B1E1E] hover:bg-[#7B1E1E] hover:text-white font-bold px-6"
                >
                  <span>Track Requisition</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Catalog Preview Card */}
            <div className="lg:col-span-5">
              <div className="card bg-base-100 p-5 rounded-2xl border border-base-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-base-200 pb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-[#7B1E1E]" />
                    <span className="font-extrabold text-sm text-base-content">Catalog Highlights</span>
                  </div>
                  <span className="badge badge-sm badge-success font-bold text-white">Active</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 text-xs">
                    <div className="flex items-center gap-2">
                      <PackageCheck className="h-4 w-4 text-[#A6761D]" />
                      <span className="font-bold text-base-content">Paper Products & Stationery</span>
                    </div>
                    <span className="font-bold text-[#7B1E1E]">A4 80gsm Paper</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[#7B1E1E]" />
                      <span className="font-bold text-base-content">IT Equipment & Toner</span>
                    </div>
                    <span className="font-bold text-[#A6761D]">LaserJet Cartridges</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 text-xs">
                    <div className="flex items-center gap-2">
                      <PackageCheck className="h-4 w-4 text-[#A6761D]" />
                      <span className="font-bold text-base-content">Laboratory & Office Supplies</span>
                    </div>
                    <span className="font-bold text-[#7B1E1E]">Standard Items</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
