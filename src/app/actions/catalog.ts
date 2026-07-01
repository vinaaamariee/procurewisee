'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CatalogProductInput {
  sku?: string;
  name: string;
  category: string;
  description: string;
  unitOfMeasure: string;
  estimatedUnitCost: number;
}

// Shape returned to dashboard/catalog — keeps backward compat by flattening relations
export interface FlatCatalogProduct {
  id: number;
  sku: string | null;       // productCode mapped as sku for backward compat
  name: string;
  category: string;          // flat category name for backward compat
  description: string;
  unitOfMeasure: string;     // unit abbreviation for backward compat
  estimatedUnitCost: number;
  isActive: boolean;
}

/**
 * Retrieves catalog products with optional search and category (name) filters.
 * Returns a flattened shape for backward compatibility with the dashboard catalog page.
 */
export async function getCatalogProducts(filters?: {
  search?: string;
  category?: string;
}): Promise<FlatCatalogProduct[]> {
  try {
    const products = await prisma.catalogProduct.findMany({
      where: {
        isActive: true,
        ...(filters?.category && filters.category !== "All"
          ? { category: { name: filters.category } }
          : {}),
        ...(filters?.search
          ? {
              OR: [
                { name: { contains: filters.search, mode: "insensitive" } },
                { productCode: { contains: filters.search, mode: "insensitive" } },
                { description: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        productCode: true,
        name: true,
        description: true,
        estimatedUnitCost: true,
        category: { select: { name: true } },
        unit: { select: { abbreviation: true } },
        isActive: true,
      },
    });

    return products.map((p) => ({
      id: p.id,
      sku: p.productCode,
      name: p.name,
      category: p.category.name,
      description: p.description,
      unitOfMeasure: p.unit.abbreviation,
      estimatedUnitCost: Number(p.estimatedUnitCost),
      isActive: p.isActive,
    }));
  } catch (error) {
    console.error("Error fetching catalog products:", error);
    throw new Error("Failed to fetch catalog products.");
  }
}

/**
 * Creates a new catalog product using the new relational schema.
 */
export async function createCatalogProduct(data: CatalogProductInput) {
  try {
    const categoryRecord = await prisma.category.upsert({
      where: { name: data.category.trim() },
      update: {},
      create: { name: data.category.trim() },
    });

    const unitRecord = await prisma.unitOfMeasure.upsert({
      where: { name: data.unitOfMeasure.trim() },
      update: {},
      create: { name: data.unitOfMeasure.trim(), abbreviation: data.unitOfMeasure.trim().slice(0, 15) },
    });

    const product = await prisma.catalogProduct.create({
      data: {
        productCode: data.sku || null,
        name: data.name,
        description: data.description,
        categoryId: categoryRecord.id,
        unitId: unitRecord.id,
        estimatedUnitCost: data.estimatedUnitCost,
      },
    });

    revalidatePath("/", "layout");
    return { success: true, product };
  } catch (error: any) {
    console.error("Error creating catalog product:", error);
    return { success: false, error: error.message || "Failed to create catalog product." };
  }
}

/**
 * Updates an existing catalog product's details.
 */
export async function updateCatalogProduct(id: number, data: Partial<CatalogProductInput>) {
  try {
    let categoryId: number | undefined;
    let unitId: number | undefined;

    if (data.category) {
      const categoryRecord = await prisma.category.upsert({
        where: { name: data.category.trim() },
        update: {},
        create: { name: data.category.trim() },
      });
      categoryId = categoryRecord.id;
    }

    if (data.unitOfMeasure) {
      const unitRecord = await prisma.unitOfMeasure.upsert({
        where: { name: data.unitOfMeasure.trim() },
        update: {},
        create: { name: data.unitOfMeasure.trim(), abbreviation: data.unitOfMeasure.trim().slice(0, 15) },
      });
      unitId = unitRecord.id;
    }

    const product = await prisma.catalogProduct.update({
      where: { id },
      data: {
        ...(data.sku !== undefined ? { productCode: data.sku } : {}),
        ...(data.name ? { name: data.name } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(unitId ? { unitId } : {}),
        ...(data.estimatedUnitCost !== undefined
          ? { estimatedUnitCost: data.estimatedUnitCost }
          : {}),
      },
    });

    revalidatePath("/", "layout");
    return { success: true, product };
  } catch (error: any) {
    console.error("Error updating catalog product:", error);
    return { success: false, error: error.message || "Failed to update catalog product." };
  }
}

/**
 * Soft deletes/deactivates a catalog product.
 */
export async function deleteCatalogProduct(id: number) {
  try {
    await prisma.catalogProduct.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting catalog product:", error);
    return { success: false, error: error.message || "Failed to delete catalog product." };
  }
}

/**
 * Retrieves all active category names for use in filter dropdowns.
 * Returns a flat string array for backward compatibility.
 */
export async function getProductCategories(): Promise<string[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { name: true },
      orderBy: { name: "asc" },
    });
    return categories.map((c) => c.name);
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return [];
  }
}
