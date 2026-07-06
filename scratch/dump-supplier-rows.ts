import * as XLSX from "xlsx";
import * as path from "path";

function main() {
  const dir = path.join(__dirname, "../historical data");
  const filePath = path.join(dir, "1. SVP 2025-January (001-042).xlsx");
  const workbook = XLSX.readFile(filePath);
  const dataSheet = workbook.Sheets["DATA"];
  const json: any[] = XLSX.utils.sheet_to_json(dataSheet); // converts sheets automatically using row 0 headers!
  
  console.log("Total rows in JSON:", json.length);
  const filledRows = json.filter(row => row["Supplier"] && row["Supplier"] !== "");
  console.log("Number of rows with Supplier:", filledRows.length);
  console.log("First 3 rows with Supplier:");
  filledRows.slice(0, 3).forEach((row, i) => {
    console.log(`Supplier Row ${i}:`, JSON.stringify(row, null, 2));
  });
}

main();
