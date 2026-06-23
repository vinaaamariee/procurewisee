import { prisma } from "@/lib/prisma";
import EndUserClient from "./EndUserClient";

export const dynamic = "force-dynamic";

export default async function EndUserRequisitionPage() {
  // Query all products from the catalog
  const products = await prisma.catalogProduct.findMany({
    orderBy: { name: "asc" },
  });

  // Map database Decimals to numbers for client serialization
  const serializedProducts = products.map(product => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: product.category,
    description: product.description,
    unitOfMeasure: product.unitOfMeasure,
    estimatedUnitCost: Number(product.estimatedUnitCost),
    isActive: product.isActive,
  }));

  return <EndUserClient products={serializedProducts} />;
}