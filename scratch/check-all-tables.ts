import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Fetching all tables in 'public' schema...");
  try {
    const tables: any[] = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log("Tables in public schema:");
    tables.forEach((t) => console.log(` - ${t.table_name}`));
  } catch (error) {
    console.error("Error executing query:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
