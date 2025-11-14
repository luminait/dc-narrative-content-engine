import "server-only";
import { PrismaClient } from "@/src/server/db/generated/prisma";
import { withAccelerate } from '@prisma/extension-accelerate'

// Declare a global variable to hold the Prisma client instance
const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

// Initialize Prisma Client
const prisma =
    globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  }).$extends(withAccelerate());

// In development, assign the Prisma client to the global variable
if (process.env.NODE_ENV !== "production") {
    // @ts-ignore
    globalForPrisma.prisma = prisma;
}


export { prisma };
export default prisma;
