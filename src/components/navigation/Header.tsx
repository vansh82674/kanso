'use client';

import { useState, useRef, useEffect } from 'react';
import { Workspace, User, WorkspaceMember, TaskPriority } from '../../types';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import {
  Search,
  Plus,
  UserPlus,
  LayoutGrid,
  List,
  Filter,
  LogOut,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Database,
} from 'lucide-react';

interface HeaderProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  onSelectWorkspace: (workspace: Workspace) => void;
  onOpenCreateWorkspaceModal: () => void;
  onOpenInviteModal: () => void;
  onOpenNewTaskModal: () => void;
  onOpenExportGuideModal?: () => void;
  currentUser: User | null;
  onOpenAuthView: () => void;
  onLogout: () => void;
  onResetData: () => void;
  // Search and filter states
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedPriority: TaskPriority | 'all';
  onPriorityChange: (p: TaskPriority | 'all') => void;
  selectedAssignee: string | 'all';
  onAssigneeChange: (a: string | 'all') => void;
  viewMode: 'kanban' | 'list';
  onViewModeChange: (v: 'kanban' | 'list') => void;
}

export function Header({
  workspaces,
  currentWorkspace,
  onSelectWorkspace,
  onOpenCreateWorkspaceModal,
  onOpenInviteModal,
  onOpenNewTaskModal,
  onOpenExportGuideModal,
  currentUser,
  onOpenAuthView,
  onLogout,
  onResetData,
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  selectedAssignee,
  onAssigneeChange,
  viewMode,
  onViewModeChange,
}: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = selectedPriority !== 'all' || selectedAssignee !== 'all';

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-800 bg-[#09090b]/90 backdrop-blur-md">
      {/* Top Main Navigation Bar */}
      <div className="flex items-center justify-between h-14 px-3 sm:px-6 gap-2 sm:gap-3">
        {/* Left Side: Brand & Workspace Switcher */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded bg-zinc-100 flex items-center justify-center text-zinc-950 font-bold text-xs font-mono select-none shadow-xs">
              K
            </div>
            <span className="font-semibold text-sm tracking-tight text-zinc-100 hidden md:inline">
              KANSO
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 hidden lg:inline">
              PROD
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          {/* Workspace Switcher */}
          <WorkspaceSwitcher
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            onSelectWorkspace={onSelectWorkspace}
            onOpenCreateModal={onOpenCreateWorkspaceModal}
            onOpenInviteModal={onOpenInviteModal}
          />
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

          {/* Invite members button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenInviteModal}
            className="flex items-center gap-1 sm:gap-1.5 text-xs font-mono px-2 sm:px-3 h-8"
            title="Invite Workspace Members"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Invite</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400">
              {currentWorkspace.members.length}
            </span>
          </Button>

          {/* + New Task Button */}
          <Button
            variant="default"
            size="sm"
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1 text-xs font-mono px-2 sm:px-3 h-8"
            title="Create New Ticket (Shortcut: N)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">New Ticket</span>
            <span className="xs:hidden font-mono text-[11px]">New</span>
          </Button>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center justify-center min-w-9 min-h-9 rounded-full hover:ring-2 hover:ring-zinc-700 transition-all focus:outline-none"
              title={currentUser ? currentUser.name : 'Account Profile'}
            >
              {currentUser ? (
                <Avatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  size="sm"
                  showStatus
                  statusOnline
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-mono text-zinc-300">
                  ?
                </div>
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl p-2 z-40 text-xs font-mono text-zinc-200">
                {currentUser ? (
                  <div className="p-2 border-b border-zinc-800/80 mb-1">
                    <div className="font-semibold text-zinc-100 truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-zinc-400 truncate">{currentUser.email}</div>
                    <div className="text-[10px] text-zinc-400 mt-1">{currentUser.title || currentUser.role}</div>
                  </div>
                ) : (
                  <div className="p-2 border-b border-zinc-800/80 mb-1 text-zinc-400">
                    Guest session
                  </div>
                )}

                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onOpenAuthView();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-zinc-800 text-left transition-colors"
                  >
                    <span>Switch Account / Sign In</span>
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onResetData();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-zinc-800 text-left transition-colors text-zinc-400 hover:text-zinc-200"
                  >
                    <span>Reset Sample Data</span>
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {currentUser && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 text-left transition-colors"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subheader Toolbar: Search, Filters & View Mode */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-2.5 border-t border-zinc-800/60 bg-zinc-950/40">
        {/* Search & Filters */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 max-w-md min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-8 pl-8 pr-2.5 text-xs font-mono rounded-md bg-zinc-900 border  placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Filter Popover */}
          <div className="relative shrink-0" ref={filterRef}>
            <Button
              variant={hasActiveFilters ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="h-8 px-2 sm:px-2.5 text-xs font-mono flex items-center gap-1 sm:gap-1.5"
              title="Filter by priority or assignee"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span className="hidden sm:inline">Filter</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </Button>

            {isFilterOpen && (
              <div className="absolute left-0 mt-2 w-56 max-w-[calc(100vw-32px)] rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl p-3 z-40 text-xs font-mono text-zinc-200 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-semibold text-zinc-300">Filter Board</span>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={() => {
                        onPriorityChange('all');
                        onAssigneeChange('all');
                      }}
                      className="text-[10px] text-zinc-400 hover:text-zinc-200"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Priority */}
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase">Priority</span>
                  <select
                    value={selectedPriority}
                    onChange={(e) => onPriorityChange(e.target.value as TaskPriority | 'all')}
                    className="w-full h-7 bg-zinc-950 border border-zinc-800 rounded px-2 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Assignee */}
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase">Assignee</span>
                  <select
                    value={selectedAssignee}
                    onChange={(e) => onAssigneeChange(e.target.value)}
                    className="w-full h-7 bg-zinc-950 border border-zinc-800 rounded px-2 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="all">All Members</option>
                    {currentWorkspace.members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Switcher: Board vs Table */}
        <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900 p-0.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => onViewModeChange('kanban')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${viewMode === 'kanban'
              ? 'bg-zinc-800 text-zinc-100 shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
              }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kanban</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${viewMode === 'list'
              ? 'bg-zinc-800 text-zinc-100 shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
              }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>
    </header>
  );
}
