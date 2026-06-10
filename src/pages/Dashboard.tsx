import { useMemo } from 'react';
import { Activity, BarChart3, Bell, Clock } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import {
  CompanyStatus,
  COMPANY_STATUS_LABELS,
  TimelineType,
  TIMELINE_TYPE_LABELS,
} from '@/types';
import Badge from '@/components/common/Badge';
import StatsOverview from '@/components/dashboard/StatsOverview';
import TrendChart from '@/components/dashboard/TrendChart';
import PositionPie from '@/components/dashboard/PositionPie';

const STAGE_COLORS: Record<string, { from: string; to: string }> = {
  [TimelineType.APPLICATION]: { from: '#3b82f6', to: '#60a5fa' },
  [TimelineType.SCREENING]: { from: '#06b6d4', to: '#22d3ee' },
  [TimelineType.INTERVIEW]: { from: '#8b5cf6', to: '#a78bfa' },
  [TimelineType.OFFER]: { from: '#f59e0b', to: '#fbbf24' },
};

const STATUS_BADGE_COLOR: Record<string, 'info' | 'purple' | 'warning'> = {
  [CompanyStatus.SCREENING]: 'info',
  [CompanyStatus.INTERVIEW]: 'purple',
  [CompanyStatus.ONSITE]: 'warning',
};

const RELEVANT_STAGE_TYPES = new Set([
  TimelineType.APPLICATION,
  TimelineType.SCREENING,
  TimelineType.INTERVIEW,
  TimelineType.OFFER,
]);

function FailureStageAnalysis() {
  const companies = useAppStore((s) => s.companies);
  const timelineNodes = useAppStore((s) => s.timelineNodes);

  const stageData = useMemo(() => {
    const rejectedCompanies = companies.filter(
      (c) => c.status === CompanyStatus.REJECTED
    );
    const stageCounts = new Map<string, number>();

    rejectedCompanies.forEach((company) => {
      const companyNodes = timelineNodes
        .filter((t) => t.companyId === company.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const lastStageNode = companyNodes.find((t) =>
        RELEVANT_STAGE_TYPES.has(t.type)
      );

      if (lastStageNode) {
        stageCounts.set(
          lastStageNode.type,
          (stageCounts.get(lastStageNode.type) || 0) + 1
        );
      }
    });

    const entries = Array.from(stageCounts.entries())
      .map(([type, count]) => ({
        type,
        label: TIMELINE_TYPE_LABELS[type as TimelineType] || type,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const maxCount = entries.length > 0 ? entries[0].count : 1;

    return { entries, maxCount, total: rejectedCompanies.length };
  }, [companies, timelineNodes]);

  return (
    <div className="glass-card glass-card-hover p-5 animate-fade-in-up h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500/20 to-amber-500/20 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h3 className="section-title !mb-0">高频失败阶段分析</h3>
          <p className="text-xs text-brand-400/70 mt-0.5">
            被拒公司在哪个阶段折戟
          </p>
        </div>
      </div>

      {stageData.entries.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-brand-400/50 text-sm">
          暂无拒绝记录
        </div>
      ) : (
        <div className="space-y-3">
          {stageData.entries.map((entry) => {
            const colors = STAGE_COLORS[entry.type] || {
              from: '#6b7280',
              to: '#9ca3af',
            };
            const percentage =
              stageData.maxCount > 0
                ? (entry.count / stageData.maxCount) * 100
                : 0;

            return (
              <div key={entry.type} className="flex items-center gap-3">
                <span className="text-sm text-brand-200 w-20 shrink-0 truncate">
                  {entry.label}
                </span>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${percentage}%`,
                      background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
                    }}
                  />
                </div>
                <span className="text-sm font-mono text-brand-300 shrink-0 w-14 text-right">
                  {entry.count}次
                </span>
              </div>
            );
          })}

          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-brand-400/60">被拒公司总数</span>
            <span className="text-sm font-mono text-brand-200">
              {stageData.total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

interface FollowUpItem {
  id: string;
  name: string;
  status: CompanyStatus;
  statusLabel: string;
  lastActivityDate: Date;
  daysSinceActivity: number;
}

function formatDate(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function FollowUpReminders() {
  const companies = useAppStore((s) => s.companies);
  const timelineNodes = useAppStore((s) => s.timelineNodes);

  const reminders = useMemo(() => {
    const activeStatuses = [
      CompanyStatus.INTERVIEW,
      CompanyStatus.ONSITE,
      CompanyStatus.SCREENING,
    ];
    const now = new Date();

    return companies
      .filter((c) => activeStatuses.includes(c.status))
      .reduce<FollowUpItem[]>((acc, c) => {
        const companyNodes = timelineNodes
          .filter((t) => t.companyId === c.id)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

        const lastNode = companyNodes[0];
        const lastActivityDate = lastNode
          ? new Date(lastNode.date)
          : c.appliedDate
            ? new Date(c.appliedDate)
            : null;

        if (!lastActivityDate || isNaN(lastActivityDate.getTime())) return acc;

        const daysSinceActivity = Math.floor(
          (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceActivity < 7) return acc;

        acc.push({
          id: c.id,
          name: c.name,
          status: c.status,
          statusLabel: COMPANY_STATUS_LABELS[c.status],
          lastActivityDate,
          daysSinceActivity,
        });

        return acc;
      }, [])
      .sort((a, b) => b.daysSinceActivity - a.daysSinceActivity);
  }, [companies, timelineNodes]);

  return (
    <div className="glass-card glass-card-hover p-5 animate-fade-in-up h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-rose-500/20 flex items-center justify-center">
          <Bell className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="section-title !mb-0">近期需跟进</h3>
          <p className="text-xs text-brand-400/70 mt-0.5">
            超过7天无动态的公司
          </p>
        </div>
      </div>

      {reminders.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-brand-400/50 text-sm">
          暂无需跟进的公司
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
          {reminders.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-brand-100 truncate">
                    {item.name}
                  </span>
                  <Badge
                    color={STATUS_BADGE_COLOR[item.status] || 'muted'}
                    size="sm"
                  >
                    {item.statusLabel}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-brand-400/60">
                  <Clock className="w-3 h-3" />
                  <span>上次活动: {formatDate(item.lastActivityDate)}</span>
                </div>
              </div>
              <Badge
                color={item.daysSinceActivity >= 14 ? 'danger' : 'warning'}
                size="sm"
                dot
              >
                {item.daysSinceActivity}天
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const today = new Date();
  const formattedDate = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const weekdayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdayMap[today.getDay()];

  return (
    <div className="min-h-full p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h1 className="page-title !mb-0">统计看板</h1>
              </div>
              <p className="page-subtitle ml-12">
                实时掌握求职进度，数据驱动决策
              </p>
            </div>
            <div className="glass-card px-4 py-2.5 flex items-center gap-2 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-brand-200">
                {formattedDate} · {weekday}
              </span>
            </div>
          </div>
        </div>

        <div className="divider" />

        <StatsOverview />

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-3">
            <TrendChart />
          </div>
          <div className="xl:col-span-2">
            <PositionPie />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-3">
            <FailureStageAnalysis />
          </div>
          <div className="xl:col-span-2">
            <FollowUpReminders />
          </div>
        </div>
      </div>
    </div>
  );
}
