import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Checking current_setting variables...");
  const queries = [
    "SELECT current_setting('app.settings.jwt_secret', true) as jwt_secret",
    "SELECT current_setting('app.settings.anon_key', true) as anon_key",
    "SELECT current_setting('app.settings.service_key', true) as service_key",
    "SELECT current_setting('jwt.secret', true) as jwt_secret",
  ];

  for (const q of queries) {
    try {
      console.log(`\nRunning: ${q}`);
      const res = await prisma.$queryRawUnsafe(q);
      console.log(JSON.stringify(res, null, 2));
    } catch (error: any) {
      console.error("Error:", error.message);
    }
  }

  await prisma.$disconnect();
}

main();



