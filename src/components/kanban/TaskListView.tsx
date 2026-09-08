'use client';

import React from 'react';
import { Task, WorkspaceMember, TaskStatus, User } from '../../types';
import { PriorityBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { formatDate, isOverdue } from '../../lib/utils';
import { COLUMNS } from '../../data/initialData';
import { CheckSquare, Calendar } from 'lucide-react';

interface TaskListViewProps {
  tasks: Task[];
  members: WorkspaceMember[];
  currentUser: User | null;
  isPrivileged: boolean;
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export function TaskListView({
  tasks,
  members,
  currentUser,
  isPrivileged,
  onTaskClick,
  onStatusChange,
}: TaskListViewProps) {
  return (
    <div className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden shadow-xs">
      {/* Mobile / Small Screen Card List View (< md) */}
      <div className="md:hidden divide-y divide-zinc-800/80">
        {tasks.map((task) => {
          const assignee = members.find((m) => m.id === task.assigneeId);
          const overdue = isOverdue(task.dueDate) && task.status !== 'done';
          const completedCount = task.subtasks.filter((st) => st.completed).length;

          return (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="p-3.5 hover:bg-zinc-900/50 active:bg-zinc-900 transition-colors cursor-pointer space-y-2.5"
            >
              {/* Row 1: Key, Priority, Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-zinc-400">
                    {task.ticketId}
                  </span>
                  <PriorityBadge priority={task.priority} />
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                    disabled={!isPrivileged && task.assigneeId !== currentUser?.id}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-[11px] font-mono rounded px-2 py-1 focus:outline-none focus:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Title */}
              <h3 className="text-sm font-medium text-zinc-200 leading-snug">
                {task.title}
              </h3>

              {/* Tags if present */}
              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 font-mono text-[10px] text-zinc-400">
                  {task.tags.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Row 3: Assignee, Due Date, Subtasks */}
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-1 border-t border-zinc-800/40">
                <div className="flex items-center gap-2 min-w-0">
                  {assignee ? (
                    <div className="flex items-center gap-1.5 truncate">
                      <Avatar src={assignee.avatar} name={assignee.name} size="xs" />
                      <span className="truncate text-zinc-300 text-[11px]">{assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-zinc-500 text-[11px]">Unassigned</span>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 text-[11px]">
                  {task.dueDate && (
                    <span className={`flex items-center gap-1 ${overdue ? 'text-rose-400 font-medium' : 'text-zinc-400'}`}>
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(task.dueDate)}</span>
                    </span>
                  )}

                  {task.subtasks.length > 0 && (
                    <span className={`flex items-center gap-1 ${completedCount === task.subtasks.length ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      <CheckSquare className="w-3 h-3" />
                      <span>{completedCount}/{task.subtasks.length}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="p-8 text-center text-zinc-400 font-mono text-xs">
            No matching tasks found. Adjust search or filters.
          </div>
        )}
      </div>

      {/* Desktop / Tablet Landscape Table View (md and up) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-4 w-28">TICKET</th>
              <th className="py-2.5 px-4">TASK TITLE</th>
              <th className="py-2.5 px-4 w-36">STATUS</th>
              <th className="py-2.5 px-4 w-28">PRIORITY</th>
              <th className="py-2.5 px-4 w-40">ASSIGNEE</th>
              <th className="py-2.5 px-4 w-32">DUE DATE</th>
              <th className="py-2.5 px-4 w-28 text-right">SUBTASKS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {tasks.map((task) => {
              const assignee = members.find((m) => m.id === task.assigneeId);
              const overdue = isOverdue(task.dueDate) && task.status !== 'done';
              const completedCount = task.subtasks.filter((st) => st.completed).length;

              return (
                <tr
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="hover:bg-zinc-900/50 cursor-pointer transition-colors group"
                >
                  {/* Ticket Key */}
                  <td className="py-3 px-4 font-semibold text-zinc-400 group-hover:text-zinc-200">
                    {task.ticketId}
                  </td>

                  {/* Title */}
                  <td className="py-3 px-4 font-sans font-medium text-zinc-200 group-hover:text-zinc-100 max-w-md">
                    <div className="truncate">{task.title}</div>
                    {task.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 font-mono text-[10px] text-zinc-400">
                        {task.tags.map((t) => (
                          <span key={t}>#{t}</span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                      disabled={!isPrivileged && task.assigneeId !== currentUser?.id}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-zinc-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {COLUMNS.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.title}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4">
                    <PriorityBadge priority={task.priority} />
                  </td>

                  {/* Assignee */}
                  <td className="py-3 px-4">
                    {assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar src={assignee.avatar} name={assignee.name} size="xs" />
                        <span className="truncate text-zinc-300">{assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-400">Unassigned</span>
                    )}
                  </td>

                  {/* Due date */}
                  <td className="py-3 px-4">
                    {task.dueDate ? (
                      <span className={overdue ? 'text-rose-400 font-medium' : 'text-zinc-400'}>
                        {formatDate(task.dueDate)}
                      </span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>

                  {/* Subtasks */}
                  <td className="py-3 px-4 text-right text-zinc-400">
                    {task.subtasks.length > 0 ? (
                      <span
                        className={
                          completedCount === task.subtasks.length
                            ? 'text-emerald-400'
                            : 'text-zinc-400'
                        }
                      >
                        {completedCount}/{task.subtasks.length}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })}

            {tasks.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-400 font-mono">
                  No matching tasks found. Adjust search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
