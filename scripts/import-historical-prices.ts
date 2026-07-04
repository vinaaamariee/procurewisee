import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";

// Stop words for token filtering
const stopWords = new Set([
  "for", "with", "and", "a", "of", "in", "under", "size", "color", "to", "be", "use",
  "the", "by", "at", "on", "or", "from", "an", "is", "suitable", "sheets", "ream",
  "pack", "pcs", "set", "unit", "box", "sub"
]);

function cleanAndTokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ") // replace punctuation with space
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length > 1 && !stopWords.has(w))
  );
}

function fuzzyMatchProduct(
  rawName: string,
  catalogProducts: { id: number; name: string }[]
): { id: number; name: string } | null {
  const rawTokens = cleanAndTokenize(rawName);
  if (rawTokens.size === 0) return null;

  let bestMatch: { id: number; name: string } | null = null;
  let bestScore = 0;

  const cleanRaw = rawName.toLowerCase().replace(/\s+/g, " ");

  for (const product of catalogProducts) {
    const catalogName = product.name.toLowerCase();
    const cleanCatalog = catalogName.replace(/\s+/g, " ");

    // 1. Exact match or direct substring match
    if (cleanRaw === cleanCatalog || cleanRaw.includes(cleanCatalog) || cleanCatalog.includes(cleanRaw)) {
      return product; // Instant high-confidence match
    }

    // 2. Token overlap score
    const catalogTokens = cleanAndTokenize(product.name);
    let intersectionCount = 0;
    for (const token of catalogTokens) {
      if (rawTokens.has(token)) {
        intersectionCount++;
      }
    }

    // Calculate score as ratio of matched catalog tokens
    if (catalogTokens.size > 0) {
      const score = intersectionCount / catalogTokens.size;
      
      // If we match at least 60% of the catalog product's descriptive words
      if (score >= 0.6 && score > bestScore) {
        bestScore = score;
        bestMatch = product;
      }
    }
  }

  return bestMatch;
}

async function main() {
  console.log("🚀 Starting Historical Price Importer (Idempotent & Fuzzy Matching & Auto-Create Products)...\n");

  // Determine historical data directory
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
    console.log("⚠️ No Excel files (.xlsx) found in the directory.");
    return;
  }

  console.log(`📂 Found ${files.length} Excel workbooks to process.\n`);

  console.log("⚡ Pre-fetching database records for in-memory caching...");
  
  // 1. Fetch all CatalogProducts for fuzzy matching
  const allProducts = await prisma.catalogProduct.findMany({
    select: { id: true, name: true }
  });
  const productCache = new Map<string, number>(); // lowercase name -> id
  allProducts.forEach(p => productCache.set(p.name.toLowerCase().trim(), p.id));
  console.log(`   - Cached ${allProducts.length} Catalog Products.`);

  // 2. Fetch and Cache Suppliers
  const allSuppliers = await prisma.supplier.findMany({
    select: { id: true, companyName: true }
  });
  const supplierCache = new Map<string, number>(); // lowercase companyName -> id
  allSuppliers.forEach(s => supplierCache.set(s.companyName.toLowerCase().trim(), s.id));
  console.log(`   - Cached ${supplierCache.size} Suppliers.`);

  // 3. Fetch and Cache Units of Measure
  const allUnits = await prisma.unitOfMeasure.findMany({
    select: { id: true, name: true, abbreviation: true }
  });
  const unitCache = new Map<string, number>(); // lowercase name/abbreviation -> id
  allUnits.forEach(u => {
    unitCache.set(u.name.toLowerCase().trim(), u.id);
    unitCache.set(u.abbreviation.toLowerCase().trim(), u.id);
  });
  console.log(`   - Cached ${unitCache.size} Units of Measure.`);

  // 4. Fetch and Cache existing HistoricalPrices to prevent duplicate database queries
  const allExistingHist = await prisma.historicalPrice.findMany({
    select: { procurementNumber: true, rawProductName: true }
  });
  const dbDuplicateKeys = new Set<string>(); // procurementNumber::rawProductName
  allExistingHist.forEach(h => {
    const key = `${h.procurementNumber.trim()}::${h.rawProductName.trim()}`;
    dbDuplicateKeys.add(key);
  });
  console.log(`   - Cached ${dbDuplicateKeys.size} existing Historical Price records.`);
  console.log("⚡ Caching complete. Starting import...\n");

  let totalRead = 0;
  let totalImported = 0;
  let totalDuplicates = 0;
  let totalFailed = 0;
  let totalMatched = 0;
  let totalUnmatched = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    console.log(`--------------------------------------------------`);
    console.log(`📄 Processing workbook: ${file}`);
    
    try {
      const workbook = XLSX.readFile(filePath);
      const dataSheet = workbook.Sheets["DATA"];
      
      if (!dataSheet) {
        console.warn(`⚠️ Warning: No "DATA" worksheet found in ${file}. Skipping.`);
        continue;
      }

      // Read raw rows to map and count Excel row number accurately
      const rawRows: any[][] = XLSX.utils.sheet_to_json(dataSheet, { header: 1 });
      if (rawRows.length <= 1) {
        console.warn(`⚠️ Warning: "DATA" worksheet in ${file} is empty or has only headers. Skipping.`);
        continue;
      }
      
      const headers = rawRows[0].map(h => String(h || "").trim());
      console.log(`🔍 Detected Headers:`, headers.filter(h => h !== ""));

      let fileReadCount = rawRows.length - 1; // total rows excluding header
      let fileImported = 0;
      let fileDuplicates = 0;
      let fileFailed = 0;
      let fileMatched = 0;
      let fileUnmatched = 0;

      // Group failures by reason
      const fileFailuresMap = new Map<string, number>();

      // Track duplicate keys processed within this file run to avoid redundant inserts in same run
      const processedInRun = new Set<string>();

      for (let i = 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        const excelRowNum = i + 1; // Excel sheet row numbers are 1-indexed

        if (!row || row.length === 0) {
          fileReadCount--;
          continue;
        }

        // Filter out completely blank rows
        const hasValues = row.some(val => val !== undefined && val !== null && String(val).trim() !== "");
        if (!hasValues) {
          fileReadCount--;
          continue;
        }

        // Map row array to cleaned key-value object using headers
        const cleanedRow: Record<string, any> = {};
        headers.forEach((h, idx) => {
          if (h !== "") {
            cleanedRow[h] = row[idx];
          }
        });

        const rawItemName = cleanedRow["Item"];
        const rawSupplierName = cleanedRow["Supplier"];
        const prNumber = cleanedRow["PR#"];

        // Truncate values to fit the schema.prisma column sizes safely
        const rawProductName = String(rawItemName || "").trim().substring(0, 255);
        const supplierName = String(rawSupplierName || "").trim().substring(0, 150);
        const procurementNumber = String(prNumber || "").trim().substring(0, 100);

        // Check duplicate key in our cache first for performance
        const duplicateKey = `${procurementNumber}::${rawProductName}`;
        if (processedInRun.has(duplicateKey) || dbDuplicateKeys.has(duplicateKey)) {
          fileDuplicates++;
          continue;
        }

        processedInRun.add(duplicateKey);

        try {
          // 1. Basic validation: Check required fields
          if (!rawItemName) {
            throw new Error("Missing item name");
          }
          if (!rawSupplierName) {
            throw new Error("Supplier lookup failed"); // No supplier present means lookup fails
          }
          if (!prNumber) {
            throw new Error("Missing PR number");
          }

          // 2. Parse quantity, unitPrice, totalPrice, and date
          const qtyVal = cleanedRow["Qty"] || cleanedRow["Quantity"];
          if (qtyVal === undefined || qtyVal === null || String(qtyVal).trim() === "") {
            throw new Error("Invalid decimal");
          }
          const quantity = parseInt(String(qtyVal).replace(/[^0-9-]/g, ""));
          if (isNaN(quantity)) {
            throw new Error("Invalid decimal");
          }

          const lcrbVal = cleanedRow["Unit LCRB"];
          if (lcrbVal === undefined || lcrbVal === null || String(lcrbVal).trim() === "") {
            throw new Error("Invalid decimal");
          }
          const unitPrice = parseFloat(String(lcrbVal).replace(/[^0-9.]/g, ""));
          if (isNaN(unitPrice)) {
            throw new Error("Invalid decimal");
          }

          const totalVal = cleanedRow["Total"];
          let totalPrice = parseFloat(String(totalVal || "").replace(/[^0-9.]/g, "")) || 0;
          if (isNaN(totalPrice) || totalPrice === 0) {
            totalPrice = quantity * unitPrice;
          }

          // Parse date with robust fallbacks
          let procurementDate: Date | null = null;
          const poDate = cleanedRow["PO/Contract Date"];
          const bacDate = cleanedRow["Date of BAC Award Approved"] || cleanedRow["Date of BAC Award"];
          const lonDate = cleanedRow["Date of LON Received by Supplier"] || cleanedRow["Date of LON Received"] || cleanedRow["Date of LON"];
          const iarDate = cleanedRow["IAR Date"];

          for (const dateVal of [poDate, bacDate, lonDate, iarDate]) {
            if (dateVal !== undefined && dateVal !== null && dateVal !== "") {
              if (typeof dateVal === "number") {
                procurementDate = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
                break;
              }
              const parsed = new Date(dateVal);
              if (!isNaN(parsed.getTime())) {
                procurementDate = parsed;
                break;
              }
            }
          }

          if (!procurementDate) {
            const sourceMonth = String(cleanedRow["MONTH"] || "").trim();
            const sourceYear = parseInt(cleanedRow["YEAR"]);
            if (sourceMonth && sourceYear && !isNaN(sourceYear)) {
              const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
              const monthIdx = months.indexOf(sourceMonth.toLowerCase());
              procurementDate = new Date(sourceYear, monthIdx !== -1 ? monthIdx : 0, 1);
            }
          }

          if (!procurementDate || isNaN(procurementDate.getTime())) {
            throw new Error("Missing procurement date");
          }

          const sourceMonth = String(cleanedRow["MONTH"] || "January").trim().substring(0, 20);
          const sourceYear = parseInt(cleanedRow["YEAR"]) || 2025;
          const unitStr = String(cleanedRow["Unit of Issue"] || "unit").trim().substring(0, 50);

          // 3. Resolve relations
          // A. Supplier match
          const supplierId = supplierCache.get(supplierName.toLowerCase()) || null;
          if (!supplierId) {
            throw new Error("Supplier lookup failed");
          }

          // B. Unit match (if not matched, set unitId = null and continue)
          const unitId = unitCache.get(unitStr.toLowerCase()) || null;

          // C. Product match (fuzzy match first)
          let productId = productCache.get(rawProductName.toLowerCase()) || null;

          if (!productId) {
            // Fuzzy lookup
            const fuzzyMatch = fuzzyMatchProduct(rawProductName, allProducts);
            if (fuzzyMatch) {
              productId = fuzzyMatch.id;
              productCache.set(rawProductName.toLowerCase(), productId);
              console.log(`[MATCHING] Normalized Item: "${rawProductName}" | Fuzzy Matched: "${fuzzyMatch.name}" (ID: ${productId})`);
            }
          }

          if (!productId) {
            // Auto-create product naturally from historical data
            const newProductCode = `HIST-PRD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const newProduct = await prisma.catalogProduct.create({
              data: {
                productCode: newProductCode,
                name: rawProductName.substring(0, 150),
                description: "Historical product imported dynamically from procurement records.",
                categoryId: 1, // Default to Uncategorized
                unitId: unitId || 1, // Fallback to 1 if not matched
                estimatedUnitCost: unitPrice,
                isActive: true,
                popularity: 1
              }
            });
            productId = newProduct.id;
            productCache.set(rawProductName.toLowerCase(), productId);
            allProducts.push({ id: productId, name: rawProductName });
            console.log(`[MATCHING] Normalized Item: "${rawProductName}" | Created dynamically: (ID: ${productId})`);
          }

          const matchedAt = new Date();

          // 4. Upsert the record
          await prisma.historicalPrice.upsert({
            where: {
              procurementNumber_rawProductName: {
                procurementNumber,
                rawProductName,
              },
            },
            update: {
              productId,
              supplierId,
              supplierName,
              procurementDate,
              quantity,
              unitId,
              unit: unitStr,
              unitPrice,
              totalPrice,
              sourceMonth,
              sourceYear,
              matchedAt,
            },
            create: {
              productId,
              rawProductName,
              supplierId,
              supplierName,
              procurementNumber,
              procurementDate,
              quantity,
              unitId,
              unit: unitStr,
              unitPrice,
              totalPrice,
              sourceMonth,
              sourceYear,
              matchedAt,
            },
          });

          // Add to cache
          dbDuplicateKeys.add(duplicateKey);

          fileImported++;
          fileMatched++;
        } catch (err: any) {
          let reason = "Unknown error";
          if (err.code === "P2002") {
            reason = "Unique constraint";
          } else if (err.message) {
            reason = err.message;
          }

          fileFailuresMap.set(reason, (fileFailuresMap.get(reason) || 0) + 1);
          fileFailed++;

          // Print detailed error log
          console.error(`❌ [ERROR] Workbook: ${file} | Row: ${excelRowNum} | Product: "${rawProductName}" | PR: "${procurementNumber}"`);
          console.error(`   Error: ${err.message || err.code || err}`);
          if (process.env.NODE_ENV !== "production") {
            console.error(`   Stack trace:`, err.stack || err);
          }
        }
      }

      console.log(`\n${file}`);
      console.log(`Rows read: ${fileReadCount}`);
      console.log(`Imported: ${fileImported}`);
      console.log(`Duplicates: ${fileDuplicates}`);
      console.log(`Failed: ${fileFailed}`);
      console.log(`Matched Catalog Products: ${fileMatched}`);
      console.log(`Unmatched Products: ${fileUnmatched}\n`);

      if (fileFailuresMap.size > 0) {
        console.log(`Failure Summary for ${file}:`);
        for (const [reason, count] of fileFailuresMap.entries()) {
          const dots = ".".repeat(Math.max(2, 33 - reason.length));
          console.log(`  ${reason} ${dots} ${count}`);
        }
        console.log();
      }

      totalRead += fileReadCount;
      totalImported += fileImported;
      totalDuplicates += fileDuplicates;
      totalFailed += fileFailed;
      totalMatched += fileMatched;
      totalUnmatched += fileUnmatched;
    } catch (e: any) {
      console.error(`❌ Critical error processing workbook ${file}:`, e.message);
    }
  }

  console.log(`==================================================`);
  console.log(`📊 GLOBAL IMPORT METRICS`);
  console.log(`--------------------------------------------------`);
  console.log(`Total Workbooks Processed : ${files.length}`);
  console.log(`Total Rows Read           : ${totalRead}`);
  console.log(`Total Rows Imported       : ${totalImported}`);
  console.log(`Total Duplicates Skipped  : ${totalDuplicates}`);
  console.log(`Total Rows Failed         : ${totalFailed}`);
  console.log(`Matched Catalog Products  : ${totalMatched}`);
  console.log(`Unmatched Products        : ${totalUnmatched}`);
  console.log(`==================================================`);

  await prisma.$disconnect();
}

main();
