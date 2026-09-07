'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Database, FileCode, Copy, Check, Terminal, ExternalLink, ArrowRight } from 'lucide-react';

interface ExportGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportGuideModal({ isOpen, onClose }: ExportGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'prisma' | 'routes' | 'env'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const prismaSchemaCode = `// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum MemberRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

model User {
  id        String            @id @default(cuid())
  email     String            @unique
  name      String
  avatar    String?
  role      String?
  members   WorkspaceMember[]
  tasks     Task[]
  createdAt DateTime          @default(now())
}

model Workspace {
  id          String            @id @default(cuid())
  name        String
  slug        String            @unique
  description String?
  color       String            @default("#6366f1")
  members     WorkspaceMember[]
  tasks       Task[]
  createdAt   DateTime          @default(now())
}

model WorkspaceMember {
  id          String     @id @default(cuid())
  workspaceId String
  userId      String
  role        MemberRole @default(MEMBER)
  workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId])
}

model Task {
  id          String        @id @default(cuid())
  ticketId    String
  title       String
  description String?
  status      TaskStatus    @default(TODO)
  priority    TaskPriority  @default(MEDIUM)
  workspaceId String
  assigneeId  String?
  dueDate     DateTime?
  tags        String[]      @default([])
  subtasks    Subtask[]
  workspace   Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  assignee    User?         @relation(fields: [assigneeId], references: [id], onDelete: SetNull)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model Subtask {
  id        String   @id @default(cuid())
  taskId    String
  title     String
  completed Boolean  @default(false)
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
}`;

  const routeCode = `// app/api/tasks/route.ts
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');
  const where = workspaceId ? { workspaceId } : {};

  const tasks = await prisma.task.findMany({
    where,
    include: { subtasks: true, assignee: true },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, description, status, priority, workspaceId, assigneeId, dueDate, tags } = body;

  const count = await prisma.task.count({ where: { workspaceId } });
  const ticketId = \`TSK-\${100 + count + 1}\`;

  const task = await prisma.task.create({
    data: {
      ticketId,
      title,
      description,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      workspaceId,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: tags || [],
    },
    include: { subtasks: true },
  });

  return Response.json(task, { status: 201 });
}`;

  const envCode = `# .env.local
# Supabase Transaction Pooler (port 6543) for Next.js App
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection for Prisma Migrations (port 5432)
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase Public API Keys
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Next.js + Prisma + Supabase Architecture"
      description="Your project source code is fully configured with Next.js App Router, Prisma ORM, and Supabase PostgreSQL."
      maxWidth="xl"
    >
      <div className="space-y-4 pt-1">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Setup & Download</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prisma')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'prisma'
                ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>schema.prisma</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'routes'
                ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span>API Routes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('env')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'env'
                ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase Env</span>
          </button>
        </div>

        {/* Tab 1: Overview & Download Info */}
        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                  How to Download ZIP & Run
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">
                  Ready for Export
                </span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 leading-relaxed">
                <li>Click the top-right Settings menu in AI Studio and select <strong className="text-zinc-200">Export as ZIP</strong> or <strong className="text-zinc-200">Push to GitHub</strong>.</li>
                <li>Unzip the archive and open the terminal in the directory.</li>
                <li>Run <code className="text-zinc-200 bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">npm install</code> to install Next.js & Prisma.</li>
                <li>Run <code className="text-zinc-200 bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">npx prisma migrate dev</code> to apply schema to your Supabase PostgreSQL.</li>
                <li>Run <code className="text-zinc-200 bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">npm run dev:next</code> to boot the Next.js App Router server.</li>
              </ol>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 space-y-2">
              <div className="text-zinc-300 font-semibold text-[11px] uppercase tracking-wider">
                Generated Next.js App Router Files in Workspace:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-400">
                <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-200 font-bold">/prisma/schema.prisma</span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Supabase PostgreSQL data models</p>
                </div>
                <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-200 font-bold">/prisma/seed.ts</span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Initial team members & tasks seeder</p>
                </div>
                <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-200 font-bold">/app/api/tasks/route.ts</span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Next.js GET & POST route handlers</p>
                </div>
                <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-200 font-bold">/app/layout.tsx & page.tsx</span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Next.js 14/15 App Router entry points</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Prisma Schema */}
        {activeTab === 'prisma' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">prisma/schema.prisma</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(prismaSchemaCode, 'prisma')}
                className="text-xs font-mono h-7 px-2"
              >
                {copiedKey === 'prisma' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400 mr-1" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    <span>Copy Schema</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 max-h-64 overflow-y-auto overflow-x-auto leading-relaxed">
              {prismaSchemaCode}
            </pre>
          </div>
        )}

        {/* Tab 3: API Route */}
        {activeTab === 'routes' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">app/api/tasks/route.ts</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(routeCode, 'route')}
                className="text-xs font-mono h-7 px-2"
              >
                {copiedKey === 'route' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400 mr-1" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    <span>Copy Route</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 max-h-64 overflow-y-auto overflow-x-auto leading-relaxed">
              {routeCode}
            </pre>
          </div>
        )}

        {/* Tab 4: Environment Variables */}
        {activeTab === 'env' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">.env.local (Supabase PostgreSQL)</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(envCode, 'env')}
                className="text-xs font-mono h-7 px-2"
              >
                {copiedKey === 'env' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400 mr-1" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    <span>Copy .env</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 max-h-64 overflow-y-auto overflow-x-auto leading-relaxed">
              {envCode}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-zinc-800 flex justify-end">
          <Button variant="default" size="sm" onClick={onClose} className="font-mono text-xs">
            Done
            <ArrowRight className="w-3 h-3 ml-1.5" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
