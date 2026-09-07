import { prisma } from '../../../../../lib/prisma';
import { requireAuth } from '../../../../../lib/auth-utils';
import { NextResponse } from 'next/server';

// POST /api/invites/[token]/decline
export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    // Require auth just so random people can't decline invites, although technically an invite token is a secret
    await requireAuth();
    const { token } = params;

    const invite = await prisma.workspaceInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found or already processed' }, { status: 404 });
    }

    await prisma.workspaceInvite.delete({
      where: { token }
    });

    return NextResponse.json({ message: 'Invite declined successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to decline invite:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to decline invite' },
      { status: 500 }
    );
  }
}
