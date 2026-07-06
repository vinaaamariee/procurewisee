import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Listing all Catalog Products in the database...");
  try {
    const products = await prisma.catalogProduct.findMany({
      select: { id: true, name: true, estimatedUnitCost: true }
    });
    console.log("Catalog Products:");
    console.log(JSON.stringify(products, null, 2));
  } catch (error) {
    console.error("Error fetching catalog products:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
