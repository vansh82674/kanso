'use client';

import { useState, useRef, useEffect } from 'react';
import { Workspace } from '../../types';
import { ChevronDown, Plus, Check, Folder, Users } from 'lucide-react';

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  onSelectWorkspace: (workspace: Workspace) => void;
  onOpenCreateModal: () => void;
  onOpenInviteModal: () => void;
}

export function WorkspaceSwitcher({
  workspaces,
  currentWorkspace,
  onSelectWorkspace,
  onOpenCreateModal,
  onOpenInviteModal,
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800/80 text-zinc-100 transition-all text-xs font-mono select-none"
      >
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: currentWorkspace.color }}
        />
        <span className="font-semibold truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[180px]">
          {currentWorkspace.name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 max-w-[calc(100vw-24px)] rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl py-1.5 z-40 text-xs font-mono text-zinc-200">
          <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold border-b border-zinc-800/80">
            Workspaces ({workspaces.length})
          </div>

          <div className="py-1 max-h-56 overflow-y-auto">
            {workspaces.map((ws) => {
              const isSelected = ws.id === currentWorkspace.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    onSelectWorkspace(ws);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-zinc-800/60 transition-colors ${
                    isSelected ? 'bg-zinc-800/40 text-zinc-100 font-semibold' : 'text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ws.color }}
                    />
                    <div className="min-w-0">
                      <div className="truncate">{ws.name}</div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Users className="w-2.5 h-2.5" />
                        <span>{ws.members.length} members</span>
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-zinc-200 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="p-1.5 border-t border-zinc-800/80 space-y-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenCreateModal();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors text-left"
            >
              <Plus className="w-3.5 h-3.5 text-zinc-400" />
              <span>Create Workspace</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenInviteModal();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors text-left"
            >
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span>Invite Members</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
