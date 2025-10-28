import "server-only";
import { PrismaClient } from "@/src/server/db/generated/prisma";

// Declare a global variable to hold the Prisma client instance
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Initialize Prisma Client
const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// In development, assign the Prisma client to the global variable
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export { prisma };
