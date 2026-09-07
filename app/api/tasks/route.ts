import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth-utils';

// GET /api/tasks?workspaceId=...
export async function GET(request: Request) {
  try {
    const { dbUser } = await requireAuth();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return Response.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    // Verify user is a member of this workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: dbUser.id,
        },
      },
    });

    if (!member) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tasks = await prisma.task.findMany({
      where: { workspaceId },
      include: {
        subtasks: true,
        assignee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedTasks = tasks.map(t => ({
      ...t,
      status: t.status.toLowerCase(),
      priority: t.priority.toLowerCase(),
    }));

    return Response.json(formattedTasks, { status: 200 });
  } catch (error: any) {
    console.error('Failed to fetch tasks:', error);
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json(
      { error: error?.message || 'Failed to fetch tasks from database' },
      { status: 500 }
    );
  }
}

// POST /api/tasks
export async function POST(request: Request) {
  try {
    const { dbUser } = await requireAuth();
    const body = await request.json();
    const {
      title,
      description,
      status = 'todo',
      priority = 'medium',
      workspaceId,
      assigneeId,
      dueDate,
      tags = [],
      subtasks = [],
    } = body;

    if (!title || !workspaceId) {
      return Response.json(
        { error: 'Title and Workspace ID are required' },
        { status: 400 }
      );
    }

    // Verify user is a member of this workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: dbUser.id,
        },
      },
    });

    if (!member) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate ticket ID
    const count = await prisma.task.count({ where: { workspaceId } });
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    const prefix = workspace ? workspace.slug.slice(0, 3).toUpperCase() : 'TSK';
    const ticketId = `${prefix}-${100 + count + 1}`;

    const newTask = await prisma.task.create({
      data: {
        ticketId,
        title,
        description,
        status: status.toUpperCase() as any,
        priority: priority.toUpperCase() as any,
        workspaceId,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags,
        subtasks: {
          create: subtasks.map((st: { title: string; completed?: boolean }) => ({
            title: st.title,
            completed: Boolean(st.completed),
          })),
        },
      },
      include: {
        subtasks: true,
        assignee: true,
      },
    });

    const formattedNewTask = {
      ...newTask,
      status: newTask.status.toLowerCase(),
      priority: newTask.priority.toLowerCase(),
    };

    return Response.json(formattedNewTask, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create task:', error);
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json(
      { error: error?.message || 'Failed to create task in database' },
      { status: 500 }
    );
  }
}
