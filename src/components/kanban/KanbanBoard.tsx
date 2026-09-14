'use client';

import React, { useState, useEffect } from 'react';
import { ColumnDefinition, Task, Workspace, WorkspaceMember, TaskStatus, User } from '../../types';
import { COLUMNS } from '../../data/initialData';
import { KanbanColumn } from './KanbanColumn';
import { TaskListView } from './TaskListView';
import { TaskDetailModal } from './TaskDetailModal';
import { NewTaskModal } from './NewTaskModal';
import { generateId } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, Clock, Users, ArrowUpRight } from 'lucide-react';

interface KanbanBoardProps {
  workspace: Workspace;
  tasks: Task[];
  onTasksUpdate: (tasks: Task[]) => void;
  viewMode: 'kanban' | 'list';
  searchQuery: string;
  selectedPriority: string;
  selectedAssignee: string;
  isNewTaskModalOpen: boolean;
  onCloseNewTaskModal: () => void;
  onOpenNewTaskModal: (status?: TaskStatus) => void;
  newTaskInitialStatus?: TaskStatus;
  isLoadingData?: boolean;
  currentUser: User | null;
}

export function KanbanBoard({
  workspace,
  tasks,
  currentUser,
  onTasksUpdate,
  viewMode,
  searchQuery,
  selectedPriority,
  selectedAssignee,
  isNewTaskModalOpen,
  onCloseNewTaskModal,
  onOpenNewTaskModal,
  newTaskInitialStatus = 'todo',
  isLoadingData = false,
}: KanbanBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [mobileColumnFilter, setMobileColumnFilter] = useState<'all' | TaskStatus>('all');

  // Keep selectedTask up to date with the tasks array (useful if task ID or fields change from the server)
  useEffect(() => {
    if (selectedTask) {
      const latestTask = tasks.find((t) => t.ticketId === selectedTask.ticketId);
      if (latestTask && JSON.stringify(latestTask) !== JSON.stringify(selectedTask)) {
        setSelectedTask(latestTask);
      }
    }
  }, [tasks, selectedTask]);

  const currentUserRole = workspace.members.find((m) => m.id === currentUser?.id)?.role;
  const isPrivileged = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  // Filter tasks belonging to current workspace and matching query/filters
  const workspaceTasks = tasks.filter((t) => t.workspaceId === workspace.id);

  const filteredTasks = workspaceTasks.filter((t) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchTicket = t.ticketId.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      const assignee = workspace.members.find((m) => m.id === t.assigneeId);
      const matchAssignee = assignee?.name.toLowerCase().includes(q);
      if (!matchTitle && !matchTicket && !matchDesc && !matchTag && !matchAssignee) {
        return false;
      }
    }

    // Priority filter
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) {
      return false;
    }

    // Assignee filter
    if (selectedAssignee !== 'all') {
      if (t.assigneeId !== selectedAssignee) return false;
    }

    return true;
  });

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggingTaskId(task.id);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
  };

  const handleDropTask = (e: React.DragEvent, targetStatus: TaskStatus) => {
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    if (!taskId) return;

    const taskToMove = tasks.find((t) => t.id === taskId);
    if (!taskToMove || taskToMove.status === targetStatus) {
      setDraggingTaskId(null);
      return;
    }

    // Enforce drag and drop restrictions
    const isAssignee = taskToMove.assigneeId === currentUser?.id;
    if (!isPrivileged && !isAssignee) {
      setDraggingTaskId(null);
      return;
    }

    const updatedTasks = tasks.map((t) =>
      t.id === taskId
        ? { ...t, status: targetStatus, updatedAt: new Date().toISOString() }
        : t
    );

    onTasksUpdate(updatedTasks);
    setDraggingTaskId(null);

    // Celebrate when moving to completed column
    if (targetStatus === 'done') {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.65 },
      });
    }
  };

  const handleStatusChangeFromList = (taskId: string, targetStatus: TaskStatus) => {
    const taskToMove = tasks.find((t) => t.id === taskId);
    if (!taskToMove) return;

    // Enforce restrictions
    const isAssignee = taskToMove.assigneeId === currentUser?.id;
    if (!isPrivileged && !isAssignee) return;

    const updatedTasks = tasks.map((t) =>
      t.id === taskId
        ? { ...t, status: targetStatus, updatedAt: new Date().toISOString() }
        : t
    );
    onTasksUpdate(updatedTasks);
    if (targetStatus === 'done') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
      });
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    onTasksUpdate(updated);
    setSelectedTask(updatedTask);
  };

  const handleDeleteTask = (taskId: string) => {
    const remaining = tasks.filter((t) => t.id !== taskId);
    onTasksUpdate(remaining);
    setSelectedTask(null);
  };

  const handleDuplicateTask = (taskToDuplicate: Task) => {
    const newTask: Task = {
      ...taskToDuplicate,
      id: generateId('tsk'),
      ticketId: `${taskToDuplicate.ticketId.slice(0, 4)}${Math.floor(Math.random() * 800 + 200)}`,
      title: `${taskToDuplicate.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onTasksUpdate([...tasks, newTask]);
  };

  const handleCreateNewTask = (newTask: Task) => {
    onTasksUpdate([...tasks, newTask]);
  };

  // Metrics
  const totalTasks = workspaceTasks.length;
  const completedTasks = workspaceTasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = workspaceTasks.filter((t) => t.status === 'in_progress').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <main className="flex-1 flex flex-col min-h-0 bg-[#09090b]">
      {/* Workspace Header Info Strip */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-zinc-800/60 bg-zinc-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                style={{ backgroundColor: workspace.color }}
              />
              <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-zinc-100">
                {workspace.name}
              </h1>
              <span className="text-[11px] sm:text-xs font-mono text-zinc-400 bg-zinc-900 px-1.5 sm:px-2 py-0.5 rounded border border-zinc-800">
                /{workspace.slug}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              {workspace.description}
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 font-mono text-[11px] sm:text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{inProgressTasks} In Flight</span>
            </div>

            <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-300">{completedTasks}/{totalTasks} Done</span>
              <span className="text-emerald-400">({progressPercent}%)</span>
            </div>

            <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span>{workspace.members.length} Members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Board Workspace Area */}
      <div className="flex-1 p-3 sm:p-6 overflow-x-auto overflow-y-auto">
        {viewMode === 'kanban' ? (
          <div className="flex flex-col h-full">
            {/* Mobile Column Navigation Pills (< md) */}
            <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2 scrollbar-none text-xs font-mono shrink-0">
              <button
                type="button"
                onClick={() => setMobileColumnFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-[11px] ${mobileColumnFilter === 'all'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 bg-zinc-900/60'
                  }`}
              >
                All ({filteredTasks.length})
              </button>
              {COLUMNS.map((col) => {
                const colCount = filteredTasks.filter((t) => t.status === col.id).length;
                const isSelected = mobileColumnFilter === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setMobileColumnFilter(col.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-[11px] ${isSelected
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 bg-zinc-900/60'
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${col.dotColor}`} />
                    <span>{col.title}</span>
                    <span className="text-[10px] text-zinc-500">({colCount})</span>
                  </button>
                );
              })}
            </div>

            {/* Columns Container: Snap-scrolling on mobile when 'all' is chosen, and grid/flex on tablet/desktop */}
            <div className="flex gap-3 sm:gap-5 items-start flex-1 min-h-112.5 overflow-x-auto pb-4 snap-x snap-mandatory">
              {COLUMNS.map((col) => {
                const isHiddenOnMobile = mobileColumnFilter !== 'all' && mobileColumnFilter !== col.id;
                const columnTasks = filteredTasks.filter((t) => t.status === col.id);
                return (
                  <div
                    key={col.id}
                    className={`${isHiddenOnMobile ? 'hidden md:flex' : 'flex'} shrink-0 snap-center`}
                  >
                    <KanbanColumn
                      column={col}
                      tasks={columnTasks}
                      members={workspace.members}
                      currentUser={currentUser}
                      isPrivileged={isPrivileged}
                      onTaskClick={(task) => setSelectedTask(task)}
                      onAddTask={(status) => onOpenNewTaskModal(status)}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDropTask={handleDropTask}
                      draggingTaskId={draggingTaskId}
                      isLoadingData={isLoadingData}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <TaskListView
            tasks={filteredTasks}
            members={workspace.members}
            currentUser={currentUser}
            isPrivileged={isPrivileged}
            onTaskClick={(task) => setSelectedTask(task)}
            onStatusChange={handleStatusChangeFromList}
          />
        )}
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          members={workspace.members}
          currentUser={currentUser}
          isPrivileged={isPrivileged}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onDuplicateTask={handleDuplicateTask}
        />
      )}

      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={onCloseNewTaskModal}
        workspaceId={workspace.id}
        workspaceSlug={workspace.slug}
        members={workspace.members}
        initialStatus={newTaskInitialStatus}
        onCreateTask={handleCreateNewTask}
        existingTasksCount={workspaceTasks.length}
      />
    </main>
  );
}
