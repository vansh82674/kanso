import { prisma } from '../../../../../lib/prisma';
import { requireAuth } from '../../../../../lib/auth-utils';
import { GoogleGenAI } from '@google/genai';

async function checkTaskAccess(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { workspaceId: true, title: true, description: true },
  });

  if (!task) return null;

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: task.workspaceId,
        userId,
      },
    },
  });

  if (!member) return null;
  return { task, role: member.role };
}

// POST /api/tasks/[id]/ai-subtasks
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbUser } = await requireAuth();
    const { id } = await params;

    const access = await checkTaskAccess(id, dbUser.id);
    if (!access) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: 'GEMINI_API_KEY is not configured in environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const mode = body.mode || 'append'; // 'append' or 'overwrite'

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
You are an expert project manager. I have a task that needs to be broken down into actionable subtasks.
Task Title: ${access.task.title}
Task Description: ${access.task.description || 'No description provided.'}

Generate 3 to 5 logical, concise, and actionable subtasks for this task. 
Respond ONLY with a valid JSON array of objects. Do not wrap in markdown blocks like \`\`\`json.
Each object should have exactly one property "title" (string).

Example output:
[
  { "title": "Analyze the requirements" },
  { "title": "Implement the core logic" },
  { "title": "Write unit tests" }
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const responseText = response.text?.trim() || '[]';
    let newSubtasks;
    try {
      // Clean up potential markdown formatting if the model ignored instructions
      const jsonStr = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      newSubtasks = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', responseText);
      return Response.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    if (!Array.isArray(newSubtasks)) {
      return Response.json({ error: 'Invalid AI response format' }, { status: 500 });
    }

    // Now update the task in the database
    let updatedTask;

    if (mode === 'overwrite') {
      updatedTask = await prisma.task.update({
        where: { id },
        data: {
          subtasks: {
            deleteMany: {},
            create: newSubtasks.map((st: any) => ({
              title: st.title,
              completed: false,
            })),
          },
        },
        include: {
          subtasks: true,
          assignee: true,
        },
      });
    } else {
      // Append mode
      updatedTask = await prisma.task.update({
        where: { id },
        data: {
          subtasks: {
            create: newSubtasks.map((st: any) => ({
              title: st.title,
              completed: false,
            })),
          },
        },
        include: {
          subtasks: true,
          assignee: true,
        },
      });
    }

    const formattedUpdatedTask = {
      ...updatedTask,
      status: updatedTask.status.toLowerCase(),
      priority: updatedTask.priority.toLowerCase(),
    };

    return Response.json(formattedUpdatedTask, { status: 200 });
  } catch (error: any) {
    console.error('AI subtask generation failed:', error);
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json(
      { error: error?.message || 'Failed to generate subtasks' },
      { status: 500 }
    );
  }
}
