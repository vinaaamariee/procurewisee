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
  if (files.length === 0) {
    console.log("No excel files found");
    return;
  }

  const filePath = path.join(dir, files[0]);
  console.log("Reading file:", filePath);
  const workbook = XLSX.readFile(filePath);
  console.log("Sheets:", workbook.SheetNames);
  
  const dataSheet = workbook.Sheets["DATA"];
  if (!dataSheet) {
    console.log("No DATA sheet found!");
    return;
  }

  // Parse first few rows to see headers and data
  const json: any[] = XLSX.utils.sheet_to_json(dataSheet, { header: 1, defval: "" });
  console.log("First 10 rows:");
  json.slice(0, 10).forEach((row, i) => {
    console.log(`Row ${i}:`, row);
  });
}

main();
