import React from 'react';
import { Task, WorkspaceMember } from '../../types';
import { PriorityBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { formatDate, isOverdue } from '../../lib/utils';
import { Calendar, CheckSquare, GripVertical } from 'lucide-react';

interface TaskCardProps {
  key?: React.Key;
  task: Task;
  assignee?: WorkspaceMember;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDraggable?: boolean;
}

export function TaskCard({
  task,
  assignee,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging = false,
  isDraggable = true,
}: TaskCardProps) {
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const overdue = isOverdue(task.dueDate) && task.status !== 'done';

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => {
        if (isDraggable) onDragStart(e, task);
      }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group relative rounded-lg border bg-zinc-900/80 p-3.5 shadow-xs transition-all duration-150 ${
        isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } hover:border-zinc-700/90 hover:bg-zinc-900 hover:shadow-md ${
        isDragging
          ? 'opacity-40 border-dashed border-zinc-600 scale-[0.98]'
          : 'border-zinc-800/90'
      }`}
    >
      {/* Top Header: Ticket Key + Priority + Drag Handle */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-zinc-400 tracking-tight group-hover:text-zinc-200 transition-colors">
            {task.ticketId}
          </span>
          <PriorityBadge priority={task.priority} />
        </div>

        {isDraggable && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400">
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-zinc-200 leading-snug group-hover:text-zinc-100 transition-colors line-clamp-2 mb-2">
        {task.title}
      </h3>

      {/* Description Snippet (if any) */}
      {task.description && (
        <p className="text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950/70 text-zinc-400 border border-zinc-800/80"
            >
              #{tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-[10px] font-mono px-1 py-0.5 text-zinc-400">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom Row: Subtasks, Due Date, Assignee Avatar */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-2.5">
          {/* Subtask count */}
          {task.subtasks.length > 0 && (
            <span
              className={`flex items-center gap-1 ${
                completedSubtasks === task.subtasks.length
                  ? 'text-emerald-400'
                  : 'text-zinc-400'
              }`}
            >
              <CheckSquare className="w-3 h-3" />
              <span>
                {completedSubtasks}/{task.subtasks.length}
              </span>
            </span>
          )}

          {/* Due date */}
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 ${
                overdue ? 'text-rose-400 font-medium' : 'text-zinc-400'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.dueDate)}</span>
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        {assignee ? (
          <Avatar
            src={assignee.avatar}
            name={assignee.name}
            size="xs"
            className="ring-1 ring-zinc-800"
          />
        ) : (
          <span className="text-[10px] text-zinc-400 font-mono">Unassigned</span>
        )}
      </div>
    </div>
  );
}
