import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from Next.js defaults
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  console.log("Seeding Department Budgets...");
  const budgets = [
    { department: "College of Engineering", allocatedBudget: 150000.00 },
    { department: "College of Arts and Sciences", allocatedBudget: 100000.00 },
    { department: "Administrative Office", allocatedBudget: 250000.00 },
    { department: "IT Support Services", allocatedBudget: 300000.00 },
  ];

  for (const b of budgets) {
    await prisma.departmentBudget.upsert({
      where: { department: b.department },
      update: { allocatedBudget: b.allocatedBudget },
      create: {
        department: b.department,
        allocatedBudget: b.allocatedBudget,
        spentBudget: 0.00,
        fiscalYear: 2026,
      },
    });
  }
  console.log("Department Budgets seeded successfully.");

  console.log("Seeding Catalog Products...");
  const products = [
    { sku: "PAP-A4-PREM", name: "Premium Copier Paper (A4)", category: "Paper Products", description: "High-grade 80gsm copy paper for laser and inkjet printers.", unitOfMeasure: "Ream", estimatedUnitCost: 240.00, isActive: true },
    { sku: "STP-HD-MAX", name: "Heavy Duty Stapler", category: "Desk Accessories", description: "All-metal construction stapler with up to 50-sheet capacity.", unitOfMeasure: "Piece", estimatedUnitCost: 650.00, isActive: true },
    { sku: "MRK-BLK-PLT", name: "Permanent Marker (Black)", category: "Writing Instruments", description: "Chisel tip permanent ink marker, waterproof and fast-drying.", unitOfMeasure: "Box (12s)", estimatedUnitCost: 45.00, isActive: false }, // Currently Unavailable
    { sku: "FLD-LNG-EXP", name: "Expanding Folder (Long)", category: "Filing & Storage", description: "Durable expanding folder with elastic strap closure.", unitOfMeasure: "Pack (25s)", estimatedUnitCost: 380.00, isActive: true },
    { sku: "USB-64-SAND", name: "High-Speed Flash Drive (64GB)", category: "IT Supplies", description: "USB 3.0 flash drive for secure and fast data transfers.", unitOfMeasure: "Piece", estimatedUnitCost: 450.00, isActive: true },
  ];

  for (const p of products) {
    await prisma.catalogProduct.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        category: p.category,
        description: p.description,
        unitOfMeasure: p.unitOfMeasure,
        estimatedUnitCost: p.estimatedUnitCost,
        isActive: p.isActive,
      },
      create: p,
    });
  }
  console.log("Catalog Products seeded successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Note: If prisma connections need cleanup, it is handled by the process end
  });
