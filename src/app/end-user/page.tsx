import { prisma } from "@/lib/prisma";
import EndUserClient from "./EndUserClient";

export const dynamic = "force-dynamic";

export default async function EndUserRequisitionPage() {
  // Query all products from the catalog
  const products = await prisma.catalogProduct.findMany({
    orderBy: { name: "asc" },
    include: {
      category: true,
      unit: true,
    },
  });

  // Map database Decimals to numbers for client serialization
  const serializedProducts = products.map(product => ({
    id: product.id,
    sku: product.productCode ?? "",
    name: product.name,
    category: product.category.name,
    description: product.description,
    unitOfMeasure: product.unit.abbreviation,
    estimatedUnitCost: Number(product.estimatedUnitCost),
    isActive: product.isActive,
  }));

  return <EndUserClient products={serializedProducts} />;
}