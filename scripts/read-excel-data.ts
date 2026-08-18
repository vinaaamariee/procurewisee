import "dotenv/config";
import { config } from "dotenv";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import * as path from "path";
import * as fs from "fs";

config({ path: ".env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const dir = path.join(__dirname, "../historical data");
const files = fs.readdirSync(dir).filter(f => f.endsWith(".xlsx")).sort();

console.log(`Found ${files.length} Excel files\n`);

const allItems = new Map<string, any>();
const errors: string[] = [];

for (const file of files) {
  const filePath = path.join(dir, file);
  try {
    const workbook = XLSX.readFile(filePath, { type: "buffer" });
    const sheet = workbook.Sheets["DATA"];
    if (!sheet) {
      console.log(`${file}: No DATA sheet, skipping`);
      continue;
    }

    const rows: any[] = XLSX.utils.sheet_to_json(sheet);
    let addedCount = 0;

    for (const row of rows) {
      const cleanedRow = Object.fromEntries(
        Object.entries(row).map(([k, v]) => [k.trim(), v])
      );
      const rawItem = cleanedRow["Item"];
      if (!rawItem) continue;
      const itemName = String(rawItem).trim();
      if (!itemName) continue;
      const lowerName = itemName.toLowerCase();

      // Try multiple column names for UOM
      const unitRaw = cleanedRow["Unit of Issue"] || cleanedRow["Unit"] || cleanedRow["Unit "];
      const unit = unitRaw ? String(unitRaw).trim() : "";

      // Try multiple column names for Remarks
      const remarks = cleanedRow["Remarks"] || cleanedRow["Purpose"] || "";

      if (!allItems.has(lowerName)) {
        allItems.set(lowerName, {
          name: itemName,
          unit: unit,
          remarks: remarks ? String(remarks).trim() : "",
          source: file,
        });
        addedCount++;
      }
    }
    console.log(`${file}: ${rows.length} rows, ${addedCount} new unique items`);
  } catch (e: any) {
    console.error(`${file}: ERROR - ${e.message}`);
    errors.push(file);
  }
}

console.log(`\n=== TOTAL UNIQUE ITEMS: ${allItems.size} ===`);
console.log(`=== FILES WITH ERRORS: ${errors.length} (${errors.join(", ")}) ===`);

// Check UOM values
const uomValues = new Map<string, number>();
for (const [_, item] of allItems) {
  const uom = item.unit || "(empty)";
  uomValues.set(uom, (uomValues.get(uom) || 0) + 1);
}
console.log(`\n=== UNIQUE UOM VALUES: ${uomValues.size} ===`);
for (const [uom, count] of Array.from(uomValues.entries()).sort((a, b) => b[1] - a[1])) {
  console.log(`  "${uom}": ${count} items`);
}

// Print all items with UOM
console.log(`\n=== ALL ITEMS ===`);
let idx = 0;
for (const [_, item] of allItems) {
  idx++;
  console.log(`${idx}. ${item.name} | UOM: "${item.unit}" | Remarks: "${item.remarks}"`);
}
