import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  Clock,
  Brain,
  CheckCircle2,
  Circle,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  FileText,
  Building2,
  Hash,
  Gauge,
  BarChart3,
  Target
} from 'lucide-react';
import {
  QuestionBank,
  QuestionCategory,
  QUESTION_CATEGORY_LABELS,
  DifficultyLevel,
  DIFFICULTY_LABELS,
  QuestionStatus,
  QUESTION_STATUS_LABELS,
  JobDirection,
  JOB_DIRECTION_LABELS
} from '@/types';
import { useAppStore } from '@/store/appStore';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import StatCard from '@/components/common/StatCard';
import EmptyState from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';

const difficultyColorMap: Record<DifficultyLevel, 'success' | 'warning' | 'danger'> = {
  [DifficultyLevel.EASY]: 'success',
  [DifficultyLevel.MEDIUM]: 'warning',
  [DifficultyLevel.HARD]: 'danger'
};

const statusColorMap: Record<QuestionStatus, 'muted' | 'warning' | 'success'> = {
  [QuestionStatus.UNREAD]: 'muted',
  [QuestionStatus.READING]: 'warning',
  [QuestionStatus.MASTERED]: 'success'
};

const statusTransitionMap: Record<QuestionStatus, QuestionStatus> = {
  [QuestionStatus.UNREAD]: QuestionStatus.READING,
  [QuestionStatus.READING]: QuestionStatus.MASTERED,
  [QuestionStatus.MASTERED]: QuestionStatus.UNREAD
};

const categoryIconMap: Record<QuestionCategory, string> = {
  [QuestionCategory.TECHNICAL]: '#6366f1',
  [QuestionCategory.BEHAVIORAL]: '#ec4899',
  [QuestionCategory.ALGORITHM]: '#10b981',
  [QuestionCategory.PROJECT]: '#f59e0b'
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return '未练习';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function Questions() {
  const questionBank = useAppStore((state) => state.questionBank);
  const updateQuestionStatus = useAppStore((state) => state.updateQuestionStatus);
  const incrementQuestionPractice = useAppStore((state) => state.incrementQuestionPractice);
  const addQuestion = useAppStore((state) => state.addQuestion);
  const deleteQuestion = useAppStore((state) => state.deleteQuestion);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState<JobDirection | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<QuestionCategory | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<QuestionStatus | 'all'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const [isMockMode, setIsMockMode] = useState(false);
  const [mockQuestions, setMockQuestions] = useState<QuestionBank[]>([]);
  const [mockIndex, setMockIndex] = useState(0);
  const [mockTimer, setMockTimer] = useState(0);
  const [mockAnswerRevealed, setMockAnswerRevealed] = useState(false);
  const [mockQuestionCount, setMockQuestionCount] = useState(5);
  const [mockConfigOpen, setMockConfigOpen] = useState(false);

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    answer: '',
    direction: JobDirection.FRONTEND,
    category: QuestionCategory.TECHNICAL,
    difficulty: DifficultyLevel.MEDIUM,
    keywords: '',
    tags: '',
    source: ''
  });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isMockMode && mockQuestions.length > 0) {
      interval = setInterval(() => {
        setMockTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMockMode, mockQuestions.length]);

  const stats = useMemo(() => {
    const total = questionBank.length;
    const mastered = questionBank.filter((q) => q.status === QuestionStatus.MASTERED).length;
    const reading = questionBank.filter((q) => q.status === QuestionStatus.READING).length;
    const unread = questionBank.filter((q) => q.status === QuestionStatus.UNREAD).length;
    return { total, mastered, reading, unread };
  }, [questionBank]);

  const categoryStats = useMemo(() => {
    return Object.values(QuestionCategory).map((cat) => {
      const items = questionBank.filter((q) => q.category === cat);
      const mastered = items.filter((q) => q.status === QuestionStatus.MASTERED).length;
      return {
        category: cat,
        label: QUESTION_CATEGORY_LABELS[cat],
        count: items.length,
        mastered,
        color: categoryIconMap[cat]
      };
    });
  }, [questionBank]);

  const directionStats = useMemo(() => {
    return Object.values(JobDirection).map((dir) => {
      const items = questionBank.filter((q) => q.direction === dir);
      return {
        direction: dir,
        label: JOB_DIRECTION_LABELS[dir],
        count: items.length,
        mastered: items.filter((q) => q.status === QuestionStatus.MASTERED).length
      };
    });
  }, [questionBank]);

  const filteredQuestions = useMemo(() => {
    return questionBank.filter((q) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const inQuestion = q.question.toLowerCase().includes(query);
        const inAnswer = q.answer.toLowerCase().includes(query);
        const inTags = q.tags.some((t) => t.toLowerCase().includes(query));
        const inKeywords = (q.keywords || []).some((k) => k.toLowerCase().includes(query));
        if (!inQuestion && !inAnswer && !inTags && !inKeywords) return false;
      }
      if (filterDirection !== 'all' && q.direction !== filterDirection) return false;
      if (filterCategory !== 'all' && q.category !== filterCategory) return false;
      if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
      if (filterStatus !== 'all' && q.status !== filterStatus) return false;
      return true;
    });
  }, [questionBank, searchQuery, filterDirection, filterCategory, filterDifficulty, filterStatus]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleStatusCycle = (id: string, currentStatus: QuestionStatus) => {
    updateQuestionStatus(id, statusTransitionMap[currentStatus]);
  };

  const handlePractice = (id: string) => {
    incrementQuestionPractice(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这道题目吗？')) {
      deleteQuestion(id);
    }
  };

  const startMockInterview = () => {
    const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(mockQuestionCount, shuffled.length));
    setMockQuestions(selected);
    setMockIndex(0);
    setMockTimer(0);
    setMockAnswerRevealed(false);
    setIsMockMode(true);
    setMockConfigOpen(false);
    selected.forEach((q) => incrementQuestionPractice(q.id));
  };

  const nextMockQuestion = () => {
    if (mockIndex < mockQuestions.length - 1) {
      setMockIndex(mockIndex + 1);
      setMockAnswerRevealed(false);
    } else {
      setIsMockMode(false);
    }
  };

  const prevMockQuestion = () => {
    if (mockIndex > 0) {
      setMockIndex(mockIndex - 1);
      setMockAnswerRevealed(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim() || !newQuestion.answer.trim()) {
      alert('请填写题目内容和参考答案');
      return;
    }
    addQuestion({
      question: newQuestion.question.trim(),
      answer: newQuestion.answer.trim(),
      direction: newQuestion.direction,
      category: newQuestion.category,
      difficulty: newQuestion.difficulty,
      status: QuestionStatus.UNREAD,
      keywords: newQuestion.keywords.split(',').map((k) => k.trim()).filter(Boolean),
      tags: newQuestion.tags.split(',').map((t) => t.trim()).filter(Boolean),
      frequency: 1,
      timesPracticed: 0,
      source: newQuestion.source.trim() || undefined
    });
    setNewQuestion({
      question: '',
      answer: '',
      direction: JobDirection.FRONTEND,
      category: QuestionCategory.TECHNICAL,
      difficulty: DifficultyLevel.MEDIUM,
      keywords: '',
      tags: '',
      source: ''
    });
    setShowAddModal(false);
  };

  if (isMockMode && mockQuestions.length > 0) {
    const currentQ = mockQuestions[mockIndex];
    const progress = ((mockIndex + 1) / mockQuestions.length) * 100;

    return (
      <div className="min-h-full p-6 lg:p-8 flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="page-title !mb-0 text-2xl">模拟面试</h1>
                <p className="text-brand-300/70 text-sm">随机抽题 · 限时答题 · 检验成果</p>
              </div>
            </div>
            <button
              onClick={() => setIsMockMode(false)}
              className="btn-secondary"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              退出模拟
            </button>
          </div>

          <div className="glass-card p-4 mb-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <Badge color="purple" size="lg">
                  <Target className="w-3.5 h-3.5 mr-1" />
                  第 {mockIndex + 1} / {mockQuestions.length} 题
                </Badge>
                <Badge color="primary" size="lg">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {formatTime(mockTimer)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={difficultyColorMap[currentQ.difficulty]} size="lg">
                  {DIFFICULTY_LABELS[currentQ.difficulty]}
                </Badge>
                <Badge color="info" size="lg">
                  {QUESTION_CATEGORY_LABELS[currentQ.category]}
                </Badge>
              </div>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-pink-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex-1 glass-card p-8 mb-6 animate-scale-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0">
                  <span className="font-serif text-2xl font-bold text-brand-300">Q</span>
                </div>
                <div className="flex-1">
                  <h2 className="font-serif text-2xl font-semibold text-white leading-relaxed">
                    {currentQ.question}
                  </h2>
                </div>
              </div>

              {mockAnswerRevealed ? (
                <div className="animate-fade-in border-t border-white/10 pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/20 flex items-center justify-center shrink-0">
                      <span className="font-serif text-2xl font-bold text-emerald-300">A</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-brand-100/90 leading-relaxed whitespace-pre-wrap">
                        {currentQ.answer}
                      </div>
                      {currentQ.keywords && currentQ.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/5">
                          <Hash className="w-4 h-4 text-brand-400 mt-1" />
                          {currentQ.keywords.map((kw, i) => (
                            <Badge key={i} color="muted" size="md">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <button
                    onClick={() => setMockAnswerRevealed(true)}
                    className="btn-secondary group"
                  >
                    <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    显示参考答案
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={prevMockQuestion}
              disabled={mockIndex === 0}
              className={cn(
                'btn-secondary',
                mockIndex === 0 && 'opacity-50 cursor-not-allowed'
              )}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              上一题
            </button>
            <button
              onClick={() => setMockAnswerRevealed(!mockAnswerRevealed)}
              className="btn-secondary"
            >
              {mockAnswerRevealed ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  隐藏答案
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  查看答案
                </>
              )}
            </button>
            <button
              onClick={nextMockQuestion}
              className="btn-primary"
            >
              {mockIndex === mockQuestions.length - 1 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  完成模拟
                </>
              ) : (
                <>
                  下一题
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="animate-fade-in-up">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h1 className="page-title !mb-0">面试题库</h1>
              </div>
              <p className="page-subtitle ml-12">
                系统化学习，刻意练习，轻松应对技术面试
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMockConfigOpen(true)}
                className="btn-secondary"
              >
                <Play className="w-4 h-4 mr-2" />
                开始模拟
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                新增题目
              </button>
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="总题数"
            value={stats.total}
            icon={<BookOpen className="w-5 h-5" />}
            iconBg="bg-gradient-to-br from-brand-500/20 to-violet-500/20"
            iconColor="text-brand-300"
            trend={questionBank.length > 0 ? 12.5 : undefined}
            trendLabel="较上周"
            className="animate-fade-in-up stagger-item"
          />
          <StatCard
            title="已掌握"
            value={stats.mastered}
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconBg="bg-gradient-to-br from-emerald-500/20 to-teal-500/20"
            iconColor="text-emerald-300"
            trend={stats.total > 0 ? ((stats.mastered / stats.total) * 100 - 30) : undefined}
            trendLabel="掌握率"
            className="animate-fade-in-up stagger-item"
          />
          <StatCard
            title="学习中"
            value={stats.reading}
            icon={<Loader2 className="w-5 h-5" />}
            iconBg="bg-gradient-to-br from-amber-500/20 to-orange-500/20"
            iconColor="text-amber-300"
            className="animate-fade-in-up stagger-item"
          />
          <StatCard
            title="未学习"
            value={stats.unread}
            icon={<Circle className="w-5 h-5" />}
            iconBg="bg-gradient-to-br from-slate-500/20 to-gray-500/20"
            iconColor="text-slate-300"
            className="animate-fade-in-up stagger-item"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            <div className="glass-card p-4 animate-fade-in-up">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400/60" />
                  <input
                    type="text"
                    placeholder="搜索题目、答案、标签..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-11"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'btn-secondary flex items-center',
                    showFilters && '!bg-brand-500/20 !border-brand-400/50'
                  )}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  筛选
                  {showFilters ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5 animate-fade-in">
                  <div>
                    <label className="label-text">岗位方向</label>
                    <select
                      value={filterDirection}
                      onChange={(e) => setFilterDirection(e.target.value as JobDirection | 'all')}
                      className="select-field"
                    >
                      <option value="all">全部方向</option>
                      {Object.values(JobDirection).map((dir) => (
                        <option key={dir} value={dir}>
                          {JOB_DIRECTION_LABELS[dir]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-text">问题分类</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value as QuestionCategory | 'all')}
                      className="select-field"
                    >
                      <option value="all">全部分类</option>
                      {Object.values(QuestionCategory).map((cat) => (
                        <option key={cat} value={cat}>
                          {QUESTION_CATEGORY_LABELS[cat]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-text">难度级别</label>
                    <select
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value as DifficultyLevel | 'all')}
                      className="select-field"
                    >
                      <option value="all">全部难度</option>
                      {Object.values(DifficultyLevel).map((diff) => (
                        <option key={diff} value={diff}>
                          {DIFFICULTY_LABELS[diff]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-text">学习状态</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as QuestionStatus | 'all')}
                      className="select-field"
                    >
                      <option value="all">全部状态</option>
                      {Object.values(QuestionStatus).map((st) => (
                        <option key={st} value={st}>
                          {QUESTION_STATUS_LABELS[st]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {filteredQuestions.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="暂无题目"
                description="没有找到匹配的题目，试试调整筛选条件或添加新题目"
              >
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新增题目
                </button>
              </EmptyState>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-brand-300/70 px-1 animate-fade-in">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    共 {filteredQuestions.length} 道题目
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    点击卡片展开详情
                  </span>
                </div>

                <div className="space-y-4">
                  {filteredQuestions.map((q, idx) => {
                    const isExpanded = expandedIds.has(q.id);
                    return (
                      <div
                        key={q.id}
                        className={cn(
                          'glass-card glass-card-hover overflow-hidden cursor-pointer stagger-item',
                          isExpanded && '!border-brand-400/40 shadow-xl shadow-brand-500/10'
                        )}
                        style={{ animationDelay: `${idx * 0.03}s` }}
                        onClick={() => toggleExpand(q.id)}
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge
                                  color={difficultyColorMap[q.difficulty]}
                                  dot
                                >
                                  {DIFFICULTY_LABELS[q.difficulty]}
                                </Badge>
                                <Badge color="primary">
                                  {QUESTION_CATEGORY_LABELS[q.category]}
                                </Badge>
                                <Badge color="purple">
                                  {JOB_DIRECTION_LABELS[q.direction]}
                                </Badge>
                                <Badge
                                  color={statusColorMap[q.status]}
                                  dot
                                >
                                  {QUESTION_STATUS_LABELS[q.status]}
                                </Badge>
                              </div>

                              <h3 className="font-serif text-lg font-semibold text-white leading-relaxed mb-3 group-hover:text-brand-200 transition-colors">
                                {q.question}
                              </h3>

                              {q.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {q.tags.slice(0, 4).map((tag, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 rounded-lg bg-white/5 text-brand-300/80 text-xs border border-white/5"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                  {q.tags.length > 4 && (
                                    <span className="px-2 py-0.5 rounded-lg bg-white/5 text-brand-400/70 text-xs">
                                      +{q.tags.length - 4}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-brand-400 shrink-0" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-brand-400 shrink-0" />
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-4 text-sm text-brand-300/70">
                              <span className="flex items-center gap-1.5">
                                <Loader2 className="w-3.5 h-3.5" />
                                练习 {q.timesPracticed} 次
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDate(q.lastPracticedAt)}
                              </span>
                              {q.frequency > 1 && (
                                <span className="flex items-center gap-1.5">
                                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                                  高频题
                                </span>
                              )}
                            </div>

                            <div
                              className="flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handlePractice(q.id)}
                                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-brand-300 text-sm hover:bg-brand-500/20 hover:border-brand-400/40 hover:text-white transition-all duration-200 flex items-center gap-1.5"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                练习
                              </button>
                              <button
                                onClick={() => handleStatusCycle(q.id, q.status)}
                                className={cn(
                                  'px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
                                  q.status === QuestionStatus.UNREAD && 'bg-slate-500/20 border border-slate-400/30 text-slate-300 hover:bg-slate-500/30',
                                  q.status === QuestionStatus.READING && 'bg-amber-500/20 border border-amber-400/30 text-amber-300 hover:bg-amber-500/30',
                                  q.status === QuestionStatus.MASTERED && 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/30'
                                )}
                              >
                                {q.status === QuestionStatus.UNREAD && <Circle className="w-3.5 h-3.5" />}
                                {q.status === QuestionStatus.READING && <Loader2 className="w-3.5 h-3.5" />}
                                {q.status === QuestionStatus.MASTERED && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {QUESTION_STATUS_LABELS[statusTransitionMap[q.status]]}
                              </button>
                              <button
                                onClick={() => handleDelete(q.id)}
                                className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300/80 text-sm hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40 transition-all duration-200 flex items-center gap-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-5 pb-5 animate-fade-in">
                            <div className="pt-4 border-t border-white/5 space-y-4">
                              <div className="glass-card p-4 !bg-white/[0.02]">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                  </div>
                                  <h4 className="font-serif text-sm font-semibold text-white">参考答案</h4>
                                </div>
                                <p className="text-brand-100/90 leading-relaxed text-sm whitespace-pre-wrap">
                                  {q.answer}
                                </p>
                              </div>

                              {q.keywords && q.keywords.length > 0 && (
                                <div className="flex items-start gap-3">
                                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <Hash className="w-3.5 h-3.5 text-purple-400" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-serif text-sm font-semibold text-white mb-2">关键词</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {q.keywords.map((kw, i) => (
                                        <Badge key={i} color="purple" size="md">
                                          {kw}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {q.source && (
                                <div className="flex items-start gap-3">
                                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                                  </div>
                                  <div>
                                    <h4 className="font-serif text-sm font-semibold text-white mb-1">来源公司</h4>
                                    <span className="text-brand-300/80 text-sm">{q.source}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="xl:col-span-1 space-y-4">
            <div className="glass-card p-5 animate-fade-in-up stagger-item">
              <h3 className="section-title !mb-4">
                <BarChart3 className="w-4 h-4 text-brand-400" />
                分类统计
              </h3>
              <div className="space-y-4">
                {categoryStats.map((stat, idx) => (
                  <div key={stat.category} className="space-y-2 stagger-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-brand-200 font-medium flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: stat.color, boxShadow: `0 0 6px ${stat.color}80` }}
                        />
                        {stat.label}
                      </span>
                      <span className="text-brand-400/80 font-mono">
                        {stat.mastered}/{stat.count}
                      </span>
                    </div>
                    <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${stat.count > 0 ? (stat.mastered / stat.count) * 100 : 0}%`,
                          background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)`,
                          boxShadow: `0 0 10px ${stat.color}40`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5 animate-fade-in-up stagger-item">
              <h3 className="section-title !mb-4">
                <Target className="w-4 h-4 text-brand-400" />
                岗位方向
              </h3>
              <div className="space-y-3">
                {directionStats.map((stat, idx) => (
                  <div
                    key={stat.direction}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-brand-400/20 transition-all duration-200 stagger-item cursor-pointer group"
                    onClick={() => setFilterDirection(stat.direction === filterDirection ? 'all' : stat.direction)}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110',
                          stat.direction === JobDirection.FRONTEND && 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20',
                          stat.direction === JobDirection.BACKEND && 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
                          stat.direction === JobDirection.ALGORITHM && 'bg-gradient-to-br from-violet-500/20 to-purple-500/20',
                          stat.direction === JobDirection.PRODUCT && 'bg-gradient-to-br from-orange-500/20 to-pink-500/20',
                          filterDirection === stat.direction && 'ring-2 ring-brand-400/50'
                        )}
                      >
                        <span className="font-bold text-xs">
                          {stat.label.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-brand-100 text-sm font-medium">{stat.label}</p>
                        <p className="text-brand-400/60 text-xs">{stat.count} 题</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-mono text-sm font-bold">{stat.mastered}</p>
                      <p className="text-brand-400/60 text-xs">已掌握</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5 animate-fade-in-up stagger-item overflow-hidden relative">
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-white">快速模拟</h3>
                </div>
                <p className="text-brand-300/70 text-sm mb-4 leading-relaxed">
                  随机抽取题目进行模拟面试，限时答题检验学习成果
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="label-text">抽取题数</label>
                    <select
                      value={mockQuestionCount}
                      onChange={(e) => setMockQuestionCount(Number(e.target.value))}
                      className="select-field"
                    >
                      <option value={3}>3 题</option>
                      <option value={5}>5 题</option>
                      <option value={8}>8 题</option>
                      <option value={10}>10 题</option>
                      <option value={Math.max(15, questionBank.length)}>
                        全部 ({questionBank.length})
                      </option>
                    </select>
                  </div>
                  <button
                    onClick={startMockInterview}
                    disabled={questionBank.length === 0}
                    className={cn(
                      'w-full btn-primary justify-center',
                      questionBank.length === 0 && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    开始模拟面试
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="新增题目"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setShowAddModal(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleAddQuestion} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              确认添加
            </button>
          </>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <label className="label-text">题目内容 *</label>
            <textarea
              rows={3}
              placeholder="请输入题目内容..."
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              className="textarea-field"
            />
          </div>

          <div>
            <label className="label-text">参考答案 *</label>
            <textarea
              rows={5}
              placeholder="请输入参考答案..."
              value={newQuestion.answer}
              onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
              className="textarea-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">岗位方向</label>
              <select
                value={newQuestion.direction}
                onChange={(e) => setNewQuestion({ ...newQuestion, direction: e.target.value as JobDirection })}
                className="select-field"
              >
                {Object.values(JobDirection).map((dir) => (
                  <option key={dir} value={dir}>
                    {JOB_DIRECTION_LABELS[dir]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">问题分类</label>
              <select
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value as QuestionCategory })}
                className="select-field"
              >
                {Object.values(QuestionCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {QUESTION_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label-text">难度级别</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.values(DifficultyLevel).map((diff) => {
                const activeClasses: Record<DifficultyLevel, string> = {
                  [DifficultyLevel.EASY]: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-lg shadow-emerald-500/10',
                  [DifficultyLevel.MEDIUM]: 'bg-amber-500/20 border-amber-400/40 text-amber-300 shadow-lg shadow-amber-500/10',
                  [DifficultyLevel.HARD]: 'bg-red-500/20 border-red-400/40 text-red-300 shadow-lg shadow-red-500/10'
                };
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setNewQuestion({ ...newQuestion, difficulty: diff })}
                    className={cn(
                      'px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border',
                      newQuestion.difficulty === diff
                        ? activeClasses[diff]
                        : 'bg-white/5 border-white/10 text-brand-300 hover:bg-white/10'
                    )}
                  >
                    {DIFFICULTY_LABELS[diff]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label-text">关键词（逗号分隔）</label>
            <input
              type="text"
              placeholder="例如：React, Hooks, Fiber"
              value={newQuestion.keywords}
              onChange={(e) => setNewQuestion({ ...newQuestion, keywords: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-text">标签（逗号分隔）</label>
            <input
              type="text"
              placeholder="例如：前端, 框架, 面试高频"
              value={newQuestion.tags}
              onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-text">来源公司</label>
            <input
              type="text"
              placeholder="例如：字节跳动、腾讯、阿里"
              value={newQuestion.source}
              onChange={(e) => setNewQuestion({ ...newQuestion, source: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={mockConfigOpen}
        onClose={() => setMockConfigOpen(false)}
        title="模拟面试设置"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setMockConfigOpen(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              onClick={startMockInterview}
              disabled={questionBank.length === 0}
              className={cn(
                'btn-primary',
                questionBank.length === 0 && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Play className="w-4 h-4 mr-2" />
              开始面试
            </button>
          </>
        }
      >
        <div className="space-y-5 py-2">
          <div className="glass-card p-4 !bg-gradient-to-br !from-brand-500/10 !to-purple-500/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/30">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-serif text-base font-semibold text-white mb-1">模拟面试模式</h4>
                <p className="text-brand-300/70 text-sm leading-relaxed">
                  从题库中随机抽取 N 道题，逐题作答并计时。完成后可查看每题参考答案。
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="label-text">抽取题目数量</label>
            <select
              value={mockQuestionCount}
              onChange={(e) => setMockQuestionCount(Number(e.target.value))}
              className="select-field"
            >
              <option value={3}>3 题 · 快速热身</option>
              <option value={5}>5 题 · 标准练习</option>
              <option value={8}>8 题 · 深度测试</option>
              <option value={10}>10 题 · 完整模拟</option>
              {questionBank.length > 10 && (
                <option value={questionBank.length}>
                  全部 {questionBank.length} 题
                </option>
              )}
            </select>
          </div>

          <div className="flex items-center justify-between text-sm pt-2 border-t border-white/5">
            <span className="text-brand-300/70">题库可用题数</span>
            <span className="text-white font-mono font-semibold">{questionBank.length} 题</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
