'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { PriorityBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Task, TaskPriority, TaskStatus, WorkspaceMember, SubTask } from '../../types';
import { COLUMNS } from '../../data/initialData';
import { generateId, formatDate, isOverdue } from '../../lib/utils';
import {
  Calendar,
  CheckSquare,
  Clock,
  Plus,
  Tag,
  Trash2,
  User,
  X,
  Copy,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  members: WorkspaceMember[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  members,
  onUpdateTask,
  onDeleteTask,
  onDuplicateTask,
}: TaskDetailModalProps) {
  if (!task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assigneeId, setAssigneeId] = useState<string | undefined>(task.assigneeId);
  const [dueDate, setDueDate] = useState<string | undefined>(task.dueDate);
  const [tags, setTags] = useState<string[]>(task.tags);
  const [newTagInput, setNewTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subtasks);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Keep state synced when task changes
  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId);
      setDueDate(task.dueDate);
      setTags(task.tags);
      setSubtasks(task.subtasks);
    }
  }, [task]);

  const assignee = members.find((m) => m.id === assigneeId);

  const completedSubtasksCount = subtasks.filter((st) => st.completed).length;
  const subtaskProgress =
    subtasks.length > 0 ? Math.round((completedSubtasksCount / subtasks.length) * 100) : 0;

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    if (newStatus === 'done') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSt: SubTask = {
      id: generateId('st'),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSt]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (stId: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === stId ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleDeleteSubtask = (stId: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== stId));
  };

  const handleSaveChanges = () => {
    const updated: Task = {
      ...task,
      title: title.trim() || task.title,
      description: description.trim(),
      status,
      priority,
      assigneeId,
      dueDate,
      tags,
      subtasks,
      updatedAt: new Date().toISOString(),
    };
    onUpdateTask(updated);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-zinc-300 bg-zinc-800/90 px-2 py-0.5 rounded border border-zinc-700/60">
              {task.ticketId}
            </span>
            <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Created {formatDate(task.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onDuplicateTask(task);
                onClose();
              }}
              className="text-xs font-mono h-7 px-2"
            >
              <Copy className="w-3 h-3 mr-1" />
              <span>Duplicate</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs font-mono h-7 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              <span>Delete</span>
            </Button>
          </div>
        </div>

        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            onDeleteTask(task.id);
            onClose();
          }}
          title="Delete task?"
          description={`Are you sure you want to delete ticket ${task.ticketId}? This action cannot be undone.`}
          confirmText="Delete"
        />

        {/* Task Title & Description */}
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 font-medium mb-1">
              TICKET TITLE
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-semibold bg-zinc-950/60 border rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-500"
              placeholder="Task title..."
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-zinc-400 font-medium mb-1">
              SPECIFICATION & ACCEPTANCE CRITERIA
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe what needs to be built, architecture requirements, or reproduction steps..."
            />
          </div>
        </div>

        {/* Meta Grid: Status, Priority, Assignee, Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/60">
          {/* Status */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-400 font-medium block">
              STATUS
            </span>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              className="w-full h-8 px-2.5 rounded border  bg-zinc-900 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-500"
            >
              {COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-400 font-medium block">
              PRIORITY
            </span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full h-8 px-2.5 rounded border bg-zinc-900 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-500"
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-400 font-medium block">
              ASSIGNEE
            </span>
            <select
              value={assigneeId || ''}
              onChange={(e) => setAssigneeId(e.target.value || undefined)}
              className="w-full h-8 px-2.5 rounded border bg-zinc-900 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-500"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-400 font-medium block">
              TARGET DUE DATE
            </span>
            <input
              type="date"
              value={dueDate || ''}
              onChange={(e) => setDueDate(e.target.value || undefined)}
              className="w-full h-8 px-2.5 rounded border bg-zinc-900 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              LABELS & TAGS
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/60"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-zinc-400 hover:text-zinc-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="+ Add tag..."
                className="h-7 w-28 text-xs font-mono bg-zinc-950 border rounded px-2 text-zinc-200 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>
        </div>

        {/* Subtasks / Checklist */}
        <div className="space-y-2.5 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckSquare className="w-3.5 h-3.5" />
              SUBTASKS ({completedSubtasksCount}/{subtasks.length})
            </span>
            <span>{subtaskProgress}% done</span>
          </div>

          {/* Progress bar */}
          {subtasks.length > 0 && (
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${subtaskProgress}%` }}
              />
            </div>
          )}

          {/* Checklist items */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between p-2 rounded-md bg-zinc-950/60 border border-zinc-800/80 group"
              >
                <label className="flex items-center gap-2.5 text-xs text-zinc-200 cursor-pointer flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => handleToggleSubtask(st.id)}
                    className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <span
                    className={`truncate font-mono ${st.completed ? 'line-through text-zinc-400' : 'text-zinc-200'
                      }`}
                  >
                    {st.title}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => handleDeleteSubtask(st.id)}
                  className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 text-zinc-400 hover:text-rose-400 p-1.5 transition-opacity"
                  title="Delete subtask"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask input */}
          <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add verification checklist item..."
              className="flex-1 h-8 text-xs font-mono bg-zinc-950 border rounded px-2.5 text-zinc-200 focus:outline-none focus:border-zinc-500"
            />
            <Button type="submit" variant="secondary" size="sm" className="font-mono text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </form>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
