import { prisma } from "@/lib/prisma";

export interface LandingStats {
  totalProducts: number;
  totalSuppliers: number;
  totalCategories: number;
  monthlyPriceUpdates: number;
}

export interface RecentProduct {
  id: number;
  name: string;
  category: string;
  brand: string;
  estimatedUnitCost: number;
  lowestSupplierPrice: number | null;
  updatedAt: Date;
}

export interface CategoryCount {
  id: number;
  category: string;
  _count: number;
}

/**
 * Fetches aggregate statistics for the landing page.
 * All counts come from real database data — no placeholders.
 */
export async function getLandingStats(): Promise<LandingStats> {
  const [totalProducts, totalSuppliers, totalCategories, monthlyPriceUpdates] =
    await Promise.all([
      prisma.catalogProduct.count({ where: { isActive: true } }),
      prisma.supplier.count(),
      prisma.category.count({ where: { isActive: true } }),
      // Count products updated within the last 30 days as a proxy for "monthly price updates"
      prisma.catalogProduct.count({
        where: {
          isActive: true,
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

  return {
    totalProducts,
    totalSuppliers,
    totalCategories,
    monthlyPriceUpdates,
  };
}

/**
 * Fetches the 8 most recently updated active products.
 * Returns serializable objects (Decimal → number).
 */
export async function getRecentProducts(): Promise<RecentProduct[]> {
  const products = await prisma.catalogProduct.findMany({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
    take: 8,
    select: {
      id: true,
      name: true,
      estimatedUnitCost: true,
      updatedAt: true,
      category: { select: { name: true } },
      brand: { select: { name: true } },
      supplierPrices: {
        where: { available: true },
        select: { unitPrice: true },
        orderBy: { unitPrice: "asc" },
        take: 1,
      },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category.name,
    brand: p.brand?.name ?? "Generic",
    estimatedUnitCost: Number(p.estimatedUnitCost),
    lowestSupplierPrice:
      p.supplierPrices.length > 0 ? Number(p.supplierPrices[0].unitPrice) : null,
    updatedAt: p.updatedAt,
  }));
}

/**
 * Fetches all active categories with their product counts.
 */
export async function getCategoriesWithCounts(): Promise<CategoryCount[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      _count: { select: { products: { where: { isActive: true } } } },
    },
    orderBy: { products: { _count: "desc" } },
  });

  return categories.map((c) => ({
    id: c.id,
    category: c.name,
    _count: c._count.products,
  }));
}
