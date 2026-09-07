import React from 'react';

export function TaskCardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/50 p-3.5 shadow-xs w-full animate-pulse">
      {/* Top Header: Ticket Key + Priority */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 w-full">
          <div className="h-3 bg-zinc-800 rounded w-12" />
          <div className="h-4 bg-zinc-800 rounded w-16" />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2 mb-3">
        <div className="h-3.5 bg-zinc-800 rounded w-full" />
        <div className="h-3.5 bg-zinc-800 rounded w-4/5" />
      </div>

      {/* Description Snippet */}
      <div className="space-y-1.5 mb-4">
        <div className="h-2.5 bg-zinc-800/60 rounded w-full" />
        <div className="h-2.5 bg-zinc-800/60 rounded w-2/3" />
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="h-3 bg-zinc-800 rounded w-8" />
          <div className="h-3 bg-zinc-800 rounded w-12" />
        </div>
        <div className="h-6 w-6 rounded-full bg-zinc-800" />
      </div>
    </div>
  );
}
