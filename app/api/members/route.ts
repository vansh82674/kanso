import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth-utils';

// POST /api/members
export async function POST(request: Request) {
  try {
    const { dbUser } = await requireAuth();
    const body = await request.json();
    const { workspaceId, email, name, role = 'MEMBER' } = body;

    if (!workspaceId || !email) {
      return Response.json(
        { error: 'workspaceId and email are required' },
        { status: 400 }
      );
    }

    // Verify current user is ADMIN or OWNER
    const currentMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: dbUser.id,
        },
      },
    });

    if (!currentMember || (currentMember.role !== 'ADMIN' && currentMember.role !== 'OWNER')) {
      return Response.json({ error: 'Forbidden: Requires Admin or Owner role' }, { status: 403 });
    }

    // Check if the user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        members: {
          where: { workspaceId }
        }
      }
    });

    if (existingUser && existingUser.members.length > 0) {
      return Response.json({ error: 'User is already a member of this workspace' }, { status: 400 });
    }

    // Convert role to uppercase to match Prisma MemberRole enum
    const uppercaseRole = role ? role.toUpperCase() : 'MEMBER';

    // Generate invite
    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await prisma.workspaceInvite.upsert({
      where: {
        workspaceId_email: {
          workspaceId,
          email,
        },
      },
      update: {
        role: uppercaseRole,
        expiresAt,
        // Optional: you could refresh the token here if you want to invalidate old ones
      },
      create: {
        workspaceId,
        email,
        role: uppercaseRole,
        expiresAt,
      },
    });

    return Response.json({
      message: 'Invitation generated successfully',
      invite: {
        token: invite.token,
        email: invite.email,
        role: invite.role.toLowerCase(),
        expiresAt: invite.expiresAt,
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to generate invite:', error);
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json(
      { error: error?.message || 'Failed to generate invitation' },
      { status: 500 }
    );
  }
}
