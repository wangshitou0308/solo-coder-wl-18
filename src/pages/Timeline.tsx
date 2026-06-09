import { useMemo, useState } from 'react';
import {
  GitBranch,
  Send,
  Filter,
  MessageSquare,
  Briefcase,
  ThumbsUp,
  ThumbsDown,
  StickyNote,
  Repeat,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  Building2,
  Tag,
  FileText,
  User,
  Clock,
  TrendingUp,
  Award,
  Flame,
  List,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import {
  TimelineNode as TimelineNodeType,
  TimelineType,
  TIMELINE_TYPE_LABELS,
  Company,
  CompanyStatus,
  COMPANY_STATUS_LABELS,
} from '@/types';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import { cn } from '@/lib/utils';

const TYPE_THEME: Record<TimelineType, {
  bg: string;
  border: string;
  glow: string;
  dot: string;
  badge: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'purple' | 'pink';
  gradient: string;
  Icon: typeof Send;
}> = {
  [TimelineType.APPLICATION]: {
    bg: 'bg-blue-500/15',
    border: 'border-blue-400/30',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
    dot: 'bg-blue-500',
    badge: 'info',
    gradient: 'from-blue-500 to-cyan-500',
    Icon: Send,
  },
  [TimelineType.SCREENING]: {
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-400/30',
    glow: 'shadow-[0_0_20px_rgba(34,211,238,0.4)]',
    dot: 'bg-cyan-500',
    badge: 'info',
    gradient: 'from-cyan-500 to-teal-500',
    Icon: Filter,
  },
  [TimelineType.INTERVIEW]: {
    bg: 'bg-purple-500/15',
    border: 'border-purple-400/30',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    dot: 'bg-purple-500',
    badge: 'purple',
    gradient: 'from-purple-500 to-violet-500',
    Icon: MessageSquare,
  },
  [TimelineType.OFFER]: {
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-400/30',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    dot: 'bg-emerald-500',
    badge: 'success',
    gradient: 'from-emerald-500 to-green-500',
    Icon: Award,
  },
  [TimelineType.REJECTION]: {
    bg: 'bg-red-500/15',
    border: 'border-red-400/30',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
    dot: 'bg-red-500',
    badge: 'danger',
    gradient: 'from-red-500 to-rose-500',
    Icon: ThumbsDown,
  },
  [TimelineType.NOTE]: {
    bg: 'bg-slate-500/15',
    border: 'border-slate-400/30',
    glow: 'shadow-[0_0_20px_rgba(148,163,184,0.4)]',
    dot: 'bg-slate-400',
    badge: 'muted',
    gradient: 'from-slate-500 to-gray-500',
    Icon: StickyNote,
  },
  [TimelineType.FOLLOWUP]: {
    bg: 'bg-amber-500/15',
    border: 'border-amber-400/30',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    dot: 'bg-amber-500',
    badge: 'warning',
    gradient: 'from-amber-500 to-orange-500',
    Icon: Repeat,
  },
};

const STATUS_BADGE_MAP: Record<CompanyStatus, 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'purple' | 'pink'> = {
  [CompanyStatus.TARGET]: 'muted',
  [CompanyStatus.APPLIED]: 'info',
  [CompanyStatus.SCREENING]: 'info',
  [CompanyStatus.INTERVIEW]: 'purple',
  [CompanyStatus.ONSITE]: 'warning',
  [CompanyStatus.OFFER]: 'success',
  [CompanyStatus.ACCEPTED]: 'success',
  [CompanyStatus.REJECTED]: 'danger',
  [CompanyStatus.ARCHIVED]: 'muted',
};

const IMPORTANT_TYPES = [
  TimelineType.APPLICATION,
  TimelineType.INTERVIEW,
  TimelineType.OFFER,
  TimelineType.REJECTION,
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function daysBetween(start: string, end: string) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.ceil((e - s) / 86400000);
}

interface FilterOption {
  label: string;
  value: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { label: '全部节点', value: 'all' },
  { label: '仅重要节点', value: 'important' },
];

interface TimelineCardProps {
  node: TimelineNodeType;
  index: number;
  isLast: boolean;
}

function TimelineCard({ node, index, isLast }: TimelineCardProps) {
  const { getCompany, getInterview, getOffer } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const theme = TYPE_THEME[node.type];
  const company = node.companyId ? getCompany(node.companyId) : undefined;
  const interview = node.interviewId ? getInterview(node.interviewId) : undefined;
  const offer = node.offerId ? getOffer(node.offerId) : undefined;
  const Icon = theme.Icon;

  return (
    <div
      className={cn(
        'relative pl-20 pb-8 stagger-item',
        isLast && 'pb-0'
      )}
      style={{ animationDelay: `${Math.min(index * 0.06, 0.6)}s` }}
    >
      {!isLast && (
        <div
          className={cn(
            'absolute left-[22px] top-10 bottom-0 w-px',
            'bg-gradient-to-b from-brand-500/40 via-brand-400/20 to-transparent'
          )}
        />
      )}

      <div
        className={cn(
          'absolute left-2 top-2 z-10',
          'w-[42px] h-[42px] rounded-xl',
          'flex items-center justify-center',
          'bg-gradient-to-br', theme.gradient,
          theme.glow,
          'transition-all duration-300',
          'hover:scale-110 hover:rotate-3',
          'group/dot'
        )}
      >
        <Icon className="w-5 h-5 text-white drop-shadow-lg" />
        <div
          className={cn(
            'absolute inset-0 rounded-xl',
            'bg-white/0 group-hover/dot:bg-white/10',
            'transition-all duration-300'
          )}
        />
      </div>

      <div
        className={cn(
          'glass-card p-5 ml-2 group/card',
          'transition-all duration-300',
          theme.bg,
          theme.border,
          'hover:shadow-xl hover:shadow-brand-500/10',
          'hover:-translate-y-0.5',
          'cursor-pointer'
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={theme.badge} dot>
              {TIMELINE_TYPE_LABELS[node.type]}
            </Badge>
            {company && (
              <Badge color="muted">
                <Building2 className="w-3 h-3" />
                {company.name}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-brand-300/70">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(node.date)}
          </div>
        </div>

        <h4 className="font-serif text-lg font-semibold text-white mb-2 group-hover/card:text-brand-200 transition-colors">
          {node.title}
        </h4>

        {node.description && (
          <p className="text-sm text-brand-200/80 leading-relaxed mb-3">
            {node.description}
          </p>
        )}

        {node.tags && node.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {node.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-full bg-white/5 border border-white/10 text-brand-300"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {(node.type === TimelineType.INTERVIEW || node.type === TimelineType.OFFER) && (
          <button
            className={cn(
              'flex items-center gap-1 text-xs text-brand-300',
              'hover:text-brand-200 transition-colors',
              'mt-2 pt-2 border-t border-white/5'
            )}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                收起详情
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                展开详情
              </>
            )}
          </button>
        )}

        {expanded && node.type === TimelineType.INTERVIEW && interview && (
          <div className="mt-4 pt-4 border-t border-white/5 animate-fade-in space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-3 bg-white/[0.02]">
                <div className="flex items-center gap-1.5 text-xs text-brand-300/70 mb-1">
                  <List className="w-3.5 h-3.5" />
                  面试轮次
                </div>
                <p className="text-white font-semibold">第 {interview.round} 轮</p>
              </div>
              <div className="glass-card p-3 bg-white/[0.02]">
                <div className="flex items-center gap-1.5 text-xs text-brand-300/70 mb-1">
                  <User className="w-3.5 h-3.5" />
                  面试官
                </div>
                <p className="text-white font-semibold truncate">
                  {interview.interviewer || '未填写'}
                </p>
              </div>
              <div className="glass-card p-3 bg-white/[0.02]">
                <div className="flex items-center gap-1.5 text-xs text-brand-300/70 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  面试时长
                </div>
                <p className="text-white font-semibold">{interview.duration} 分钟</p>
              </div>
              <div className="glass-card p-3 bg-white/[0.02]">
                <div className="flex items-center gap-1.5 text-xs text-brand-300/70 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  题目数量
                </div>
                <p className="text-white font-semibold">{interview.questions.length} 道</p>
              </div>
            </div>
          </div>
        )}

        {expanded && node.type === TimelineType.OFFER && offer && (
          <div className="mt-4 pt-4 border-t border-white/5 animate-fade-in space-y-3">
            <div className="glass-card p-4 bg-emerald-500/5 border border-emerald-400/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-brand-300/80">薪资结构概要</span>
                <Badge color="success" size="sm">
                  {offer.monthsPaid} 薪
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-300/70">基础月薪</span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    {offer.salary.baseSalary}K
                  </span>
                </div>
                {offer.salary.performanceBonus && (
                  <div className="flex justify-between">
                    <span className="text-brand-300/70">绩效奖金/月</span>
                    <span className="text-brand-200 font-mono">
                      +{offer.salary.performanceBonus}K
                    </span>
                  </div>
                )}
                {offer.salary.yearEndBonus && (
                  <div className="flex justify-between">
                    <span className="text-brand-300/70">年终奖</span>
                    <span className="text-brand-200 font-mono">
                      +{offer.salary.yearEndBonus}K
                    </span>
                  </div>
                )}
                {offer.salary.signingBonus && (
                  <div className="flex justify-between">
                    <span className="text-brand-300/70">签字费</span>
                    <span className="text-amber-400 font-mono font-semibold">
                      +{offer.salary.signingBonus}K
                    </span>
                  </div>
                )}
                <div className="pt-2 mt-2 border-t border-white/5 flex justify-between">
                  <span className="text-brand-200 font-medium">年总包预估</span>
                  <span className="text-white font-mono font-bold">
                    {((offer.salary.baseSalary + (offer.salary.performanceBonus || 0)) * offer.monthsPaid
                      + (offer.salary.yearEndBonus || 0)
                      + (offer.salary.signingBonus || 0)).toFixed(0)}K
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-brand-300/70">
              <span>工作地点：{offer.location}</span>
              <span>
                截止日期：{formatDate(offer.deadline)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatsPanelProps {
  nodes: TimelineNodeType[];
}

function StatsPanel({ nodes }: StatsPanelProps) {
  const stats = useMemo(() => {
    const companyNodes: Record<string, TimelineNodeType[]> = {};
    nodes.forEach((n) => {
      if (n.companyId) {
        if (!companyNodes[n.companyId]) companyNodes[n.companyId] = [];
        companyNodes[n.companyId].push(n);
      }
    });

    let totalDays = 0;
    let offerCount = 0;
    let longestFlow = 0;
    let longestCompany: string | undefined;

    Object.entries(companyNodes).forEach(([companyId, nodeList]) => {
      const sorted = [...nodeList].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const applyNode = sorted.find((n) => n.type === TimelineType.APPLICATION);
      const offerNode = sorted.find((n) => n.type === TimelineType.OFFER);

      if (applyNode && offerNode) {
        const days = daysBetween(applyNode.date, offerNode.date);
        totalDays += days;
        offerCount++;
      }

      if (sorted.length >= 2) {
        const flowDays = daysBetween(sorted[0].date, sorted[sorted.length - 1].date);
        if (flowDays > longestFlow) {
          longestFlow = flowDays;
          longestCompany = companyId;
        }
      }
    });

    const { getCompany } = useAppStore.getState();

    return {
      avgDays: offerCount > 0 ? Math.round(totalDays / offerCount) : 0,
      offerCount,
      longestFlow,
      longestCompanyName: longestCompany ? getCompany(longestCompany)?.name : '-',
      typeCount: Object.entries(
        nodes.reduce((acc, n) => {
          acc[n.type] = (acc[n.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort((a, b) => (b[1] as number) - (a[1] as number)),
    };
  }, [nodes]);

  const { getCompany } = useAppStore();
  void getCompany;

  return (
    <div className="glass-card p-5 space-y-5">
      <h3 className="section-title !mb-0">
        <TrendingUp className="w-5 h-5 text-brand-400" />
        推进节奏统计
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-400/20">
          <div className="flex items-center gap-2 text-xs text-emerald-300/80 mb-2">
            <Award className="w-3.5 h-3.5" />
            已获Offer
          </div>
          <p className="data-value text-emerald-400">{stats.offerCount}</p>
          <p className="text-[11px] text-brand-300/50 mt-0.5">家公司</p>
        </div>
        <div className="glass-card p-4 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-400/20">
          <div className="flex items-center gap-2 text-xs text-blue-300/80 mb-2">
            <Clock className="w-3.5 h-3.5" />
            平均周期
          </div>
          <p className="data-value text-blue-400">{stats.avgDays}</p>
          <p className="text-[11px] text-brand-300/50 mt-0.5">天/Offer</p>
        </div>
        <div className="glass-card p-4 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-400/20 col-span-2">
          <div className="flex items-center gap-2 text-xs text-amber-300/80 mb-2">
            <Flame className="w-3.5 h-3.5" />
            当前最长流程
          </div>
          <div className="flex items-baseline gap-2">
            <p className="data-value text-amber-400">{stats.longestFlow}</p>
            <p className="text-sm text-brand-300/70">天</p>
          </div>
          {stats.longestCompanyName && stats.longestCompanyName !== '-' && (
            <p className="text-xs text-brand-300/60 mt-0.5 truncate">
              {stats.longestCompanyName}
            </p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-brand-300 mb-3">节点类型分布</h4>
        <div className="space-y-2.5">
          {stats.typeCount.map(([type, count]) => {
            const theme = TYPE_THEME[type as TimelineType];
            const TypeIcon = theme.Icon;
            return (
              <div key={type} className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                    'bg-gradient-to-br', theme.gradient,
                    theme.glow
                  )}
                >
                  <TypeIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-brand-200">
                      {TIMELINE_TYPE_LABELS[type as TimelineType]}
                    </span>
                    <span className="text-brand-400 font-mono font-semibold">
                      {count}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full bg-gradient-to-r', theme.gradient,
                        'transition-all duration-700'
                      )}
                      style={{
                        width: `${((count as number) / Math.max((stats.typeCount[0]?.[1] as number) || 1, 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface AddNodeFormProps {
  onClose: () => void;
}

function AddNodeForm({ onClose }: AddNodeFormProps) {
  const { companies, addTimelineNode } = useAppStore();
  const [companyId, setCompanyId] = useState<string>('');
  const [type, setType] = useState<TimelineType>(TimelineType.NOTE);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!companyId) {
      setError('请选择公司');
      return;
    }
    if (!title.trim()) {
      setError('请输入标题');
      return;
    }

    addTimelineNode({
      companyId,
      type,
      date: new Date(date).toISOString(),
      title: title.trim(),
      description: description.trim() || undefined,
      tags: tagsInput
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean),
    });

    onClose();
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="glass-card p-3 bg-red-500/10 border border-red-400/30 text-red-300 text-sm animate-fade-in">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="label-text">选择公司</label>
        <select
          value={companyId}
          onChange={(e) => {
            setCompanyId(e.target.value);
            setError('');
          }}
          className="select-field"
        >
          <option value="">请选择公司...</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} - {c.position}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="label-text">节点类型</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {(Object.keys(TIMELINE_TYPE_LABELS) as TimelineType[]).map((t) => {
            const theme = TYPE_THEME[t];
            const TypeIcon = theme.Icon;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'glass-card p-3 flex flex-col items-center gap-1.5',
                  'transition-all duration-200',
                  type === t
                    ? cn(
                        'ring-2 ring-offset-0 border-transparent',
                        'bg-gradient-to-br', theme.gradient,
                        theme.glow
                      )
                    : 'hover:border-brand-400/40'
                )}
              >
                <TypeIcon
                  className={cn(
                    'w-5 h-5',
                    type === t ? 'text-white' : 'text-brand-300'
                  )}
                />
                <span
                  className={cn(
                    'text-[11px] font-medium',
                    type === t ? 'text-white' : 'text-brand-200'
                  )}
                >
                  {TIMELINE_TYPE_LABELS[t]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="label-text">日期</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="space-y-2">
        <label className="label-text">标题</label>
        <input
          type="text"
          placeholder="如：简历筛选通过、技术一面安排..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
          className="input-field"
        />
      </div>

      <div className="space-y-2">
        <label className="label-text">描述</label>
        <textarea
          placeholder="详细描述..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="textarea-field"
        />
      </div>

      <div className="space-y-2">
        <label className="label-text">标签 <span className="text-brand-400/60">(用逗号分隔)</span></label>
        <input
          type="text"
          placeholder="如：面试, 技术, 算法"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="input-field"
        />
      </div>
    </div>
  );
}

export default function TimelinePage() {
  const { timelineNodes, companies } = useAppStore();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'important'>('all');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const filteredNodes = useMemo(() => {
    let list = [...timelineNodes];

    if (selectedCompanyId !== 'all') {
      list = list.filter((n) => n.companyId === selectedCompanyId);
    }

    if (filterMode === 'important') {
      list = list.filter((n) => IMPORTANT_TYPES.includes(n.type));
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [timelineNodes, selectedCompanyId, filterMode]);

  const selectedCompany: Company | undefined = useMemo(() => {
    if (selectedCompanyId === 'all') return undefined;
    return companies.find((c) => c.id === selectedCompanyId);
  }, [selectedCompanyId, companies]);

  return (
    <div className="min-h-full p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto space-y-5">
        <div className="animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <GitBranch className="w-5 h-5 text-white" />
                </div>
                <h1 className="page-title !mb-0">求职时间线</h1>
              </div>
              <p className="page-subtitle ml-12">
                完整追踪每一个机会的推进过程，共 {timelineNodes.length} 个节点
              </p>
            </div>
            <button
              onClick={() => setAddModalOpen(true)}
              className="btn-primary flex items-center gap-2 w-fit animate-fade-in"
            >
              <Plus className="w-4 h-4" />
              新增时间节点
            </button>
          </div>
        </div>

        <div className="divider" />

        <div className="flex flex-col lg:flex-row gap-4 items-stretch animate-fade-in">
          <div className="relative flex-1 max-w-md">
            <button
              onClick={() => {
                setShowCompanyDropdown(!showCompanyDropdown);
                setShowFilterDropdown(false);
              }}
              className={cn(
                'w-full glass-card px-4 py-3 flex items-center gap-3',
                'transition-all duration-200 hover:border-brand-400/40',
                'text-left'
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                  selectedCompany
                    ? 'bg-gradient-to-br from-brand-500 to-violet-500'
                    : 'bg-white/5'
                )}
              >
                <Building2
                  className={cn(
                    'w-4.5 h-4.5',
                    selectedCompany ? 'text-white' : 'text-brand-300'
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-brand-300/60 mb-0.5">按公司筛选</p>
                <p className="text-sm text-white font-medium truncate">
                  {selectedCompany ? (
                    <span className="flex items-center gap-2">
                      {selectedCompany.name}
                      <Badge
                        color={STATUS_BADGE_MAP[selectedCompany.status]}
                        size="sm"
                        dot
                        className="!py-0"
                      >
                        {COMPANY_STATUS_LABELS[selectedCompany.status]}
                      </Badge>
                    </span>
                  ) : (
                    <span className="text-brand-200">全部公司 ({companies.length}家)</span>
                  )}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-brand-400 shrink-0 transition-transform',
                  showCompanyDropdown && 'rotate-180'
                )}
              />
            </button>

            {showCompanyDropdown && (
              <div className="absolute top-full mt-2 left-0 right-0 z-30 glass-card p-2 animate-scale-in shadow-2xl max-h-80 overflow-y-auto no-scrollbar">
                <button
                  onClick={() => {
                    setSelectedCompanyId('all');
                    setShowCompanyDropdown(false);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between',
                    selectedCompanyId === 'all'
                      ? 'bg-brand-500/20 text-brand-200'
                      : 'text-brand-100 hover:bg-white/5'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-brand-400" />
                    全部公司
                  </span>
                  <Badge color="primary" size="sm">
                    {companies.length}
                  </Badge>
                </button>
                <div className="h-px bg-white/5 my-1" />
                {companies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCompanyId(c.id);
                      setShowCompanyDropdown(false);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors',
                      selectedCompanyId === c.id
                        ? 'bg-brand-500/20 text-brand-200'
                        : 'text-brand-100 hover:bg-white/5'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                            'bg-gradient-to-br from-brand-500/30 to-violet-500/30 border border-white/10'
                          )}
                        >
                          <span className="text-xs font-serif font-bold text-brand-200">
                            {c.name.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">
                            {c.name}
                          </p>
                          <p className="text-[11px] text-brand-300/60 truncate">
                            {c.position}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge
                          color={STATUS_BADGE_MAP[c.status]}
                          size="sm"
                          dot
                          className="!py-0"
                        >
                          {COMPANY_STATUS_LABELS[c.status]}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-full lg:w-auto">
            <button
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowCompanyDropdown(false);
              }}
              className={cn(
                'w-full lg:w-auto glass-card px-4 py-3 flex items-center gap-3',
                'transition-all duration-200 hover:border-brand-400/40'
              )}
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <Filter className="w-4.5 h-4.5 text-brand-300" />
              </div>
              <div className="flex-1 lg:flex-none lg:min-w-[120px]">
                <p className="text-[11px] text-brand-300/60 mb-0.5">节点筛选</p>
                <p className="text-sm text-white font-medium">
                  {filterMode === 'all' ? '全部节点' : '仅重要节点'}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-brand-400 shrink-0 transition-transform',
                  showFilterDropdown && 'rotate-180'
                )}
              />
            </button>

            {showFilterDropdown && (
              <div className="absolute top-full mt-2 left-0 right-0 z-30 glass-card p-2 animate-scale-in shadow-2xl">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFilterMode(opt.value as 'all' | 'important');
                      setShowFilterDropdown(false);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between',
                      filterMode === opt.value
                        ? 'bg-brand-500/20 text-brand-200'
                        : 'text-brand-100 hover:bg-white/5'
                    )}
                  >
                    <span>{opt.label}</span>
                    {filterMode === opt.value && (
                      <span className="text-brand-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="grid grid-cols-1 xl:grid-cols-4 gap-5"
          onClick={() => {
            if (showCompanyDropdown) setShowCompanyDropdown(false);
            if (showFilterDropdown) setShowFilterDropdown(false);
          }}
        >
          <div className="xl:col-span-3">
            <div className="glass-card p-6">
              {filteredNodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 border border-brand-400/20 flex items-center justify-center mb-5 animate-pulse">
                    <GitBranch className="w-10 h-10 text-brand-400/60" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-white mb-2">
                    暂无时间节点
                  </h3>
                  <p className="text-sm text-brand-300/60 mb-6 max-w-sm">
                    {selectedCompany
                      ? `${selectedCompany.name} 暂无时间记录`
                      : '添加第一个时间节点，开始记录你的求职之旅'}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddModalOpen(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    新增时间节点
                  </button>
                </div>
              ) : (
                <div className="relative pt-2">
                  {filteredNodes.map((node, idx) => (
                    <TimelineCard
                      key={node.id}
                      node={node}
                      index={idx}
                      isLast={idx === filteredNodes.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <StatsPanel nodes={filteredNodes} />

            <div className="glass-card p-5 space-y-4">
              <h3 className="section-title !mb-0">
                <Briefcase className="w-5 h-5 text-brand-400" />
                图例说明
              </h3>
              <div className="space-y-2.5">
                {(Object.keys(TIMELINE_TYPE_LABELS) as TimelineType[]).map((t) => {
                  const theme = TYPE_THEME[t];
                  const TypeIcon = theme.Icon;
                  return (
                    <div
                      key={t}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                          'bg-gradient-to-br', theme.gradient,
                          theme.glow
                        )}
                      >
                        <TypeIcon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-brand-200">
                        {TIMELINE_TYPE_LABELS[t]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="新增时间节点"
        size="lg"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAddModalOpen(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              onClick={() => {
                const form = document.querySelector('[data-add-node-form]');
                if (form) {
                  const submitBtn = form.querySelector('[data-submit-btn]') as HTMLButtonElement;
                  submitBtn?.click();
                }
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              确认添加
            </button>
          </div>
        }
      >
        <div data-add-node-form>
          <AddNodeForm onClose={() => setAddModalOpen(false)} />
          <button
            data-submit-btn
            type="button"
            className="hidden"
            onClick={() => {
              const companyIdSelect = document.querySelector('select') as HTMLSelectElement;
              const titleInput = document.querySelectorAll('input[type="text"]')[0] as HTMLInputElement;
              const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
              const typeButtons = document.querySelectorAll('button[class*="glass-card p-3 flex flex-col"]');
              const descTextarea = document.querySelector('textarea') as HTMLTextAreaElement;
              const tagsInput = document.querySelectorAll('input[type="text"]')[1] as HTMLInputElement;

              let selectedType: TimelineType = TimelineType.NOTE;
              (Object.keys(TIMELINE_TYPE_LABELS) as TimelineType[]).forEach((t, idx) => {
                const btn = typeButtons[idx];
                if (btn && btn.className.includes('ring-2')) {
                  selectedType = t;
                }
              });

              if (!companyIdSelect?.value) {
                const errEl = document.querySelector('[class*="bg-red-500/10"]');
                if (errEl) (errEl as HTMLElement).textContent = '请选择公司';
                return;
              }
              if (!titleInput?.value.trim()) {
                const errEl = document.querySelector('[class*="bg-red-500/10"]');
                if (errEl) (errEl as HTMLElement).textContent = '请输入标题';
                return;
              }

              const { addTimelineNode } = useAppStore.getState();
              addTimelineNode({
                companyId: companyIdSelect.value,
                type: selectedType,
                date: new Date(dateInput?.value || new Date()).toISOString(),
                title: titleInput.value.trim(),
                description: descTextarea?.value.trim() || undefined,
                tags: (tagsInput?.value || '')
                  .split(/[,，]/)
                  .map((t) => t.trim())
                  .filter(Boolean),
              });

              setAddModalOpen(false);
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
