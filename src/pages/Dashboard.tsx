import { Activity } from 'lucide-react';
import StatsOverview from '@/components/dashboard/StatsOverview';
import TrendChart from '@/components/dashboard/TrendChart';
import PositionPie from '@/components/dashboard/PositionPie';

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
      </div>
    </div>
  );
}
