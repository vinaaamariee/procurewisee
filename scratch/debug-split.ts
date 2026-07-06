import * as fs from "fs";
import * as path from "path";

function main() {
  const migPath = path.join(__dirname, "../prisma/migrations/20260704160800_add_historical_prices/migration.sql");
  const sql = fs.readFileSync(migPath, "utf-8");
  const statements = sql
    .replace(/\r/g, "")
    .split(";")
    .map(s => s.trim())
    .filter(s => s !== "" && !s.startsWith("--"));

  console.log("Total statements:", statements.length);
  for (let i = 0; i < statements.length; i++) {
    console.log(`Index ${i}: ${statements[i].substring(0, 100).replace(/\n/g, " ")}`);
  }
}

main();
