import { prisma } from '../../../../../lib/prisma';
import { requireAuth } from '../../../../../lib/auth-utils';

async function checkTaskAccess(taskId: string, userId: string): Promise<'NOT_FOUND' | 'FORBIDDEN' | 'OK'> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { workspaceId: true },
  });

  if (!task) return 'NOT_FOUND';

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: task.workspaceId,
        userId,
      },
    },
  });

  return member ? 'OK' : 'FORBIDDEN';
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbUser } = await requireAuth();
    const { id } = await Promise.resolve(params);

    const access = await checkTaskAccess(id, dbUser.id);
    if (access === 'NOT_FOUND') {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }
    if (access === 'FORBIDDEN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const comments = await prisma.comment.findMany({
      where: { taskId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return Response.json(comments, { status: 200 });
  } catch (error: any) {
    console.error('Failed to get comments:', error);
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbUser } = await requireAuth();
    const { id } = await Promise.resolve(params);

    const access = await checkTaskAccess(id, dbUser.id);
    if (access === 'NOT_FOUND') {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }
    if (access === 'FORBIDDEN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return Response.json({ error: 'Invalid comment content' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        taskId: id,
        userId: dbUser.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return Response.json(comment, { status: 201 });
  } catch (error: any) {
    console.error('Failed to post comment:', error);
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
