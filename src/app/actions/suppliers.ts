'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Creates or updates supplier performance/intelligence metrics.
 */
export async function upsertSupplierProfile(
  supplierId: number,
  data: {
    reliabilityRating?: number;
    qualityComplianceRate?: number;
    historicalDeliveryDays?: number;
    isVerified?: boolean;
  }
) {
  const updated = await prisma.supplier.update({
    where: { id: supplierId },
    data: {
      reliabilityRating: data.reliabilityRating !== undefined ? data.reliabilityRating : undefined,
      qualityComplianceRate: data.qualityComplianceRate !== undefined ? data.qualityComplianceRate : undefined,
      historicalDeliveryDays: data.historicalDeliveryDays !== undefined ? data.historicalDeliveryDays : undefined,
      isVerified: data.isVerified !== undefined ? data.isVerified : undefined,
    },
  });

  revalidatePath("/", "layout");
  return updated;
}

/**
 * Retrieves all registered suppliers, ordered alphabetically by company name.
 */
export async function getSupplierProfiles() {
  return await prisma.supplier.findMany({
    orderBy: { companyName: "asc" },
  });
}

/**
 * Toggles the `isVerified` status of a supplier.
 */
export async function verifySupplier(supplierId: number) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    select: { isVerified: true },
  });

  if (!supplier) {
    throw new Error(`Supplier with ID ${supplierId} not found.`);
  }

  const updated = await prisma.supplier.update({
    where: { id: supplierId },
    data: {
      isVerified: !supplier.isVerified,
    },
  });

  revalidatePath("/", "layout");
  return updated;
}
