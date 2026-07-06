import * as fs from "fs";
import * as path from "path";

function main() {
  const migPath = path.join(__dirname, "../prisma/migrations/20260704160800_add_historical_prices/migration.sql");
  const lines = fs.readFileSync(migPath, "utf-8").split("\n");
  console.log(`Total lines in file: ${lines.length}`);
  for (let i = 25; i < 245; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}

main();
