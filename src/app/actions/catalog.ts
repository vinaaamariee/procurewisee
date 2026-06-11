'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CatalogProductInput {
  sku: string;
  name: string;
  category: string;
  description: string;
  unitOfMeasure: string;
  estimatedUnitCost: number;
}

/**
 * Retrieves catalog products with optional search and category filters.
 */
export async function getCatalogProducts(filters?: { search?: string; category?: string }) {
  try {
    const whereClause: any = { isActive: true };

    if (filters?.category && filters.category !== 'All') {
      whereClause.category = filters.category;
    }

    if (filters?.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.catalogProduct.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error("Error fetching catalog products:", error);
    throw new Error("Failed to fetch catalog products.");
  }
}

/**
 * Creates a new catalog product.
 */
export async function createCatalogProduct(data: CatalogProductInput) {
  try {
    const product = await prisma.catalogProduct.create({
      data: {
        sku: data.sku,
        name: data.name,
        category: data.category,
        description: data.description,
        unitOfMeasure: data.unitOfMeasure,
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
    const product = await prisma.catalogProduct.update({
      where: { id },
      data: {
        sku: data.sku,
        name: data.name,
        category: data.category,
        description: data.description,
        unitOfMeasure: data.unitOfMeasure,
        estimatedUnitCost: data.estimatedUnitCost,
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
 * Retrieves all unique categories present in the catalog.
 */
export async function getProductCategories() {
  try {
    const categories = await prisma.catalogProduct.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { isActive: true },
    });

    return categories.map((c) => c.category).sort();
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return [];
  }
}
