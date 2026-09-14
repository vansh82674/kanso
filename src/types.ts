export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  ticketId: string; // e.g. ENG-101
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  workspaceId: string;
  assigneeId?: string;
  dueDate?: string;
  tags: string[];
  subtasks: SubTask[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  avatar: string;
  joinedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string; // hex or tailwind identifier
  icon: string;
  createdAt: string;
  members: WorkspaceMember[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  title?: string;
}

export interface ColumnDefinition {
  id: TaskStatus;
  title: string;
  badgeClass: string;
  dotColor: string;
}
