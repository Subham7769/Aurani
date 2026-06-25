import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Lazy singleton — deferred until first property access so a missing
// DATABASE_URL doesn't crash the module at import time.
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_t, prop) {
    if (!globalForPrisma.__prisma) {
      globalForPrisma.__prisma = createPrismaClient();
    }
    const val = (globalForPrisma.__prisma as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === "function" ? val.bind(globalForPrisma.__prisma) : val;
  },
});
