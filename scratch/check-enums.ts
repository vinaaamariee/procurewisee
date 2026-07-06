import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Querying all custom enums and their labels...");
  try {
    const enums: any[] = await prisma.$queryRaw`
      SELECT t.typname as enum_name, e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      ORDER BY enum_name, enum_value;
    `;
    console.log("Enums found:");
    const grouped: Record<string, string[]> = {};
    enums.forEach(item => {
      if (!grouped[item.enum_name]) {
        grouped[item.enum_name] = [];
      }
      grouped[item.enum_name].push(item.enum_value);
    });
    console.log(JSON.stringify(grouped, null, 2));
  } catch (error) {
    console.error("Error executing query:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
