"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { submitRequisitionAction } from "../actions/requisitions";

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  description: string;
  unitOfMeasure: string;
  estimatedUnitCost: number;
  isActive: boolean;
}

interface CartItem {
  id: number;
  name: string;
  estimatedUnitCost: number;
  uom: string;
  quantity: number;
}

interface EndUserClientProps {
  products: Product[];
}

export default function EndUserClient({ products }: EndUserClientProps) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", department: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("procurewise_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart storage", e);
      }
    }
  }, []);

  // Handle deep-linked product prefill
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const productParam = urlParams.get("product");
      if (productParam) {
        const pId = parseInt(productParam, 10);
        const targetProd = products.find(p => p.id === pId);
        if (targetProd && targetProd.isActive) {
          const existing = cart.find(item => item.id === targetProd.id);
          if (!existing) {
            const newCart = [...cart, {
              id: targetProd.id,
              name: targetProd.name,
              estimatedUnitCost: targetProd.estimatedUnitCost,
              uom: targetProd.unitOfMeasure,
              quantity: 1
            }];
            saveCart(newCart);
          }
          setIsCheckoutOpen(true);
        }
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, [products, cart]);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("procurewise_cart", JSON.stringify(newCart));
  };

  // Unique categories for filtering
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const addToCart = (product: Product) => {
    if (!product.isActive) return;
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      saveCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      saveCart([...cart, {
        id: product.id,
        name: product.name,
        estimatedUnitCost: product.estimatedUnitCost,
        uom: product.unitOfMeasure,
        quantity: 1
      }]);
    }
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

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await submitRequisitionAction({
        requesterName: formData.name,
        requesterEmail: formData.email,
        department: formData.department,
        items: cart.map(item => ({
          productName: item.name,
          quantity: item.quantity,
          estimatedUnitPrice: item.estimatedUnitCost,
        }))
      });

      if (response.success && response.secureToken) {
        localStorage.removeItem("procurewise_cart");
        saveCart([]);
        setIsCheckoutOpen(false);
        router.push(`/track/${response.secureToken}`);
      } else {
        setErrorMessage(response.message || "Failed to submit requisition.");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.estimatedUnitCost * item.quantity), 0);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] flex flex-col">
      {/* Header Banner */}
      <header className="sticky top-0 z-50 bg-[#FAF9F6] border-b-2 border-[#ca8a04]/25 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-tr from-[#7e191b] to-[#ca8a04] flex items-center justify-center text-white font-black text-sm">
              PW
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#7e191b] tracking-tight">PROCUREWISE</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Batanes State College • Internal Procurement</p>
            </div>
          </div>
          <div className="bg-[#ca8a04]/10 border border-[#ca8a04]/30 rounded-full px-4 py-1.5 text-xs text-[#ca8a04] font-bold">
            Frictionless Requisition Client
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        {/* Catalog */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[#7e191b]">Office Supplies Catalog</h2>
              <p className="text-sm text-gray-500">Request supplies for your department. No login required.</p>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search supplies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#ca8a04] bg-white transition w-full md:w-48"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#ca8a04] bg-white transition cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Catalog Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center text-gray-400 bg-white border border-[#E7E5E0] rounded-xl shadow-sm">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">No matching supplies found in catalog.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className={`bg-white border border-[#E7E5E0] rounded-xl p-5 shadow-sm transition hover:shadow-md flex flex-col justify-between ${!product.isActive ? 'opacity-60 bg-gray-50/50' : ''}`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-[#ca8a04] bg-[#ca8a04]/10 rounded px-2 py-0.5 uppercase">
                        {product.category}
                      </span>
                      {!product.isActive && (
                        <span className="text-[9px] font-black text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5 uppercase tracking-wide">
                          Currently Unavailable
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-gray-900 leading-snug">{product.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                      <span className="text-lg font-black text-gray-900">₱{product.estimatedUnitCost.toFixed(2)}</span>
                      <span className="text-[10px] text-gray-500 ml-1">/ {product.unitOfMeasure}</span>
                    </div>
                    <button
                      disabled={!product.isActive}
                      onClick={() => addToCart(product)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        product.isActive 
                          ? 'bg-[#7e191b] hover:bg-[#962124] text-white' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Add to Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar Cart */}
        <section className="bg-white border border-[#E7E5E0] rounded-xl p-6 shadow-sm h-fit sticky top-24 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 border-b pb-4 flex justify-between items-center">
              <span>Request Requisition</span>
              <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 font-bold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </h2>

            {cart.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-xs">Your requisition cart is empty.</p>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-gray-100 max-h-[350px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                    <div className="flex-1 pr-3">
                      <p className="font-bold text-gray-900 leading-tight">{item.name}</p>
                      <p className="text-gray-500 mt-0.5">₱{item.estimatedUnitCost.toFixed(2)} • per {item.uom}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)} 
                        className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-50 text-gray-600 font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)} 
                        className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-50 text-gray-600 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t pt-4 mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-semibold uppercase">Total Est. Value</span>
                <span className="text-xl font-black text-[#7e191b]">₱{cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full bg-[#7e191b] hover:bg-[#962124] text-white py-2.5 rounded-lg font-bold text-xs transition uppercase tracking-wider"
              >
                Proceed to Request Submission
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7E5E0] rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-[#7e191b] mb-1">Department Requisition</h3>
            <p className="text-xs text-gray-500 mb-6 font-medium">Please specify the routing credentials below.</p>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-xs mb-4 font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Requester Full Name</label>
                <input 
                  type="text" required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs outline-none focus:border-[#ca8a04] bg-[#FAF9F6] transition"
                  placeholder="E.g., Dr. Juan Dela Cruz"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Requesting Unit/Department</label>
                <input 
                  type="text" required 
                  value={formData.department} 
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs outline-none focus:border-[#ca8a04] bg-[#FAF9F6] transition"
                  placeholder="E.g., College of Arts and Sciences"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">BSC Institutional Email</label>
                <input 
                  type="email" required 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs outline-none focus:border-[#ca8a04] bg-[#FAF9F6] transition"
                  placeholder="E.g., juandelacruz@bsc.edu.ph"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-[11px] leading-relaxed text-[#ca8a04]">
                <strong>BSC Budget Control Policy:</strong> Requisitions are immediately routed and checked against department annual allocations. A secure tracking token is provided upon submission.
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-lg text-xs font-bold transition uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#7e191b] hover:bg-[#962124] text-white py-2.5 rounded-lg text-xs font-bold transition uppercase tracking-wider flex items-center justify-center"
                >
                  {loading ? "Filing PR..." : "Submit Requisition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
