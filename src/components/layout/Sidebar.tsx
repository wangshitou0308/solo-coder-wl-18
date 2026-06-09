import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Building2,
  CalendarDays,
  BookOpen,
  BadgeDollarSign,
  Clock,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: '统计看板', key: 'dashboard' },
  { icon: FileText, label: '简历管理', key: 'resumes' },
  { icon: Building2, label: '目标公司', key: 'companies' },
  { icon: CalendarDays, label: '面试记录', key: 'interviews' },
  { icon: BookOpen, label: '面试题库', key: 'questions' },
  { icon: BadgeDollarSign, label: '薪资谈判', key: 'salary' },
  { icon: Clock, label: '求职时间线', key: 'timeline' },
];

interface SidebarProps {
  activeKey?: string;
  onMenuClick?: (key: string) => void;
}

export default function Sidebar({ activeKey = 'dashboard', onMenuClick }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState(activeKey);

  const handleClick = (key: string) => {
    setActive(key);
    onMenuClick?.(key);
  };

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 glass-card flex flex-col transition-all duration-300 ease-out',
        collapsed ? 'w-20' : 'w-64',
      )}
    >
      <div className="flex items-center justify-between p-5 border-b border-glass-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/30">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div
            className={cn(
              'whitespace-nowrap transition-all duration-300',
              collapsed ? 'opacity-0 w-0' : 'opacity-100',
            )}
          >
            <h1 className="font-serif text-lg font-bold text-white">求职追踪</h1>
            <p className="text-xs text-brand-300">Job Tracker</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleClick(item.key)}
              style={{ animationDelay: `${index * 0.05}s` }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative animate-fade-in',
                isActive
                  ? 'bg-gradient-to-r from-brand-600/80 to-brand-500/60 text-white shadow-lg shadow-brand-500/20 border border-brand-400/30'
                  : 'text-brand-200 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10',
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-brand-300 to-brand-500" />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-transform duration-200',
                  isActive ? 'scale-110' : 'group-hover:scale-110',
                )}
              />
              <span
                className={cn(
                  'font-medium whitespace-nowrap transition-all duration-300',
                  collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100',
                )}
              >
                {item.label}
              </span>
              {isActive && !collapsed && (
                <span className="ml-auto w-2 h-2 rounded-full bg-brand-200 shadow-[0_0_10px_rgba(191,219,254,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-glass-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-brand-200 hover:bg-white/5 hover:text-white transition-all duration-200 group"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-medium">收起菜单</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
