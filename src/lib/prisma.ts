import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { URL } from "url";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment variables.");
  }

  // Parse the connection string using Node's standard URL parser.
  // This correctly handles special characters and URL-encoded components.
  const dbUrl = new URL(connectionString);
  
  const pool = new Pool({
    user: dbUrl.username,
    password: decodeURIComponent(dbUrl.password || ""),
    host: dbUrl.hostname,
    port: dbUrl.port ? parseInt(dbUrl.port) : 5432,
    database: dbUrl.pathname.substring(1),
    ssl: dbUrl.searchParams.get("sslmode") !== "disable" ? { rejectUnauthorized: false } : undefined,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
