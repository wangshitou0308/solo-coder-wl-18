import { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { PieChart } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { CompanyStatus } from '@/types';

ChartJS.register(ArcElement, Tooltip, Legend);

enum Direction {
  FRONTEND = 'FRONTEND',
  BACKEND = 'BACKEND',
  ALGORITHM = 'ALGORITHM',
  PRODUCT = 'PRODUCT',
  OTHER = 'OTHER',
}

const DIRECTION_LABELS: Record<Direction, string> = {
  [Direction.FRONTEND]: '前端',
  [Direction.BACKEND]: '后端',
  [Direction.ALGORITHM]: '算法',
  [Direction.PRODUCT]: '产品',
  [Direction.OTHER]: '其他',
};

const DIRECTION_COLORS: Record<Direction, { bg: string; border: string }> = {
  [Direction.FRONTEND]: {
    bg: 'rgba(59, 130, 246, 0.75)',
    border: 'rgba(96, 165, 250, 1)',
  },
  [Direction.BACKEND]: {
    bg: 'rgba(139, 92, 246, 0.75)',
    border: 'rgba(167, 139, 250, 1)',
  },
  [Direction.ALGORITHM]: {
    bg: 'rgba(16, 185, 129, 0.75)',
    border: 'rgba(52, 211, 153, 1)',
  },
  [Direction.PRODUCT]: {
    bg: 'rgba(249, 115, 22, 0.75)',
    border: 'rgba(251, 146, 60, 1)',
  },
  [Direction.OTHER]: {
    bg: 'rgba(107, 114, 128, 0.75)',
    border: 'rgba(156, 163, 175, 1)',
  },
};

const DIRECTION_ORDER: Direction[] = [
  Direction.FRONTEND,
  Direction.BACKEND,
  Direction.ALGORITHM,
  Direction.PRODUCT,
  Direction.OTHER,
];

function inferDirection(position: string): Direction {
  const p = position.toLowerCase();
  if (p.includes('前端') || p.includes('frontend')) return Direction.FRONTEND;
  if (p.includes('后端') || p.includes('java') || p.includes('go') || p.includes('backend')) return Direction.BACKEND;
  if (p.includes('算法') || p.includes('algorithm') || p.includes('ai')) return Direction.ALGORITHM;
  if (p.includes('产品') || p.includes('product')) return Direction.PRODUCT;
  return Direction.OTHER;
}

export default function PositionPie() {
  const companies = useAppStore((s) => s.companies);

  const { chartData, totalCount, directionStats } = useMemo(() => {
    const appliedCompanies = companies.filter(
      (c) => c.status !== CompanyStatus.TARGET && c.status !== CompanyStatus.ARCHIVED
    );

    const directionCounts = new Map<Direction, number>();
    DIRECTION_ORDER.forEach((d) => directionCounts.set(d, 0));

    appliedCompanies.forEach((c) => {
      const direction = inferDirection(c.position || '');
      directionCounts.set(direction, (directionCounts.get(direction) || 0) + 1);
    });

    const labels = DIRECTION_ORDER.map((d) => DIRECTION_LABELS[d]);
    const data = DIRECTION_ORDER.map((d) => directionCounts.get(d) || 0);
    const total = data.reduce((sum, v) => sum + v, 0);

    const backgroundColors = DIRECTION_ORDER.map((d) => DIRECTION_COLORS[d].bg);
    const borderColors = DIRECTION_ORDER.map((d) => DIRECTION_COLORS[d].border);

    const stats = DIRECTION_ORDER.map((direction) => ({
      direction,
      label: DIRECTION_LABELS[direction],
      count: directionCounts.get(direction) || 0,
      percentage: total > 0 ? (((directionCounts.get(direction) || 0) / total) * 100).toFixed(1) : '0.0',
      color: DIRECTION_COLORS[direction],
    }));

    return {
      totalCount: total,
      chartData: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 2,
            hoverOffset: 8,
            spacing: 2,
          },
        ],
      },
      directionStats: stats,
    };
  }, [companies]);

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(30, 27, 75, 0.95)',
        titleColor: '#fff',
        bodyColor: 'rgba(199, 210, 254, 0.95)',
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          family: "'Noto Sans SC', sans-serif",
          size: 13,
          weight: 600,
        },
        bodyFont: {
          family: "'JetBrains Mono', monospace",
          size: 12,
        },
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const percentage =
              totalCount > 0
                ? ((value / totalCount) * 100).toFixed(1)
                : '0';
            return ` ${value} 家 (${percentage}%)`;
          },
        },
        boxPadding: 6,
        usePointStyle: true,
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 800,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="glass-card glass-card-hover p-5 animate-fade-in-up h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-emerald-500/20 flex items-center justify-center">
          <PieChart className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="section-title !mb-0">岗位方向分布</h3>
          <p className="text-xs text-brand-400/70 mt-0.5">投递岗位的方向占比统计</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="relative w-full max-w-[220px] h-56 shrink-0">
          <Doughnut data={chartData} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold font-mono text-white glow-text">
              {totalCount}
            </span>
            <span className="text-xs text-brand-400/70 mt-1">总投递</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-2.5">
          {directionStats.map((stat, idx) => (
            <div
              key={stat.direction}
              className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors stagger-item"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{
                  background: stat.color.bg,
                  border: `1.5px solid ${stat.color.border}`,
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-brand-100 truncate">
                    {stat.label}
                  </span>
                  <span className="text-xs font-mono text-brand-300 shrink-0">
                    {stat.count}家 · {stat.percentage}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${stat.percentage}%`,
                      background: `linear-gradient(90deg, ${stat.color.bg}, ${stat.color.border})`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
