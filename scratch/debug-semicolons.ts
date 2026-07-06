import * as fs from "fs";
import * as path from "path";

function main() {
  const migPath = path.join(__dirname, "../prisma/migrations/20260704160800_add_historical_prices/migration.sql");
  const sql = fs.readFileSync(migPath, "utf-8").replace(/\r/g, "");
  
  // Let's count semicolons in sql
  const semicolonIndices: number[] = [];
  let pos = sql.indexOf(";");
  while (pos !== -1) {
    semicolonIndices.push(pos);
    pos = sql.indexOf(";", pos + 1);
  }
  console.log(`Total semicolons found: ${semicolonIndices.length}`);
  
  const splits = sql.split(";");
  console.log(`Total splits: ${splits.length}`);
  splits.forEach((part, index) => {
    const trimmed = part.trim();
    if (trimmed.length > 0) {
      console.log(`Split ${index} (length ${trimmed.length}): ${trimmed.substring(0, 100).replace(/\n/g, " ")}`);
    } else {
      console.log(`Split ${index} is EMPTY`);
    }
  });
}

main();
