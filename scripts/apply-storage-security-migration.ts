import "dotenv/config";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { prisma } from "../src/lib/prisma";

async function main() {
  const migrationPath = resolve(process.cwd(), "migrations/secure_ppmp_document_storage.sql");
  const sql = await readFile(migrationPath, "utf8");

  await prisma.$executeRawUnsafe(sql);

  const buckets = await prisma.$queryRawUnsafe<Array<{ id: string; public: boolean }>>(
    "select id, public from storage.buckets where id = 'ppmp-documents'",
  );
  const policies = await prisma.$queryRawUnsafe<Array<{ policyname: string }>>(
    "select policyname from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'ppmp_document_owner_%' order by policyname",
  );

  if (buckets.length !== 1 || buckets[0].public) {
    throw new Error("PPMP document bucket was not verified as private.");
  }
  if (policies.length !== 3) {
    throw new Error(`Expected 3 PPMP Storage policies, found ${policies.length}.`);
  }

  console.log("PPMP Storage security migration applied and verified.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
