import { useState, useMemo } from 'react';
import {
  DollarSign,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Layers,
  BarChart3,
  Plus,
  MapPin,
  Calendar,
  Building2,
  Briefcase,
  Award,
  Shield,
  Heart,
  Dumbbell,
  Clock,
  Home,
  Plane,
  Check,
  X,
  LayoutGrid,
  Table2,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Offer, SalaryBreakdown, Benefits, Company, ID } from '@/types';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import StatCard from '@/components/common/StatCard';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

type ViewMode = 'card' | 'table';

const calculateTotalPackage = (salary: SalaryBreakdown, monthsPaid: number): number => {
  const base = (salary.baseSalary || 0) * monthsPaid;
  const performance = (salary.performanceBonus || 0) * 12;
  const yearEnd = salary.yearEndBonus || 0;
  const signing = salary.signingBonus || 0;
  const stock = (salary.stockOptions || 0) / 4;
  return base + performance + yearEnd + signing + stock;
};

const getCompanyColor = (index: number): string => {
  const gradients = [
    'from-pink-500 to-rose-500',
    'from-violet-500 to-purple-500',
    'from-cyan-500 to-blue-500',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-500',
    'from-fuchsia-500 to-pink-500',
    'from-indigo-500 to-violet-500'
  ];
  return gradients[index % gradients.length];
};

const formatWan = (value: number): string => {
  return value.toFixed(1) + '万';
};

const getDaysUntilDeadline = (deadline: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(deadline);
  d.setHours(0, 0, 0, 0);
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

interface SalaryItem {
  key: keyof SalaryBreakdown;
  label: string;
  color: string;
  multiplier?: number;
}

const SALARY_ITEMS: SalaryItem[] = [
  { key: 'baseSalary', label: '基本工资', color: 'bg-gradient-to-r from-indigo-500 to-blue-500', multiplier: undefined },
  { key: 'performanceBonus', label: '绩效奖金', color: 'bg-gradient-to-r from-cyan-500 to-teal-500', multiplier: 12 },
  { key: 'yearEndBonus', label: '年终奖', color: 'bg-gradient-to-r from-amber-500 to-orange-500' },
  { key: 'stockOptions', label: '股票期权/4年', color: 'bg-gradient-to-r from-purple-500 to-violet-500', multiplier: 1 / 4 },
  { key: 'signingBonus', label: '签字费', color: 'bg-gradient-to-r from-rose-500 to-pink-500' }
];

const BENEFIT_BOOLEAN_ITEMS: { key: keyof Benefits; label: string; icon: typeof Shield }[] = [
  { key: 'supplementaryMedical', label: '补充医疗', icon: Shield },
  { key: 'dentalInsurance', label: '牙科保险', icon: Heart },
  { key: 'lifeInsurance', label: '人寿保险', icon: Award },
  { key: 'gymMembership', label: '健身房', icon: Dumbbell },
  { key: 'freeMeals', label: '免费餐饮', icon: Home },
  { key: 'flexibleWorking', label: '弹性工作', icon: Clock },
  { key: 'remoteWork', label: '远程办公', icon: Plane },
  { key: 'stockPurchasePlan', label: '员工购股', icon: TrendingUp }
];

interface OfferFormState {
  companyId: ID;
  position: string;
  baseSalary: number;
  performanceBonus: number;
  yearEndBonus: number;
  stockOptions: number;
  signingBonus: number;
  monthsPaid: number;
  location: string;
  deadline: string;
  startDate: string;
  socialInsuranceBase: number;
  housingFundBase: number;
  housingFundRatio: number;
  annualLeaveDays: number;
  sickLeaveDays: number;
  supplementaryMedical: boolean;
  dentalInsurance: boolean;
  lifeInsurance: boolean;
  gymMembership: boolean;
  freeMeals: boolean;
  flexibleWorking: boolean;
  remoteWork: boolean;
  stockPurchasePlan: boolean;
  educationBudget: number;
  notes: string;
}

const createEmptyForm = (companies: Company[]): OfferFormState => ({
  companyId: companies[0]?.id || '',
  position: '',
  baseSalary: 0,
  performanceBonus: 0,
  yearEndBonus: 0,
  stockOptions: 0,
  signingBonus: 0,
  monthsPaid: 12,
  location: '',
  deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  startDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  socialInsuranceBase: 0,
  housingFundBase: 0,
  housingFundRatio: 12,
  annualLeaveDays: 10,
  sickLeaveDays: 5,
  supplementaryMedical: false,
  dentalInsurance: false,
  lifeInsurance: false,
  gymMembership: false,
  freeMeals: false,
  flexibleWorking: false,
  remoteWork: false,
  stockPurchasePlan: false,
  educationBudget: 0,
  notes: ''
});

export default function Salary() {
  const { offers, companies, getCompany, addOffer, updateOffer, deleteOffer } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [expandedCard, setExpandedCard] = useState<ID | null>(null);
  const [form, setForm] = useState<OfferFormState>(() => createEmptyForm(companies));

  const stats = useMemo(() => {
    const totalOffers = offers.length;
    const acceptedOffers = offers.filter((o) => o.accepted).length;
    const packages = offers.map((o) => calculateTotalPackage(o.salary, o.monthsPaid));
    const maxPackage = packages.length > 0 ? Math.max(...packages) : 0;
    const avgPackage = packages.length > 0 ? packages.reduce((a, b) => a + b, 0) / packages.length : 0;
    return { totalOffers, acceptedOffers, maxPackage, avgPackage };
  }, [offers]);

  const avgValues = useMemo(() => {
    if (offers.length === 0) return null;
    const avgBase = offers.reduce((s, o) => s + (o.salary.baseSalary || 0), 0) / offers.length;
    const avgPerformance = offers.reduce((s, o) => s + (o.salary.performanceBonus || 0), 0) / offers.length;
    const avgYearEnd = offers.reduce((s, o) => s + (o.salary.yearEndBonus || 0), 0) / offers.length;
    const avgStock = offers.reduce((s, o) => s + (o.salary.stockOptions || 0), 0) / offers.length;
    const avgSigning = offers.reduce((s, o) => s + (o.salary.signingBonus || 0), 0) / offers.length;
    const avgMonths = offers.reduce((s, o) => s + o.monthsPaid, 0) / offers.length;
    const avgAnnualLeave = offers.reduce((s, o) => s + (o.benefits?.annualLeaveDays || 0), 0) / offers.length;
    return { avgBase, avgPerformance, avgYearEnd, avgStock, avgSigning, avgMonths, avgAnnualLeave };
  }, [offers]);

  const handleOpenModal = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      setForm({
        companyId: offer.companyId,
        position: offer.position,
        baseSalary: offer.salary.baseSalary || 0,
        performanceBonus: offer.salary.performanceBonus || 0,
        yearEndBonus: offer.salary.yearEndBonus || 0,
        stockOptions: offer.salary.stockOptions || 0,
        signingBonus: offer.salary.signingBonus || 0,
        monthsPaid: offer.monthsPaid,
        location: offer.location,
        deadline: offer.deadline,
        startDate: offer.startDate || '',
        socialInsuranceBase: offer.benefits?.socialInsuranceBase || 0,
        housingFundBase: offer.benefits?.housingFundBase || 0,
        housingFundRatio: offer.benefits?.housingFundRatio || 12,
        annualLeaveDays: offer.benefits?.annualLeaveDays || 0,
        sickLeaveDays: offer.benefits?.sickLeaveDays || 0,
        supplementaryMedical: offer.benefits?.supplementaryMedical || false,
        dentalInsurance: offer.benefits?.dentalInsurance || false,
        lifeInsurance: offer.benefits?.lifeInsurance || false,
        gymMembership: offer.benefits?.gymMembership || false,
        freeMeals: offer.benefits?.freeMeals || false,
        flexibleWorking: offer.benefits?.flexibleWorking || false,
        remoteWork: offer.benefits?.remoteWork || false,
        stockPurchasePlan: offer.benefits?.stockPurchasePlan || false,
        educationBudget: offer.benefits?.educationBudget || 0,
        notes: offer.notes || ''
      });
    } else {
      setEditingOffer(null);
      setForm(createEmptyForm(companies));
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const salary: SalaryBreakdown = {
      baseSalary: form.baseSalary,
      performanceBonus: form.performanceBonus,
      yearEndBonus: form.yearEndBonus,
      stockOptions: form.stockOptions,
      signingBonus: form.signingBonus
    };
    const benefits: Benefits = {
      socialInsuranceBase: form.socialInsuranceBase,
      housingFundBase: form.housingFundBase,
      housingFundRatio: form.housingFundRatio,
      annualLeaveDays: form.annualLeaveDays,
      sickLeaveDays: form.sickLeaveDays,
      supplementaryMedical: form.supplementaryMedical,
      dentalInsurance: form.dentalInsurance,
      lifeInsurance: form.lifeInsurance,
      gymMembership: form.gymMembership,
      freeMeals: form.freeMeals,
      flexibleWorking: form.flexibleWorking,
      remoteWork: form.remoteWork,
      stockPurchasePlan: form.stockPurchasePlan,
      educationBudget: form.educationBudget
    };

    if (editingOffer) {
      updateOffer(editingOffer.id, {
        companyId: form.companyId,
        position: form.position,
        salary,
        benefits,
        monthsPaid: form.monthsPaid,
        location: form.location,
        deadline: form.deadline,
        startDate: form.startDate || undefined,
        notes: form.notes
      });
    } else {
      addOffer({
        companyId: form.companyId,
        position: form.position,
        salary,
        benefits,
        monthsPaid: form.monthsPaid,
        location: form.location,
        deadline: form.deadline,
        startDate: form.startDate || undefined,
        accepted: false,
        notes: form.notes
      });
    }
    setIsModalOpen(false);
  };

  const toggleAccept = (offer: Offer) => {
    updateOffer(offer.id, { accepted: !offer.accepted });
  };

  const handleDelete = (id: ID) => {
    if (window.confirm('确定要删除这个Offer吗？')) {
      deleteOffer(id);
    }
  };

  const getStatusBadge = (accepted: boolean) => {
    if (accepted) {
      return <Badge color="success" dot>已接受</Badge>;
    }
    return <Badge color="warning" dot>待决定</Badge>;
  };

  const renderSalaryBar = (offer: Offer, index: number) => {
    const total = calculateTotalPackage(offer.salary, offer.monthsPaid);
    if (total === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-brand-300">薪资结构</span>
          <span className="font-mono text-brand-200">总包 {formatWan(total)}/年</span>
        </div>
        <div className="h-4 rounded-lg overflow-hidden flex bg-white/5">
          {SALARY_ITEMS.map((item) => {
            const rawValue = offer.salary[item.key] || 0;
            let value = rawValue;
            if (item.key === 'baseSalary') value = rawValue * offer.monthsPaid;
            if (item.key === 'performanceBonus') value = rawValue * 12;
            if (item.key === 'stockOptions') value = rawValue / 4;
            const percent = total > 0 ? (value / total) * 100 : 0;
            if (percent < 0.5) return null;
            return (
              <div
                key={item.key}
                className={cn('h-full transition-all duration-500', item.color)}
                style={{ width: `${percent}%` }}
                title={`${item.label}: ${formatWan(value)}`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {SALARY_ITEMS.map((item) => {
            const rawValue = offer.salary[item.key] || 0;
            let value = rawValue;
            if (item.key === 'baseSalary') value = rawValue * offer.monthsPaid;
            if (item.key === 'performanceBonus') value = rawValue * 12;
            if (item.key === 'stockOptions') value = rawValue / 4;
            if (value === 0) return null;
            const isAbove = avgValues ? (
              item.key === 'baseSalary' ? rawValue >= avgValues.avgBase :
              item.key === 'performanceBonus' ? rawValue >= avgValues.avgPerformance :
              item.key === 'yearEndBonus' ? rawValue >= avgValues.avgYearEnd :
              item.key === 'stockOptions' ? rawValue >= avgValues.avgStock :
              rawValue >= avgValues.avgSigning
            ) : true;
            return (
              <span
                key={item.key}
                className={cn(
                  'text-[11px] inline-flex items-center gap-1',
                  isAbove ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                <span className={cn('w-2 h-2 rounded-full', item.color)} />
                {item.label} {formatWan(value)}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCountdown = (deadline: string) => {
    const days = getDaysUntilDeadline(deadline);
    if (days < 0) {
      return <Badge color="danger">已过期</Badge>;
    }
    if (days === 0) {
      return <Badge color="danger" dot>今天截止</Badge>;
    }
    if (days <= 3) {
      return <Badge color="danger" dot>还有 {days} 天截止</Badge>;
    }
    if (days <= 7) {
      return <Badge color="warning" dot>还有 {days} 天截止</Badge>;
    }
    return <Badge color="info">还有 {days} 天截止</Badge>;
  };

  const today = new Date();
  const formattedDate = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const weekdayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdayMap[today.getDay()];

  return (
    <div className="min-h-full p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h1 className="page-title !mb-0">薪资谈判</h1>
              </div>
              <p className="page-subtitle ml-12">
                多Offer横向对比，数据驱动最优选择
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass-card px-4 py-2.5 flex items-center gap-2 animate-fade-in">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-brand-200">
                  {formattedDate} · {weekday}
                </span>
              </div>
              <div className="glass-card p-1.5 flex gap-1 animate-fade-in">
                <button
                  onClick={() => setViewMode('card')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
                    viewMode === 'card'
                      ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/20'
                      : 'text-brand-300 hover:text-white hover:bg-white/10'
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                  卡片
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
                    viewMode === 'table'
                      ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/20'
                      : 'text-brand-300 hover:text-white hover:bg-white/10'
                  )}
                >
                  <Table2 className="w-4 h-4" />
                  对比表
                </button>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="btn-primary flex items-center gap-2 animate-fade-in"
              >
                <Plus className="w-4 h-4" />
                新增Offer
              </button>
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="总Offer数"
            value={stats.totalOffers}
            icon={<Layers className="w-6 h-6" />}
            iconBg="bg-gradient-to-br from-indigo-500/20 to-blue-500/20"
            iconColor="text-indigo-400"
            suffix=" 个"
          />
          <StatCard
            title="已接受"
            value={stats.acceptedOffers}
            icon={<CheckCircle2 className="w-6 h-6" />}
            iconBg="bg-gradient-to-br from-emerald-500/20 to-teal-500/20"
            iconColor="text-emerald-400"
            suffix=" 个"
          />
          <StatCard
            title="最高总包"
            value={stats.maxPackage}
            icon={<TrendingUp className="w-6 h-6" />}
            iconBg="bg-gradient-to-br from-pink-500/20 to-rose-500/20"
            iconColor="text-pink-400"
            suffix=" 万/年"
            decimals={1}
          />
          <StatCard
            title="平均总包"
            value={stats.avgPackage}
            icon={<BarChart3 className="w-6 h-6" />}
            iconBg="bg-gradient-to-br from-amber-500/20 to-orange-500/20"
            iconColor="text-amber-400"
            suffix=" 万/年"
            decimals={1}
          />
        </div>

        {offers.length === 0 ? (
          <div className="glass-card p-16 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500/20 to-pink-500/20 flex items-center justify-center mb-4">
              <Briefcase className="w-10 h-10 text-brand-400" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-white mb-2">暂无Offer记录</h3>
            <p className="text-brand-300/70 mb-6">开始记录你的第一个薪资Offer吧</p>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新增第一个Offer
            </button>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {offers.map((offer, index) => {
              const company = getCompany(offer.companyId);
              const total = calculateTotalPackage(offer.salary, offer.monthsPaid);
              const isExpanded = expandedCard === offer.id;
              const isAboveAvg = avgValues ? total >= stats.avgPackage : true;
              const initial = company?.name?.[0] || '?';

              return (
                <div
                  key={offer.id}
                  className="stagger-item glass-card glass-card-hover p-5 flex flex-col gap-4 relative overflow-hidden"
                >
                  {offer.accepted && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center animate-pulse-glow">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center font-serif text-2xl font-bold text-white shrink-0 shadow-lg',
                        'bg-gradient-to-br',
                        getCompanyColor(index)
                      )}
                    >
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg font-semibold text-white truncate">
                        {company?.name || '未知公司'}
                      </h3>
                      <p className="text-sm text-brand-300 truncate">{offer.position}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                        <span className="text-xs text-brand-400 truncate">{offer.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {getStatusBadge(offer.accepted)}
                    {renderCountdown(offer.deadline)}
                  </div>

                  <div className="py-3 px-4 rounded-xl bg-gradient-to-r from-brand-500/10 via-pink-500/10 to-brand-500/10 border border-brand-400/20">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[11px] text-brand-300 mb-0.5">预计年总包</p>
                        <div className="flex items-baseline gap-1.5">
                          <AnimatedNumber
                            value={total}
                            decimals={1}
                            className={cn(
                              'font-mono text-2xl font-bold',
                              isAboveAvg ? 'text-emerald-400' : 'text-rose-400',
                              'glow-text'
                            )}
                          />
                          <span className="text-sm text-brand-300">万/年</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-brand-300 mb-0.5">月薪范围</p>
                        <p className="font-mono font-semibold text-white">
                          {offer.salary.baseSalary}-{(offer.salary.baseSalary + (offer.salary.performanceBonus || 0)).toFixed(1)}
                          <span className="text-xs text-brand-400"> · {offer.monthsPaid}薪</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {renderSalaryBar(offer, index)}

                  <button
                    onClick={() => setExpandedCard(isExpanded ? null : offer.id)}
                    className="flex items-center justify-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors py-1"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        收起详情
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        展开福利详情
                      </>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="animate-fade-in space-y-3 pt-1 border-t border-white/5">
                      <div>
                        <p className="text-xs font-medium text-brand-200 mb-2">福利对比</p>
                        <div className="grid grid-cols-4 gap-2">
                          {BENEFIT_BOOLEAN_ITEMS.slice(0, 8).map((b) => {
                            const enabled = offer.benefits?.[b.key] as boolean;
                            return (
                              <div
                                key={b.key as string}
                                className={cn(
                                  'flex flex-col items-center justify-center p-2 rounded-lg text-center',
                                  enabled
                                    ? 'bg-emerald-500/10 border border-emerald-400/20'
                                    : 'bg-white/[0.02] border border-white/5'
                                )}
                                title={b.label}
                              >
                                <b.icon
                                  className={cn(
                                    'w-4 h-4 mb-1',
                                    enabled ? 'text-emerald-400' : 'text-brand-500/60'
                                  )}
                                />
                                <span
                                  className={cn(
                                    'text-[10px]',
                                    enabled ? 'text-emerald-300' : 'text-brand-400/60'
                                  )}
                                >
                                  {b.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {offer.benefits?.annualLeaveDays !== undefined && (
                        <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/[0.02]">
                          <span className="text-brand-300 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            年假天数
                          </span>
                          <span
                            className={cn(
                              'font-mono font-semibold',
                              avgValues && offer.benefits!.annualLeaveDays! >= avgValues.avgAnnualLeave
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            )}
                          >
                            {offer.benefits.annualLeaveDays} 天
                          </span>
                        </div>
                      )}

                      {offer.notes && (
                        <div className="p-3 rounded-lg bg-white/[0.02] text-xs text-brand-300">
                          💡 {offer.notes}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => toggleAccept(offer)}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5',
                        offer.accepted
                          ? 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25'
                          : 'bg-white/5 border border-white/10 text-brand-200 hover:bg-white/10'
                      )}
                    >
                      {offer.accepted ? (
                        <><CheckCircle2 className="w-4 h-4" /> 已接受</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" /> 标记接受</>
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenModal(offer)}
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-300 hover:text-white hover:bg-brand-500/20 hover:border-brand-400/30 transition-all duration-200"
                      title="编辑"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id)}
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-400/30 transition-all duration-200"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-5 py-4 text-xs font-medium text-brand-300 sticky left-0 bg-glass-bg/95 backdrop-blur z-10">
                      公司/职位
                    </th>
                    <th className="text-center px-4 py-4 text-xs font-medium text-brand-300">状态</th>
                    <th className="text-center px-4 py-4 text-xs font-medium text-brand-300">地点</th>
                    <th className="text-right px-4 py-4 text-xs font-medium text-brand-300">月薪(万)</th>
                    <th className="text-center px-4 py-4 text-xs font-medium text-brand-300">薪制</th>
                    <th className="text-right px-4 py-4 text-xs font-medium text-brand-300">基本工资</th>
                    <th className="text-right px-4 py-4 text-xs font-medium text-brand-300">绩效/年</th>
                    <th className="text-right px-4 py-4 text-xs font-medium text-brand-300">年终奖</th>
                    <th className="text-right px-4 py-4 text-xs font-medium text-brand-300">股票/年</th>
                    <th className="text-right px-4 py-4 text-xs font-medium text-brand-300">签字费</th>
                    <th className="text-right px-4 py-4 text-xs font-medium text-brand-300">
                      <span className="text-white font-semibold">总包</span>
                    </th>
                    {BENEFIT_BOOLEAN_ITEMS.map((b) => (
                      <th key={b.key as string} className="text-center px-3 py-4 text-xs font-medium text-brand-300">
                        {b.label}
                      </th>
                    ))}
                    <th className="text-center px-4 py-4 text-xs font-medium text-brand-300">年假</th>
                    <th className="text-center px-4 py-4 text-xs font-medium text-brand-300">截止</th>
                    <th className="text-center px-4 py-4 text-xs font-medium text-brand-300 sticky right-0 bg-glass-bg/95 backdrop-blur z-10">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer, index) => {
                    const company = getCompany(offer.companyId);
                    const total = calculateTotalPackage(offer.salary, offer.monthsPaid);
                    const initial = company?.name?.[0] || '?';

                    const baseAnnual = (offer.salary.baseSalary || 0) * offer.monthsPaid;
                    const perfAnnual = (offer.salary.performanceBonus || 0) * 12;
                    const stockAnnual = (offer.salary.stockOptions || 0) / 4;

                    const baseClass = avgValues && (offer.salary.baseSalary || 0) >= avgValues.avgBase ? 'text-emerald-400' : 'text-red-400';
                    const perfClass = avgValues && (offer.salary.performanceBonus || 0) >= avgValues.avgPerformance ? 'text-emerald-400' : 'text-red-400';
                    const ybClass = avgValues && (offer.salary.yearEndBonus || 0) >= avgValues.avgYearEnd ? 'text-emerald-400' : 'text-red-400';
                    const stockClass = avgValues && (offer.salary.stockOptions || 0) >= avgValues.avgStock ? 'text-emerald-400' : 'text-red-400';
                    const signClass = avgValues && (offer.salary.signingBonus || 0) >= avgValues.avgSigning ? 'text-emerald-400' : 'text-red-400';
                    const totalClass = total >= stats.avgPackage ? 'text-emerald-400' : 'text-red-400';
                    const monthsClass = avgValues && offer.monthsPaid >= avgValues.avgMonths ? 'text-emerald-400' : 'text-red-400';
                    const leaveClass = avgValues && (offer.benefits?.annualLeaveDays || 0) >= avgValues.avgAnnualLeave ? 'text-emerald-400' : 'text-red-400';

                    return (
                      <tr
                        key={offer.id}
                        className={cn(
                          'border-b border-white/5 transition-all duration-200 hover:bg-white/[0.03]',
                          offer.accepted && 'bg-emerald-500/[0.03]'
                        )}
                      >
                        <td className="px-5 py-4 sticky left-0 bg-glass-bg/95 backdrop-blur z-10">
                          <div className="flex items-center gap-3 min-w-[180px]">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-xl flex items-center justify-center font-serif text-lg font-bold text-white shrink-0 shadow-md',
                                'bg-gradient-to-br',
                                getCompanyColor(index)
                              )}
                            >
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-white truncate">{company?.name}</p>
                              <p className="text-xs text-brand-400 truncate">{offer.position}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center px-4 py-4">
                          {getStatusBadge(offer.accepted)}
                        </td>
                        <td className="text-center px-4 py-4">
                          <span className="text-sm text-brand-300">{offer.location.split('·')[0]}</span>
                        </td>
                        <td className="text-right px-4 py-4">
                          <span className="font-mono text-sm text-white">
                            {offer.salary.baseSalary}-
                            {(offer.salary.baseSalary + (offer.salary.performanceBonus || 0)).toFixed(1)}
                          </span>
                        </td>
                        <td className="text-center px-4 py-4">
                          <span className={cn('font-mono text-sm font-semibold', monthsClass)}>
                            {offer.monthsPaid}薪
                          </span>
                        </td>
                        <td className={cn('text-right px-4 py-4 font-mono text-sm', baseClass)}>
                          {formatWan(baseAnnual)}
                        </td>
                        <td className={cn('text-right px-4 py-4 font-mono text-sm', perfClass)}>
                          {perfAnnual > 0 ? formatWan(perfAnnual) : '-'}
                        </td>
                        <td className={cn('text-right px-4 py-4 font-mono text-sm', ybClass)}>
                          {(offer.salary.yearEndBonus || 0) > 0 ? formatWan(offer.salary.yearEndBonus!) : '-'}
                        </td>
                        <td className={cn('text-right px-4 py-4 font-mono text-sm', stockClass)}>
                          {stockAnnual > 0 ? formatWan(stockAnnual) : '-'}
                        </td>
                        <td className={cn('text-right px-4 py-4 font-mono text-sm', signClass)}>
                          {(offer.salary.signingBonus || 0) > 0 ? formatWan(offer.salary.signingBonus!) : '-'}
                        </td>
                        <td className={cn('text-right px-4 py-4 font-mono font-bold text-base', totalClass, 'glow-text')}>
                          {formatWan(total)}
                        </td>
                        {BENEFIT_BOOLEAN_ITEMS.map((b) => {
                          const enabled = offer.benefits?.[b.key] as boolean;
                          return (
                            <td key={b.key as string} className="text-center px-3 py-4">
                              {enabled ? (
                                <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-red-400/60 mx-auto" />
                              )}
                            </td>
                          );
                        })}
                        <td className={cn('text-center px-4 py-4 font-mono text-sm font-semibold', leaveClass)}>
                          {offer.benefits?.annualLeaveDays || 0}天
                        </td>
                        <td className="text-center px-4 py-4">
                          {renderCountdown(offer.deadline)}
                        </td>
                        <td className="text-center px-4 py-4 sticky right-0 bg-glass-bg/95 backdrop-blur z-10">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => toggleAccept(offer)}
                              className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                                offer.accepted
                                  ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                                  : 'bg-white/5 text-brand-300 hover:bg-white/10'
                              )}
                              title={offer.accepted ? '取消接受' : '标记接受'}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenModal(offer)}
                              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-brand-300 hover:text-white hover:bg-brand-500/20 transition-all duration-200"
                              title="编辑"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(offer.id)}
                              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-brand-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingOffer ? '编辑Offer' : '新增Offer'}
          size="xl"
          footer={
            <>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button onClick={handleSubmit} className="btn-primary">
                {editingOffer ? '保存修改' : '确认添加'}
              </button>
            </>
          }
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-text flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> 选择公司
                </label>
                <select
                  className="select-field"
                  value={form.companyId}
                  onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-text flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> 职位名称
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="如：高级前端工程师"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                />
              </div>
              <div>
                <label className="label-text flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> 工作地点
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="如：北京·海淀区"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div>
                <label className="label-text flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> 月薪制 (个月)
                </label>
                <input
                  type="number"
                  className="input-field"
                  min={12}
                  max={24}
                  value={form.monthsPaid}
                  onChange={(e) => setForm({ ...form, monthsPaid: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="label-text flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> 入职日期
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="label-text flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> 回复截止日期
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h4 className="font-serif text-base font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-pink-400" />
                薪资明细 (单位: 万元)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="label-text">基本工资/月</label>
                  <input
                    type="number"
                    className="input-field"
                    step="0.1"
                    value={form.baseSalary}
                    onChange={(e) => setForm({ ...form, baseSalary: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label-text">绩效奖金/月</label>
                  <input
                    type="number"
                    className="input-field"
                    step="0.1"
                    value={form.performanceBonus}
                    onChange={(e) => setForm({ ...form, performanceBonus: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label-text">年终奖</label>
                  <input
                    type="number"
                    className="input-field"
                    step="0.1"
                    value={form.yearEndBonus}
                    onChange={(e) => setForm({ ...form, yearEndBonus: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label-text">股票期权(总额)</label>
                  <input
                    type="number"
                    className="input-field"
                    step="1"
                    value={form.stockOptions}
                    onChange={(e) => setForm({ ...form, stockOptions: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label-text">签字费</label>
                  <input
                    type="number"
                    className="input-field"
                    step="0.1"
                    value={form.signingBonus}
                    onChange={(e) => setForm({ ...form, signingBonus: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-brand-500/10 via-pink-500/10 to-brand-500/10 border border-brand-400/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-brand-200">预计年总包 (自动计算)</span>
                  <span className="font-mono text-xl font-bold text-emerald-400 glow-text">
                    {formatWan(
                      calculateTotalPackage(
                        {
                          baseSalary: form.baseSalary,
                          performanceBonus: form.performanceBonus,
                          yearEndBonus: form.yearEndBonus,
                          stockOptions: form.stockOptions,
                          signingBonus: form.signingBonus
                        },
                        form.monthsPaid
                      )
                    )}
                    <span className="text-sm text-brand-300 ml-1">/年</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h4 className="font-serif text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                五险一金 & 假期
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="label-text">社保基数(万/月)</label>
                  <input
                    type="number"
                    className="input-field"
                    step="0.1"
                    value={form.socialInsuranceBase}
                    onChange={(e) => setForm({ ...form, socialInsuranceBase: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label-text">公积金基数(万/月)</label>
                  <input
                    type="number"
                    className="input-field"
                    step="0.1"
                    value={form.housingFundBase}
                    onChange={(e) => setForm({ ...form, housingFundBase: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label-text">公积金比例(%)</label>
                  <input
                    type="number"
                    className="input-field"
                    min={5}
                    max={12}
                    value={form.housingFundRatio}
                    onChange={(e) => setForm({ ...form, housingFundRatio: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label-text">年假天数</label>
                  <input
                    type="number"
                    className="input-field"
                    min={0}
                    value={form.annualLeaveDays}
                    onChange={(e) => setForm({ ...form, annualLeaveDays: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label-text">病假天数</label>
                  <input
                    type="number"
                    className="input-field"
                    min={0}
                    value={form.sickLeaveDays}
                    onChange={(e) => setForm({ ...form, sickLeaveDays: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h4 className="font-serif text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                其他福利
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BENEFIT_BOOLEAN_ITEMS.map((b) => {
                  const Icon = b.icon;
                  const enabled = form[b.key] as boolean;
                  return (
                    <button
                      key={b.key as string}
                      type="button"
                      onClick={() => setForm({ ...form, [b.key]: !enabled } as OfferFormState)}
                      className={cn(
                        'flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-200 text-left',
                        enabled
                          ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
                          : 'bg-white/[0.02] border-white/10 text-brand-300 hover:bg-white/5 hover:border-white/20'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 shrink-0', enabled ? 'text-emerald-400' : '')} />
                      <span className="text-sm font-medium flex-1">{b.label}</span>
                      {enabled ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <div className="w-4 h-4 rounded border border-white/20" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4">
                <label className="label-text">教育预算 (元/年)</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.educationBudget}
                  onChange={(e) => setForm({ ...form, educationBudget: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="label-text">备注信息</label>
              <textarea
                className="textarea-field"
                rows={3}
                placeholder="可以记录薪资谈判要点、HR反馈等信息..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

function AnimatedNumber({
  value,
  decimals = 0,
  className
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const { formatted } = useCountUp(value, { decimals });
  return <span className={cn('animate-count-up', className)}>{formatted}</span>;
}
