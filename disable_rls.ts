import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE "Task" DISABLE ROW LEVEL SECURITY;`);
  console.log("Disabled RLS on Task table");
}

main().finally(() => prisma.$disconnect());
