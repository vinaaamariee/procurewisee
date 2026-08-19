"use client";

import { useState, useMemo } from "react";
import { Search, Package, Filter, ShoppingCart, Plus, Minus, Trash2, X, Eye } from "lucide-react";
import Link from "next/link";

interface ProductSpec {
  name: string;
  value: string;
}

interface CatalogProduct {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: { id: number; name: string };
  brand: { id: number; name: string } | null;
  unit: { id: number; name: string; abbreviation: string };
  imageUrl: string | null;
  specifications: ProductSpec[];
  remarks: string | null;
}

interface CartItem {
  product: CatalogProduct;
  quantity: number;
  estimatedUnitCost: number;
}

interface EndUserCatalogClientProps {
  products: CatalogProduct[];
  categories: { id: number; name: string }[];
}

export default function EndUserCatalogClient({ products, categories }: EndUserCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [detailProduct, setDetailProduct] = useState<CatalogProduct | null>(null);
  const [addCostDialog, setAddCostDialog] = useState<CatalogProduct | null>(null);
  const [addQty, setAddQty] = useState(1);
  const [addCost, setAddCost] = useState(0);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryId === "" || p.category.id === selectedCategoryId;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategoryId]);

  const addToCart = (product: CatalogProduct) => {
    setAddQty(1);
    setAddCost(0);
    setAddCostDialog(product);
  };

  const confirmAddToCart = () => {
    if (!addCostDialog) return;
    const existing = cart.find((c) => c.product.id === addCostDialog.id);
    if (existing) {
      setCart(cart.map((c) =>
        c.product.id === addCostDialog.id
          ? { ...c, quantity: c.quantity + addQty, estimatedUnitCost: addCost || c.estimatedUnitCost }
          : c
      ));
    } else {
      setCart([...cart, { product: addCostDialog, quantity: addQty, estimatedUnitCost: addCost }]);
    }
    setAddCostDialog(null);
  };

  const updateCartQty = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((c) => c.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.estimatedUnitCost, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Search by name, SKU, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-base-300 bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : "")}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-base-300 bg-base-100 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none min-w-[180px]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition"
        >
          <ShoppingCart className="h-4 w-4" />
          PR Items
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-base-100 rounded-2xl border border-base-300">
          <Package className="h-12 w-12 mx-auto text-base-content/20 mb-3" />
          <p className="text-sm font-medium text-base-content/60">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-base-100 border border-base-300 rounded-2xl p-5 hover:shadow-md transition-all duration-200 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase">
                  {product.category.name}
                </span>
                {product.sku && (
                  <span className="text-[10px] font-mono text-base-content/50">{product.sku}</span>
                )}
              </div>

              <h3 className="font-bold text-sm text-base-content leading-snug mb-1">{product.name}</h3>
              {product.brand && (
                <p className="text-[11px] text-base-content/50 mb-2">{product.brand.name}</p>
              )}
              <p className="text-xs text-base-content/60 line-clamp-2 mb-4 leading-relaxed">{product.description}</p>

              <div className="mt-auto pt-3 border-t border-base-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-base-content/70">
                  Unit: {product.unit.abbreviation}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDetailProduct(product)}
                    className="p-1.5 rounded-lg border border-base-300 text-base-content/60 hover:bg-base-200 transition"
                    title="View Details"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => addToCart(product)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold hover:opacity-90 transition"
                  >
                    <Plus className="h-3 w-3" />
                    Add to PR
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add to Cart Dialog */}
      {addCostDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-base-100 border border-base-300 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-base-content">Add to Purchase Request</h3>
              <button onClick={() => setAddCostDialog(null)} className="p-1 rounded-lg hover:bg-base-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-base-200 border border-base-300">
                <p className="font-bold text-sm text-base-content">{addCostDialog.name}</p>
                <p className="text-xs text-base-content/60 mt-1">{addCostDialog.description}</p>
                <p className="text-[11px] text-base-content/50 mt-2">
                  {addCostDialog.category.name} &bull; Unit: {addCostDialog.unit.abbreviation}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-base-content/60 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={addQty}
                    onChange={(e) => setAddQty(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-base-300 bg-base-100 p-2.5 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-base-content/60 mb-1">Est. Unit Cost (₱)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={addCost}
                    onChange={(e) => setAddCost(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-base-300 bg-base-100 p-2.5 text-sm font-bold"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setAddCostDialog(null)}
                  className="flex-1 py-2.5 rounded-xl border border-base-300 text-sm font-bold text-base-content hover:bg-base-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddToCart}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Dialog */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-base-100 border border-base-300 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-base-content">{detailProduct.name}</h3>
              <button onClick={() => setDetailProduct(null)} className="p-1 rounded-lg hover:bg-base-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-bold text-base-content/60 uppercase text-[10px]">SKU</span>
                  <p className="font-mono font-bold text-base-content">{detailProduct.sku || "—"}</p>
                </div>
                <div>
                  <span className="font-bold text-base-content/60 uppercase text-[10px]">Category</span>
                  <p className="font-bold text-base-content">{detailProduct.category.name}</p>
                </div>
                <div>
                  <span className="font-bold text-base-content/60 uppercase text-[10px]">Brand</span>
                  <p className="font-bold text-base-content">{detailProduct.brand?.name || "—"}</p>
                </div>
                <div>
                  <span className="font-bold text-base-content/60 uppercase text-[10px]">Unit</span>
                  <p className="font-bold text-base-content">{detailProduct.unit.name} ({detailProduct.unit.abbreviation})</p>
                </div>
              </div>
              <div>
                <span className="font-bold text-base-content/60 uppercase text-[10px]">Description</span>
                <p className="text-sm text-base-content mt-1 leading-relaxed">{detailProduct.description}</p>
              </div>
              {detailProduct.specifications.length > 0 && (
                <div>
                  <span className="font-bold text-base-content/60 uppercase text-[10px]">Specifications</span>
                  <div className="mt-1 space-y-1">
                    {detailProduct.specifications.map((spec, i) => (
                      <div key={i} className="flex justify-between text-xs p-2 rounded-lg bg-base-200">
                        <span className="font-medium text-base-content/70">{spec.name}</span>
                        <span className="font-bold text-base-content">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {detailProduct.remarks && (
                <div>
                  <span className="font-bold text-base-content/60 uppercase text-[10px]">Remarks</span>
                  <p className="text-xs text-base-content/70 mt-1">{detailProduct.remarks}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setDetailProduct(null); addToCart(detailProduct); }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add to Purchase Request
              </button>
              <button
                onClick={() => setDetailProduct(null)}
                className="py-2.5 px-5 rounded-xl border border-base-300 text-sm font-bold text-base-content hover:bg-base-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="bg-base-100 w-full max-w-md h-full shadow-2xl flex flex-col">
            <div className="p-5 border-b border-base-300 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-base-content">Purchase Request Items</h3>
                <p className="text-xs text-base-content/60">{cart.length} product(s), {cartCount} total items</p>
              </div>
              <button onClick={() => setShowCart(false)} className="p-2 rounded-xl hover:bg-base-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="h-10 w-10 mx-auto text-base-content/20 mb-3" />
                  <p className="text-sm text-base-content/60">No items added yet.</p>
                  <p className="text-xs text-base-content/40 mt-1">Browse the catalog and add products.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="p-4 rounded-xl border border-base-300 bg-base-200/50 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-base-content truncate">{item.product.name}</p>
                        <p className="text-[11px] text-base-content/50">{item.product.unit.abbreviation}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 rounded-lg text-error/70 hover:bg-error/10 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 border border-base-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateCartQty(item.product.id, -1)}
                          className="px-2 py-1 hover:bg-base-300 transition text-xs font-bold"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 py-1 text-xs font-bold min-w-[2rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.product.id, 1)}
                          className="px-2 py-1 hover:bg-base-300 transition text-xs font-bold"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.estimatedUnitCost}
                          onChange={(e) => {
                            const cost = parseFloat(e.target.value) || 0;
                            setCart((prev) =>
                              prev.map((c) =>
                                c.product.id === item.product.id ? { ...c, estimatedUnitCost: cost } : c
                              )
                            );
                          }}
                          className="w-full rounded-lg border border-base-300 bg-base-100 p-1.5 text-xs font-bold text-right"
                          placeholder="Unit cost (₱)"
                        />
                      </div>
                      <span className="text-xs font-bold text-base-content min-w-[80px] text-right">
                        ₱{(item.quantity * item.estimatedUnitCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-base-300 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-base-content/60">Estimated Total</span>
                  <span className="text-lg font-extrabold text-primary">
                    ₱{cartTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Link
                  href="/dashboard/end-user/pr/new"
                  onClick={() => {
                    // Store cart items in localStorage for the PR page to pick up
                    localStorage.setItem("pw_pr_items", JSON.stringify(cart));
                    setShowCart(false);
                  }}
                  className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  Create Purchase Request with These Items
                </Link>
                <button
                  onClick={() => setCart([])}
                  className="w-full py-2 rounded-xl border border-base-300 text-sm font-bold text-base-content/60 hover:bg-base-200 transition"
                >
                  Clear All Items
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
