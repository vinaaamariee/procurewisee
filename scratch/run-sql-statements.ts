import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const migPath = path.join(__dirname, "../prisma/migrations/20260704160800_add_historical_prices/migration.sql");
  const sql = fs.readFileSync(migPath, "utf-8");
  
  const rawSplits = sql.replace(/\r/g, "").split(";");
  const statements: string[] = [];

  for (const part of rawSplits) {
    // Strip SQL line comments
    const cleanStmt = part
      .split("\n")
      .map(line => {
        const commentIdx = line.indexOf("--");
        return commentIdx !== -1 ? line.substring(0, commentIdx) : line;
      })
      .join("\n")
      .trim();

    if (cleanStmt !== "") {
      statements.push(cleanStmt);
    }
  }

  console.log(`Found ${statements.length} SQL statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`\nExecuting Statement ${i + 1}/${statements.length}:`);
    console.log(stmt.substring(0, 150) + (stmt.length > 150 ? "..." : ""));
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log("-> Success");
    } catch (e: any) {
      console.error("-> Error:", e.message);
    }
  }

  await prisma.$disconnect();
}

main();
