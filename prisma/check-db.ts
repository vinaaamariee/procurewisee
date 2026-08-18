import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Checking database tables...");
  try {
    const supplierCount = await prisma.supplier.count();
    const catalogCount = await prisma.catalogProduct.count();

    console.log(`Suppliers count: ${supplierCount}`);
    console.log(`CatalogProducts count: ${catalogCount}`);

    if (supplierCount > 0 && catalogCount > 0) {
      console.log("Database seeding appears successful!");
      const sampleSuppliers = await prisma.supplier.findMany({ take: 3 });
      console.log("Sample Suppliers:", sampleSuppliers.map((s: any) => s.companyName));
      const sampleProducts = await prisma.catalogProduct.findMany({ take: 3 });
      console.log("Sample Catalog Products:", sampleProducts.map((p: any) => p.name));
    } else {
      console.log("Database contains no seed data or incomplete seed data.");
    }
  } catch (error) {
    console.error("Error querying database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
