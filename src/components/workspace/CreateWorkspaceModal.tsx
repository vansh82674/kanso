'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Workspace, User } from '../../types';
import { generateId } from '../../lib/utils';
import { Check } from 'lucide-react';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onCreateWorkspace: (workspace: Workspace) => void;
}

const COLOR_PRESETS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Zinc', value: '#71717a' },
];

export function CreateWorkspaceModal({
  isOpen,
  onClose,
  currentUser,
  onCreateWorkspace,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLOR_PRESETS[0].value);
  const [error, setError] = useState('');

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }

    const newWorkspace: Workspace = {
      id: generateId('ws'),
      name: name.trim(),
      slug: slug || 'new-workspace',
      description: description.trim() || 'Workspace for team project coordination and sprint delivery',
      color,
      icon: 'Folder',
      createdAt: new Date().toISOString().split('T')[0],
      members: currentUser
        ? [
            {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              role: 'admin',
              avatar: currentUser.avatar,
              joinedAt: new Date().toISOString().split('T')[0],
            },
          ]
        : [],
    };

    onCreateWorkspace(newWorkspace);
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Workspace"
      description="Workspaces isolate team boards, member permissions, and project tickets."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800/50 text-xs font-mono text-rose-300">
            {error}
          </div>
        )}

        <Input
          label="WORKSPACE NAME"
          id="wsName"
          placeholder="e.g. Q4 Growth & Experimentation"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          required
        />

        {slug && (
          <div className="text-[11px] font-mono text-zinc-400">
            Identifier slug: <span className="text-zinc-200">/{slug}</span>
          </div>
        )}

        <Textarea
          label="DESCRIPTION (OPTIONAL)"
          id="wsDesc"
          placeholder="What will this workspace focus on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        {/* Color selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono text-zinc-400 font-medium">
            ACCENT PALETTE
          </label>
          <div className="flex items-center gap-2 pt-1">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setColor(p.value)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative border border-zinc-700"
                style={{ backgroundColor: p.value }}
              >
                {color === p.value && <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="default">
            Create Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
}
