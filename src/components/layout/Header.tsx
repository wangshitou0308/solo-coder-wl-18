import { useState } from 'react';
import { Search, Bell, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
}

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

export default function Header({ title = '统计看板' }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
  const weekStr = `星期${weekDays[now.getDay()]}`;

  const notifications = [
    { id: 1, title: '新面试邀请', desc: '字节跳动已邀请您参加面试', time: '5分钟前', unread: true },
    { id: 2, title: '面试提醒', desc: '明天上午10:00 腾讯二面', time: '1小时前', unread: true },
    { id: 3, title: '简历已查看', desc: '阿里巴巴HR查看了您的简历', time: '昨天', unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-20 glass-card rounded-none border-x-0 border-t-0 px-6 py-4 animate-fade-in">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-white glow-text">{title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-sm text-brand-300">
                {dateStr} {weekStr}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={cn(
              'relative transition-all duration-300',
              searchFocused ? 'w-80' : 'w-64',
            )}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400 transition-colors duration-200" />
            <input
              type="text"
              placeholder="搜索公司、职位、记录..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                'w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border text-sm text-white placeholder-brand-400 transition-all duration-300',
                searchFocused
                  ? 'border-brand-400/50 bg-white/10 shadow-lg shadow-brand-500/10 ring-2 ring-brand-500/30 outline-none'
                  : 'border-white/10 hover:border-white/20',
              )}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                'relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200',
                showNotifications
                  ? 'bg-brand-500/20 text-white border border-brand-400/40'
                  : 'bg-white/5 text-brand-200 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20',
              )}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center animate-pulse-glow border-2 border-brand-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-3 w-80 glass-card p-4 animate-scale-in z-50">
                <h3 className="font-semibold text-white mb-3">通知中心</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'p-3 rounded-xl transition-all duration-200 cursor-pointer',
                        n.unread
                          ? 'bg-brand-500/10 border border-brand-400/20'
                          : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.05]',
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {n.unread && (
                          <span className="w-2 h-2 rounded-full bg-brand-400 mt-2 shrink-0 animate-pulse" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{n.title}</p>
                          <p className="text-xs text-brand-300 mt-0.5 truncate">{n.desc}</p>
                          <p className="text-xs text-brand-500 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 py-2 text-sm text-brand-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                  查看全部通知
                </button>
              </div>
            )}
          </div>

          <button className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 transition-all duration-200">
            <User className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
