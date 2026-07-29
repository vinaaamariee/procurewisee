import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";

async function main() {
  console.log("🚀 Starting Supplier Seeder from Historical Data...\n");

  let dir = path.join(__dirname, "../historical-data");
  if (!fs.existsSync(dir)) {
    dir = path.join(__dirname, "../historical data");
  }

  if (!fs.existsSync(dir)) {
    console.error(`❌ Historical data directory not found in: \n  - ${path.join(__dirname, "../historical-data")}\n  - ${path.join(__dirname, "../historical data")}`);
    process.exit(1);
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith(".xlsx"));
  if (files.length === 0) {
    console.log("⚠️ No Excel files (.xlsx) found.");
    return;
  }

  console.log(`📂 Processing ${files.length} Excel workbooks to extract suppliers...\n`);

  const supplierNamesSet = new Set<string>();

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const workbook = XLSX.readFile(filePath);
      const dataSheet = workbook.Sheets["DATA"];
      if (!dataSheet) continue;

      const rawRows: any[][] = XLSX.utils.sheet_to_json(dataSheet, { header: 1 });
      if (rawRows.length <= 1) continue;

      const headers = rawRows[0].map(h => String(h || "").trim());
      const supplierColIdx = headers.findIndex(h => h.toLowerCase() === "supplier");

      for (let i = 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!row || row.length === 0) continue;

        let supplierName = "";
        if (supplierColIdx !== -1 && row[supplierColIdx]) {
          supplierName = String(row[supplierColIdx]).trim();
        } else {
          // Fallback search across row cells for supplier name patterns
          headers.forEach((h, idx) => {
            if (h.toLowerCase().includes("supplier") || h.toLowerCase().includes("bidder")) {
              if (row[idx]) supplierName = String(row[idx]).trim();
            }
          });
        }

        if (supplierName && supplierName.length > 1) {
          const cleanName = supplierName.substring(0, 150);
          supplierNamesSet.add(cleanName);
        }
      }
    } catch (err: any) {
      console.warn(`⚠️ Error reading file ${file}:`, err.message);
    }
  }

  console.log(`🔍 Extracted ${supplierNamesSet.size} unique supplier names from historical data:`);
  Array.from(supplierNamesSet).forEach(name => console.log(`   - ${name}`));

  console.log("\n⚡ Upserting suppliers into database...");
  let count = 0;
  for (const name of supplierNamesSet) {
    try {
      const existing = await prisma.supplier.findFirst({
        where: {
          companyName: {
            equals: name,
            mode: "insensitive",
          },
        },
      });

      if (!existing) {
        await prisma.supplier.create({
          data: {
            companyName: name,
            businessAddress: "Basco, Batanes",
            contactPerson: "Manager",
            contactNumber: "09000000000",
            reliabilityRating: 4.5,
            qualityComplianceRate: 95.0,
            isVerified: true,
          },
        });
        count++;
      }
    } catch (err: any) {
      console.error(`❌ Failed to upsert "${name}":`, err.message);
    }
  }

  console.log(`\n✅ Successfully seeded ${count} new suppliers! Total unique: ${supplierNamesSet.size}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
