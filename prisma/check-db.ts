import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Checking database tables...");
  try {
    const supplierCount = await prisma.supplier.count();
    const itemCount = await prisma.officeItem.count();
    const quoteCount = await prisma.priceQuote.count();

    console.log(`Suppliers count: ${supplierCount}`);
    console.log(`OfficeItems count: ${itemCount}`);
    console.log(`PriceQuotes count: ${quoteCount}`);

    if (supplierCount > 0 && itemCount > 0 && quoteCount > 0) {
      console.log("Database seeding appears successful!");
      // Print some samples
      const sampleSuppliers = await prisma.supplier.findMany({ take: 3 });
      console.log("Sample Suppliers:", sampleSuppliers.map(s => s.name));
      const sampleItems = await prisma.officeItem.findMany({ take: 3 });
      console.log("Sample Items:", sampleItems.map(i => i.name));
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
