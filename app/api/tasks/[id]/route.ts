import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/auth-utils';

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

// PATCH /api/tasks/[id]
export async function PATCH(
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

    const {
      title,
      description,
      status,
      priority,
      assigneeId,
      dueDate,
      tags,
      subtasks, // Expect an array of { id?: string, title: string, completed: boolean }
    } = body;

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (status !== undefined) dataToUpdate.status = status.toUpperCase();
    if (priority !== undefined) dataToUpdate.priority = priority.toUpperCase();
    if (assigneeId !== undefined) dataToUpdate.assigneeId = assigneeId || null;
    if (dueDate !== undefined) dataToUpdate.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) dataToUpdate.tags = tags;

    // Handle subtasks if provided
    if (subtasks !== undefined) {
      dataToUpdate.subtasks = {
        deleteMany: {}, // Delete all existing subtasks
        create: subtasks.map((st: any) => ({
          title: st.title,
          completed: Boolean(st.completed),
        })), // Recreate them
      };
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: dataToUpdate,
      include: {
        subtasks: true,
        assignee: true,
      },
    });

    const formattedUpdatedTask = {
      ...updatedTask,
      status: updatedTask.status.toLowerCase(),
      priority: updatedTask.priority.toLowerCase(),
    };

    return Response.json(formattedUpdatedTask, { status: 200 });
  } catch (error: any) {
    console.error('Failed to update task:', error);
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error?.code === 'P2025') {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }
    return Response.json(
      { error: error?.message || 'Failed to update task in database' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(
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

    await prisma.task.delete({
      where: { id },
    });

    return Response.json({ success: true, deletedId: id }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to delete task:', error);
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error?.code === 'P2025') {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }
    return Response.json(
      { error: error?.message || 'Failed to delete task from database' },
      { status: 500 }
    );
  }
}
