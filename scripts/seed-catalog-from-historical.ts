import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";

async function main() {
  console.log("🌱 Starting Catalog Product Seeder from Historical Data (optimized)...\n");

  // Determine historical data directory
  let dir = path.join(__dirname, "../historical-data");
  if (!fs.existsSync(dir)) {
    dir = path.join(__dirname, "../historical data");
  }

  if (!fs.existsSync(dir)) {
    console.error(`❌ Historical data directory not found.`);
    process.exit(1);
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith(".xlsx"));
  if (files.length === 0) {
    console.log("⚠️ No Excel files found.");
    return;
  }

  // Pre-fetch existing catalog products to avoid duplicates
  const existingProducts = await prisma.catalogProduct.findMany({
    select: { name: true }
  });
  const existingNames = new Set(existingProducts.map(p => p.name.toLowerCase().trim()));
  console.log(`⚡ Loaded ${existingNames.size} existing Catalog Products from database.\n`);

  // Map to store unique normalized items: name (lowercase) -> { originalName, estimatedCost }
  const uniqueItems = new Map<string, { originalName: string; estimatedCost: number }>();

  console.log("🔍 Scanning workbooks to extract unique items...");
  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const workbook = XLSX.readFile(filePath);
      const dataSheet = workbook.Sheets["DATA"];
      if (!dataSheet) continue;

      const rows: any[] = XLSX.utils.sheet_to_json(dataSheet);
      for (const row of rows) {
        // Clean row keys
        const cleanedRow = Object.fromEntries(
          Object.entries(row).map(([k, v]) => [k.trim(), v])
        );

        const rawItemName = cleanedRow["Item"];
        if (!rawItemName) continue;

        const originalName = String(rawItemName).trim();
        if (originalName === "") continue;

        // Truncate to 150 characters to match CatalogProduct name constraint
        const normalizedName = originalName.substring(0, 150).trim();
        const lowerName = normalizedName.toLowerCase();

        // Skip if already in database
        if (existingNames.has(lowerName)) continue;

        // Get estimated unit cost from Unit Budget or Unit LCRB
        const budgetVal = cleanedRow["Unit Budget"] || cleanedRow["Unit LCRB"] || 0;
        const estimatedCost = parseFloat(String(budgetVal).replace(/[^0-9.]/g, "")) || 0.00;

        // Save if not already exists
        if (!uniqueItems.has(lowerName)) {
          uniqueItems.set(lowerName, { originalName: normalizedName, estimatedCost });
        } else {
          const current = uniqueItems.get(lowerName)!;
          if (current.estimatedCost === 0 && estimatedCost > 0) {
            uniqueItems.set(lowerName, { originalName: normalizedName, estimatedCost });
          }
        }
      }
    } catch (e: any) {
      console.error(`⚠️ Error scanning file ${file}:`, e.message);
    }
  }

  console.log(`✨ Found ${uniqueItems.size} new unique items to seed.\n`);

  if (uniqueItems.size === 0) {
    console.log("✅ No new unique items to seed.");
    return;
  }

  // Create default Category (Uncategorized) and Unit Of Measure (unit) if they don't exist
  const defaultCategory = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Uncategorized", isActive: true }
  });

  const defaultUnit = await prisma.unitOfMeasure.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "unit", abbreviation: "unit", isActive: true }
  });

  // Prepare batch data
  let seq = 2000; // start index for unique product codes
  const itemsToCreate = Array.from(uniqueItems.values()).map(item => {
    seq++;
    return {
      productCode: `HIST-PRD-${seq}`,
      name: item.originalName,
      description: "Historical product imported from procurement records.",
      categoryId: defaultCategory.id,
      unitId: defaultUnit.id,
      estimatedUnitCost: item.estimatedCost,
      isActive: true,
      popularity: 0,
    };
  });

  console.log(`🚀 Seeding ${itemsToCreate.length} Catalog Products in batches...`);
  
  // We can insert in chunks of 500 to be safe with parameter count limits in PostgreSQL
  const chunkSize = 500;
  let totalCreated = 0;

  for (let i = 0; i < itemsToCreate.length; i += chunkSize) {
    const chunk = itemsToCreate.slice(i, i + chunkSize);
    try {
      const result = await prisma.catalogProduct.createMany({
        data: chunk,
        skipDuplicates: true,
      });
      totalCreated += result.count;
      console.log(`   - Seeded batch ${i / chunkSize + 1} (${chunk.length} items). Total created so far: ${totalCreated}`);
    } catch (err: any) {
      console.error(`❌ Error seeding batch:`, err.message);
    }
  }

  console.log(`\n==================================================`);
  console.log(`🎉 CATALOG SEED SUMMARY`);
  console.log(`--------------------------------------------------`);
  console.log(`Total New Products Seeded : ${totalCreated}`);
  console.log(`==================================================`);

  await prisma.$disconnect();
}

main();
