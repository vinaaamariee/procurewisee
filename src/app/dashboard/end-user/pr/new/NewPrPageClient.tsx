"use client";

import { useEffect, useState } from "react";
import PRDocument from "@/components/pr/PRDocument";
import type { PRItemRow } from "@/components/pr/PRItemsTable";

interface CatalogProduct {
  id: number;
  sku: string;
  name: string;
  category: string;
  description: string;
  unitOfMeasure: string;
}

interface PpmpOption {
  id: number;
  ppmpNumber: string;
  projectTitle: string;
  estimatedBudget: number;
  status: string;
}

interface CartItem {
  product: {
    id: number;
    name: string;
    unit: { abbreviation: string };
    category: { name: string };
    description: string;
  };
  quantity: number;
  estimatedUnitCost: number;
}

interface NewPrPageClientProps {
  catalogProducts: CatalogProduct[];
  ppmps: PpmpOption[];
}

export default function NewPrPageClient({ catalogProducts, ppmps }: NewPrPageClientProps) {
  const [initialItems, setInitialItems] = useState<PRItemRow[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pw_pr_items");
      if (stored) {
        const cartItems: CartItem[] = JSON.parse(stored);
        if (cartItems.length > 0) {
          const items: PRItemRow[] = cartItems.map((cartItem, index) => ({
            id: `catalog-${cartItem.product.id}-${Date.now()}-${index}`,
            stockNo: String(index + 1).padStart(3, "0"),
            unit: cartItem.product.unit.abbreviation,
            description: `${cartItem.product.name} - ${cartItem.product.description}`,
            quantity: cartItem.quantity,
            estimatedUnitCost: cartItem.estimatedUnitCost,
            estimatedCost: cartItem.quantity * cartItem.estimatedUnitCost,
            productId: cartItem.product.id,
            specification: cartItem.product.description,
          }));
          setInitialItems(items);
        }
        localStorage.removeItem("pw_pr_items");
      }
    } catch (e) {
      console.warn("Failed to load cart items from localStorage:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <span className="text-xs font-bold text-base-content/60 uppercase tracking-widest">
            Loading Purchase Request...
          </span>
        </div>
      </div>
    );
  }

  return (
    <PRDocument
      mode="create"
      catalogProducts={catalogProducts}
      initialData={initialItems ? { items: initialItems } : undefined}
    />
  );
}
