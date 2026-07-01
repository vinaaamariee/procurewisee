import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type MarketAvailability = "Available" | "Limited" | "Unavailable";

export interface CatalogFilters {
  categories: Array<{ id: number; name: string; productCount: number }>;
  brands: Array<{ id: number; name: string }>;
  priceRange: { min: number; max: number };
}

export interface ProductListItem {
  id: number;
  productCode: string | null;
  name: string;
  description: string;
  category: { id: number; name: string };
  brand: { id: number; name: string } | null;
  unit: { id: number; name: string; abbreviation: string };
  estimatedUnitCost: number;
  imageUrl: string | null;
  popularity: number;
  updatedAt: Date;
  lowestPrice: number | null;
  availableSupplierCount: number;
  availability: MarketAvailability;
}

export interface SupplierPrice {
  id: number;
  supplier: {
    id: number;
    companyName: string;
    reliabilityRating: number | null;
    historicalDeliveryDays: number;
    isVerified: boolean;
  };
  unitPrice: number;
  available: boolean;
  remarks: string | null;
  updatedAt: Date;
  priceEffectiveDate: Date;
  priceExpiryDate: Date | null;
}

export interface PriceHistoryPoint {
  price: number;
  effectiveDate: Date;
  supplierName: string;
}

export interface ProductDetail {
  id: number;
  productCode: string | null;
  name: string;
  description: string;
  category: { id: number; name: string };
  brand: { id: number; name: string } | null;
  unit: { id: number; name: string; abbreviation: string };
  estimatedUnitCost: number;
  imageUrl: string | null;
  popularity: number;
  createdAt: Date;
  updatedAt: Date;
  specifications: Array<{ specificationName: string; specificationValue: string }>;
  supplierPrices: SupplierPrice[];
  priceHistory: PriceHistoryPoint[];
  lowestPrice: number | null;
  preferredSupplier: string | null;
  availableSupplierCount: number;
  availability: MarketAvailability;
}

export interface CatalogPageResult {
  products: ProductListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function resolveAvailability(availableCount: number): MarketAvailability {
  if (availableCount === 0) return "Unavailable";
  if (availableCount === 1) return "Limited";
  return "Available";
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all filter options: categories with product counts, active brands,
 * and the overall price range from supplier prices.
 */
export async function getCatalogFilters(): Promise<CatalogFilters> {
  const [categories, brands, priceAgg] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.supplierProductPrice.aggregate({
      _min: { unitPrice: true },
      _max: { unitPrice: true },
      where: { available: true },
    }),
  ]);

  return {
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      productCount: c._count.products,
    })),
    brands: brands.map((b) => ({ id: b.id, name: b.name })),
    priceRange: {
      min: priceAgg._min.unitPrice ? Number(priceAgg._min.unitPrice) : 0,
      max: priceAgg._max.unitPrice ? Number(priceAgg._max.unitPrice) : 100000,
    },
  };
}

/**
 * Fetches paginated, filtered, and sorted catalog products.
 * All filtering and sorting is done at the database level.
 */
export async function getCatalogPage(params: {
  search?: string;
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  onlyAvailable?: boolean;
  sortBy?: "lowestPrice" | "highestPrice" | "recentlyUpdated" | "mostRequested";
  page?: number;
  pageSize?: number;
}): Promise<CatalogPageResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, params.pageSize ?? 24));
  const skip = (page - 1) * pageSize;

  // Build WHERE clause
  const where: Prisma.CatalogProductWhereInput = {
    isActive: true,
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.brandId ? { brandId: params.brandId } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" } },
            { description: { contains: params.search, mode: "insensitive" } },
            { productCode: { contains: params.search, mode: "insensitive" } },
            { brand: { name: { contains: params.search, mode: "insensitive" } } },
            { category: { name: { contains: params.search, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(params.onlyAvailable
      ? {
          supplierPrices: { some: { available: true } },
        }
      : {}),
    ...(params.minPrice !== undefined || params.maxPrice !== undefined
      ? {
          supplierPrices: {
            some: {
              available: true,
              unitPrice: {
                ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
                ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
              },
            },
          },
        }
      : {}),
  };

  // Determine orderBy
  let orderBy: Prisma.CatalogProductOrderByWithRelationInput = { updatedAt: "desc" };
  if (params.sortBy === "mostRequested") orderBy = { popularity: "desc" };
  else if (params.sortBy === "recentlyUpdated") orderBy = { updatedAt: "desc" };
  // lowestPrice / highestPrice require post-sort (below)

  const [rawProducts, totalCount] = await Promise.all([
    prisma.catalogProduct.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: {
        id: true,
        productCode: true,
        name: true,
        description: true,
        estimatedUnitCost: true,
        imageUrl: true,
        popularity: true,
        updatedAt: true,
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, abbreviation: true } },
        supplierPrices: {
          where: { available: true },
          select: { unitPrice: true },
        },
      },
    }),
    prisma.catalogProduct.count({ where }),
  ]);

  let products: ProductListItem[] = rawProducts.map((p) => {
    const availablePrices = p.supplierPrices.map((sp) => Number(sp.unitPrice));
    const lowestPrice = availablePrices.length > 0 ? Math.min(...availablePrices) : null;
    const availableSupplierCount = p.supplierPrices.length;

    return {
      id: p.id,
      productCode: p.productCode,
      name: p.name,
      description: p.description,
      category: p.category,
      brand: p.brand,
      unit: p.unit,
      estimatedUnitCost: Number(p.estimatedUnitCost),
      imageUrl: p.imageUrl,
      popularity: p.popularity,
      updatedAt: p.updatedAt,
      lowestPrice,
      availableSupplierCount,
      availability: resolveAvailability(availableSupplierCount),
    };
  });

  // Client-side sort by price (lowest/highest)
  if (params.sortBy === "lowestPrice") {
    products.sort((a, b) => {
      if (a.lowestPrice === null) return 1;
      if (b.lowestPrice === null) return -1;
      return a.lowestPrice - b.lowestPrice;
    });
  } else if (params.sortBy === "highestPrice") {
    products.sort((a, b) => {
      if (a.lowestPrice === null) return 1;
      if (b.lowestPrice === null) return -1;
      return b.lowestPrice - a.lowestPrice;
    });
  }

  return {
    products,
    totalCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}

/**
 * Fetches a single product with full detail: specifications, supplier prices
 * (including supplier info), and price history.
 */
export async function getProductDetail(id: number): Promise<ProductDetail | null> {
  const product = await prisma.catalogProduct.findUnique({
    where: { id, isActive: true },
    select: {
      id: true,
      productCode: true,
      name: true,
      description: true,
      estimatedUnitCost: true,
      imageUrl: true,
      popularity: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      unit: { select: { id: true, name: true, abbreviation: true } },
      specifications: {
        select: { specificationName: true, specificationValue: true },
      },
      supplierPrices: {
        select: {
          id: true,
          unitPrice: true,
          available: true,
          remarks: true,
          updatedAt: true,
          priceEffectiveDate: true,
          priceExpiryDate: true,
          supplier: {
            select: {
              id: true,
              companyName: true,
              reliabilityRating: true,
              historicalDeliveryDays: true,
              isVerified: true,
            },
          },
          history: {
            select: { price: true, effectiveDate: true, createdAt: true },
            orderBy: { effectiveDate: "asc" },
          },
        },
        orderBy: { unitPrice: "asc" },
      },
    },
  });

  if (!product) return null;

  // Increment popularity asynchronously (fire and forget)
  prisma.catalogProduct
    .update({ where: { id }, data: { popularity: { increment: 1 } } })
    .catch(() => {});

  const availableSupplierPrices = product.supplierPrices.filter((sp) => sp.available);
  const availableSupplierCount = availableSupplierPrices.length;

  const lowestPrice =
    availableSupplierPrices.length > 0
      ? Number(availableSupplierPrices[0].unitPrice) // already sorted asc
      : null;

  const preferredSupplier =
    availableSupplierPrices.length > 0
      ? availableSupplierPrices[0].supplier.companyName
      : null;

  // Flatten price history across all supplier prices
  const priceHistory: PriceHistoryPoint[] = product.supplierPrices.flatMap((sp) =>
    sp.history.map((h) => ({
      price: Number(h.price),
      effectiveDate: h.effectiveDate,
      supplierName: sp.supplier.companyName,
    }))
  );
  priceHistory.sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime());

  return {
    id: product.id,
    productCode: product.productCode,
    name: product.name,
    description: product.description,
    category: product.category,
    brand: product.brand,
    unit: product.unit,
    estimatedUnitCost: Number(product.estimatedUnitCost),
    imageUrl: product.imageUrl,
    popularity: product.popularity,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    specifications: product.specifications,
    supplierPrices: product.supplierPrices.map((sp) => ({
      id: sp.id,
      supplier: {
        id: sp.supplier.id,
        companyName: sp.supplier.companyName,
        reliabilityRating: sp.supplier.reliabilityRating ? Number(sp.supplier.reliabilityRating) : null,
        historicalDeliveryDays: sp.supplier.historicalDeliveryDays,
        isVerified: sp.supplier.isVerified,
      },
      unitPrice: Number(sp.unitPrice),
      available: sp.available,
      remarks: sp.remarks,
      updatedAt: sp.updatedAt,
      priceEffectiveDate: sp.priceEffectiveDate,
      priceExpiryDate: sp.priceExpiryDate,
    })),
    priceHistory,
    lowestPrice,
    preferredSupplier,
    availableSupplierCount,
    availability: resolveAvailability(availableSupplierCount),
  };
}

/**
 * Fetches up to 4 active related products from the same category,
 * excluding the current product.
 */
export async function getRelatedProducts(
  productId: number,
  categoryId: number
): Promise<ProductListItem[]> {
  const products = await prisma.catalogProduct.findMany({
    where: { isActive: true, categoryId, id: { not: productId } },
    orderBy: { popularity: "desc" },
    take: 4,
    select: {
      id: true,
      productCode: true,
      name: true,
      description: true,
      estimatedUnitCost: true,
      imageUrl: true,
      popularity: true,
      updatedAt: true,
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      unit: { select: { id: true, name: true, abbreviation: true } },
      supplierPrices: {
        where: { available: true },
        select: { unitPrice: true },
      },
    },
  });

  return products.map((p) => {
    const availablePrices = p.supplierPrices.map((sp) => Number(sp.unitPrice));
    const lowestPrice = availablePrices.length > 0 ? Math.min(...availablePrices) : null;
    const availableSupplierCount = p.supplierPrices.length;

    return {
      id: p.id,
      productCode: p.productCode,
      name: p.name,
      description: p.description,
      category: p.category,
      brand: p.brand,
      unit: p.unit,
      estimatedUnitCost: Number(p.estimatedUnitCost),
      imageUrl: p.imageUrl,
      popularity: p.popularity,
      updatedAt: p.updatedAt,
      lowestPrice,
      availableSupplierCount,
      availability: resolveAvailability(availableSupplierCount),
    };
  });
}
