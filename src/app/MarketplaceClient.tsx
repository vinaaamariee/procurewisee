"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPrFromCartAction } from "./actions/pr";
import { getPpmpList } from "./actions/ppmp";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShoppingCart, Grid, List, Search, SlidersHorizontal, LogIn, LayoutDashboard, ChevronRight, X, Minus, Plus } from "lucide-react";

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

export default function MarketplaceClient({ products, suppliers, userProfile }: MarketplaceClientProps) {
  const router = useRouter();
  
  // State variables
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [sortBy, setSortBy] = useState("popularity");
  
  // PR Generation State
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

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("procurewise_cart");
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("procurewise_cart", JSON.stringify(newCart));
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      saveCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      saveCart([...cart, {
        id: product.id,
        name: product.name,
        estimatedUnitCost: product.estimatedUnitCost,
        uom: product.unitOfMeasure,
        quantity: 1,
        brand: product.brand,
        specifications: product.technicalSpecifications,
      }]);
    }
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      saveCart(cart.filter(i => i.id !== id));
    } else {
      saveCart(cart.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    }
  };

  // Derive filter options
  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);
  const brands = useMemo(() => Array.from(new Set(products.map(p => p.brand))), [products]);
  
  // Get max cost for price filter
  const absoluteMaxPrice = useMemo(() => {
    const costs = products.map(p => p.estimatedUnitCost);
    return costs.length > 0 ? Math.max(...costs) : 100000;
  }, [products]);

  useEffect(() => {
    setMaxPrice(absoluteMaxPrice);
  }, [absoluteMaxPrice]);

  // Filter & Sort Logic
  const processedProducts = useMemo(() => {
    let result = products.filter(p => {
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

    if (sortBy === "popularity") {
      result.sort((a, b) => b.popularity - a.popularity);
    } else if (sortBy === "priceAsc") {
      result.sort((a, b) => a.estimatedUnitCost - b.estimatedUnitCost);
    } else if (sortBy === "priceDesc") {
      result.sort((a, b) => b.estimatedUnitCost - a.estimatedUnitCost);
    } else if (sortBy === "newest") {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedSupplier, maxPrice, sortBy]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.estimatedUnitCost * item.quantity), 0);

  const handleCheckoutClick = async () => {
    if (userProfile && userProfile.role !== "End User") {
      alert(`Role Restrictions: You are logged in as a ${userProfile.role}. Only End Users can submit Purchase Requests.`);
      return;
    }

    // Load user's approved PPMPs if logged in
    setLoading(true);
    try {
      if (userProfile) {
        const ppmps = await getPpmpList({ department: userProfile.fullName, status: "Approved" });
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
        items: cart.map(item => ({
          productId: item.id,
          description: item.name,
          brand: item.brand,
          quantity: item.quantity,
          unit: item.uom,
          estimatedUnitCost: item.estimatedUnitCost,
          specification: item.specifications,
        }))
      });

      if (res.success) {
        saveCart([]);
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        setSuccessMessage(`Purchase Request ${res.pr?.prNumber} has been generated successfully! The procurement office has been notified.`);
      } else {
        setErrorMessage(res.error || "Failed to generate Purchase Request.");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#070b13] text-[#1f2937] dark:text-[#f3f4f6] font-sans">
      
      {/* ── Main Header ── */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#7e191b] to-[#ca8a04] flex items-center justify-center text-white font-black text-lg shadow-md Shimmer">
              PW
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#7e191b] dark:text-white tracking-tight leading-tight">PROCUREWISE</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Batanes State College Procurement Portal</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-lg relative hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search catalog items, brands, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF9F6] dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-full py-2 pl-10 pr-4 text-xs outline-none focus:border-[#ca8a04] focus:ring-1 focus:ring-[#ca8a04] transition"
            />
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {/* Cart trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#ca8a04] text-white text-[9px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {userProfile ? (
              <a
                href={
                  userProfile.role === "Supplier"
                    ? "/unauthorized"
                    : userProfile.role === "Administrative Approver"
                    ? "/dashboard/approver"
                    : userProfile.role === "Procurement Officer"
                    ? "/dashboard/officer"
                    : "/dashboard/end-user"
                }
                className="flex items-center gap-2 bg-[#7e191b] hover:bg-[#962124] text-white px-4 py-2 rounded-full text-xs font-bold transition shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </a>
            ) : (
              <a
                href="/login"
                className="flex items-center gap-2 bg-[#ca8a04] hover:bg-[#d4960d] text-white px-4 py-2 rounded-full text-xs font-bold transition shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── Marketplace Body ── */}
      <main className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filter Panel */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
              <h2 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#ca8a04]" />
                <span>Filters</span>
              </h2>
              <button 
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedBrand("");
                  setSelectedSupplier("");
                  setMaxPrice(absoluteMaxPrice);
                  setSearchQuery("");
                }}
                className="text-[10px] text-gray-500 hover:text-[#ca8a04] font-bold uppercase transition"
              >
                Reset All
              </button>
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#FAF9F6] dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-2.5 text-xs outline-none focus:border-[#ca8a04] transition cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Brand Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-[#FAF9F6] dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-2.5 text-xs outline-none focus:border-[#ca8a04] transition cursor-pointer"
              >
                <option value="">All Brands</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Supplier Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preferred Supplier</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full bg-[#FAF9F6] dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-2.5 text-xs outline-none focus:border-[#ca8a04] transition cursor-pointer"
              >
                <option value="">All Suppliers</option>
                {suppliers.map(s => <option key={s.id} value={s.companyName}>{s.companyName}</option>)}
              </select>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Max Price</label>
                <span className="text-xs font-bold text-[#ca8a04]">₱{maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max={absoluteMaxPrice}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ca8a04]"
              />
            </div>
          </div>
        </aside>

        {/* Catalog Items Listing */}
        <section className="flex-1 space-y-6">
          
          {/* Top sorting & toggles */}
          <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
            <span className="text-xs text-gray-500 font-semibold">{processedProducts.length} items available</span>
            
            <div className="flex items-center gap-4">
              
              {/* Sort by */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider hidden sm:block">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#FAF9F6] dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-2 text-xs outline-none focus:border-[#ca8a04] cursor-pointer"
                >
                  <option value="popularity">Popularity</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="newest">Newest Added</option>
                </select>
              </div>

              {/* Grid / List toggle */}
              <div className="flex bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition ${viewMode === "grid" ? "bg-white dark:bg-slate-800 text-[#ca8a04]" : "text-gray-400"}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition ${viewMode === "list" ? "bg-white dark:bg-slate-800 text-[#ca8a04]" : "text-gray-400"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Catalog grid display */}
          {processedProducts.length === 0 ? (
            <div className="py-24 text-center text-gray-400 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No matching supplies found in catalog.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedProducts.map((p) => (
                <div key={p.id} className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between relative group overflow-hidden">
                  
                  {/* Decorative Border */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7e191b] to-[#ca8a04] opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-extrabold text-[#ca8a04] bg-[#ca8a04]/10 rounded-full px-2.5 py-0.5 uppercase tracking-wide">
                        {p.category}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400">SKU: {p.sku}</span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base leading-snug group-hover:text-[#7e191b] transition">{p.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Brand: {p.brand}</p>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-3">{p.description}</p>

                    {p.technicalSpecifications && (
                      <div className="bg-[#FAF9F6] dark:bg-slate-900/50 rounded-xl p-3 border border-gray-100 dark:border-slate-800 text-[11px] text-gray-500">
                        <strong className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Specifications:</strong>
                        {p.technicalSpecifications}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 border-t border-gray-100 dark:border-slate-800 pt-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-400 block font-semibold uppercase">Est. Price</span>
                        <span className="text-lg font-black text-gray-900 dark:text-white">₱{p.estimatedUnitCost.toFixed(2)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block font-semibold uppercase">UOM</span>
                        <span className="text-sm font-extrabold text-[#ca8a04]">{p.unitOfMeasure}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-gray-500 font-medium">
                      Preferred Supplier: <strong className="text-gray-800 dark:text-slate-200">{p.preferredSupplier}</strong>
                    </div>

                    <button
                      onClick={() => addToCart(p)}
                      className="w-full bg-[#7e191b] hover:bg-[#962124] text-white py-2 rounded-xl text-xs font-bold transition shadow-sm uppercase tracking-wider mt-1"
                    >
                      Add to Requisition
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {processedProducts.map((p) => (
                <div key={p.id} className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col md:flex-row justify-between gap-6 relative group">
                  
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#7e191b] to-[#ca8a04] opacity-0 group-hover:opacity-100 transition-opacity rounded-l-2xl" />

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-extrabold text-[#ca8a04] bg-[#ca8a04]/10 rounded-full px-2.5 py-0.5 uppercase tracking-wide">
                        {p.category}
                      </span>
                      <span className="text-xs text-gray-400 font-bold">SKU: {p.sku}</span>
                    </div>

                    <h3 className="font-extrabold text-lg text-gray-900 dark:text-white leading-tight">{p.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Brand: {p.brand} • Preferred Supplier: {p.preferredSupplier}</p>
                    <p className="text-xs text-gray-500 max-w-2xl">{p.description}</p>
                    {p.technicalSpecifications && (
                      <p className="text-[11px] text-gray-400"><strong className="text-[9px] uppercase tracking-wider">Specs:</strong> {p.technicalSpecifications}</p>
                    )}
                  </div>

                  <div className="md:w-48 shrink-0 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-gray-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                    <div className="text-right space-y-1">
                      <span className="text-xs text-gray-400 block font-semibold uppercase">Est. Price</span>
                      <span className="text-xl font-black text-[#7e191b] dark:text-white">₱{p.estimatedUnitCost.toFixed(2)}</span>
                      <span className="text-xs text-gray-400 block">per {p.unitOfMeasure}</span>
                    </div>

                    <button
                      onClick={() => addToCart(p)}
                      className="w-full bg-[#7e191b] hover:bg-[#962124] text-white py-2 rounded-xl text-xs font-bold transition shadow-sm uppercase tracking-wider mt-4"
                    >
                      Add to Requisition
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── Slide-out Cart Drawer ── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
          
          {/* Drawer content */}
          <div className="relative w-full max-w-md bg-white dark:bg-[#0f172a] h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2.5">
                <ShoppingCart className="w-5 h-5 text-[#ca8a04]" />
                <span>Requisition Cart</span>
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 divide-y divide-gray-100 dark:divide-slate-800">
              {cart.length === 0 ? (
                <div className="py-24 text-center text-gray-400 space-y-4">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-xs">Your requisition cart is empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="py-4 flex justify-between items-center gap-4 text-xs">
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-gray-900 dark:text-white leading-snug">{item.name}</p>
                      <p className="text-gray-400 text-[10px] uppercase font-bold mt-0.5">Brand: {item.brand}</p>
                      <p className="text-[#ca8a04] font-semibold mt-1">₱{item.estimatedUnitCost.toFixed(2)} / {item.uom}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)} 
                        className="w-7 h-7 rounded-lg border border-gray-300 dark:border-slate-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)} 
                        className="w-7 h-7 rounded-lg border border-gray-300 dark:border-slate-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Est. Value</span>
                  <span className="text-2xl font-black text-[#7e191b] dark:text-white">₱{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                <button
                  onClick={handleCheckoutClick}
                  className="w-full bg-[#7e191b] hover:bg-[#962124] text-white py-3 rounded-xl font-bold text-xs transition uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Generate Purchase Request</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Success Banner ── */}
      {successMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-lg font-black text-green-700 dark:text-green-400">Requisition Submitted!</h3>
            <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage("")}
              className="bg-[#7e191b] hover:bg-[#962124] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition uppercase tracking-wider"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* ── Checkout / PR Modal ── */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-black text-[#7e191b] dark:text-white tracking-tight">Generate Purchase Request</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  {userProfile ? "Submit your cart items for formal procurement processing." : "No login required. Fill in your details to submit a requisition."}
                </p>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs mb-4 font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handlePrSubmit} className="space-y-4 text-xs">
              {/* Requester Identity — shown for guests, pre-filled for logged-in users */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Requester Full Name</label>
                  <input 
                    type="text" required 
                    value={checkoutData.requesterName} 
                    onChange={(e) => setCheckoutData({...checkoutData, requesterName: e.target.value})}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-[#ca8a04] bg-[#FAF9F6] dark:bg-slate-900 transition"
                    placeholder="E.g., Dr. Juan Dela Cruz"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                  <input 
                    type="email" required 
                    value={checkoutData.requesterEmail} 
                    onChange={(e) => setCheckoutData({...checkoutData, requesterEmail: e.target.value})}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-[#ca8a04] bg-[#FAF9F6] dark:bg-slate-900 transition"
                    placeholder="E.g., juan@bsc.edu.ph"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Requisition Unit / Dept</label>
                  <input 
                    type="text" required 
                    value={checkoutData.department} 
                    onChange={(e) => setCheckoutData({...checkoutData, department: e.target.value})}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-[#ca8a04] bg-[#FAF9F6] dark:bg-slate-900 transition"
                    placeholder="E.g., ICT Department"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Office / Division</label>
                  <input 
                    type="text" required 
                    value={checkoutData.office} 
                    onChange={(e) => setCheckoutData({...checkoutData, office: e.target.value})}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-[#ca8a04] bg-[#FAF9F6] dark:bg-slate-900 transition"
                    placeholder="E.g., ICTO"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Funding Source</label>
                  <input 
                    type="text" required 
                    value={checkoutData.fundingSource} 
                    onChange={(e) => setCheckoutData({...checkoutData, fundingSource: e.target.value})}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-[#ca8a04] bg-[#FAF9F6] dark:bg-slate-900 transition"
                    placeholder="E.g., GAA 2026"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Link to Approved PPMP</label>
                  <select
                    value={checkoutData.ppmpId}
                    onChange={(e) => setCheckoutData({...checkoutData, ppmpId: e.target.value})}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-[#ca8a04] bg-[#FAF9F6] dark:bg-slate-900 transition cursor-pointer"
                  >
                    <option value="">Select PPMP Plan (Optional)</option>
                    {ppmpList.map(ppmp => (
                      <option key={ppmp.id} value={ppmp.id}>{ppmp.ppmpNumber} - {ppmp.projectTitle}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Purpose of Requisition</label>
                <textarea 
                  required 
                  value={checkoutData.purpose} 
                  onChange={(e) => setCheckoutData({...checkoutData, purpose: e.target.value})}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-[#ca8a04] bg-[#FAF9F6] dark:bg-slate-900 transition"
                  placeholder="Specify details, urgency, and destination..."
                  rows={3}
                />
              </div>

              <div className="bg-[#ca8a04]/10 border border-[#ca8a04]/30 rounded-xl p-4 text-[11px] leading-relaxed text-[#ca8a04] font-medium">
                <strong>Budget Check Policy:</strong> Generates a Purchase Request Draft and allocates estimates against department budget allocations automatically. Revisions are logged asynchronously.
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1 bg-gray-100 dark:bg-slate-850 hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 py-2.5 rounded-xl font-bold transition uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#7e191b] hover:bg-[#962124] text-white py-2.5 rounded-xl font-bold transition uppercase tracking-wider flex items-center justify-center"
                >
                  {loading ? "Generating..." : "Submit Purchase Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
