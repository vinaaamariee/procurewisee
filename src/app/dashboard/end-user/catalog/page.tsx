import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import EndUserCatalogClient from "./EndUserCatalogClient";

export const metadata = { title: "Product Catalog — ProcureWise" };

export default async function EndUserCatalogPage() {
  await requireRole("End User");

  const [rawProducts, categories] = await Promise.all([
    prisma.catalogProduct.findMany({
      where: { isActive: true },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, abbreviation: true } },
        specifications: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const products = rawProducts.map((p) => ({
    id: p.id,
    sku: p.productCode || "",
    name: p.name,
    description: p.description,
    category: { id: p.category.id, name: p.category.name },
    brand: p.brand ? { id: p.brand.id, name: p.brand.name } : null,
    unit: { id: p.unit.id, name: p.unit.name, abbreviation: p.unit.abbreviation },
    imageUrl: p.imageUrl,
    specifications: p.specifications.map((s) => ({
      name: s.specificationName,
      value: s.specificationValue,
    })),
    remarks: p.remarks,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-base-content">
          Product Catalog
        </h1>
        <p className="text-sm text-base-content/60 mt-1">
          Browse available products and add them directly to your Purchase Requests.
        </p>
      </div>
      <EndUserCatalogClient products={products} categories={categories} />
    </div>
  );
}
