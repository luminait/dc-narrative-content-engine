import "server-only";
import { PrismaClient } from "@/src/server/db/generated/prisma";

// Declare a global variable to hold the Prisma client instance
const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

// Initialize Prisma Client (no extensions to avoid type conflicts)
const prisma =
    globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// In development, assign the Prisma client to the global variable
if (process.env.NODE_ENV !== "production") {
    // @ts-ignore
    globalForPrisma.prisma = prisma;
}


export { prisma };
export default prisma;
