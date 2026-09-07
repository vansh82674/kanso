// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma: any = new (PrismaClient as any)();

async function main() {
  console.log('Seeding Supabase PostgreSQL database...');

  // 1. Create realistic team users
  const user1 = await prisma.user.upsert({
    where: { email: 'elena.rostova@acme.dev' },
    update: {},
    create: {
      email: 'elena.rostova@acme.dev',
      name: 'Elena Rostova',
      role: 'Staff Platform Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'marcus.vance@acme.dev' },
    update: {},
    create: {
      email: 'marcus.vance@acme.dev',
      name: 'Marcus Vance',
      role: 'Frontend Systems Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'sarah.chen@acme.dev' },
    update: {},
    create: {
      email: 'sarah.chen@acme.dev',
      name: 'Sarah Chen',
      role: 'Principal Product Designer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'devon.lane@acme.dev' },
    update: {},
    create: {
      email: 'devon.lane@acme.dev',
      name: 'Devon Lane',
      role: 'Distributed Systems Eng',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 2. Create core workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'eng-core' },
    update: {},
    create: {
      name: 'Core Platform Engineering',
      slug: 'eng-core',
      description: 'Distributed infrastructure, latency reduction, and microservice orchestration.',
      color: '#3b82f6',
    },
  });

  // 3. Connect workspace members
  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: user1.id,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: user1.id,
      role: 'OWNER',
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: user2.id,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: user2.id,
      role: 'ADMIN',
    },
  });

  // 4. Create initial tasks
  const task1 = await prisma.task.create({
    data: {
      ticketId: 'ENG-101',
      title: 'Migrate connection pool to Supabase PgBouncer',
      description: 'Switch application database configuration from raw TCP sockets to port 6543 pooled connection.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      workspaceId: workspace.id,
      assigneeId: user1.id,
      tags: ['database', 'performance', 'infra'],
      subtasks: {
        create: [
          { title: 'Update Prisma directUrl and pooler URL', completed: true },
          { title: 'Verify SSL mode in production', completed: true },
          { title: 'Run load simulation under 1,000 req/s', completed: false },
        ],
      },
    },
  });

  console.log(`Seeding complete! Workspace ID: ${workspace.id}, Task: ${task1.ticketId}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
