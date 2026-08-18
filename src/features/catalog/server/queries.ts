import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";


// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface CatalogFilters {
  categories: Array<{ id: number; name: string; productCount: number }>;
  brands: Array<{ id: number; name: string }>;
}

export interface ProductListItem {
  id: number;
  productCode: string | null;
  name: string;
  description: string;
  category: { id: number; name: string };
  brand: { id: number; name: string } | null;
  unit: { id: number; name: string; abbreviation: string };
  imageUrl: string | null;
  popularity: number;
  updatedAt: Date;
  remarks: string | null;
}

export interface ProductDetail {
  id: number;
  productCode: string | null;
  name: string;
  description: string;
  category: { id: number; name: string };
  brand: { id: number; name: string } | null;
  unit: { id: number; name: string; abbreviation: string };
  imageUrl: string | null;
  popularity: number;
  createdAt: Date;
  updatedAt: Date;
  remarks: string | null;
  specifications: Array<{ specificationName: string; specificationValue: string }>;
}

export interface CatalogPageResult {
  products: ProductListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all filter options: categories with product counts and active brands.
 */
export async function getCatalogFilters(): Promise<CatalogFilters> {
  const [categories, brands] = await Promise.all([
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
  ]);

  return {
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      productCount: c._count.products,
    })),
    brands: brands.map((b) => ({ id: b.id, name: b.name })),
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
  sortBy?: "recentlyUpdated" | "mostRequested" | "recentlyAdded";
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
  };

  // Determine orderBy
  let orderBy: Prisma.CatalogProductOrderByWithRelationInput = { updatedAt: "desc" };
  if (params.sortBy === "mostRequested") orderBy = { popularity: "desc" };
  else if (params.sortBy === "recentlyUpdated") orderBy = { updatedAt: "desc" };
  else if (params.sortBy === "recentlyAdded") orderBy = { createdAt: "desc" };

  const [products, totalCount] = await Promise.all([
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
        imageUrl: true,
        popularity: true,
        updatedAt: true,
        remarks: true,
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, abbreviation: true } },
      },
    }),
    prisma.catalogProduct.count({ where }),
  ]);

  return {
    products: products.map((p) => ({
      id: p.id,
      productCode: p.productCode,
      name: p.name,
      description: p.description,
      category: p.category,
      brand: p.brand,
      unit: p.unit,
      imageUrl: p.imageUrl,
      popularity: p.popularity,
      updatedAt: p.updatedAt,
      remarks: p.remarks,
    })),
    totalCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}

/**
 * Fetches a single product with full detail: specifications.
 */
export async function getProductDetail(id: number): Promise<ProductDetail | null> {
  const product = await prisma.catalogProduct.findUnique({
    where: { id, isActive: true },
    select: {
      id: true,
      productCode: true,
      name: true,
      description: true,
      imageUrl: true,
      popularity: true,
      createdAt: true,
      updatedAt: true,
      remarks: true,
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      unit: { select: { id: true, name: true, abbreviation: true } },
      specifications: {
        select: { specificationName: true, specificationValue: true },
      },
    },
  });

  if (!product) return null;

  // Increment popularity asynchronously (fire and forget)
  prisma.catalogProduct
    .update({ where: { id }, data: { popularity: { increment: 1 } } })
    .catch(() => {});

  return {
    id: product.id,
    productCode: product.productCode,
    name: product.name,
    description: product.description,
    category: product.category,
    brand: product.brand,
    unit: product.unit,
    imageUrl: product.imageUrl,
    popularity: product.popularity,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    remarks: product.remarks,
    specifications: product.specifications,
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
      imageUrl: true,
      popularity: true,
      updatedAt: true,
      remarks: true,
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      unit: { select: { id: true, name: true, abbreviation: true } },
    },
  });

  return products.map((p) => ({
    id: p.id,
    productCode: p.productCode,
    name: p.name,
    description: p.description,
    category: p.category,
    brand: p.brand,
    unit: p.unit,
    imageUrl: p.imageUrl,
    popularity: p.popularity,
    updatedAt: p.updatedAt,
    remarks: p.remarks,
  }));
}
