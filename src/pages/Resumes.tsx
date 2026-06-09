import { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Send,
  Target,
  Briefcase,
  GraduationCap,
  Code2,
  FolderKanban,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Download,
  User,
  Layers,
  BarChart3,
  Calendar,
  Star,
  Award,
  Building2,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import Badge from '@/components/common/Badge';
import type { Resume, Skill, Project, Experience, Education } from '@/types';

const categoryColors: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'purple' | 'pink'> = {
  '前端框架': 'primary',
  '后端框架': 'success',
  '编程语言': 'warning',
  '数据库': 'info',
  '后端技术': 'purple',
  'DevOps': 'pink',
};

function getCategoryColor(category: string): 'primary' | 'success' | 'warning' | 'info' | 'purple' | 'pink' {
  return categoryColors[category] || 'primary';
}

function groupSkillsByCategory(skills: Skill[]): Record<string, Skill[]> {
  return skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function StatBlock({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div>
        <p className="text-brand-300/70 text-xs font-medium">{label}</p>
        <p className="data-value text-lg glow-text">
          {value}
          {suffix && <span className="text-sm text-brand-400 ml-0.5">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}

function SkillBar({ skill }: { skill: Skill }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-brand-100 font-medium">{skill.name}</span>
        <span className="text-xs font-mono text-brand-400">{skill.level}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 via-violet-500 to-purple-500 transition-all duration-1000 ease-out"
          style={{ width: `${skill.level}%` }}
        />
      </div>
    </div>
  );
}

function ProjectItem({ project }: { project: Project }) {
  return (
    <div className="glass-card p-4 hover:border-brand-400/40 transition-all duration-300">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/30 to-violet-500/30 flex items-center justify-center">
            <FolderKanban className="w-4 h-4 text-brand-300" />
          </div>
          <div>
            <h5 className="text-white font-semibold text-sm">{project.name}</h5>
            <p className="text-brand-400/80 text-xs">{project.role}</p>
          </div>
        </div>
        <span className="text-[10px] text-brand-400/70 font-mono whitespace-nowrap">
          {formatDate(project.startDate)} - {formatDate(project.endDate)}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {project.techStack.map((tech) => (
          <Badge key={tech} color="muted" size="sm" className="text-[10px]">
            {tech}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ExperienceItem({ exp }: { exp: Experience }) {
  return (
    <div className="relative pl-6 pb-6 last:pb-0">
      <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 border-4 border-brand-950 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
      {!exp.isCurrent && (
        <div className="absolute left-[7px] top-5 bottom-0 w-px bg-gradient-to-b from-brand-500/50 to-transparent" />
      )}
      <div className="glass-card p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-400" />
              <h5 className="text-white font-semibold text-sm">{exp.company}</h5>
              {exp.isCurrent && <Badge color="success" size="sm" dot>在职</Badge>}
            </div>
            <p className="text-brand-300 text-xs mt-1">{exp.position}</p>
          </div>
          <span className="text-[10px] text-brand-400/70 font-mono whitespace-nowrap">
            {formatDate(exp.startDate)} - {exp.isCurrent ? '至今' : formatDate(exp.endDate)}
          </span>
        </div>
        <ul className="space-y-1.5 mt-3">
          {exp.description.map((desc, i) => (
            <li key={i} className="text-xs text-brand-200/80 flex gap-2">
              <span className="text-brand-500 mt-0.5">•</span>
              <span>{desc}</span>
            </li>
          ))}
        </ul>
        {exp.achievements && exp.achievements.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
            {exp.achievements.map((a, i) => (
              <Badge key={i} color="warning" size="sm" className="text-[10px]">
                <Award className="w-3 h-3" />
                {a}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EducationItem({ edu }: { edu: Education }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <h5 className="text-white font-semibold text-sm">{edu.school}</h5>
            <p className="text-brand-400/80 text-xs">
              {edu.major} · {edu.degree}
            </p>
          </div>
        </div>
        <span className="text-[10px] text-brand-400/70 font-mono whitespace-nowrap">
          {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {edu.gpa && (
          <Badge color="info" size="sm" className="text-[10px]">
            <Star className="w-3 h-3" />
            GPA {edu.gpa}
          </Badge>
        )}
        {edu.honors?.map((h, i) => (
          <Badge key={i} color="purple" size="sm" className="text-[10px]">
            {h}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ResumeCard({ resume, index }: { resume: Resume; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const deleteResume = useAppStore((s) => s.deleteResume);
  const groupedSkills = useMemo(() => groupSkillsByCategory(resume.skills), [resume.skills]);
  const conversionRate =
    resume.applicationCount > 0
      ? ((resume.interviewCount / resume.applicationCount) * 100).toFixed(0)
      : '0';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定要删除简历「${resume.name} - ${resume.version}」吗？`)) {
      deleteResume(resume.id);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`正在下载简历：${resume.name}_${resume.version}.pdf`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`编辑简历：${resume.name} - ${resume.version}`);
  };

  return (
    <div
      className={cn(
        'glass-card glass-card-hover overflow-hidden stagger-item',
        expanded && 'ring-1 ring-brand-400/40'
      )}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-lg font-bold text-white font-serif">{resume.name}</h3>
                <Badge color="muted" size="sm">
                  <Layers className="w-3 h-3" />
                  {resume.version}
                </Badge>
              </div>
              <p className="text-brand-300 text-sm">{resume.targetPosition}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleEdit}
              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand-500/20 border border-white/10 hover:border-brand-400/40 flex items-center justify-center text-brand-300 hover:text-white transition-all duration-200"
              title="编辑"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/40 flex items-center justify-center text-brand-300 hover:text-emerald-300 transition-all duration-200"
              title="下载"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-400/40 flex items-center justify-center text-brand-300 hover:text-red-300 transition-all duration-200"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {resume.targetIndustry && (
          <div className="flex items-center gap-1.5 mb-4">
            <Target className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-sm text-brand-200/80">{resume.targetIndustry}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-5 p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Send className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-xs text-brand-300/70">投递次数</span>
            </div>
            <p className="font-mono text-xl font-bold text-white glow-text">{resume.applicationCount}</p>
          </div>
          <div className="text-center border-x border-white/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Briefcase className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-brand-300/70">面试次数</span>
            </div>
            <p className="font-mono text-xl font-bold text-white glow-text">{resume.interviewCount}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-brand-300/70">面试转化率</span>
            </div>
            <p
              className={cn(
                'font-mono text-xl font-bold glow-text',
                Number(conversionRate) >= 50 ? 'text-emerald-400' : 'text-amber-400'
              )}
            >
              {conversionRate}
              <span className="text-sm">%</span>
            </p>
          </div>
        </div>

        {resume.projects.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-brand-300/80 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FolderKanban className="w-3.5 h-3.5" />
              项目经历 ({resume.projects.length})
            </h4>
            <div className="space-y-2">
              {resume.projects.slice(0, expanded ? undefined : 2).map((proj) => (
                <ProjectItem key={proj.id} project={proj} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-xs font-semibold text-brand-300/80 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5" />
            技能标签
          </h4>
          {!expanded ? (
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.slice(0, 8).map((skill) => (
                <Badge key={skill.id} color={getCategoryColor(skill.category)} size="sm">
                  {skill.name}
                </Badge>
              ))}
              {resume.skills.length > 8 && (
                <Badge color="muted" size="sm">
                  +{resume.skills.length - 8}
                </Badge>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedSkills).map(([category, skills]) => (
                <div key={category}>
                  <Badge color={getCategoryColor(category)} size="sm" className="mb-3">
                    {category}
                  </Badge>
                  <div className="space-y-2 pl-1">
                    {skills.map((skill) => (
                      <SkillBar key={skill.id} skill={skill} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="animate-scale-in border-t border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="p-5 space-y-6">
            {resume.experience.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-brand-300/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5" />
                  工作经历 ({resume.experience.length})
                </h4>
                <div className="space-y-2">
                  {resume.experience.map((exp) => (
                    <ExperienceItem key={exp.id} exp={exp} />
                  ))}
                </div>
              </div>
            )}

            {resume.education.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-brand-300/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5" />
                  教育经历 ({resume.education.length})
                </h4>
                <div className="space-y-2">
                  {resume.education.map((edu) => (
                    <EducationItem key={edu.id} edu={edu} />
                  ))}
                </div>
              </div>
            )}

            <div className="glass-card p-4 border-brand-400/20">
              <h4 className="text-xs font-semibold text-brand-300/80 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                个人简介
              </h4>
              <p className="text-sm text-brand-200/90 leading-relaxed">{resume.summary}</p>
            </div>

            <div className="flex items-center gap-4 text-xs text-brand-400/70 pt-2 border-t border-white/5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                创建：{formatDate(resume.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Edit2 className="w-3 h-3" />
                更新：{formatDate(resume.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full py-3 flex items-center justify-center gap-1.5 text-sm font-medium transition-all duration-300',
          'border-t border-white/5 bg-white/[0.02] hover:bg-white/[0.05]',
          expanded ? 'text-brand-300' : 'text-brand-400 hover:text-brand-200'
        )}
      >
        {expanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            收起详情
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            查看完整简历
          </>
        )}
      </button>
    </div>
  );
}

export default function Resumes() {
  const resumes = useAppStore((s) => s.resumes);

  const stats = useMemo(() => {
    const total = resumes.length;
    const totalApplications = resumes.reduce((sum, r) => sum + r.applicationCount, 0);
    const totalInterviews = resumes.reduce((sum, r) => sum + r.interviewCount, 0);
    const avgConversion =
      totalApplications > 0
        ? ((totalInterviews / totalApplications) * 100).toFixed(1)
        : '0';
    return { total, totalApplications, totalInterviews, avgConversion };
  }, [resumes]);

  return (
    <div className="min-h-full p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h1 className="page-title !mb-0">简历管理</h1>
              </div>
              <p className="page-subtitle ml-12">
                管理多版本简历，追踪投递效果，持续优化求职素材
              </p>
            </div>
            <button className="btn-primary inline-flex items-center gap-2 animate-fade-in">
              <Plus className="w-4 h-4" />
              添加简历
            </button>
          </div>
        </div>

        <div className="divider" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card glass-card-hover p-5 animate-fade-in-up">
            <StatBlock
              icon={<FileText className="w-5 h-5" />}
              iconBg="bg-gradient-to-br from-brand-500/30 to-violet-500/30"
              iconColor="text-brand-300"
              label="简历总数"
              value={stats.total}
              suffix="份"
            />
          </div>
          <div
            className="glass-card glass-card-hover p-5 animate-fade-in-up"
            style={{ animationDelay: '0.05s' }}
          >
            <StatBlock
              icon={<Send className="w-5 h-5" />}
              iconBg="bg-gradient-to-br from-blue-500/30 to-cyan-500/30"
              iconColor="text-blue-300"
              label="总投递次数"
              value={stats.totalApplications}
              suffix="次"
            />
          </div>
          <div
            className="glass-card glass-card-hover p-5 animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <StatBlock
              icon={<Briefcase className="w-5 h-5" />}
              iconBg="bg-gradient-to-br from-violet-500/30 to-purple-500/30"
              iconColor="text-violet-300"
              label="面试次数"
              value={stats.totalInterviews}
              suffix="次"
            />
          </div>
          <div
            className="glass-card glass-card-hover p-5 animate-fade-in-up"
            style={{ animationDelay: '0.15s' }}
          >
            <StatBlock
              icon={<BarChart3 className="w-5 h-5" />}
              iconBg="bg-gradient-to-br from-emerald-500/30 to-teal-500/30"
              iconColor="text-emerald-300"
              label="平均面试率"
              value={stats.avgConversion}
              suffix="%"
            />
          </div>
        </div>

        {resumes.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {resumes.map((resume, index) => (
              <ResumeCard key={resume.id} resume={resume} index={index} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-16 text-center animate-fade-in-up">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 flex items-center justify-center">
              <FileText className="w-10 h-10 text-brand-400" />
            </div>
            <h3 className="text-xl font-bold text-white font-serif mb-2">暂无简历</h3>
            <p className="text-brand-300/70 mb-5">点击上方「添加简历」按钮，开始管理你的求职素材</p>
            <button className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              创建第一份简历
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
