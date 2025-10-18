import { PrismaClient } from "@/src/server/db/generated/prisma";

// Prevent multiple instances of PrismaClient in development
declare global { 
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
