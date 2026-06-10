import { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileJson,
  HardDrive,
  Archive,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import Modal from '@/components/common/Modal';
import { cn } from '@/lib/utils';

interface OperationResult {
  success: boolean;
  message: string;
}

export default function DataManagement() {
  const { exportAllData, importAllData, clearAllData, resetToMockData } = useAppStore();
  const companies = useAppStore((s) => s.companies);
  const resumes = useAppStore((s) => s.resumes);
  const interviews = useAppStore((s) => s.interviews);
  const questionBank = useAppStore((s) => s.questionBank);
  const offers = useAppStore((s) => s.offers);
  const timelineNodes = useAppStore((s) => s.timelineNodes);

  const [result, setResult] = useState<OperationResult | null>(null);
  const [confirmModal, setConfirmModal] = useState<'clear' | 'reset' | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const json = exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `job-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setResult({ success: true, message: '数据已成功导出为JSON文件' });
    } catch {
      setResult({ success: false, message: '导出失败，请重试' });
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const success = importAllData(json);
      setResult({
        success,
        message: success ? '数据已成功从JSON文件导入恢复' : '导入失败，JSON格式不正确或数据结构不匹配',
      });
      setIsImporting(false);
    };
    reader.onerror = () => {
      setResult({ success: false, message: '文件读取失败，请重试' });
      setIsImporting(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    clearAllData();
    setConfirmModal(null);
    setResult({ success: true, message: '所有数据已清空' });
  };

  const handleReset = () => {
    resetToMockData();
    setConfirmModal(null);
    setResult({ success: true, message: '数据已重置为初始示例数据' });
  };

  const dataStats = [
    { label: '公司', count: companies.length, icon: Building2, color: 'from-violet-500 to-pink-500' },
    { label: '简历', count: resumes.length, icon: FileJson, color: 'from-brand-500 to-violet-500' },
    { label: '面试', count: interviews.length, icon: Archive, color: 'from-amber-500 to-orange-500' },
    { label: '题库', count: questionBank.length, icon: HardDrive, color: 'from-cyan-500 to-blue-500' },
    { label: 'Offer', count: offers.length, icon: Database, color: 'from-emerald-500 to-teal-500' },
    { label: '时间线', count: timelineNodes.length, icon: RefreshCw, color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <div className="min-h-full p-6 lg:p-8">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div className="animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h1 className="page-title !mb-0">数据管理</h1>
              </div>
              <p className="page-subtitle ml-12">
                安全管理你的求职数据，支持导出备份与导入恢复
              </p>
            </div>
          </div>
        </div>

        <div className="divider" />

        {result && (
          <div
            className={cn(
              'glass-card p-4 flex items-center gap-3 animate-fade-in',
              result.success
                ? 'bg-emerald-500/10 border border-emerald-400/30'
                : 'bg-red-500/10 border border-red-400/30'
            )}
          >
            {result.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className={cn('text-sm font-medium', result.success ? 'text-emerald-300' : 'text-red-300')}>
              {result.message}
            </span>
            <button
              onClick={() => setResult(null)}
              className="ml-auto text-brand-400 hover:text-white transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {dataStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="glass-card p-4 text-center animate-fade-in-up stagger-item"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center',
                  'bg-gradient-to-br', stat.color
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-mono text-2xl font-bold text-white glow-text">{stat.count}</p>
                <p className="text-xs text-brand-300/70 mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">导出数据</h3>
                <p className="text-xs text-brand-400/70">将全部数据导出为JSON文件备份</p>
              </div>
            </div>
            <p className="text-sm text-brand-200/80 leading-relaxed mb-5">
              导出的JSON文件包含所有公司、简历、面试记录、Offer、题库和时间线数据。
              建议定期导出备份，防止数据丢失。
            </p>
            <button
              onClick={handleExport}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              一键导出JSON
            </button>
          </div>

          <div className="glass-card p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">导入数据</h3>
                <p className="text-xs text-brand-400/70">从JSON文件恢复你的求职数据</p>
              </div>
            </div>
            <p className="text-sm text-brand-200/80 leading-relaxed mb-5">
              选择之前导出的JSON文件，将覆盖当前所有数据。
              请确保文件格式正确，导入前建议先导出当前数据作为备份。
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={handleImport}
              disabled={isImporting}
              className={cn(
                'w-full btn-primary flex items-center justify-center gap-2',
                isImporting && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Upload className="w-4 h-4" />
              {isImporting ? '正在导入...' : '从JSON文件导入'}
            </button>
          </div>

          <div className="glass-card p-6 animate-fade-in-up border border-red-500/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">清空数据</h3>
                <p className="text-xs text-brand-400/70">删除所有数据，此操作不可撤销</p>
              </div>
            </div>
            <p className="text-sm text-brand-200/80 leading-relaxed mb-5">
              清空后将删除所有公司、简历、面试记录、Offer、题库和时间线数据。
              <span className="text-red-400 font-medium">此操作不可撤销！</span>
              建议先导出数据备份。
            </p>
            <button
              onClick={() => setConfirmModal('clear')}
              className="w-full px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-medium hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              清空全部数据
            </button>
          </div>

          <div className="glass-card p-6 animate-fade-in-up border border-amber-500/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <RotateCcw className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">重置示例数据</h3>
                <p className="text-xs text-brand-400/70">恢复为初始示例数据</p>
              </div>
            </div>
            <p className="text-sm text-brand-200/80 leading-relaxed mb-5">
              重置后将用初始示例数据覆盖当前所有数据。
              <span className="text-amber-400 font-medium">当前数据将被替换！</span>
              建议先导出当前数据备份。
            </p>
            <button
              onClick={() => setConfirmModal('reset')}
              className="w-full px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium hover:bg-amber-500/20 hover:border-amber-500/50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              重置为示例数据
            </button>
          </div>
        </div>

        <Modal
          open={confirmModal !== null}
          onClose={() => setConfirmModal(null)}
          title="确认操作"
          size="sm"
          footer={
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={confirmModal === 'clear' ? handleClear : handleReset}
                className={cn(
                  'px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2',
                  confirmModal === 'clear'
                    ? 'bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30'
                    : 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                )}
              >
                {confirmModal === 'clear' ? (
                  <>
                    <Trash2 className="w-4 h-4" />
                    确认清空
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    确认重置
                  </>
                )}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
              <div>
                <p className="text-white font-medium">
                  {confirmModal === 'clear' ? '确定要清空所有数据吗？' : '确定要重置为示例数据吗？'}
                </p>
                <p className="text-sm text-brand-300/70 mt-1">
                  {confirmModal === 'clear'
                    ? '此操作将永久删除所有数据，且不可撤销。'
                    : '此操作将用示例数据替换当前所有数据。'}
                </p>
              </div>
            </div>
            <p className="text-xs text-brand-400/60">
              建议在执行此操作前，先导出当前数据作为备份。
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
}
