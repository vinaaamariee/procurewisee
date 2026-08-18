import "dotenv/config";
import { config } from "dotenv";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import * as path from "path";
import * as fs from "fs";
import { Pool } from "pg";

config({ path: ".env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  options: "-c search_path=public",
});

// ─────────────────────────────────────────────────────────────────────────────
// UOM NORMALIZATION MAP
// ─────────────────────────────────────────────────────────────────────────────

const UOM_NORMALIZE: Record<string, string> = {
  "pc": "piece",
  "pcs": "piece",
  "pc.": "piece",
  "pcs.": "piece",
  "piece": "piece",
  "unit": "unit",
  "set": "set",
  "sets": "set",
  "box": "box",
  "boxes": "box",
  "pack": "pack",
  "packs": "pack",
  "ream": "ream",
  "bottle": "bottle",
  "bottles": "bottle",
  "roll": "roll",
  "rolls": "roll",
  "kg": "kilogram",
  "kgs": "kilogram",
  "kilogram": "kilogram",
  "liter": "liter",
  "gallon": "gallon",
  "cart": "carton",
  "carton": "carton",
  "copy": "copy",
  "doz": "dozen",
  "dozen": "dozen",
  "meter": "meter",
  "meters": "meter",
  "sack": "sack",
  "sacks": "sack",
  "tray": "tray",
  "jar": "jar",
  "can": "can",
  "cans": "can",
  "set": "set",
  "tank": "tank",
  "tanks": "tank",
  "drum": "drum",
  "pail": "pail",
  "ballot": "ballot",
  "ballots": "ballot",
  "refill": "refill",
  "cartridge": "cartridge",
  "tube": "tube",
  "tin": "tin",
  "lot": "lot",
  "month": "month",
  "months": "month",
  "pax": "pax",
  "container": "container",
  "bags(50)": "bag",
  "kls": "kilogram",
  "": "unit",
};

function normalizeUom(raw: string): string {
  const cleaned = raw.trim().toLowerCase().replace(/[.,]/g, "");
  return UOM_NORMALIZE[cleaned] || cleaned || "unit";
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY INFERENCE
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Office Supplies": [
    "bond paper", "paper", "pen", "pencil", "stapler", "staple",
    "tape", "folder", "envelop", "clip", "marker", "ink", "toner",
    "printer ink", "sticky note", "correction", "ballpen", "sign pen",
    "ruler", "sharpener", "eraser", "notebook", "pad", "folder",
    "push pin", "paper fastener", "paper clip", "binder clip",
    "pvc cover", "sticker paper", "vellum", "kraft", "document",
    "file", "record book", "stamp", "sign pen",
  ],
  "ICT Equipment": [
    "laptop", "desktop", "computer", "printer", "monitor", "keyboard",
    "mouse", "speaker", "router", "switch", "cable", "cctv", "camera",
    "scanner", "usb", "hdmi", "ethernet", "wifi", "wireless",
    "hard drive", "ssd", "memory", "ram", "battery", "adapter",
    "power supply", "ups", "inverter", "server", "nas",
  ],
  "Janitorial & Cleaning": [
    "broom", "mop", "cleaner", "detergent", "bleach", "soap",
    "trash bag", "garbage bag", "sponge", "disinfectant", "alcohol",
    "sanitizer", "tissue", "toilet", "bathroom", "deodorizer",
    "floor", "rag", "duster", "wiper", "squeegee",
  ],
  "Food & Beverages": [
    "coffee", "sugar", "flour", "rice", "oil", "vinegar", "salt",
    "milk", "cream", "butter", "egg", "chicken", "pork", "beef",
    "fish", "vegetable", "fruit", "bread", "snack", "juice",
    "chocolate", "vanilla", "yeast", "baking", "spice",
  ],
  "Hardware & Maintenance": [
    "nail", "screw", "drill", "hammer", "wrench", "paint",
    "plywood", "lumber", "pipe", "wire", "electrical", "cement",
    "steel", "metal", "angle bar", "yero", "saw", "ladder",
    "welding", "refrigerant", "aircon", "fin",
  ],
  "Furniture & Fixtures": [
    "table", "chair", "desk", "cabinet", "shelf", "rack",
    "bookshelf", "filing", "drawer", "stool", "stand",
  ],
  "Medical & Health Supplies": [
    "medicine", "paracetamol", "ibuprofen", "band aid", "gloves",
    "alcohol", "thermometer", "stethoscope", "syringe", "nebulizer",
    "oximeter", "bp monitor", "first aid", "vitamin",
  ],
  "Signage & Prints": [
    "tarpaulin", "sticker", "plaque", "frame", "sign",
    "printing", "banner",
  ],
  "Sports & Apparel": [
    "jersey", "uniform", "vest", "helmet", "shoe", "ball",
    "medal", "trophy",
  ],
  "Electrical & Lighting": [
    "bulb", "led", "lamp", "light", "fan", "extension cord",
    "outlet", "switch", "breaker", "wire", "tape",
  ],
  "Books & Educational Materials": [
    "book", "textbook", "manual", "notebook", "journal",
  ],
  "Fuel & Energy": [
    "gasoline", "diesel", "fuel", "lpg", "gas",
  ],
};

function inferCategory(name: string): string {
  const lower = name.toLowerCase();
  let bestMatch = "Other Supplies";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        score += kw.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }

  return bestScore > 0 ? bestMatch : "Other Supplies";
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Starting PhilGEPS Catalog Import...\n");

  const dir = path.join(__dirname, "../historical data");
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".xlsx")).sort();

  console.log(`Found ${files.length} Excel files`);

  // ── Step 1: Read and normalize all items ─────────────────────────────────
  const allItems = new Map<string, { name: string; unit: string; remarks: string }>();
  const errors: string[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const workbook = XLSX.readFile(filePath, { type: "buffer" });
      const sheet = workbook.Sheets["DATA"];
      if (!sheet) continue;

      const rows: any[] = XLSX.utils.sheet_to_json(sheet);
      for (const row of rows) {
        const cleanedRow = Object.fromEntries(
          Object.entries(row).map(([k, v]) => [k.trim(), v])
        );
        const rawItem = cleanedRow["Item"];
        if (!rawItem) continue;
        const itemName = String(rawItem).trim();
        if (!itemName) continue;

        // Truncate to 150 chars for DB constraint
        const truncated = itemName.substring(0, 150).trim();
        const lowerName = truncated.toLowerCase();

        const unitRaw = cleanedRow["Unit of Issue"] || cleanedRow["Unit"] || cleanedRow["Unit "] || "";
        const unit = normalizeUom(String(unitRaw));

        const remarks = cleanedRow["Remarks"] || "";

        if (!allItems.has(lowerName)) {
          allItems.set(lowerName, {
            name: truncated,
            unit,
            remarks: remarks ? String(remarks).trim() : "",
          });
        }
      }
    } catch (e: any) {
      errors.push(`${file}: ${e.message}`);
    }
  }

  console.log(`\nRead ${allItems.size} unique items from ${files.length - errors.length} files`);
  if (errors.length > 0) {
    console.log(`${errors.length} files had errors (corrupted xlsx):`);
    for (const e of errors) {
      console.log(`  - ${e}`);
    }
  }

  // ── Step 2: Connect to database ──────────────────────────────────────────
  const client = await pool.connect();

  try {
    // ── Step 3: Ensure default category exists ──────────────────────────────
    await client.query(`
      INSERT INTO categories (id, name, "isActive", "createdAt", "updatedAt")
      VALUES (1, 'Uncategorized', true, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // ── Step 4: Create/get UOM records ──────────────────────────────────────
    const uomMap = new Map<string, number>();
    const uniqueUnits = new Set<string>();
    for (const [_, item] of allItems) {
      uniqueUnits.add(item.unit);
    }

    console.log(`\nUpserting ${uniqueUnits.size} UOM records...`);
    for (const uom of uniqueUnits) {
      const result = await client.query(`
        INSERT INTO units_of_measure (name, abbreviation, "isActive", "createdAt", "updatedAt")
        VALUES ($1, $1, true, NOW(), NOW())
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
      `, [uom]);
      uomMap.set(uom, result.rows[0].id);
    }
    console.log(`  UOM records: ${uomMap.size}`);

    // ── Step 5: Create/get category records ─────────────────────────────────
    const categoryMap = new Map<string, number>();
    const uniqueCategories = new Set<string>();
    for (const [_, item] of allItems) {
      uniqueCategories.add(inferCategory(item.name));
    }

    console.log(`\nUpserting ${uniqueCategories.size} category records...`);
    for (const cat of uniqueCategories) {
      const result = await client.query(`
        INSERT INTO categories (name, "isActive", "createdAt", "updatedAt")
        VALUES ($1, true, NOW(), NOW())
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
      `, [cat]);
      categoryMap.set(cat, result.rows[0].id);
    }
    console.log(`  Category records: ${categoryMap.size}`);

    // ── Step 6: Get existing products for dedup ─────────────────────────────
    const existingProducts = await client.query(`SELECT "product_id" as id, name FROM catalog_products`);
    const existingNameMap = new Map<string, number>();
    for (const row of existingProducts.rows) {
      existingNameMap.set(row.name.toLowerCase().trim(), row.id);
    }

    // ── Step 7: Separate new vs existing items ──────────────────────────────
    let nextSeq = 3000;
    const usedCodes = new Set<string>();
    const newItems: Array<{ name: string; remarks: string; catId: number; unitId: number; code: string }> = [];
    const updateItems: Array<{ name: string; remarks: string; catId: number; unitId: number; id: number }> = [];

    for (const [_, item] of allItems) {
      const catName = inferCategory(item.name);
      const catId = categoryMap.get(catName)!;
      const unitId = uomMap.get(item.unit)!;
      if (!catId || !unitId) continue;

      const existingId = existingNameMap.get(item.name.toLowerCase().trim());
      if (existingId) {
        updateItems.push({ name: item.name, remarks: item.remarks, catId, unitId, id: existingId });
      } else {
        while (usedCodes.has(`PGEP-${nextSeq}`)) nextSeq++;
        const code = `PGEP-${nextSeq}`;
        usedCodes.add(code);
        nextSeq++;
        newItems.push({ name: item.name, remarks: item.remarks, catId, unitId, code });
      }
    }

    // ── Step 8: Batch insert new items ──────────────────────────────────────
    console.log(`\nImporting: ${newItems.length} new, ${updateItems.length} existing...`);
    const BATCH = 100;
    let created = 0;
    for (let i = 0; i < newItems.length; i += BATCH) {
      const chunk = newItems.slice(i, i + BATCH);
      const values: string[] = [];
      const params: any[] = [];
      let p = 1;
      for (const item of chunk) {
        values.push(`($${p}, $${p+1}, $${p+2}, $${p+3}, $${p+4}, $${p+5}, true, NOW(), NOW(), 0)`);
        params.push(item.code, item.name, item.name, item.unitId, item.catId, item.remarks || null);
        p += 6;
      }
      const res = await client.query(`INSERT INTO catalog_products ("productCode", name, description, "unitId", "categoryId", remarks, "isActive", "createdAt", "updatedAt", popularity) VALUES ${values.join(", ")}`, params);
      created += res.rowCount || 0;
    }
    console.log(`  Created: ${created}`);

    // ── Step 9: Batch update existing items ─────────────────────────────────
    let updated = 0;
    for (let i = 0; i < updateItems.length; i += BATCH) {
      const chunk = updateItems.slice(i, i + BATCH);
      const ids = chunk.map(item => item.id);
      const res = await client.query(`
        UPDATE catalog_products SET
          "unitId" = (CASE "product_id" ${chunk.map((item, j) => `WHEN $${j + 1} THEN $${chunk.length + j + 1}::int`).join(" ")} END)::int,
          "categoryId" = (CASE "product_id" ${chunk.map((item, j) => `WHEN $${j + 1} THEN $${chunk.length * 2 + j + 1}::int`).join(" ")} END)::int,
          remarks = CASE "product_id" ${chunk.map((item, j) => `WHEN $${j + 1} THEN $${chunk.length * 3 + j + 1}`).join(" ")} END,
          "updatedAt" = NOW()
        WHERE "product_id" IN (${ids.map((_, j) => `$${j + 1}::int`).join(", ")})
      `, [
        ...ids,
        ...chunk.map(item => item.unitId),
        ...chunk.map(item => item.catId),
        ...chunk.map(item => item.remarks || null),
      ]);
      updated += res.rowCount || 0;
    }
    console.log(`  Updated: ${updated}`);

    console.log(`\n${"=".repeat(50)}`);
    console.log(`CATALOG IMPORT SUMMARY`);
    console.log(`${"=".repeat(50)}`);
    console.log(`Total source items:        ${allItems.size}`);
    console.log(`New products created:      ${created}`);
    console.log(`Existing products updated: ${updated}`);
    console.log(`Corrupted source files:    ${errors.length}`);
    console.log(`Categories used:           ${categoryMap.size}`);
    console.log(`UOM records created:       ${uomMap.size}`);
    console.log(`${"=".repeat(50)}`);

    const priceCheck = await client.query(`SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'catalog_products' AND column_name = 'estimated_unit_cost') as has_price;`);
    console.log(`\nVerification: estimated_unit_cost column exists: ${priceCheck.rows[0].has_price} (should be false)`);
    const totalProducts = await client.query(`SELECT COUNT(*) as count FROM catalog_products`);
    console.log(`Total catalog products in DB: ${totalProducts.rows[0].count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error("Import failed:", e);
  process.exit(1);
});
