import { prisma } from "@/lib/prisma";
import { suppliers, type OfficeItem } from "@/lib/mock-price-data";
import { getAuthenticatedUser } from "@/lib/auth/get-user-profile";
import { ROLE_HOME } from "@/types/auth";
import PriceComparisonClient from "./PriceComparisonClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Price Comparison Dashboard — ProcureWise",
  description: "Compare supplier quotes for office supplies at Batanes State College.",
};

export default async function PriceComparisonPage() {
  // Fetch items and quotes from the database
  const dbItemsRaw = await prisma.officeItem.findMany({
    include: {
      quotes: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Map to mock types exactly for component compatibility
  const mappedItems: OfficeItem[] = dbItemsRaw.map((item) => ({
    id: item.id,
    name: item.name,
    unit: item.unit,
    category: item.category,
    description: item.description,
    quotes: item.quotes.map((q) => ({
      supplierId: q.supplierId,
      unitPrice: q.unitPrice,
      availability: q.availability as "in-stock" | "limited" | "out-of-stock",
      deliveryDays: q.deliveryDays,
      notes: q.notes ?? undefined,
    })),
  }));

  // Retrieve user session or fallback to root if not logged in
  let roleHome = "/";
  try {
    const { profile } = await getAuthenticatedUser();
    roleHome = ROLE_HOME[profile.role] || "/";
  } catch (error) {
    console.warn("Unauthenticated access to price-comparison page, using root fallback:", error);
  }

  return <PriceComparisonClient items={mappedItems} suppliers={suppliers} roleHome={roleHome} />;
}
