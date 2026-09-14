import { prisma } from '../../../../../../lib/prisma';
import { requireAuth } from '../../../../../../lib/auth-utils';

async function checkTaskAccess(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { workspaceId: true },
  });

  if (!task) return false;

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: task.workspaceId,
        userId,
      },
    },
  });

  return member;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { dbUser } = await requireAuth();
    const { id, commentId } = await Promise.resolve(params);

    const member = await checkTaskAccess(id, dbUser.id);
    if (!member) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return Response.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Only the author or workspace admins/owners can delete the comment
    if (comment.userId !== dbUser.id && member.role !== 'ADMIN' && member.role !== 'OWNER') {
      return Response.json({ error: 'Forbidden to delete this comment' }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return Response.json({ success: true, deletedId: commentId }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to delete comment:', error);
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
