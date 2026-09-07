// @ts-ignore
import { PrismaClient } from '@prisma/client';

// Declare prisma global variable for Next.js hot module reloading
const globalForPrisma = globalThis as unknown as { prisma: any };

export const prisma: any =
  globalForPrisma.prisma ??
  new (PrismaClient as any)({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
