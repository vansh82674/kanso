import { useState } from 'react';
import { cn, getInitials } from '../../lib/utils';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showStatus?: boolean;
  statusOnline?: boolean;
}

export function Avatar({
  src,
  name,
  size = 'md',
  className,
  showStatus = false,
  statusOnline = true,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };

  const statusSizeClasses = {
    xs: 'w-1.5 h-1.5 ring-1',
    sm: 'w-2 h-2 ring-1',
    md: 'w-2.5 h-2.5 ring-2',
    lg: 'w-3 h-3 ring-2',
  };

  return (
    <div className="relative inline-block select-none flex-shrink-0">
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full overflow-hidden bg-zinc-800 border border-zinc-700/60 font-mono font-medium text-zinc-300',
          sizeClasses[size],
          className
        )}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={name}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-zinc-950',
            statusOnline ? 'bg-emerald-500' : 'bg-zinc-500',
            statusSizeClasses[size]
          )}
        />
      )}
    </div>
  );
}
