import { useState, useMemo } from 'react';
import {
  ClipboardList,
  Calendar,
  Clock,
  User,
  MapPin,
  ChevronDown,
  Star,
  Plus,
  Filter,
  Building2,
  CheckCircle2,
  XCircle,
  Loader2,
  BarChart3,
  Phone,
  Video,
  Map,
  Briefcase,
  Code2,
  Users,
  MessageSquare,
  Award,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import {
  Interview,
  InterviewResult,
  InterviewType,
  InterviewForm,
  InterviewQuestion,
  QuestionCategory,
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_FORM_LABELS,
  INTERVIEW_RESULT_LABELS,
  QUESTION_CATEGORY_LABELS,
  ID,
} from '@/types';
import Badge from '@/components/common/Badge';
import StatCard from '@/components/common/StatCard';
import Modal from '@/components/common/Modal';
import { cn } from '@/lib/utils';

const resultBadgeColor: Record<InterviewResult, 'success' | 'danger' | 'warning'> = {
  [InterviewResult.PASS]: 'success',
  [InterviewResult.FAIL]: 'danger',
  [InterviewResult.PENDING]: 'warning',
};

const resultIcon: Record<InterviewResult, typeof CheckCircle2> = {
  [InterviewResult.PASS]: CheckCircle2,
  [InterviewResult.FAIL]: XCircle,
  [InterviewResult.PENDING]: Loader2,
};

const categoryColorClasses: Record<QuestionCategory, { bg: string; border: string; text: string; iconBg: string }> = {
  [QuestionCategory.TECHNICAL]: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-400/30',
    text: 'text-blue-300',
    iconBg: 'bg-blue-500/20',
  },
  [QuestionCategory.BEHAVIORAL]: {
    bg: 'bg-pink-500/10',
    border: 'border-pink-400/30',
    text: 'text-pink-300',
    iconBg: 'bg-pink-500/20',
  },
  [QuestionCategory.ALGORITHM]: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-400/30',
    text: 'text-amber-300',
    iconBg: 'bg-amber-500/20',
  },
  [QuestionCategory.PROJECT]: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-400/30',
    text: 'text-emerald-300',
    iconBg: 'bg-emerald-500/20',
  },
};

const categoryIcon: Record<QuestionCategory, typeof Code2> = {
  [QuestionCategory.TECHNICAL]: Code2,
  [QuestionCategory.BEHAVIORAL]: MessageSquare,
  [QuestionCategory.ALGORITHM]: Award,
  [QuestionCategory.PROJECT]: Briefcase,
};

const formIcon: Record<InterviewForm, typeof Phone> = {
  [InterviewForm.PHONE]: Phone,
  [InterviewForm.VIDEO]: Video,
  [InterviewForm.ONSITE]: Map,
};

const typeBadgeColor: Record<InterviewType, 'primary' | 'success' | 'warning' | 'info' | 'purple'> = {
  [InterviewType.PHONE]: 'info',
  [InterviewType.VIDEO]: 'primary',
  [InterviewType.ONSITE]: 'warning',
  [InterviewType.CODE]: 'purple',
  [InterviewType.HR]: 'success',
};

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'w-4 h-4',
            i < rating
              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]'
              : 'text-white/20'
          )}
        />
      ))}
    </div>
  );
}

function QuestionCard({ question }: { question: InterviewQuestion }) {
  const colors = categoryColorClasses[question.category];
  const Icon = categoryIcon[question.category];

  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01]',
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
            colors.iconBg
          )}
        >
          <Icon className={cn('w-5 h-5', colors.text)} />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge color="muted" size="sm">
                {QUESTION_CATEGORY_LABELS[question.category]}
              </Badge>
              {question.selfRating !== undefined && (
                <StarRating rating={question.selfRating} />
              )}
            </div>
            <p className="text-white font-medium leading-relaxed">
              {question.question}
            </p>
          </div>

          {question.myAnswer && (
            <div className="space-y-1.5">
              <p className="text-xs text-brand-300/70 font-medium">我的回答</p>
              <p className="text-brand-200/90 text-sm leading-relaxed bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                {question.myAnswer}
              </p>
            </div>
          )}

          {question.interviewerFeedback && (
            <div className="space-y-1.5">
              <p className="text-xs text-brand-300/70 font-medium">面试官反馈</p>
              <p className="text-emerald-200/90 text-sm leading-relaxed bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-400/20">
                {question.interviewerFeedback}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InterviewCard({
  interview,
  companyName,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  interview: Interview;
  companyName: string;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const ResultIcon = resultIcon[interview.result];
  const FormIcon = formIcon[interview.form];

  const dateObj = new Date(interview.date);
  const formattedDate = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dateObj.getDay()];

  const questionsByCategory = useMemo(() => {
    const grouped: Record<QuestionCategory, InterviewQuestion[]> = {
      [QuestionCategory.TECHNICAL]: [],
      [QuestionCategory.BEHAVIORAL]: [],
      [QuestionCategory.ALGORITHM]: [],
      [QuestionCategory.PROJECT]: [],
    };
    interview.questions.forEach((q) => grouped[q.category].push(q));
    return grouped;
  }, [interview.questions]);

  return (
    <div
      className={cn(
        'glass-card glass-card-hover overflow-hidden stagger-item',
        isExpanded && 'ring-2 ring-brand-400/30'
      )}
    >
      <div
        className="p-5 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shadow-lg shadow-brand-500/30 shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    {companyName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-brand-200 font-medium">{interview.title}</span>
                    <span className="text-brand-400/60">·</span>
                    <span className="text-brand-300/70">第{interview.round}轮</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5 text-brand-200/80">
                <Calendar className="w-4 h-4 text-brand-400/70" />
                <span>{formattedDate} · {weekday}</span>
              </div>
              {interview.time && (
                <div className="flex items-center gap-1.5 text-brand-200/80">
                  <Clock className="w-4 h-4 text-brand-400/70" />
                  <span>{interview.time} · {interview.duration}分钟</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-brand-200/80">
                <FormIcon className="w-4 h-4 text-brand-400/70" />
                <span>{INTERVIEW_FORM_LABELS[interview.form]}</span>
              </div>
              {interview.interviewer && (
                <div className="flex items-center gap-1.5 text-brand-200/80">
                  <User className="w-4 h-4 text-brand-400/70" />
                  <span>
                    {interview.interviewer}
                    {interview.interviewerTitle && ` · ${interview.interviewerTitle}`}
                  </span>
                </div>
              )}
              {interview.location && (
                <div className="flex items-center gap-1.5 text-brand-200/80">
                  <MapPin className="w-4 h-4 text-brand-400/70" />
                  <span className="truncate max-w-xs">{interview.location}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
              <Badge color={typeBadgeColor[interview.type]} size="sm" dot>
                {INTERVIEW_TYPE_LABELS[interview.type]}
              </Badge>
              <Badge color={resultBadgeColor[interview.result]} size="sm" dot>
                <ResultIcon className={cn('w-3.5 h-3.5', interview.result === InterviewResult.PENDING && 'animate-spin')} />
                {INTERVIEW_RESULT_LABELS[interview.result]}
              </Badge>
              {interview.selfRating !== undefined && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/20">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-medium text-amber-300">
                    自评 {interview.selfRating}/5
                  </span>
                </div>
              )}
              {interview.questions.length > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                  <ClipboardList className="w-3.5 h-3.5 text-brand-300" />
                  <span className="text-xs font-medium text-brand-200/80">
                    {interview.questions.length} 道题
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                'bg-white/5 text-brand-400/70 hover:bg-brand-500/20 hover:text-brand-200'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                'bg-white/5 text-red-400/70 hover:bg-red-500/20 hover:text-red-300'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                isExpanded
                  ? 'bg-brand-500/20 text-brand-300 rotate-180'
                  : 'bg-white/5 text-brand-400/70 hover:bg-white/10 hover:text-brand-200'
              )}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {interview.notes && !isExpanded && (
          <p className="mt-3 text-sm text-brand-300/60 line-clamp-1">
            💡 {interview.notes}
          </p>
        )}
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-4 animate-fade-in">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {interview.feedback && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
              <p className="text-xs text-emerald-300/80 font-medium mb-1.5">
                面试总结
              </p>
              <p className="text-emerald-200 text-sm leading-relaxed">
                {interview.feedback}
              </p>
            </div>
          )}

          {interview.questions.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(questionsByCategory).map(
                ([category, questions]) =>
                  questions.length > 0 && (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-1 h-4 rounded-full',
                            categoryColorClasses[category as QuestionCategory].text.replace('text-', 'bg-')
                          )}
                        />
                        <h4 className="text-sm font-semibold text-brand-200">
                          {QUESTION_CATEGORY_LABELS[category as QuestionCategory]}
                          <span className="ml-2 text-brand-400/60 font-normal">
                            ({questions.length})
                          </span>
                        </h4>
                      </div>
                      <div className="space-y-2.5">
                        {questions.map((q) => (
                          <QuestionCard key={q.id} question={q} />
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          ) : (
            <div className="py-6 text-center">
              <ClipboardList className="w-10 h-10 text-brand-400/40 mx-auto mb-2" />
              <p className="text-sm text-brand-400/60">暂无面试问题记录</p>
            </div>
          )}

          {interview.notes && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-brand-300/70 font-medium mb-1.5">
                📝 备注
              </p>
              <p className="text-brand-200/80 text-sm leading-relaxed">
                {interview.notes}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/15 border border-brand-400/30 text-brand-200 text-sm font-medium hover:bg-brand-500/25 transition-all duration-200"
            >
              <Pencil className="w-3.5 h-3.5" />
              编辑
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-400/30 text-red-300 text-sm font-medium hover:bg-red-500/25 transition-all duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              删除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryStats({ interviews }: { interviews: Interview[] }) {
  const stats = useMemo(() => {
    const counts: Record<QuestionCategory, number> = {
      [QuestionCategory.TECHNICAL]: 0,
      [QuestionCategory.BEHAVIORAL]: 0,
      [QuestionCategory.ALGORITHM]: 0,
      [QuestionCategory.PROJECT]: 0,
    };
    interviews.forEach((i) =>
      i.questions.forEach((q) => counts[q.category]++)
    );
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return { counts, total };
  }, [interviews]);

  const maxCount = Math.max(...Object.values(stats.counts), 1);

  const entries = (Object.entries(stats.counts) as [QuestionCategory, number][])
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="glass-card p-5 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-white">问题分类统计</h3>
          <p className="text-xs text-brand-400/60">共 {stats.total} 道题</p>
        </div>
      </div>

      <div className="space-y-3.5">
        {entries.map(([category, count]) => {
          const colors = categoryColorClasses[category];
          const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
          const barWidth = (count / maxCount) * 100;

          return (
            <div key={category} className="space-y-1.5 stagger-item">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-md flex items-center justify-center',
                      colors.iconBg
                    )}
                  >
                    {(() => {
                      const Icon = categoryIcon[category];
                      return <Icon className={cn('w-3.5 h-3.5', colors.text)} />;
                    })()}
                  </div>
                  <span className={cn('font-medium', colors.text)}>
                    {QUESTION_CATEGORY_LABELS[category]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white">{count}</span>
                  <span className="text-brand-400/60 text-xs">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700 ease-out',
                    category === QuestionCategory.TECHNICAL &&
                      'bg-gradient-to-r from-blue-500 to-blue-400',
                    category === QuestionCategory.BEHAVIORAL &&
                      'bg-gradient-to-r from-pink-500 to-pink-400',
                    category === QuestionCategory.ALGORITHM &&
                      'bg-gradient-to-r from-amber-500 to-amber-400',
                    category === QuestionCategory.PROJECT &&
                      'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  )}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
        {entries.slice(0, 2).map(([category, count]) => {
          const colors = categoryColorClasses[category];
          return (
            <div
              key={category}
              className={cn(
                'p-3 rounded-xl border',
                colors.bg,
                colors.border
              )}
            >
              <p className={cn('text-2xl font-mono font-bold', colors.text)}>
                {count}
              </p>
              <p className="text-xs text-brand-300/70 mt-0.5">
                {QUESTION_CATEGORY_LABELS[category]}最多
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface NewInterviewForm {
  companyId: ID;
  title: string;
  round: number;
  type: InterviewType;
  form: InterviewForm;
  date: string;
  time: string;
  duration: number;
  interviewer: string;
  interviewerTitle: string;
  location: string;
  result: InterviewResult;
  notes: string;
  selfRating: number;
}

const initialForm: NewInterviewForm = {
  companyId: '',
  title: '',
  round: 1,
  type: InterviewType.VIDEO,
  form: InterviewForm.VIDEO,
  date: new Date().toISOString().split('T')[0],
  time: '14:00',
  duration: 60,
  interviewer: '',
  interviewerTitle: '',
  location: '',
  result: InterviewResult.PENDING,
  notes: '',
  selfRating: 3,
};

export default function Interviews() {
  const interviews = useAppStore((s) => s.interviews);
  const companies = useAppStore((s) => s.companies);
  const getCompany = useAppStore((s) => s.getCompany);
  const addInterview = useAppStore((s) => s.addInterview);
  const updateInterview = useAppStore((s) => s.updateInterview);
  const deleteInterview = useAppStore((s) => s.deleteInterview);

  const [expandedId, setExpandedId] = useState<ID | null>(null);
  const [filterCompany, setFilterCompany] = useState<ID | 'all'>('all');
  const [filterResult, setFilterResult] = useState<InterviewResult | 'all'>('all');
  const [filterForm, setFilterForm] = useState<InterviewForm | 'all'>('all');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<NewInterviewForm>(initialForm);
  const [editingId, setEditingId] = useState<ID | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const stats = useMemo(() => {
    const total = interviews.length;
    const passed = interviews.filter((i) => i.result === InterviewResult.PASS).length;
    const failed = interviews.filter((i) => i.result === InterviewResult.FAIL).length;
    const evaluated = passed + failed;
    const passRate = evaluated > 0 ? (passed / evaluated) * 100 : 0;
    const pending = interviews.filter((i) => i.result === InterviewResult.PENDING).length;
    const ratedInterviews = interviews.filter((i) => i.selfRating !== undefined);
    const avgRating =
      ratedInterviews.length > 0
        ? ratedInterviews.reduce((sum, i) => sum + (i.selfRating || 0), 0) /
          ratedInterviews.length
        : 0;
    return { total, passRate, pending, avgRating };
  }, [interviews]);

  const filteredInterviews = useMemo(() => {
    return interviews
      .filter((i) => filterCompany === 'all' || i.companyId === filterCompany)
      .filter((i) => filterResult === 'all' || i.result === filterResult)
      .filter((i) => filterForm === 'all' || i.form === filterForm)
      .filter((i) => {
        if (!filterDateStart && !filterDateEnd) return true;
        const d = i.date;
        if (filterDateStart && d < filterDateStart) return false;
        if (filterDateEnd && d > filterDateEnd) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [interviews, filterCompany, filterResult, filterForm, filterDateStart, filterDateEnd]);

  const handleSubmit = () => {
    if (!form.companyId || !form.title) {
      return;
    }
    if (editingId) {
      updateInterview(editingId, {
        companyId: form.companyId,
        title: form.title,
        round: form.round,
        type: form.type,
        form: form.form,
        date: form.date,
        time: form.time || undefined,
        duration: form.duration,
        interviewer: form.interviewer || undefined,
        interviewerTitle: form.interviewerTitle || undefined,
        location: form.location || undefined,
        result: form.result,
        notes: form.notes || undefined,
        selfRating: form.selfRating,
      });
    } else {
      addInterview({
        companyId: form.companyId,
        title: form.title,
        round: form.round,
        type: form.type,
        form: form.form,
        date: form.date,
        time: form.time || undefined,
        duration: form.duration,
        interviewer: form.interviewer || undefined,
        interviewerTitle: form.interviewerTitle || undefined,
        location: form.location || undefined,
        result: form.result,
        questions: [],
        notes: form.notes || undefined,
        selfRating: form.selfRating,
      });
    }
    setForm(initialForm);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (interview: Interview) => {
    setEditingId(interview.id);
    setForm({
      companyId: interview.companyId,
      title: interview.title,
      round: interview.round,
      type: interview.type,
      form: interview.form,
      date: interview.date,
      time: interview.time || '',
      duration: interview.duration,
      interviewer: interview.interviewer || '',
      interviewerTitle: interview.interviewerTitle || '',
      location: interview.location || '',
      result: interview.result,
      notes: interview.notes || '',
      selfRating: interview.selfRating || 3,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: ID) => {
    if (window.confirm('确定要删除这条面试记录吗？删除后无法恢复。')) {
      deleteInterview(id);
      if (expandedId === id) {
        setExpandedId(null);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(initialForm);
    setEditingId(null);
  };

  const resetFilters = () => {
    setFilterCompany('all');
    setFilterResult('all');
    setFilterForm('all');
    setFilterDateStart('');
    setFilterDateEnd('');
  };

  const hasActiveFilters =
    filterCompany !== 'all' || filterResult !== 'all' || filterForm !== 'all' || filterDateStart !== '' || filterDateEnd !== '';

  return (
    <div className="min-h-full p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <h1 className="page-title !mb-0">面试记录</h1>
              </div>
              <p className="page-subtitle ml-12">
                复盘每一场面试，积累每一次成长
              </p>
            </div>
            <button
              onClick={() => {
                setEditingId(null);
                setForm(initialForm);
                setIsModalOpen(true);
              }}
              className="btn-primary flex items-center gap-2 self-start sm:self-auto animate-fade-in"
            >
              <Plus className="w-5 h-5" />
              <span>新增面试记录</span>
            </button>
          </div>
        </div>

        <div className="divider" />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="面试总数"
            value={stats.total}
            icon={<ClipboardList className="w-6 h-6" />}
            iconBg="bg-violet-500/15"
            iconColor="text-violet-400"
            suffix=" 场"
            trend={8.2}
            trendLabel="较上月"
          />
          <StatCard
            title="面试通过率"
            value={stats.passRate}
            icon={<CheckCircle2 className="w-6 h-6" />}
            iconBg="bg-emerald-500/15"
            iconColor="text-emerald-400"
            suffix="%"
            decimals={1}
            trend={5.6}
            trendLabel="较上月"
          />
          <StatCard
            title="待评估数"
            value={stats.pending}
            icon={<Loader2 className="w-6 h-6" />}
            iconBg="bg-amber-500/15"
            iconColor="text-amber-400"
            suffix=" 场"
            trend={-3.2}
            trendLabel="较上月"
          />
          <StatCard
            title="平均自评分数"
            value={stats.avgRating}
            icon={<Star className="w-6 h-6" />}
            iconBg="bg-pink-500/15"
            iconColor="text-pink-400"
            suffix=" 星"
            decimals={1}
            trend={0.3}
            trendLabel="较上月"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3 space-y-4">
            <div className="glass-card p-4 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200',
                      showFilters || hasActiveFilters
                        ? 'bg-brand-500/20 border-brand-400/40 text-brand-200'
                        : 'bg-white/5 border-white/10 text-brand-300 hover:bg-white/10'
                    )}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">筛选</span>
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-brand-400 hover:text-brand-200 hover:bg-white/10 transition-all duration-200"
                    >
                      <span className="text-sm">重置</span>
                    </button>
                  )}
                  <span className="text-sm text-brand-400/60">
                    显示 {filteredInterviews.length}/{interviews.length} 场
                  </span>
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
                  <div>
                    <label className="label-text">按公司</label>
                    <select
                      value={filterCompany}
                      onChange={(e) => setFilterCompany(e.target.value as ID | 'all')}
                      className="select-field"
                    >
                      <option value="all">全部公司</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-text">按结果</label>
                    <select
                      value={filterResult}
                      onChange={(e) => setFilterResult(e.target.value as InterviewResult | 'all')}
                      className="select-field"
                    >
                      <option value="all">全部结果</option>
                      {Object.values(InterviewResult).map((r) => (
                        <option key={r} value={r}>
                          {INTERVIEW_RESULT_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-text">按形式</label>
                    <select
                      value={filterForm}
                      onChange={(e) => setFilterForm(e.target.value as InterviewForm | 'all')}
                      className="select-field"
                    >
                      <option value="all">全部形式</option>
                      {Object.values(InterviewForm).map((f) => (
                        <option key={f} value={f}>
                          {INTERVIEW_FORM_LABELS[f]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-text">开始日期</label>
                    <input
                      type="date"
                      value={filterDateStart}
                      onChange={(e) => setFilterDateStart(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label-text">结束日期</label>
                    <input
                      type="date"
                      value={filterDateEnd}
                      onChange={(e) => setFilterDateEnd(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {filteredInterviews.length > 0 ? (
                filteredInterviews.map((interview, index) => {
                  const company = getCompany(interview.companyId);
                  return (
                    <div
                      key={interview.id}
                      className="relative"
                      style={{ animationDelay: `${(index % 8) * 0.05}s` }}
                    >
                      <InterviewCard
                        interview={interview}
                        companyName={company?.name || '未知公司'}
                        isExpanded={expandedId === interview.id}
                        onToggle={() =>
                          setExpandedId(
                            expandedId === interview.id ? null : interview.id
                          )
                        }
                        onEdit={() => handleEdit(interview)}
                        onDelete={() => handleDelete(interview.id)}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="glass-card p-12 text-center animate-fade-in">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <ClipboardList className="w-8 h-8 text-brand-400/40" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white mb-1.5">
                    暂无面试记录
                  </h3>
                  <p className="text-brand-400/60 text-sm mb-5">
                    {hasActiveFilters ? '尝试调整筛选条件' : '点击右上角按钮添加你的第一场面试'}
                  </p>
                  {!hasActiveFilters && (
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setForm(initialForm);
                        setIsModalOpen(true);
                      }}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      添加面试记录
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-2 space-y-4">
            <CategoryStats interviews={interviews} />

            <div className="glass-card p-5 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">面试公司</h3>
                  <p className="text-xs text-brand-400/60">
                    共 {new Set(interviews.map((i) => i.companyId)).size} 家
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {interviews
                  .filter(
                    (interview, index, self) =>
                      index === self.findIndex((i) => i.companyId === interview.companyId)
                  )
                  .slice(0, 6)
                  .map((interview) => {
                    const company = getCompany(interview.companyId);
                    const companyInterviews = interviews.filter(
                      (i) => i.companyId === interview.companyId
                    );
                    const companyPassed = companyInterviews.filter(
                      (i) => i.result === InterviewResult.PASS
                    ).length;

                    return (
                      <div
                        key={interview.companyId}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-brand-400/20 transition-all duration-200 cursor-pointer group stagger-item"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500/30 to-violet-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                            <Building2 className="w-[18px] h-[18px] text-brand-300" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate">
                              {company?.name || '未知公司'}
                            </p>
                            <p className="text-xs text-brand-400/60">
                              {companyInterviews.length} 场面试
                            </p>
                          </div>
                        </div>
                        <Badge
                          color={companyPassed > 0 ? 'success' : 'muted'}
                          size="sm"
                        >
                          {companyPassed}/{companyInterviews.length} 通过
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        <Modal
          open={isModalOpen}
          onClose={closeModal}
          title={editingId ? '编辑面试记录' : '新增面试记录'}
          size="lg"
          footer={
            <>
              <button
                onClick={closeModal}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className={cn(
                  'btn-primary',
                  (!form.companyId || !form.title) &&
                    'opacity-50 cursor-not-allowed'
                )}
                disabled={!form.companyId || !form.title}
              >
                保存
              </button>
            </>
          }
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label-text">
                  公司 <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.companyId}
                  onChange={(e) =>
                    setForm({ ...form, companyId: e.target.value })
                  }
                  className="select-field"
                >
                  <option value="">请选择公司</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.position}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-text">
                  面试标题 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="如：技术一面、HR面"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">面试轮次</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.round}
                  onChange={(e) =>
                    setForm({ ...form, round: Number(e.target.value) })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">面试类型</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as InterviewType })
                  }
                  className="select-field"
                >
                  {Object.values(InterviewType).map((t) => (
                    <option key={t} value={t}>
                      {INTERVIEW_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-text">面试形式</label>
                <select
                  value={form.form}
                  onChange={(e) =>
                    setForm({ ...form, form: e.target.value as InterviewForm })
                  }
                  className="select-field"
                >
                  {Object.values(InterviewForm).map((f) => (
                    <option key={f} value={f}>
                      {INTERVIEW_FORM_LABELS[f]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-text">日期</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">时间</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">时长（分钟）</label>
                <input
                  type="number"
                  min={15}
                  max={240}
                  step={15}
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: Number(e.target.value) })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">当前状态</label>
                <select
                  value={form.result}
                  onChange={(e) =>
                    setForm({ ...form, result: e.target.value as InterviewResult })
                  }
                  className="select-field"
                >
                  {Object.values(InterviewResult).map((r) => (
                    <option key={r} value={r}>
                      {INTERVIEW_RESULT_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-text">面试官</label>
                <input
                  type="text"
                  value={form.interviewer}
                  onChange={(e) =>
                    setForm({ ...form, interviewer: e.target.value })
                  }
                  placeholder="面试官姓名"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">面试官职位</label>
                <input
                  type="text"
                  value={form.interviewerTitle}
                  onChange={(e) =>
                    setForm({ ...form, interviewerTitle: e.target.value })
                  }
                  placeholder="如：高级前端工程师"
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label-text">地点</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder="公司地址或线上会议室链接"
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label-text">自评表现</label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, selfRating: n })}
                      className="transition-transform duration-200 hover:scale-125"
                    >
                      <Star
                        className={cn(
                          'w-8 h-8 transition-all duration-200',
                          n <= form.selfRating
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                            : 'text-white/20 hover:text-white/40'
                        )}
                      />
                    </button>
                  ))}
                  <span className="text-sm text-brand-300/70 ml-2">
                    {form.selfRating}/5
                  </span>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="label-text">备注</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="面试准备、注意事项、待跟进问题等..."
                  rows={3}
                  className="textarea-field"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
