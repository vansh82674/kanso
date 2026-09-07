import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/invites/[token]
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    const invite = await prisma.workspaceInvite.findUnique({
      where: { token },
      include: {
        workspace: true,
      },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found or expired' }, { status: 404 });
    }

    if (new Date() > invite.expiresAt) {
      // Clean up expired invite
      await prisma.workspaceInvite.delete({ where: { token } });
      return NextResponse.json({ error: 'Invite has expired' }, { status: 410 });
    }

    return NextResponse.json({
      token: invite.token,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
      workspace: {
        id: invite.workspace.id,
        name: invite.workspace.name,
        color: invite.workspace.color,
      }
    });
  } catch (error: any) {
    console.error('Failed to fetch invite:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invite details' },
      { status: 500 }
    );
  }
}
