import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import { getPpmpList } from "@/app/actions/ppmp";
import PPMPDashboardClient from "./PPMPDashboardClient";
import { ProductListItem } from "@/features/catalog/server/queries";

export const metadata = { title: "PPMP — ProcureWise" };

export default async function EndUserPpmpPage() {
  const { profile } = await requireRole("End User");

  const budgets = await prisma.departmentBudget.findMany({
    orderBy: { department: "asc" },
  });

  const departments = budgets.map((b) => b.department);
  
  // Use first department or a default
  const selectedDepartment = departments.length > 0 ? departments[0] : "General Administration";

  const budget = budgets.find(
    (b) => b.department.toLowerCase() === selectedDepartment.toLowerCase()
  );

  const budgetAllocated = budget ? Number(budget.allocatedBudget) : 1200000.00;
  const budgetSpent = budget ? Number(budget.spentBudget) : 0.00;

  const initialPpmps = await getPpmpList({ department: selectedDepartment });

  const plannedSum = initialPpmps.reduce(
    (sum, plan) => sum + Number(plan.estimatedBudget),
    0
  );

  const rawProducts = await prisma.catalogProduct.findMany({
    where: { isActive: true },
    include: {
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      unit: { select: { id: true, name: true, abbreviation: true } },
    },
    orderBy: { popularity: "desc" },
  });

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-base-content">
          Project Procurement Management Plan
        </h1>
        <p className="text-sm text-base-content/60 mt-1">
          Create, manage, and track your department&apos;s PPMP entries. Link approved plans to Purchase Requests.
        </p>
      </div>

      <PPMPDashboardClient
        products={products}
        initialPpmps={JSON.parse(JSON.stringify(initialPpmps))}
        budgetAllocated={budgetAllocated}
        budgetAlreadyPlanned={plannedSum}
        department={selectedDepartment}
        office={selectedDepartment}
        userId={profile.id}
      />
    </div>
  );
}
