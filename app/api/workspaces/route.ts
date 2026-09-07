import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth-utils';

// GET /api/workspaces
export async function GET() {
  try {
    const { dbUser } = await requireAuth();

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: dbUser.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Map Prisma structure to Frontend Workspace type
    const formattedWorkspaces = workspaces.map((ws) => ({
      ...ws,
      members: ws.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        role: m.role,
        joinedAt: m.joinedAt || ws.createdAt,
      })),
    }));

    return Response.json(formattedWorkspaces, { status: 200 });
  } catch (error: any) {
    console.error('Failed to fetch workspaces:', error);
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json(
      { error: error?.message || 'Failed to fetch workspaces from database' },
      { status: 500 }
    );
  }
}

// POST /api/workspaces
export async function POST(request: Request) {
  try {
    const { dbUser } = await requireAuth();
    const body = await request.json();
    const { name, slug, description, color = '#6366f1' } = body;

    if (!name || !slug) {
      return Response.json(
        { error: 'Workspace name and slug are required' },
        { status: 400 }
      );
    }

    const newWorkspace = await prisma.workspace.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        description,
        color,
        members: {
          create: {
            userId: dbUser.id,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    const formattedWorkspace = {
      ...newWorkspace,
      members: newWorkspace.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        role: m.role,
        joinedAt: m.joinedAt || newWorkspace.createdAt,
      })),
    };

    return Response.json(formattedWorkspace, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create workspace:', error);
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json(
      { error: error?.message || 'Failed to create workspace in database' },
      { status: 500 }
    );
  }
}
