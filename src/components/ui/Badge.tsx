import React from 'react';
import { cn } from '../../lib/utils';
import { TaskPriority } from '../../types';
import { AlertCircle, AlertTriangle, ArrowDown, Minus } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'mono';
  className?: string;
  children?: React.ReactNode;
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-zinc-800 text-zinc-300 border-zinc-700/50',
    secondary: 'bg-zinc-900 text-zinc-400 border-zinc-800',
    outline: 'border-zinc-700/80 text-zinc-300 bg-transparent',
    success: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
    warning: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
    destructive: 'bg-rose-950/40 text-rose-300 border-rose-800/40',
    mono: 'bg-zinc-900/90 text-zinc-300 font-mono tracking-tight border-zinc-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-sm border select-none whitespace-nowrap transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  switch (priority) {
    case 'urgent':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertCircle className="w-3 h-3 text-rose-400" />
          <span>URGENT</span>
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>HIGH</span>
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Minus className="w-3 h-3 text-blue-400" />
          <span>MED</span>
        </span>
      );
    case 'low':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-500/10 text-zinc-400 border border-zinc-700/40">
          <ArrowDown className="w-3 h-3 text-zinc-400" />
          <span>LOW</span>
        </span>
      );
  }
}
