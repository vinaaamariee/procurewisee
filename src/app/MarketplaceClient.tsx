"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPrFromCartAction } from "./actions/pr";
import { getPpmpList } from "./actions/ppmp";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ShoppingCart,
  Grid,
  List,
  Search,
  SlidersHorizontal,
  LogIn,
  LayoutDashboard,
  ChevronRight,
  X,
  Minus,
  Plus,
  Package,
  Bell,
  CheckCircle2,
  Tag,
  Building2,
  Truck,
  BarChart3,
  FileText,
  ClipboardList,
  MapPin,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Interfaces (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  description: string;
  unitOfMeasure: string;
  estimatedUnitCost: number;
  brand: string;
  popularity: number;
  technicalSpecifications: string;
  latestCanvassedPrice: number | null;
  preferredSupplier: string;
  isActive: boolean;
}

interface CartItem {
  id: number;
  name: string;
  estimatedUnitCost: number;
  uom: string;
  quantity: number;
  brand: string;
  specifications: string;
}

interface MarketplaceClientProps {
  products: Product[];
  suppliers: any[];
  userProfile: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function MarketplaceHeader({
  searchQuery,
  setSearchQuery,
  cart,
  setIsCartOpen,
  userProfile,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  cart: CartItem[];
  setIsCartOpen: (v: boolean) => void;
  userProfile: any;
}) {
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const dashboardHref =
    userProfile?.role === "Supplier"
      ? "/unauthorized"
      : userProfile?.role === "Administrative Approver"
      ? "/dashboard/approver"
      : userProfile?.role === "Procurement Officer"
      ? "/dashboard/officer"
      : "/dashboard/end-user";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B3B6E] to-[#1a5ba8] flex items-center justify-center shadow-md">
              <Package className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] font-black text-[#0B3B6E] dark:text-white leading-tight tracking-tight">
                ProcureWise
              </p>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold leading-tight">
                Batanes State College
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#0B3B6E] transition-colors" />
              <input
                type="text"
                placeholder="Search catalog items, brands, specifications…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-[#0B3B6E] focus:ring-2 focus:ring-[#0B3B6E]/10 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-4.5 h-4.5 text-gray-600 dark:text-slate-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#D4A017] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950">
                  {cartCount}
                </span>
              )}
            </button>

            {userProfile ? (
              <a
                href={dashboardHref}
                className="flex items-center gap-2 bg-[#0B3B6E] hover:bg-[#0a3260] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </a>
            ) : (
              <a
                href="/login"
                className="flex items-center gap-2 bg-[#0B3B6E] hover:bg-[#0a3260] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-[#0B3B6E] via-[#0d4a8a] to-[#1a5ba8] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] animate-pulse" />
              Procurement Management Information System
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight">
              Good Morning 👋
              <span className="block text-2xl lg:text-3xl font-bold text-blue-200 mt-2">
                Welcome to ProcureWise
              </span>
            </h1>
            <p className="text-blue-100 text-base lg:text-lg leading-relaxed max-w-lg">
              Digitizing Procurement Planning, Market Scoping, Canvassing and
              Decision Support for Batanes State College.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="/catalog"
                className="inline-flex items-center gap-2 bg-[#D4A017] hover:bg-[#c49315] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-md"
              >
                <Package className="w-4 h-4" />
                Browse Catalog
              </a>
              <a
                href="/track"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-sm"
              >
                <FileText className="w-4 h-4" />
                Track Purchase Request
              </a>
            </div>
          </div>

          {/* Right — decorative card */}
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#D4A017]/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-[#D4A017]" />
                </div>
                <div>
                  <p className="font-bold text-sm">Procurement at a Glance</p>
                  <p className="text-blue-200 text-xs">Live system statistics</p>
                </div>
              </div>
              {[
                { label: "Active RFQs", value: "3", color: "#D4A017" },
                { label: "Pending PRs", value: "12", color: "#34d399" },
                { label: "Catalog Items", value: "2,713", color: "#60a5fa" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between bg-white/5 rounded-xl p-3.5 border border-white/10"
                >
                  <span className="text-blue-100 text-sm font-medium">{stat.label}</span>
                  <span className="font-black text-lg" style={{ color: stat.color }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickAccessSection({ onOpenCart }: { onOpenCart: () => void }) {
  const tiles = [
    {
      icon: Package,
      title: "Browse Products",
      desc: "Explore the procurement catalog with detailed specs and supplier pricing.",
      href: "/catalog",
      cta: "View Catalog →",
      color: "#0B3B6E",
      bg: "rgba(11,59,110,0.06)",
    },
    {
      icon: ClipboardList,
      title: "Create PPMP",
      desc: "Prepare your Project Procurement Management Plan for budget allocation.",
      href: "/dashboard/end-user/ppmp",
      cta: "Start Planning →",
      color: "#D4A017",
      bg: "rgba(212,160,23,0.06)",
    },
    {
      icon: FileText,
      title: "Submit Purchase Request",
      desc: "File a purchase request for items needed by your department or office.",
      href: "/dashboard/end-user/pr",
      cta: "Submit PR →",
      color: "#059669",
      bg: "rgba(5,150,105,0.06)",
    },
    {
      icon: MapPin,
      title: "Track Request",
      desc: "Track the status of your procurement request using your tracking code.",
      href: "/track",
      cta: "Track Now →",
      color: "#6366f1",
      bg: "rgba(99,102,241,0.06)",
    },
  ];

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#D4A017] mb-2">
          Quick Access
        </p>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          Start your procurement workflow
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {tiles.map((tile) => (
          <a
            key={tile.title}
            href={tile.href}
            className="group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col gap-4"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: tile.bg }}
            >
              <tile.icon className="w-5 h-5" style={{ color: tile.color }} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                {tile.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                {tile.desc}
              </p>
            </div>
            <span className="text-xs font-bold" style={{ color: tile.color }}>
              {tile.cta}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function FilterToolbar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  selectedSupplier,
  setSelectedSupplier,
  maxPrice,
  setMaxPrice,
  absoluteMaxPrice,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  categories,
  brands,
  suppliers,
  resultCount,
  onReset,
}: any) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search — mobile */}
        <div className="relative flex-1 min-w-[180px] md:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#0B3B6E] transition"
          />
        </div>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="flex-1 min-w-[130px] max-w-[200px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#0B3B6E] cursor-pointer transition"
        >
          <option value="">All Categories</option>
          {categories.map((c: string) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Brand */}
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="flex-1 min-w-[120px] max-w-[180px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#0B3B6E] cursor-pointer transition"
        >
          <option value="">All Brands</option>
          {brands.map((b: string) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        {/* Supplier */}
        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="flex-1 min-w-[140px] max-w-[220px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#0B3B6E] cursor-pointer transition"
        >
          <option value="">All Suppliers</option>
          {suppliers.map((s: any) => (
            <option key={s.id} value={s.companyName}>{s.companyName}</option>
          ))}
        </select>

        {/* Price */}
        <div className="flex items-center gap-2 min-w-[160px]">
          <span className="text-[10px] text-gray-400 font-bold uppercase whitespace-nowrap">
            Max ₱{maxPrice.toLocaleString()}
          </span>
          <input
            type="range"
            min="0"
            max={absoluteMaxPrice}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-1.5 accent-[#0B3B6E] cursor-pointer"
          />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block" />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#0B3B6E] cursor-pointer transition"
        >
          <option value="popularity">Popularity</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="newest">Newest Added</option>
        </select>

        {/* View Toggle */}
        <div className="flex bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-white dark:bg-slate-700 text-[#0B3B6E] shadow-sm"
                : "text-gray-400"
            }`}
            aria-label="Grid view"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-white dark:bg-slate-700 text-[#0B3B6E] shadow-sm"
                : "text-gray-400"
            }`}
            aria-label="List view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Result count + Reset */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs text-gray-400 font-semibold whitespace-nowrap">
            {resultCount} items
          </span>
          <button
            onClick={onReset}
            className="text-[10px] text-gray-400 hover:text-[#0B3B6E] font-bold uppercase tracking-wider transition-colors whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ p, onAdd }: { p: Product; onAdd: (p: Product) => void }) {
  return (
    <div className="group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden">
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0B3B6E] to-[#D4A017] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="space-y-4">
        {/* Badge + SKU */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#0B3B6E] bg-[#0B3B6E]/08 dark:bg-[#0B3B6E]/20 rounded-full px-2.5 py-1 uppercase tracking-wide">
            <Tag className="w-2.5 h-2.5" />
            {p.category}
          </span>
          <span className="text-[10px] font-mono text-gray-400">
            {p.sku}
          </span>
        </div>

        {/* Name + Brand */}
        <div>
          <h3 className="font-bold text-sm leading-snug text-gray-900 dark:text-white group-hover:text-[#0B3B6E] dark:group-hover:text-blue-300 transition-colors">
            {p.name}
          </h3>
          <p className="text-[11px] text-gray-400 font-semibold mt-0.5 flex items-center gap-1">
            <Building2 className="w-2.5 h-2.5" />
            {p.brand}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {p.description}
        </p>

        {/* Specs */}
        {p.technicalSpecifications && (
          <div className="bg-gray-50 dark:bg-slate-800/60 rounded-xl p-3 border border-gray-100 dark:border-slate-700">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Specifications
            </p>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2">
              {p.technicalSpecifications}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800 space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Est. Price
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white leading-tight">
              ₱{p.estimatedUnitCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unit</p>
            <p className="text-sm font-bold text-[#D4A017]">{p.unitOfMeasure}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Truck className="w-3 h-3 shrink-0" />
          <span className="truncate">
            <span className="font-semibold text-gray-700 dark:text-slate-300">{p.preferredSupplier}</span>
          </span>
        </div>

        <button
          onClick={() => onAdd(p)}
          className="w-full bg-[#0B3B6E] hover:bg-[#0a3260] active:scale-[0.98] text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm tracking-wide"
        >
          + Add to Requisition
        </button>
      </div>
    </div>
  );
}

function ProductListItem({ p, onAdd }: { p: Product; onAdd: (p: Product) => void }) {
  return (
    <div className="group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col md:flex-row gap-5 relative overflow-hidden">
      {/* Left accent */}
      <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-[#0B3B6E] to-[#D4A017] opacity-0 group-hover:opacity-100 transition-opacity rounded-l-2xl" />

      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0B3B6E] bg-[#0B3B6E]/08 dark:bg-[#0B3B6E]/20 rounded-full px-2.5 py-1 uppercase tracking-wide">
            <Tag className="w-2.5 h-2.5" />
            {p.category}
          </span>
          <span className="text-[10px] font-mono text-gray-400">{p.sku}</span>
        </div>

        <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug group-hover:text-[#0B3B6E] dark:group-hover:text-blue-300 transition-colors">
          {p.name}
        </h3>
        <p className="text-xs text-gray-400 font-semibold flex items-center gap-2">
          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{p.brand}</span>
          <span className="text-gray-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1"><Truck className="w-3 h-3" />{p.preferredSupplier}</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed max-w-2xl">
          {p.description}
        </p>
        {p.technicalSpecifications && (
          <p className="text-[11px] text-gray-400">
            <span className="font-bold text-[10px] uppercase tracking-wider">Specs: </span>
            {p.technicalSpecifications}
          </p>
        )}
      </div>

      <div className="md:w-44 shrink-0 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-gray-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-5 gap-4">
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Est. Price</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
            ₱{p.estimatedUnitCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-[#D4A017] font-semibold">per {p.unitOfMeasure}</p>
        </div>

        <button
          onClick={() => onAdd(p)}
          className="w-full bg-[#0B3B6E] hover:bg-[#0a3260] active:scale-[0.98] text-white py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm tracking-wide"
        >
          + Add to Requisition
        </button>
      </div>
    </div>
  );
}

function CartDrawer({
  cart,
  cartTotal,
  updateQuantity,
  onClose,
  onCheckout,
  loading,
}: {
  cart: CartItem[];
  cartTotal: number;
  updateQuantity: (id: number, delta: number) => void;
  onClose: () => void;
  onCheckout: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-[420px] bg-white dark:bg-slate-950 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B3B6E]/08 dark:bg-[#0B3B6E]/20 flex items-center justify-center">
              <ShoppingCart className="w-4.5 h-4.5 text-[#0B3B6E]" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-900 dark:text-white">Requisition Cart</h2>
              <p className="text-[11px] text-gray-400">
                {cart.length === 0
                  ? "No items"
                  : `${cart.reduce((s, i) => s + i.quantity, 0)} item(s)`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 divide-y divide-gray-100 dark:divide-slate-800">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Cart is empty</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Browse the catalog and add items to your requisition.
                </p>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="py-4 flex gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wide">
                    {item.brand}
                  </p>
                  <p className="text-xs font-bold text-[#D4A017] mt-1">
                    ₱{item.estimatedUnitCost.toFixed(2)}{" "}
                    <span className="text-gray-400 font-normal">/ {item.uom}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-7 h-7 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Minus className="w-3 h-3 text-gray-500" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-7 h-7 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Total Estimated Value
                </p>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                  ₱{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right text-xs text-gray-400">
                <p>{cart.length} line(s)</p>
              </div>
            </div>
            <button
              onClick={onCheckout}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#0B3B6E] hover:bg-[#0a3260] disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? (
                "Loading…"
              ) : (
                <>
                  Generate Purchase Request
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutModal({
  checkoutData,
  setCheckoutData,
  ppmpList,
  userProfile,
  loading,
  errorMessage,
  onClose,
  onSubmit,
}: {
  checkoutData: any;
  setCheckoutData: (d: any) => void;
  ppmpList: any[];
  userProfile: any;
  loading: boolean;
  errorMessage: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const inputClass =
    "w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#0B3B6E] focus:ring-2 focus:ring-[#0B3B6E]/10 transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500";
  const labelClass =
    "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              Generate Purchase Request
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {userProfile
                ? "Submit your cart items for formal procurement processing."
                : "No login required — fill in your details to submit a requisition."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4.5 h-4.5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-6 py-5 space-y-5">
          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-3.5 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Requester info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Requester Full Name</label>
              <input
                type="text"
                required
                placeholder="Dr. Juan Dela Cruz"
                value={checkoutData.requesterName}
                onChange={(e) =>
                  setCheckoutData({ ...checkoutData, requesterName: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                required
                placeholder="juan@bsc.edu.ph"
                value={checkoutData.requesterEmail}
                onChange={(e) =>
                  setCheckoutData({ ...checkoutData, requesterEmail: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* Department + Office */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Requisition Unit / Dept</label>
              <input
                type="text"
                required
                placeholder="ICT Department"
                value={checkoutData.department}
                onChange={(e) =>
                  setCheckoutData({ ...checkoutData, department: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Office / Division</label>
              <input
                type="text"
                required
                placeholder="ICTO"
                value={checkoutData.office}
                onChange={(e) =>
                  setCheckoutData({ ...checkoutData, office: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* Funding + PPMP */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Funding Source</label>
              <input
                type="text"
                required
                placeholder="GAA 2026"
                value={checkoutData.fundingSource}
                onChange={(e) =>
                  setCheckoutData({ ...checkoutData, fundingSource: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Link to Approved PPMP</label>
              <select
                value={checkoutData.ppmpId}
                onChange={(e) =>
                  setCheckoutData({ ...checkoutData, ppmpId: e.target.value })
                }
                className={inputClass + " cursor-pointer"}
              >
                <option value="">Select PPMP (Optional)</option>
                {ppmpList.map((ppmp) => (
                  <option key={ppmp.id} value={ppmp.id}>
                    {ppmp.ppmpNumber} — {ppmp.projectTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className={labelClass}>Purpose of Requisition</label>
            <textarea
              required
              rows={3}
              placeholder="Specify details, urgency, and destination…"
              value={checkoutData.purpose}
              onChange={(e) =>
                setCheckoutData({ ...checkoutData, purpose: e.target.value })
              }
              className={inputClass}
            />
          </div>

          {/* Policy note */}
          <div className="bg-[#D4A017]/08 dark:bg-[#D4A017]/10 border border-[#D4A017]/25 rounded-xl p-4 text-xs text-[#b88a10] dark:text-[#f5c842] leading-relaxed font-medium">
            <strong>Budget Check Policy:</strong> Generates a Purchase Request Draft and allocates estimates
            against department budget allocations automatically. Revisions are logged asynchronously.
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 py-3 rounded-xl font-bold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#0B3B6E] hover:bg-[#0a3260] disabled:opacity-60 text-white py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? "Generating…" : "Submit Purchase Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SuccessModal({
  message,
  onClose,
  onDashboard,
}: {
  message: string;
  onClose: () => void;
  onDashboard: () => void;
}) {
  const prNumberMatch = message.match(/PR-[\w-]+/);
  const prNumber = prNumberMatch ? prNumberMatch[0] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            Requisition Submitted!
          </h3>
          {prNumber && (
            <div className="inline-flex items-center gap-2 bg-[#0B3B6E]/08 dark:bg-[#0B3B6E]/20 rounded-xl px-4 py-2">
              <FileText className="w-4 h-4 text-[#0B3B6E]" />
              <span className="font-black text-sm text-[#0B3B6E] dark:text-blue-300">
                {prNumber}
              </span>
            </div>
          )}
          <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mt-3">
            {message}
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 py-3 rounded-xl font-bold text-sm transition-colors"
          >
            Continue Browsing
          </button>
          <button
            onClick={onDashboard}
            className="flex-1 bg-[#0B3B6E] hover:bg-[#0a3260] text-white py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MarketplaceClient({
  products,
  suppliers,
  userProfile,
}: MarketplaceClientProps) {
  const router = useRouter();

  // ── State (ALL UNCHANGED) ──────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [sortBy, setSortBy] = useState("popularity");

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [ppmpList, setPpmpList] = useState<any[]>([]);
  const [checkoutData, setCheckoutData] = useState({
    requesterName: "",
    requesterEmail: "",
    department: "",
    office: "",
    purpose: "",
    fundingSource: "",
    ppmpId: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ── Effects (ALL UNCHANGED) ────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("procurewise_cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("procurewise_cart", JSON.stringify(newCart));
  };

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      saveCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      saveCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          estimatedUnitCost: product.estimatedUnitCost,
          uom: product.unitOfMeasure,
          quantity: 1,
          brand: product.brand,
          specifications: product.technicalSpecifications,
        },
      ]);
    }
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      saveCart(cart.filter((i) => i.id !== id));
    } else {
      saveCart(cart.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)));
    }
  };

  // ── Derived values (ALL UNCHANGED) ────────────────────────────────────────
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products]
  );
  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))),
    [products]
  );
  const absoluteMaxPrice = useMemo(() => {
    const costs = products.map((p) => p.estimatedUnitCost);
    return costs.length > 0 ? Math.max(...costs) : 100000;
  }, [products]);

  useEffect(() => {
    setMaxPrice(absoluteMaxPrice);
  }, [absoluteMaxPrice]);

  const processedProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.technicalSpecifications.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesBrand = !selectedBrand || p.brand === selectedBrand;
      const matchesSupplier = !selectedSupplier || p.preferredSupplier === selectedSupplier;
      const matchesPrice = p.estimatedUnitCost <= maxPrice;
      return matchesSearch && matchesCategory && matchesBrand && matchesSupplier && matchesPrice;
    });

    if (sortBy === "popularity") result.sort((a, b) => b.popularity - a.popularity);
    else if (sortBy === "priceAsc") result.sort((a, b) => a.estimatedUnitCost - b.estimatedUnitCost);
    else if (sortBy === "priceDesc") result.sort((a, b) => b.estimatedUnitCost - a.estimatedUnitCost);
    else if (sortBy === "newest") result.sort((a, b) => b.id - a.id);

    return result;
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedSupplier, maxPrice, sortBy]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.estimatedUnitCost * item.quantity,
    0
  );

  // ── Handlers (ALL UNCHANGED) ───────────────────────────────────────────────
  const handleCheckoutClick = async () => {
    if (userProfile && userProfile.role !== "End User") {
      alert(
        `Role Restrictions: You are logged in as a ${userProfile.role}. Only End Users can submit Purchase Requests.`
      );
      return;
    }
    setLoading(true);
    try {
      if (userProfile) {
        const ppmps = await getPpmpList({
          department: userProfile.fullName,
          status: "Approved",
        });
        setPpmpList(ppmps || []);
      }
      setCheckoutData({
        requesterName: userProfile?.fullName || "",
        requesterEmail: userProfile?.email || "",
        department: userProfile?.fullName || "",
        office: "Department Office",
        purpose: "",
        fundingSource: "GAA 2026",
        ppmpId: "",
      });
      setIsCheckoutOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await createPrFromCartAction({
        department: checkoutData.department,
        office: checkoutData.office,
        purpose: checkoutData.purpose,
        fundingSource: checkoutData.fundingSource,
        ppmpId: checkoutData.ppmpId ? parseInt(checkoutData.ppmpId) : undefined,
        requestedById: userProfile?.id || undefined,
        requesterName: checkoutData.requesterName || undefined,
        requesterEmail: checkoutData.requesterEmail || undefined,
        items: cart.map((item) => ({
          productId: item.id,
          description: item.name,
          brand: item.brand,
          quantity: item.quantity,
          unit: item.uom,
          estimatedUnitCost: item.estimatedUnitCost,
          specification: item.specifications,
        })),
      });

      if (res.success) {
        saveCart([]);
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        setSuccessMessage(
          `Purchase Request ${res.pr?.prNumber} has been generated successfully! The procurement office has been notified.`
        );
      } else {
        setErrorMessage(res.error || "Failed to generate Purchase Request.");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-slate-950 text-gray-900 dark:text-white font-sans">
      {/* Header */}
      <MarketplaceHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        userProfile={userProfile}
      />

      {/* Hero */}
      <HeroSection />

      {/* Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Quick Access */}
        <QuickAccessSection onOpenCart={() => setIsCartOpen(true)} />

        {/* Section title */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#D4A017] mb-1">
              Explore Catalog
            </p>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              Procurement Catalog
            </h2>
          </div>
        </div>

        {/* Filter Toolbar */}
        <FilterToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          selectedSupplier={selectedSupplier}
          setSelectedSupplier={setSelectedSupplier}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          absoluteMaxPrice={absoluteMaxPrice}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          categories={categories}
          brands={brands}
          suppliers={suppliers}
          resultCount={processedProducts.length}
          onReset={() => {
            setSelectedCategory("");
            setSelectedBrand("");
            setSelectedSupplier("");
            setMaxPrice(absoluteMaxPrice);
            setSearchQuery("");
          }}
        />

        {/* Product Grid / List */}
        {processedProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl py-24 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">
              No matching supplies found in catalog.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your filters or search terms.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedProducts.map((p) => (
              <ProductCard key={p.id} p={p} onAdd={addToCart} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {processedProducts.map((p) => (
              <ProductListItem key={p.id} p={p} onAdd={addToCart} />
            ))}
          </div>
        )}
      </main>

      {/* Footer spacer */}
      <div className="h-16" />

      {/* Cart Drawer */}
      {isCartOpen && (
        <CartDrawer
          cart={cart}
          cartTotal={cartTotal}
          updateQuantity={updateQuantity}
          onClose={() => setIsCartOpen(false)}
          onCheckout={handleCheckoutClick}
          loading={loading}
        />
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          checkoutData={checkoutData}
          setCheckoutData={setCheckoutData}
          ppmpList={ppmpList}
          userProfile={userProfile}
          loading={loading}
          errorMessage={errorMessage}
          onClose={() => setIsCheckoutOpen(false)}
          onSubmit={handlePrSubmit}
        />
      )}

      {/* Success Modal */}
      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage("")}
          onDashboard={() => {
            setSuccessMessage("");
            router.push(
              userProfile?.role === "End User"
                ? "/dashboard/end-user"
                : "/dashboard"
            );
          }}
        />
      )}
    </div>
  );
}
