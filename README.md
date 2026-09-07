# KANSO - Next.js & Supabase PostgreSQL Team Task Board

A high-throughput, modern Trello-like team productivity workspace engineered with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **Supabase PostgreSQL**.

---

## ⚡ Quick Start for Next.js & Supabase

### 1. Prerequisites
- Node.js 18.18+ or 20+
- A free account on [Supabase](https://supabase.com) (or any PostgreSQL instance)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Inside `.env.local`, configure your Supabase database credentials:
```env
# Supabase Transaction Pooler (port 6543)
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection for Prisma Migrations (port 5432)
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase Public API Keys
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"
```

### 4. Run Prisma Database Migrations
Initialize the schema and generate the Prisma Client:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Seed Initial Data (Workspaces, Team Members, Tasks)
Populate your Supabase database with realistic team members, tickets, and columns:
```bash
npm run prisma:seed
```

### 6. Launch the Next.js Development Server
```bash
npm run dev:next
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Architecture

```
├── app/
│   ├── api/
│   │   ├── tasks/
│   │   │   ├── route.ts          # GET (list tasks by workspace), POST (create task)
│   │   │   └── [id]/route.ts     # PATCH (status, priority, assignee), DELETE
│   │   ├── workspaces/
│   │   │   └── route.ts          # GET (all workspaces), POST (new workspace)
│   │   └── members/
│   │       └── route.ts          # POST (invite new team member)
│   ├── layout.tsx                # Next.js App Router root layout & fonts
│   ├── page.tsx                  # Home route
│   └── globals.css               # Tailwind CSS & Geist Mono variable definitions
│
├── prisma/
│   ├── schema.prisma             # Data models: User, Workspace, Member, Task, Subtask
│   └── seed.ts                   # Realistic engineering team seed data
│
├── lib/
│   ├── prisma.ts                 # Cached Prisma Client instance
│   ├── supabase.ts               # Supabase JS Client
│   └── utils.ts                  # cn, formatting, date helpers
│
├── src/                          # Modular React UI components & board engine
│   ├── components/
│   │   ├── kanban/               # KanbanBoard, KanbanColumn, TaskCard, TaskDetailModal, NewTaskModal
│   │   ├── navigation/           # Header, WorkspaceSwitcher
│   │   ├── workspace/            # CreateWorkspaceModal, InviteMemberModal
│   │   └── ui/                   # Button, Badge, Modal, Input, Avatar
│   └── types.ts                  # Shared TypeScript interfaces & enums
│
├── next.config.mjs               # Next.js configuration
└── package.json                  # Dependencies & scripts
```

---

## 🛡️ Database Models (Prisma)

- **User**: Profile information (`email`, `name`, `avatar`, `role`).
- **Workspace**: Multi-tenant projects (`name`, `slug`, `color`, `description`).
- **WorkspaceMember**: Connects users to workspaces with granular roles (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`).
- **Task**: Tickets (`ticketId`, `title`, `description`, `status`, `priority`, `dueDate`, `tags`).
- **Subtask**: Hierarchical checklists with completion progress.

---

## 🚀 Useful Scripts

| Script | Purpose |
|---|---|
| `npm run dev:next` | Start Next.js App Router local server |
| `npm run build:next` | Build Next.js for production |
| `npm run prisma:generate` | Regenerate Prisma Client types |
| `npm run prisma:migrate` | Apply schema migrations to Supabase Postgres |
| `npm run prisma:studio` | Launch visual Prisma Studio database GUI |
| `npm run prisma:seed` | Seed initial database records |
| `npm run dev` | Start Vite development preview |
