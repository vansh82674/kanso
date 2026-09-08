'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';
import toast, { Toaster } from 'react-hot-toast';
import {
  Workspace,
  Task,
  User,
  WorkspaceMember,
  MemberRole,
  TaskStatus,
  TaskPriority,
} from './types';
import { Header } from './components/navigation/Header';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { CreateWorkspaceModal } from './components/workspace/CreateWorkspaceModal';
import { InviteMemberModal } from './components/workspace/InviteMemberModal';
import { ExportGuideModal } from './components/workspace/ExportGuideModal';

export default function App() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true); // Auth loading
  const [isLoadingData, setIsLoadingData] = useState(true); // Workspace & Tasks loading
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>('');

  // UI state
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isExportGuideModalOpen, setIsExportGuideModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskInitialStatus, setNewTaskInitialStatus] = useState<TaskStatus>('todo');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Authentication & Initial Data Fetch
  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Construct currentUser from session
      setCurrentUser({
        id: session.user.id,
        email: session.user.email!,
        name: session.user.email!.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.user.email!)}`,
        role: 'Engineer',
      });

      // Fetch workspaces
      try {
        const res = await fetch('/api/workspaces');
        if (!res.ok) throw new Error('Failed to fetch workspaces');
        const data = await res.json();
        setWorkspaces(data);
        if (data.length > 0) {
          setCurrentWorkspaceId(data[0].id);
        } else {
          setIsLoadingData(false);
        }
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to fetch workspaces');
        setIsLoadingData(false);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [router, supabase]);

  // Fetch Tasks when workspace changes
  useEffect(() => {
    if (!currentWorkspaceId) return;

    let isMounted = true;

    const fetchTasks = async () => {
      setIsLoadingData(true);
      try {
        const res = await fetch(`/api/tasks?workspaceId=${currentWorkspaceId}`);
        if (!res.ok) throw new Error('Failed to fetch tasks');
        const data = await res.json();
        if (isMounted) setTasks(data);
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load tasks');
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    };

    fetchTasks();

    // Setup realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Task',
        },
        (payload) => {
          // Filter by workspace ID manually on the client for INSERT/UPDATE
          if (payload.eventType !== 'DELETE') {
            const record = payload.new;
            if (record && record.workspaceId !== currentWorkspaceId) {
              return;
            }
          }

          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as any;
            const formattedTask = {
              ...newTask,
              status: newTask.status?.toLowerCase(),
              priority: newTask.priority?.toLowerCase(),
              tags: newTask.tags || [],
              subtasks: [],
            };
            setTasks((prev) => {
              if (prev.some((t) => t.id === formattedTask.id)) return prev;
              return [...prev, formattedTask];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = payload.new as any;
            setTasks((prev) => prev.map((t) => {
              if (t.id === updatedTask.id) {
                return {
                  ...t,
                  ...updatedTask,
                  status: updatedTask.status?.toLowerCase(),
                  priority: updatedTask.priority?.toLowerCase(),
                  tags: updatedTask.tags || t.tags || [],
                  subtasks: t.subtasks || [],
                };
              }
              return t;
            }));
          } else if (payload.eventType === 'DELETE') {
            const deletedTask = payload.old as any;
            setTasks((prev) => prev.filter((t) => t.id !== deletedTask.id));
          }
        }
      )
      .subscribe((status, err) => {
        console.log('Supabase realtime status:', status, err);
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [currentWorkspaceId, supabase]);

  // Keyboard shortcut listener: 'N' for new task
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        if (workspaces.length > 0) {
          setNewTaskInitialStatus('todo');
          setIsNewTaskModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workspaces.length]);

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  // Handlers
  const handleSelectWorkspace = (ws: Workspace) => {
    setCurrentWorkspaceId(ws.id);
  };

  const handleCreateWorkspace = async (newWs: Workspace) => {
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWs.name, slug: newWs.slug, description: newWs.description })
      });
      if (res.ok) {
        const created = await res.json();
        setWorkspaces([...workspaces, created]);
        setCurrentWorkspaceId(created.id);
        toast.success(`Workspace "${created.name}" created`);
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Failed to create workspace');
      }
    } catch (e: any) {
      console.error(e);
      toast.error('An unexpected error occurred');
    }
  };

  const handleAddMember = async (newMember: WorkspaceMember) => {
    // The actual API call is now moved to the InviteMemberModal to show the loading state on the button
    setWorkspaces(
      workspaces.map((ws) =>
        ws.id === currentWorkspace.id
          ? { ...ws, members: [...ws.members, newMember] }
          : ws
      )
    );
  };

  const handleRemoveMember = (memberId: string) => {
    // Real API call would go here
    setWorkspaces(
      workspaces.map((ws) =>
        ws.id === currentWorkspace.id
          ? { ...ws, members: ws.members.filter((m) => m.id !== memberId) }
          : ws
      )
    );
  };

  const handleUpdateMemberRole = (memberId: string, role: MemberRole) => {
    // Real API call would go here
    setWorkspaces(
      workspaces.map((ws) =>
        ws.id === currentWorkspace.id
          ? {
            ...ws,
            members: ws.members.map((m) =>
              m.id === memberId ? { ...m, role } : m
            ),
          }
          : ws
      )
    );
  };

  const handleTasksUpdate = async (newTasks: Task[]) => {
    // We can find the diff (the task that changed status or any other field).
    const changedTask = newTasks.find(nt => {
      const oldTask = tasks.find(t => t.id === nt.id);
      if (!oldTask) return true; // new task
      // Compare all fields that could be mutated
      return (
        oldTask.status !== nt.status ||
        oldTask.priority !== nt.priority ||
        oldTask.assigneeId !== nt.assigneeId ||
        oldTask.title !== nt.title ||
        oldTask.description !== nt.description ||
        oldTask.dueDate !== nt.dueDate ||
        JSON.stringify(oldTask.tags) !== JSON.stringify(nt.tags) ||
        JSON.stringify(oldTask.subtasks) !== JSON.stringify(nt.subtasks)
      );
    });

    if (changedTask) {
      // Optimistic update
      setTasks(newTasks);

      // Fire API request for the specific changed task
      const oldTask = tasks.find(t => t.id === changedTask.id);
      if (oldTask) {
        // It's an update
        fetch(`/api/tasks/${changedTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: changedTask.title,
            description: changedTask.description,
            status: changedTask.status,
            priority: changedTask.priority,
            assigneeId: changedTask.assigneeId,
            dueDate: changedTask.dueDate,
            tags: changedTask.tags,
            subtasks: changedTask.subtasks,
          })
        }).catch((e) => {
          console.error(e);
          toast.error('Failed to update task');
        });
      } else {
        // It's a creation (handled elsewhere usually, but just in case)
        fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changedTask)
        })
          .then(async (res) => {
            if (res.ok) {
              const realTask = await res.json();
              setTasks(prevTasks => prevTasks.map(t => t.id === changedTask.id ? realTask : t));
              toast.success('Task created successfully');
            } else {
              const err = await res.json();
              console.error('Failed to create task:', err);
              toast.error(err.error || 'Failed to create task');
            }
          })
          .catch((e) => {
            console.error(e);
            toast.error('Network error creating task');
          });
      }
    } else {
      // Check for deletion
      const deletedTask = tasks.find(t => !newTasks.some(nt => nt.id === t.id));
      if (deletedTask) {
        setTasks(newTasks);
        fetch(`/api/tasks/${deletedTask.id}`, { method: 'DELETE' })
          .then(res => {
            if (res.ok) toast.success('Task deleted');
            else toast.error('Failed to delete task');
          })
          .catch((e) => {
            console.error(e);
            toast.error('Network error deleting task');
          });
      } else {
        // Just local state refresh
        setTasks(newTasks);
      }
    }
  };

  const handleOpenNewTaskModal = (status: TaskStatus = 'todo') => {
    setNewTaskInitialStatus(status);
    setIsNewTaskModalOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#09090b] text-zinc-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Authenticating Session...</span>
        </div>
      </div>
    );
  }

  // If no workspaces exist yet for the user
  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b] text-zinc-400 font-mono text-xs space-y-4">
        <p>No workspaces found. You need to create one to start.</p>
        <button
          onClick={() => setIsCreateWorkspaceModalOpen(true)}
          className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-md hover:bg-zinc-200 transition-colors font-sans font-medium"
        >
          Create Workspace
        </button>
        <CreateWorkspaceModal
          isOpen={isCreateWorkspaceModalOpen}
          onClose={() => setIsCreateWorkspaceModalOpen(false)}
          currentUser={currentUser}
          onCreateWorkspace={handleCreateWorkspace}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#18181b', color: '#f4f4f5', border: '1px solid #27272a', fontSize: '13px' } }} />
      <Header
        workspaces={workspaces}
        currentWorkspace={currentWorkspace!}
        onSelectWorkspace={handleSelectWorkspace}
        onOpenCreateWorkspaceModal={() => setIsCreateWorkspaceModalOpen(true)}
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
        onOpenNewTaskModal={() => handleOpenNewTaskModal('todo')}
        onOpenExportGuideModal={() => setIsExportGuideModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthView={() => { }}
        onLogout={handleLogout}
        onResetData={() => { }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedAssignee={selectedAssignee}
        onAssigneeChange={setSelectedAssignee}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {currentWorkspace && (
        <KanbanBoard
          workspace={currentWorkspace}
          tasks={tasks}
          currentUser={currentUser}
          onTasksUpdate={handleTasksUpdate}
          viewMode={viewMode}
          searchQuery={searchQuery}
          selectedPriority={selectedPriority}
          selectedAssignee={selectedAssignee}
          isNewTaskModalOpen={isNewTaskModalOpen}
          onCloseNewTaskModal={() => setIsNewTaskModalOpen(false)}
          onOpenNewTaskModal={handleOpenNewTaskModal}
          newTaskInitialStatus={newTaskInitialStatus}
        />
      )}

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={() => setIsCreateWorkspaceModalOpen(false)}
        currentUser={currentUser}
        onCreateWorkspace={handleCreateWorkspace}
      />

      {currentWorkspace && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          workspace={currentWorkspace}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          onUpdateMemberRole={handleUpdateMemberRole}
        />
      )}

      <ExportGuideModal
        isOpen={isExportGuideModalOpen}
        onClose={() => setIsExportGuideModalOpen(false)}
      />
    </div>
  );
}
