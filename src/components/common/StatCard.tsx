import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCountUp } from '@/hooks/useCountUp';

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  prefix = '',
  suffix = '',
  decimals = 0,
  trend,
  trendLabel,
  className,
}: StatCardProps) {
  const { formatted } = useCountUp(value, { prefix, suffix, decimals });
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className={cn(
        'glass-card glass-card-hover p-5 flex flex-col gap-3 animate-fade-in-up',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-brand-300/80 text-sm font-medium mb-1">{title}</p>
          <div className="data-value glow-text">{formatted}</div>
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            iconBg
          )}
        >
          <div className={iconColor}>{icon}</div>
        </div>
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
          <div
            className={cn(
              'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold',
              isPositive
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-red-500/15 text-red-400'
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
          {trendLabel && (
            <span className="text-xs text-brand-400/70">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
