# KANSO v1 - Next.js & Supabase PostgreSQL Team Task Board

A high-throughput, modern Trello-like team productivity workspace engineered with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **Supabase PostgreSQL**.

---

## ✨ V1 Features

- **Supabase Authentication**: Secure email and password authentication out-of-the-box (`@supabase/ssr`).
- **PostgreSQL Database**: Powered by Supabase Postgres and managed via Prisma ORM.
- **Dynamic Workspaces**: Create multi-tenant projects with unique colors and switch between them instantly.
- **Secure Workspace Invitations**: A robust, opt-in invite system that generates secure tokens (`/join?token=...`) with a dedicated landing page for users to accept or decline invites.
- **Real-time Kanban Engine**: Drag-and-drop tasks across columns. Changes are saved instantly to the database.
- **Role-Based Access Control (RBAC)**: Secure board state and task actions based on workspace member roles (Owner, Admin, Member, Viewer). Only assignees and privileged roles can edit tasks or change status.
- **Collaboration Hub**: Real-time task comments and activity feed. Engage with your team directly inside the Task Detail Modal with chronological feeds, user avatars, and instant `Cmd/Ctrl+Enter` posting.
- **AI Task Breakdown (Google Gemini)**: Automatically generate intelligent subtasks for any ticket using `gemini-3.6-flash`.
- **Live Assignment Notifications**: Native `react-hot-toast` notifications trigger instantly via Supabase `postgres_changes` channels when work is delegated to you.
- **Task Management**: Create, edit, duplicate, and safely delete tasks via custom, sleek confirmation modals.
- **UI & UX Polish**: Features beautiful loading skeletons, global notifications, and custom scrollbars.

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
npx prisma db push
```

### 5. Launch the Next.js Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Architecture

```
├── app/
│   ├── api/
│   │   ├── invites/          # GET, POST (accept/decline invites securely)
│   │   ├── tasks/            # GET, POST, PATCH, DELETE (Task CRUD)
│   │   ├── workspaces/       # GET, POST (Workspace CRUD)
│   │   └── members/          # POST (generate invite tokens)
│   ├── join/                 # /join?token=... landing page for invites
│   ├── login/                # Supabase auth login / signup page
│   ├── dashboard/            # Protected Kanban dashboard
│   ├── layout.tsx            # Next.js App Router root layout & fonts
│   └── page.tsx              # Landing page
│
├── prisma/
│   ├── schema.prisma         # Data models
│
├── lib/
│   ├── prisma.ts             # Cached Prisma Client instance
│   ├── supabase/             # Supabase client / server setup
│   └── auth-utils.ts         # Authentication helper functions
│
├── src/                      # Modular React UI components & board engine
│   ├── components/
│   │   ├── kanban/           # KanbanBoard, KanbanColumn, TaskCard, TaskDetailModal
│   │   ├── workspace/        # CreateWorkspaceModal, InviteMemberModal
│   │   └── ui/               # Button, Badge, Modal, Input, ConfirmModal
```

---

## 🛡️ Database Models (Prisma)

- **User**: Profile information (`email`, `name`, `avatar`, `role`).
- **Workspace**: Multi-tenant projects (`name`, `slug`, `color`, `description`).
- **WorkspaceMember**: Connects users to workspaces with granular roles (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`).
- **WorkspaceInvite**: Secure pending invitation tokens with expirations.
- **Task**: Tickets (`ticketId`, `title`, `description`, `status`, `priority`, `dueDate`, `tags`).
- **Subtask**: Hierarchical checklists with completion progress.
- **Comment**: Chronological task activity logs (`content`, `taskId`, `userId`).
