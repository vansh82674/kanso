import { prisma } from '../../../../../lib/prisma';
import { requireAuth } from '../../../../../lib/auth-utils';
import { NextResponse } from 'next/server';

// POST /api/invites/[token]/accept
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { dbUser } = await requireAuth();
    const { token } = await Promise.resolve(params);

    const invite = await prisma.workspaceInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found or expired' }, { status: 404 });
    }

    if (new Date() > invite.expiresAt) {
      await prisma.workspaceInvite.delete({ where: { token } });
      return NextResponse.json({ error: 'Invite has expired' }, { status: 410 });
    }

    // Optional: Ensure the logged-in user matches the invited email
    // if (dbUser.email !== invite.email) {
    //   return NextResponse.json({ error: 'This invite is for a different email address' }, { status: 403 });
    // }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: invite.workspaceId,
          userId: dbUser.id,
        }
      }
    });

    if (existingMember) {
      // Delete invite if they are already a member
      await prisma.workspaceInvite.delete({ where: { token } });
      return NextResponse.json({ message: 'You are already a member of this workspace' });
    }

    // Create the member and delete the invite in a transaction
    await prisma.$transaction([
      prisma.workspaceMember.create({
        data: {
          workspaceId: invite.workspaceId,
          userId: dbUser.id,
          role: invite.role,
        }
      }),
      prisma.workspaceInvite.delete({
        where: { token }
      })
    ]);

    return NextResponse.json({ message: 'Successfully joined workspace', workspaceId: invite.workspaceId }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to accept invite:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to accept invite' },
      { status: 500 }
    );
  }
}
