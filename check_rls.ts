import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRawUnsafe(`
    SELECT relrowsecurity 
    FROM pg_class 
    WHERE relname = 'Task';
  `);
  console.log("RLS enabled?", result);
}

main().finally(() => prisma.$disconnect());
