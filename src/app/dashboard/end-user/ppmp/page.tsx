import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import { getPpmpList } from "@/app/actions/ppmp";
import PPMPDashboardClient from "./PPMPDashboardClient";
import { ProductListItem } from "@/features/catalog/server/queries";

export const metadata = { title: "PPMP Management — ProcureWise" };

export default async function PPMPManagementPage() {
  // 1. Authorize user
  const { profile } = await requireRole("End User");

  // 2. Fetch department budget allocations
  const budget = await prisma.departmentBudget.findUnique({
    where: { department: profile.fullName },
  });
  const budgetAllocated = budget ? Number(budget.allocatedBudget) : 1200000.00;
  const budgetSpent = budget ? Number(budget.spentBudget) : 0.00;

  // 3. Fetch existing PPMPs
  const initialPpmps = await getPpmpList({ department: profile.fullName });

  // Compute other planned budget: sum of estimated budget of all PPMPs under this department
  const plannedSum = initialPpmps.reduce(
    (sum, plan) => sum + Number(plan.estimatedBudget),
    0
  );

  // 4. Fetch catalog products
  const rawProducts = await prisma.catalogProduct.findMany({
    where: { isActive: true },
    include: {
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      unit: { select: { id: true, name: true, abbreviation: true } },
    },
    orderBy: { popularity: "desc" },
  });

  // Map database products to the ProductListItem format
  const products: ProductListItem[] = rawProducts.map((p) => ({
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

  return (
    <PPMPDashboardClient
      products={products}
      initialPpmps={JSON.parse(JSON.stringify(initialPpmps))}
      budgetAllocated={budgetAllocated}
      budgetAlreadyPlanned={plannedSum}
      department={profile.fullName}
      office="Main Office"
      userId={profile.id}
    />
  );
}
