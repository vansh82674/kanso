import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.task.findMany({ select: { id: true, ticketId: true, title: true } }).then(console.log).finally(() => prisma.$disconnect());
