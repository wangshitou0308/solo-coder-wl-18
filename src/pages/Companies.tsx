import { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Building2,
  Search,
  Plus,
  MapPin,
  Briefcase,
  Star,
  X,
  Filter,
  Calendar,
  Mail,
  Phone,
  Globe,
  Tag,
  ChevronDown,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Company, CompanyStatus, COMPANY_STATUS_LABELS } from '@/types';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import { cn } from '@/lib/utils';

const STATUS_ORDER: CompanyStatus[] = [
  CompanyStatus.TARGET,
  CompanyStatus.APPLIED,
  CompanyStatus.SCREENING,
  CompanyStatus.INTERVIEW,
  CompanyStatus.ONSITE,
  CompanyStatus.OFFER,
  CompanyStatus.ACCEPTED,
  CompanyStatus.REJECTED,
  CompanyStatus.ARCHIVED,
];

const STATUS_THEME: Record<CompanyStatus, {
  bg: string;
  border: string;
  badge: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'purple' | 'pink';
  accent: string;
  dot: string;
}> = {
  [CompanyStatus.TARGET]: {
    bg: 'bg-slate-500/10',
    border: 'border-slate-400/20',
    badge: 'muted',
    accent: 'text-slate-300',
    dot: 'bg-slate-400',
  },
  [CompanyStatus.APPLIED]: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-400/20',
    badge: 'info',
    accent: 'text-cyan-300',
    dot: 'bg-cyan-400',
  },
  [CompanyStatus.SCREENING]: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-400/20',
    badge: 'info',
    accent: 'text-blue-300',
    dot: 'bg-blue-400',
  },
  [CompanyStatus.INTERVIEW]: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-400/20',
    badge: 'purple',
    accent: 'text-violet-300',
    dot: 'bg-violet-400',
  },
  [CompanyStatus.ONSITE]: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-400/20',
    badge: 'warning',
    accent: 'text-amber-300',
    dot: 'bg-amber-400',
  },
  [CompanyStatus.OFFER]: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-400/20',
    badge: 'success',
    accent: 'text-emerald-300',
    dot: 'bg-emerald-400',
  },
  [CompanyStatus.ACCEPTED]: {
    bg: 'bg-green-500/10',
    border: 'border-green-400/20',
    badge: 'success',
    accent: 'text-green-300',
    dot: 'bg-green-400',
  },
  [CompanyStatus.REJECTED]: {
    bg: 'bg-red-500/10',
    border: 'border-red-400/20',
    badge: 'danger',
    accent: 'text-red-300',
    dot: 'bg-red-400',
  },
  [CompanyStatus.ARCHIVED]: {
    bg: 'bg-gray-500/10',
    border: 'border-gray-400/20',
    badge: 'muted',
    accent: 'text-gray-300',
    dot: 'bg-gray-400',
  },
};

const PRIORITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'P1 最高', color: 'text-red-400' },
  2: { label: 'P2 高', color: 'text-orange-400' },
  3: { label: 'P3 中', color: 'text-amber-400' },
  4: { label: 'P4 低', color: 'text-blue-400' },
  5: { label: 'P5 最低', color: 'text-slate-400' },
};

function PriorityStars({ priority }: { priority: number }) {
  const filled = 6 - priority;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'w-3.5 h-3.5 shrink-0 transition-all',
            i <= filled
              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]'
              : 'text-white/20'
          )}
        />
      ))}
    </div>
  );
}

interface CompanyCardProps {
  company: Company;
  onClick: () => void;
  isDragging?: boolean;
}

function CompanyCard({ company, onClick, isDragging }: CompanyCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card p-4 cursor-pointer group animate-fade-in-up',
        'transition-all duration-300',
        isDragging
          ? 'shadow-2xl shadow-brand-500/30 border-brand-400/60 scale-[1.02] rotate-1 opacity-90'
          : 'hover:border-brand-400/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/20'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-serif text-base font-semibold text-white truncate group-hover:text-brand-200 transition-colors">
            {company.name}
          </h4>
          <p className="text-xs text-brand-300/70 mt-0.5 truncate">{company.industry}</p>
        </div>
        <PriorityStars priority={company.priority} />
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-brand-100">
          <Briefcase className="w-3.5 h-3.5 text-brand-400 shrink-0" />
          <span className="truncate font-medium">{company.position}</span>
        </div>
        {company.salary && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-emerald-400 font-semibold font-mono">{company.salary}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-brand-300/80">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{company.location}</span>
        </div>
      </div>

      {company.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {company.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full bg-white/5 border border-white/10 text-brand-200 hover:bg-brand-500/20 transition-colors"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
          {company.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] rounded-full bg-white/5 text-brand-300/70">
              +{company.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface SortableCompanyCardProps {
  company: Company;
  onClick: () => void;
}

function SortableCompanyCard({ company, onClick }: SortableCompanyCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: company.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CompanyCard company={company} onClick={onClick} isDragging={isDragging} />
    </div>
  );
}

interface KanbanColumnProps {
  status: CompanyStatus;
  companies: Company[];
  onCardClick: (company: Company) => void;
}

function KanbanColumn({ status, companies, onCardClick }: KanbanColumnProps) {
  const theme = STATUS_THEME[status];
  const companyIds = companies.map((c) => c.id);

  return (
    <div
      className={cn(
        'kanban-column flex flex-col min-h-[400px] max-h-[calc(100vh-240px)]',
        theme.bg,
        theme.border
      )}
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <span className={cn('w-2.5 h-2.5 rounded-full animate-pulse', theme.dot)} />
          <h3 className={cn('font-serif text-sm font-semibold', theme.accent)}>
            {COMPANY_STATUS_LABELS[status]}
          </h3>
        </div>
        <Badge color={theme.badge} size="sm" className="!px-2">
          {companies.length}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 -mr-1 space-y-3">
        <SortableContext items={companyIds} strategy={verticalListSortingStrategy}>
          {companies.map((company) => (
            <SortableCompanyCard
              key={company.id}
              company={company}
              onClick={() => onCardClick(company)}
            />
          ))}
        </SortableContext>

        {companies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-3', theme.bg)}>
              <Building2 className={cn('w-6 h-6', theme.accent, 'opacity-40')} />
            </div>
            <p className="text-xs text-brand-300/50">暂无公司</p>
            <p className="text-[10px] text-brand-300/30 mt-1">拖拽卡片到此处</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CompanyDetailModal({
  company,
  open,
  onClose,
}: {
  company: Company | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!company) return null;
  const theme = STATUS_THEME[company.status];
  const priorityInfo = PRIORITY_LABELS[company.priority] || PRIORITY_LABELS[3];

  return (
    <Modal open={open} onClose={onClose} title={company.name} size="lg">
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-serif font-bold',
              theme.bg,
              theme.border,
              'border'
            )}>
              <span className={theme.accent}>{company.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-white">{company.name}</h2>
              <p className="text-sm text-brand-300 mt-0.5">{company.industry} · {company.size}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge color={theme.badge} dot>
                  {COMPANY_STATUS_LABELS[company.status]}
                </Badge>
                <Badge color="muted">
                  <span className={priorityInfo.color}>{priorityInfo.label}</span>
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end mb-1">
              <PriorityStars priority={company.priority} />
            </div>
            {company.rating && (
              <p className="text-xs text-brand-300/70">
                评分：<span className="font-mono text-amber-400">{company.rating}/5</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-4 space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-400" />
              岗位信息
            </h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-300/70">岗位名称</span>
                <span className="text-white font-medium">{company.position}</span>
              </div>
              {company.salary && (
                <div className="flex justify-between">
                  <span className="text-brand-300/70">薪资范围</span>
                  <span className="text-emerald-400 font-mono font-semibold">{company.salary}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-brand-300/70">工作地点</span>
                <span className="text-white flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" />
                  {company.location}
                </span>
              </div>
              {company.appliedDate && (
                <div className="flex justify-between">
                  <span className="text-brand-300/70">投递日期</span>
                  <span className="text-white flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-400" />
                    {new Date(company.appliedDate).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-4 space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-400" />
              联系方式
            </h4>
            <div className="space-y-2.5 text-sm">
              {company.contactName ? (
                <div className="flex justify-between">
                  <span className="text-brand-300/70">联系人</span>
                  <span className="text-white">{company.contactName}</span>
                </div>
              ) : (
                <p className="text-xs text-brand-300/40">暂无联系人信息</p>
              )}
              {company.contactEmail && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-brand-300/70">邮箱</span>
                  <a
                    href={`mailto:${company.contactEmail}`}
                    className="text-brand-300 hover:text-brand-200 flex items-center gap-1 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span className="max-w-[180px] truncate">{company.contactEmail}</span>
                  </a>
                </div>
              )}
              {company.contactPhone && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-brand-300/70">电话</span>
                  <a
                    href={`tel:${company.contactPhone}`}
                    className="text-brand-300 hover:text-brand-200 flex items-center gap-1 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {company.contactPhone}
                  </a>
                </div>
              )}
              {company.website && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-brand-300/70">官网</span>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-300 hover:text-brand-200 flex items-center gap-1 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    访问官网
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {company.tags.length > 0 && (
          <div className="glass-card p-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-brand-400" />
              标签
            </h4>
            <div className="flex flex-wrap gap-2">
              {company.tags.map((tag) => (
                <Badge key={tag} color="primary" size="md">
                  <Tag className="w-3 h-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {company.notes && (
          <div className="glass-card p-4">
            <h4 className="text-sm font-semibold text-white mb-2">备注</h4>
            <p className="text-sm text-brand-200 whitespace-pre-wrap leading-relaxed">
              {company.notes}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function Companies() {
  const { companies, updateCompanyStatus } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<number | null>(null);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority =
        priorityFilter === null || company.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [companies, searchQuery, priorityFilter]);

  const groupedCompanies = useMemo(() => {
    const groups: Record<CompanyStatus, Company[]> = {} as Record<CompanyStatus, Company[]>;
    STATUS_ORDER.forEach((status) => {
      groups[status] = [];
    });
    filteredCompanies.forEach((company) => {
      if (groups[company.status]) {
        groups[company.status].push(company);
      }
    });
    STATUS_ORDER.forEach((status) => {
      groups[status].sort((a, b) => a.priority - b.priority);
    });
    return groups;
  }, [filteredCompanies]);

  const activeCompany = useMemo(() => {
    if (!activeId) return null;
    return companies.find((c) => c.id === activeId) || null;
  }, [activeId, companies]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    const activeCompany = companies.find((c) => c.id === activeIdStr);
    if (!activeCompany) return;

    if (STATUS_ORDER.includes(overIdStr as CompanyStatus)) {
      if (activeCompany.status !== overIdStr) {
        updateCompanyStatus(activeIdStr, overIdStr as CompanyStatus);
      }
      return;
    }

    const overCompany = companies.find((c) => c.id === overIdStr);
    if (overCompany && activeCompany.status !== overCompany.status) {
      updateCompanyStatus(activeIdStr, overCompany.status);
    }
  };

  const handleCardClick = (company: Company) => {
    setSelectedCompany(company);
    setDetailModalOpen(true);
  };

  const totalCount = filteredCompanies.length;

  return (
    <div className="min-h-full p-4 lg:p-6">
      <div className="max-w-full mx-auto space-y-5">
        <div className="animate-fade-in-up">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h1 className="page-title !mb-0">目标公司看板</h1>
              </div>
              <p className="page-subtitle ml-12">
                拖拽切换状态，追踪 {totalCount} 家公司的求职进度
              </p>
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center animate-fade-in">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
            <input
              type="text"
              placeholder="搜索公司名称、岗位、地点或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-11 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-brand-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
              className={cn(
                'btn-secondary flex items-center gap-2 min-w-[160px] justify-between',
                priorityFilter !== null && 'ring-2 ring-brand-500/50'
              )}
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {priorityFilter !== null
                  ? PRIORITY_LABELS[priorityFilter]?.label || `P${priorityFilter}`
                  : '优先级筛选'}
              </span>
              <ChevronDown className={cn('w-4 h-4 transition-transform', showPriorityDropdown && 'rotate-180')} />
            </button>

            {showPriorityDropdown && (
              <div className="absolute top-full mt-2 right-0 z-30 w-52 glass-card p-2 animate-scale-in shadow-2xl">
                <button
                  onClick={() => {
                    setPriorityFilter(null);
                    setShowPriorityDropdown(false);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between',
                    priorityFilter === null
                      ? 'bg-brand-500/20 text-brand-200'
                      : 'text-brand-100 hover:bg-white/5'
                  )}
                >
                  <span>全部优先级</span>
                  {priorityFilter === null && <span className="text-brand-400">✓</span>}
                </button>
                <div className="h-px bg-white/5 my-1" />
                {Object.entries(PRIORITY_LABELS).map(([key, { label, color }]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setPriorityFilter(Number(key));
                      setShowPriorityDropdown(false);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between',
                      priorityFilter === Number(key)
                        ? 'bg-brand-500/20 text-brand-200'
                        : 'text-brand-100 hover:bg-white/5'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <PriorityStars priority={Number(key)} />
                      <span className={color}>{label}</span>
                    </div>
                    {priorityFilter === Number(key) && <span className="text-brand-400">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            添加公司
          </button>
        </div>

        <div
          className="overflow-x-auto no-scrollbar -mx-4 px-4 pb-4"
          onClick={() => showPriorityDropdown && setShowPriorityDropdown(false)}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 min-w-max pb-2">
              {STATUS_ORDER.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  companies={groupedCompanies[status] || []}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>

            <DragOverlay>
              {activeCompany ? (
                <div className="w-72">
                  <CompanyCard
                    company={activeCompany}
                    onClick={() => {}}
                    isDragging
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      <CompanyDetailModal
        company={selectedCompany}
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedCompany(null);
        }}
      />
    </div>
  );
}
