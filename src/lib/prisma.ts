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
  // and append project reference to the username if it is missing (fixes ENOIDENTIFIER / no tenant identifier error)
  try {
    const parsedUrl = new URL(connectionString);
    
    // Extract project reference from hostname or the NEXT_PUBLIC_SUPABASE_URL environment variable
    let projectRef = "";
    const hostnameMatch = parsedUrl.hostname.match(/db\.([a-zA-Z0-9]+)\.supabase\.co/) || 
                          parsedUrl.hostname.match(/^([a-zA-Z0-9]+)\.supabase\.co$/);
    if (hostnameMatch) {
      projectRef = hostnameMatch[1];
    } else if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const sbMatch = process.env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/(.*?)\.supabase\.co/);
      if (sbMatch) {
        projectRef = sbMatch[1];
      }
    }

    if (projectRef) {
      // 1. If it's a direct Supabase host on port 5432, route to the IPv4 transaction pooler on port 6543
      if (parsedUrl.hostname.includes(".supabase.co") && !parsedUrl.hostname.includes("pooler.supabase.com")) {
        parsedUrl.hostname = `aws-1-ap-southeast-1.pooler.supabase.com`;
        parsedUrl.port = "6543";
      }

      // 2. Ensure username has the tenant suffix (e.g., .tfswokhkuxwvpcpxekso)
      // Supavisor connection pooler requires username in format: username.projectRef (e.g., postgres.tfswokhkuxwvpcpxekso)
      // If the suffix is missing, it throws a fatal (ENOIDENTIFIER) "no tenant identifier provided" error.
      if (parsedUrl.username && !parsedUrl.username.endsWith(`.${projectRef}`)) {
        parsedUrl.username = `${parsedUrl.username}.${projectRef}`;
      }

      connectionString = parsedUrl.toString();
    }
  } catch (error) {
    console.warn("[PRISMA DIAGNOSTICS] Failed to parse DATABASE_URL with URL parser, using fallback regex", error);
    // Fallback regex in case of URL parsing issues (e.g. invalid syntax)
    if (connectionString.includes(".supabase.co") && !connectionString.includes("pooler.supabase.com")) {
      const match = connectionString.match(/db\.([a-zA-Z0-9]+)\.supabase\.co/);
      if (match) {
        const projectRef = match[1];
        connectionString = connectionString
          .replace(`db.${projectRef}.supabase.co:5432`, `aws-1-ap-southeast-1.pooler.supabase.com:6543`)
          .replace(`db.${projectRef}.supabase.co`, `aws-1-ap-southeast-1.pooler.supabase.com:6543`);
      }
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
