'use client';

import React, { useState } from 'react';
import { ColumnDefinition, Task, WorkspaceMember, User } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskCardSkeleton } from './TaskCardSkeleton';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  key?: React.Key;
  column: ColumnDefinition;
  tasks: Task[];
  members: WorkspaceMember[];
  currentUser: User | null;
  isPrivileged: boolean;
  onTaskClick: (task: Task) => void;
  onAddTask: (status: ColumnDefinition['id']) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDropTask: (e: React.DragEvent, targetStatus: ColumnDefinition['id']) => void;
  draggingTaskId: string | null;
  isLoadingData?: boolean;
}

export function KanbanColumn({
  column,
  tasks,
  members,
  currentUser,
  isPrivileged,
  onTaskClick,
  onAddTask,
  onDragStart,
  onDragEnd,
  onDropTask,
  draggingTaskId,
  isLoadingData = false,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only deactivate if leaving this column container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDropTask(e, column.id);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col w-[84vw] max-w-[320px] sm:w-80 shrink-0 snap-center rounded-xl border bg-zinc-950/40 p-3 transition-colors ${isDragOver
        ? 'border-zinc-500 bg-zinc-900/50 ring-1 ring-zinc-500/40'
        : 'border-zinc-800/80'
        }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800/70">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${column.dotColor}`} />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
            {column.title}
          </h2>
          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-800">
            {isLoadingData ? '-' : tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddTask(column.id)}
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors"
          title={`Add task to ${column.title}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tasks List */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-0.5 min-h-35">
        {isLoadingData ? (
          <>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </>
        ) : (
          <>
            {tasks.map((task) => {
              const assignee = members.find((m) => m.id === task.assigneeId);
              const isDraggable = isPrivileged || task.assigneeId === currentUser?.id;
              
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  assignee={assignee}
                  isDraggable={isDraggable}
                  onClick={() => onTaskClick(task)}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  isDragging={draggingTaskId === task.id}
                />
              );
            })}

            {tasks.length === 0 && (
              <div
                onClick={() => onAddTask(column.id)}
                className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800/80 rounded-lg p-6 text-center cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/30 transition-colors group"
              >
                <p className="text-xs font-mono text-zinc-400 group-hover:text-zinc-300">
                  No tasks here
                </p>
                <span className="text-[11px] font-mono text-zinc-400 mt-1 flex items-center gap-1 group-hover:text-zinc-200">
                  <Plus className="w-3 h-3" /> Click to add
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Add Footer Button */}
      <button
        type="button"
        onClick={() => onAddTask(column.id)}
        className="mt-2.5 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-transparent hover:border-zinc-800 bg-transparent hover:bg-zinc-900/70 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-all w-full text-center"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add task</span>
      </button>
    </div>
  );
}
