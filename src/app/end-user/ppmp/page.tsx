import { prisma } from "@/lib/prisma";
import { getPpmpList } from "@/app/actions/ppmp";
import PPMPDashboardClient from "@/app/dashboard/end-user/ppmp/PPMPDashboardClient";
import { ProductListItem } from "@/features/catalog/server/queries";
import Link from "next/link";

export const metadata = { title: "PPMP Requisition & Planning — ProcureWise" };

interface PageProps {
  searchParams: Promise<{ department?: string }>;
}

export default async function PublicPPMPPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedDepartment = params.department?.trim();

  // Fetch list of departments/budgets so the user can select one
  const budgets = await prisma.departmentBudget.findMany({
    orderBy: { department: "asc" },
  });

  if (!selectedDepartment) {
    // Render the department selection page
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#FAF9F6] border-b-2 border-[#ca8a04]/25 shadow-sm">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 no-underline">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-tr from-[#7e191b] to-[#ca8a04] flex items-center justify-center text-white font-black text-sm shadow-md">
                PW
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-[#7e191b] tracking-tight">PROCUREWISE</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Batanes State College • Internal Procurement</p>
              </div>
            </Link>
            <div className="bg-[#ca8a04]/10 border border-[#ca8a04]/30 rounded-full px-4 py-1.5 text-xs text-[#ca8a04] font-bold">
              Public PPMP Planner
            </div>
          </div>
        </header>

        {/* Selection Interface */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border border-[#E7E5E0] rounded-2xl max-w-xl w-full p-8 shadow-xl">
            <h2 className="text-2xl font-black text-[#7e191b] mb-2 tracking-tight text-center">
              Create & Manage PPMP
            </h2>
            <p className="text-sm text-gray-500 mb-8 text-center leading-relaxed">
              Identify your department/unit to view allocated budgets, draft new project procurement management plans, or modify existing plan details.
            </p>

            <form method="GET" action="/end-user/ppmp" className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Unit / Department
                </label>
                <select
                  name="department"
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-[#ca8a04] bg-[#FAF9F6] transition cursor-pointer font-medium"
                >
                  <option value="" disabled selected>
                    -- Choose Department --
                  </option>
                  {budgets.map((b) => (
                    <option key={b.id} value={b.department}>
                      {b.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs leading-relaxed text-[#ca8a04]">
                <strong>BSC Planning Policy:</strong> PPMP plans are validated against annual departmental budget allocations. No login is required to prepare and save these plans, but all submissions are subject to budget audits.
              </div>

              <button
                type="submit"
                className="w-full bg-[#7e191b] hover:bg-[#962124] text-white py-3 rounded-lg font-bold text-sm transition uppercase tracking-wider shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                Start Planning →
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // A department is selected: fetch their data and render the PPMP planner
  const budget = budgets.find(
    (b) => b.department.toLowerCase() === selectedDepartment.toLowerCase()
  );

  const budgetAllocated = budget ? Number(budget.allocatedBudget) : 1200000.00;
  const budgetSpent = budget ? Number(budget.spentBudget) : 0.00;

  // 3. Fetch existing PPMPs
  const initialPpmps = await getPpmpList({ department: selectedDepartment });

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
      supplierPrices: {
        where: { available: true },
        select: { unitPrice: true },
      },
    },
    orderBy: { popularity: "desc" },
  });

  // Map database products to the ProductListItem format
  const products: ProductListItem[] = rawProducts.map((p) => {
    const prices = p.supplierPrices.map((sp) => Number(sp.unitPrice));
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
    const count = p.supplierPrices.length;

    return {
      id: p.id,
      productCode: p.productCode,
      name: p.name,
      description: p.description,
      category: p.category,
      brand: p.brand,
      unit: p.unit,
      estimatedUnitCost: Number(p.estimatedUnitCost),
      imageUrl: p.imageUrl,
      popularity: p.popularity,
      updatedAt: p.updatedAt,
      lowestPrice,
      availableSupplierCount: count,
      availability: count === 0 ? "Unavailable" : count === 1 ? "Limited" : "Available",
    };
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FAF9F6] border-b border-[#ca8a04]/25 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/end-user/ppmp" className="flex items-center gap-3 no-underline">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-tr from-[#7e191b] to-[#ca8a04] flex items-center justify-center text-white font-black text-sm shadow-md">
              PW
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#7e191b] tracking-tight">PROCUREWISE</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                Batanes State College • Internal Procurement
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border">
              Planning for: <span className="text-[#ca8a04]">{selectedDepartment}</span>
            </div>
            <Link
              href="/end-user/ppmp"
              className="text-xs font-bold text-[#7e191b] hover:text-[#962124] no-underline border border-[#7e191b]/20 px-3 py-1.5 rounded-lg transition hover:bg-red-50"
            >
              Change Department
            </Link>
          </div>
        </div>
      </header>

      {/* Main planner wrapper */}
      <main className="max-w-[1400px] mx-auto px-6 py-8 w-full flex-1">
        <PPMPDashboardClient
          products={products}
          initialPpmps={JSON.parse(JSON.stringify(initialPpmps))}
          budgetAllocated={budgetAllocated}
          budgetAlreadyPlanned={plannedSum}
          department={selectedDepartment}
          office="Main Office"
          userId=""
        />
      </main>
    </div>
  );
}
