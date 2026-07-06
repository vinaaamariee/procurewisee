import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";

function main() {
  const dir = path.join(__dirname, "../historical data");
  if (!fs.existsSync(dir)) {
    console.log("Directory does not exist:", dir);
    return;
  }
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".xlsx"));
  console.log("Total files found:", files.length);

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const workbook = XLSX.readFile(filePath);
      const dataSheet = workbook.Sheets["DATA"];
      if (!dataSheet) {
        console.log(`[${file}] NO DATA sheet found`);
        continue;
      }
      const json: any[][] = XLSX.utils.sheet_to_json(dataSheet, { header: 1 });
      if (json.length === 0) {
        console.log(`[${file}] DATA sheet is empty`);
        continue;
      }
      const headers = json[0].map(h => String(h).trim());
      console.log(`[${file}] Headers:`, headers.slice(0, 15));
    } catch (e: any) {
      console.log(`[${file}] Failed to read:`, e.message);
    }
  }
}

main();
