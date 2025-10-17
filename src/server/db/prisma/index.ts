import { PrismaClient } from "@/src/server/db/generated/prisma";

// This prevents multiple instances of Prisma Client in development
declare global {
  let prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
