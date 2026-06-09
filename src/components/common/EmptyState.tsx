import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
  className?: string;
  compact?: boolean;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title = '暂无数据',
  description = '还没有任何记录，开始添加第一条吧',
  actionLabel,
  onAction,
  children,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'glass-card flex flex-col items-center justify-center text-center animate-fade-in-up relative overflow-hidden',
        compact ? 'p-6' : 'p-10',
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-brand-700/5" />

      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-brand-500/5 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center">
        <div
          className={cn(
            'relative mb-5 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-700/20 border border-brand-400/20 flex items-center justify-center shadow-lg shadow-brand-500/10',
            compact ? 'w-14 h-14' : 'w-20 h-20',
          )}
        >
          <div className="absolute inset-0 rounded-2xl animate-pulse-glow opacity-50" />
          <Icon
            className={cn(
              'text-brand-300 relative z-10',
              compact ? 'w-6 h-6' : 'w-9 h-9',
            )}
          />
        </div>

        <h3
          className={cn(
            'font-serif font-bold text-white mb-2',
            compact ? 'text-lg' : 'text-xl',
          )}
        >
          {title}
        </h3>

        <p
          className={cn(
            'text-brand-300 max-w-sm leading-relaxed mb-5',
            compact ? 'text-xs' : 'text-sm',
          )}
        >
          {description}
        </p>

        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className={cn(
              'inline-flex items-center gap-2 font-medium rounded-xl transition-all duration-300',
              compact
                ? 'px-4 py-2 text-sm btn-primary'
                : 'px-6 py-3 btn-primary',
            )}
          >
            <Plus className={cn(compact ? 'w-4 h-4' : 'w-5 h-5')} />
            {actionLabel}
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
