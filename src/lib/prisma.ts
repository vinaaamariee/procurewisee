import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment variables.");
  }

  // Strip carriage returns (\r), whitespace, and outer quotes (common Windows CRLF issue)
  connectionString = connectionString.replace(/\r/g, "").trim().replace(/^["']|["']$/g, "").trim();

  // Dynamically rewrite direct IPv6 Supabase connection URLs to the IPv4 transaction pooler URL (port 6543)
  // to prevent P1001 database connection timeouts in serverless production environments (e.g., Vercel)
  if (connectionString.includes(".supabase.co") && !connectionString.includes("pooler.supabase.com")) {
    const match = connectionString.match(/db\.([a-zA-Z0-9]+)\.supabase\.co/);
    if (match) {
      const projectRef = match[1];
      // Map to the transaction pooler (port 6543) in the Singapore region (aws-1-ap-southeast-1)
      connectionString = connectionString
        .replace(`db.${projectRef}.supabase.co:5432`, `aws-1-ap-southeast-1.pooler.supabase.com:6543`)
        .replace(`db.${projectRef}.supabase.co`, `aws-1-ap-southeast-1.pooler.supabase.com:6543`);
    }
  }

  // Securely log connection details (masking the password) for debugging
  const maskedConn = connectionString.replace(/:[^:@]+@/, ":[MASKED]@");
  console.log(`[PRISMA DIAGNOSTICS] Connecting with URL: ${maskedConn}`);

  // Pass connectionString directly to pg Pool
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 10000,
    statement_timeout: 20000,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
