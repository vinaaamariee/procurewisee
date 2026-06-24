import { prisma } from "@/lib/prisma";
import MarketplaceClient from "./MarketplaceClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PublicMarketplacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  // Retrieve products in catalog
  const products = await prisma.catalogProduct.findMany({
    where: { isActive: true },
    include: { preferredSupplier: true },
    orderBy: { name: "asc" }
  });

  // Retrieve registered suppliers
  const suppliers = await prisma.supplier.findMany({
    orderBy: { companyName: "asc" }
  });

  // Map Decimal values to JavaScript numbers for client serialization
  const serializedProducts = products.map(p => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    description: p.description,
    unitOfMeasure: p.unitOfMeasure,
    estimatedUnitCost: Number(p.estimatedUnitCost),
    brand: p.brand || "Generic",
    popularity: p.popularity,
    technicalSpecifications: p.technicalSpecifications || "",
    latestCanvassedPrice: p.latestCanvassedPrice ? Number(p.latestCanvassedPrice) : null,
    preferredSupplier: p.preferredSupplier ? p.preferredSupplier.companyName : "None",
    isActive: p.isActive,
  }));

  return (
    <MarketplaceClient
      products={serializedProducts}
      suppliers={suppliers}
      userProfile={profile}
    />
  );
}
