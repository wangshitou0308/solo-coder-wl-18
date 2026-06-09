import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { CompanyStatus } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TrendChart() {
  const companies = useAppStore((s) => s.companies);
  const interviews = useAppStore((s) => s.interviews);

  const chartData = useMemo(() => {
    const now = new Date();
    const labels: string[] = [];
    const applicationsByMonth: number[] = [];
    const interviewsByMonth: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      labels.push(`${year}-${month}`);
      applicationsByMonth.push(0);
      interviewsByMonth.push(0);
    }

    const appliedCompanies = companies.filter(
      (c) => c.status !== CompanyStatus.TARGET && c.status !== CompanyStatus.ARCHIVED
    );

    appliedCompanies.forEach((c) => {
      if (!c.appliedDate) return;
      const d = new Date(c.appliedDate);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const idx = labels.indexOf(yearMonth);
      if (idx >= 0) {
        applicationsByMonth[idx]++;
      }
    });

    interviews.forEach((i) => {
      if (!i.date) return;
      const d = new Date(i.date);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const idx = labels.indexOf(yearMonth);
      if (idx >= 0) {
        interviewsByMonth[idx]++;
      }
    });

    return {
      labels,
      datasets: [
        {
          label: '投递量',
          data: applicationsByMonth,
          backgroundColor: 'rgba(59, 130, 246, 0.75)',
          borderColor: 'rgba(96, 165, 250, 1)',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 'flex' as const,
          maxBarThickness: 32,
        },
        {
          label: '面试量',
          data: interviewsByMonth,
          backgroundColor: 'rgba(139, 92, 246, 0.75)',
          borderColor: 'rgba(167, 139, 250, 1)',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 'flex' as const,
          maxBarThickness: 32,
        },
      ],
    };
  }, [companies, interviews]);

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: 'rgba(165, 180, 252, 0.9)',
          font: {
            family: "'Noto Sans SC', sans-serif",
            size: 12,
          },
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      title: {
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
        boxPadding: 6,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(165, 180, 252, 0.7)',
          font: {
            family: "'Noto Sans SC', sans-serif",
            size: 12,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(139, 92, 246, 0.1)',
        },
        ticks: {
          color: 'rgba(165, 180, 252, 0.7)',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 11,
          },
          stepSize: 1,
          precision: 0,
        },
        border: {
          display: false,
        },
        beginAtZero: true,
      },
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="glass-card glass-card-hover p-5 animate-fade-in-up h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="section-title !mb-0">投递与面试月度趋势</h3>
          <p className="text-xs text-brand-400/70 mt-0.5">近6个月数据概览</p>
        </div>
      </div>
      <div className="h-72">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
