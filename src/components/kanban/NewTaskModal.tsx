'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Task, TaskPriority, TaskStatus, WorkspaceMember } from '../../types';
import { COLUMNS } from '../../data/initialData';
import { generateId } from '../../lib/utils';
import { Plus, X } from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceSlug: string;
  members: WorkspaceMember[];
  initialStatus?: TaskStatus;
  onCreateTask: (task: Task) => void;
  existingTasksCount: number;
}

export function NewTaskModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceSlug,
  members,
  initialStatus = 'todo',
  onCreateTask,
  existingTasksCount,
}: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState<string | undefined>(members[0]?.id);
  const [dueDate, setDueDate] = useState<string>('');
  const [tags, setTags] = useState<string[]>(['Feature']);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus);
    }
  }, [initialStatus, isOpen]);

  const prefix = workspaceSlug.slice(0, 3).toUpperCase() || 'TSK';
  const ticketId = `${prefix}-${100 + existingTasksCount + 1}`;

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    const newTask: Task = {
      id: generateId('tsk'),
      ticketId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      workspaceId,
      assigneeId: assigneeId || undefined,
      dueDate: dueDate || undefined,
      tags,
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreateTask(newTask);
    setTitle('');
    setDescription('');
    setTags(['Feature']);
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      description={`Creating new ticket ${ticketId} in current workspace.`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800/50 text-xs font-mono text-rose-300">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/60">
            {ticketId}
          </span>
          <span className="text-xs font-mono text-zinc-400">Target Ticket Key</span>
        </div>

        <Input
          label="TASK TITLE"
          id="taskTitle"
          placeholder="e.g. Implement real-time presence indicators in board header"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          required
        />

        <Textarea
          label="DESCRIPTION & SPECIFICATION"
          id="taskDesc"
          placeholder="Provide technical context, acceptance criteria, or design links..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-950/60">
          {/* Status */}
          <div className="space-y-1">
            <label className="block text-[11px] font-mono text-zinc-400 font-medium">
              INITIAL COLUMN
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full h-8 px-2.5 rounded border bg-zinc-900 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-500"
            >
              {COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <label className="block text-[11px] font-mono text-zinc-400 font-medium">
              PRIORITY LEVEL
            </label>
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
          <div className="space-y-1">
            <label className="block text-[11px] font-mono text-zinc-400 font-medium">
              ASSIGNEE
            </label>
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
          <div className="space-y-1">
            <label className="block text-[11px] font-mono text-zinc-400 font-medium">
              DUE DATE
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-8 px-2.5 rounded border bg-zinc-900 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono text-zinc-400 font-medium">
            TAGS
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/60"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="text-zinc-400 hover:text-zinc-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="+ Tag..."
                className="h-7 w-24 text-xs font-mono bg-zinc-950 border rounded px-2 text-zinc-200 focus:outline-none focus:border-zinc-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="default">
            Create Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
}
