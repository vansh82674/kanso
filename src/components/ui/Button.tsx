import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'subtle';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.98]';

    const variants = {
      default:
        'bg-zinc-100 text-zinc-950 hover:bg-zinc-200 border border-transparent shadow-xs font-medium',
      secondary:
        'bg-zinc-800 text-zinc-100 hover:bg-zinc-700/80 border border-zinc-700/60',
      outline:
        'border border-zinc-800 bg-transparent hover:bg-zinc-900 text-zinc-200 hover:text-zinc-100',
      ghost:
        'bg-transparent hover:bg-zinc-800/60 text-zinc-300 hover:text-zinc-100',
      destructive:
        'bg-rose-600/90 text-white hover:bg-rose-600 border border-rose-500/40',
      subtle:
        'bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-300 border border-zinc-800/80',
    };

    const sizes = {
      default: 'h-9 px-4 py-2 text-sm rounded-md',
      sm: 'h-8 px-3 text-xs rounded-md',
      lg: 'h-10 px-5 text-base rounded-md',
      icon: 'h-8 w-8 rounded-md p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
