import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const ws = await prisma.workspace.findFirst();
  if (!ws) {
      console.log("No workspace found");
      return;
  }
  
  const task = await prisma.task.create({
    data: {
      ticketId: 'TEST-123',
      title: 'Realtime Test Task',
      workspaceId: ws.id,
      status: 'TODO',
      priority: 'LOW'
    }
  });

  console.log("Created task:", task.id);
  
  setTimeout(async () => {
     await prisma.task.update({
         where: { id: task.id },
         data: { status: 'DONE' }
     });
     console.log("Updated task");
  }, 2000);

  setTimeout(async () => {
     await prisma.task.delete({ where: { id: task.id } });
     console.log("Deleted task");
  }, 4000);
}

main().finally(() => setTimeout(() => prisma.$disconnect(), 5000));
