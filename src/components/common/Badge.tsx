import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeColor =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'muted'
  | 'purple'
  | 'pink';

type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children?: ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  primary:
    'bg-brand-500/20 text-brand-200 border border-brand-400/30 shadow-[0_0_10px_rgba(99,102,241,0.15)]',
  success:
    'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
  warning:
    'bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
  danger:
    'bg-red-500/20 text-red-300 border border-red-400/30 shadow-[0_0_10px_rgba(239,68,68,0.15)]',
  info: 'bg-blue-500/20 text-blue-300 border border-blue-400/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]',
  muted: 'bg-white/5 text-brand-300 border border-white/10',
  purple:
    'bg-purple-500/20 text-purple-300 border border-purple-400/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]',
  pink: 'bg-pink-500/20 text-pink-300 border border-pink-400/30 shadow-[0_0_10px_rgba(236,72,153,0.15)]',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3.5 py-1.5 text-sm',
};

const dotColorClasses: Record<BadgeColor, string> = {
  primary: 'bg-brand-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]',
  success: 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]',
  warning: 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]',
  danger: 'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]',
  info: 'bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]',
  muted: 'bg-brand-400',
  purple: 'bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]',
  pink: 'bg-pink-400 shadow-[0_0_6px_rgba(236,72,153,0.8)]',
};

export default function Badge({
  children,
  color = 'primary',
  size = 'md',
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'badge inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200 hover:scale-105',
        colorClasses[color],
        sizeClasses[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0 animate-pulse',
            dotColorClasses[color],
          )}
        />
      )}
      {children}
    </span>
  );
}
