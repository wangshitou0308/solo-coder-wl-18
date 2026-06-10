import { useState, useMemo, useEffect } from 'react';
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
  Filter,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import type { Resume, ID, Skill, Project, Experience, Education } from '@/types';

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

interface ResumeFormState {
  name: string;
  version: string;
  targetPosition: string;
  targetIndustry: string;
  summary: string;
  skillsText: string;
  educationText: string;
  experienceText: string;
  projectsText: string;
}

const emptyForm: ResumeFormState = {
  name: '',
  version: '',
  targetPosition: '',
  targetIndustry: '',
  summary: '',
  skillsText: '',
  educationText: '',
  experienceText: '',
  projectsText: '',
};

function ResumeFormModal({
  open,
  onClose,
  editResume,
}: {
  open: boolean;
  onClose: () => void;
  editResume: Resume | null;
}) {
  const addResume = useAppStore((s) => s.addResume);
  const updateResume = useAppStore((s) => s.updateResume);

  const [form, setForm] = useState<ResumeFormState>(emptyForm);

  const isEdit = editResume !== null;

  useEffect(() => {
    if (editResume) {
      setForm({
        name: editResume.name,
        version: editResume.version,
        targetPosition: editResume.targetPosition,
        targetIndustry: editResume.targetIndustry || '',
        summary: editResume.summary,
        skillsText: editResume.skills.map((s) => `${s.name}:${s.level}:${s.category}`).join(', '),
        educationText: editResume.education.map((e) => `${e.school}|${e.major}|${e.degree}`).join('\n'),
        experienceText: editResume.experience.map((e) => `${e.company}|${e.position}`).join('\n'),
        projectsText: editResume.projects.map((p) => `${p.name}|${p.role}|${p.techStack.join('/')}`).join('\n'),
      });
    } else {
      setForm(emptyForm);
    }
  }, [editResume]);

  const handleSubmit = () => {
    if (!form.name.trim() || !form.version.trim() || !form.targetPosition.trim() || !form.summary.trim()) return;

    const skills: Skill[] = form.skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s, i) => {
        const parts = s.split(':');
        return {
          id: `skill-${Date.now()}-${i}`,
          name: parts[0] || s,
          level: parts[1] ? Number(parts[1]) : 70,
          category: parts[2] || '其他',
        };
      });

    const education: Education[] = form.educationText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, i) => {
        const parts = line.split('|');
        return {
          id: `edu-${Date.now()}-${i}`,
          school: parts[0] || line,
          major: parts[1] || '',
          degree: parts[2] || '',
          startDate: '2020-09',
          endDate: '2024-06',
        };
      });

    const experience: Experience[] = form.experienceText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, i) => {
        const parts = line.split('|');
        return {
          id: `exp-${Date.now()}-${i}`,
          company: parts[0] || line,
          position: parts[1] || '',
          startDate: '2022-07',
          endDate: '2024-01',
          isCurrent: false,
          description: [],
        };
      });

    const projects: Project[] = form.projectsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, i) => {
        const parts = line.split('|');
        return {
          id: `proj-${Date.now()}-${i}`,
          name: parts[0] || line,
          description: '',
          role: parts[1] || '',
          techStack: parts[2] ? parts[2].split('/') : [],
          startDate: '2023-01',
          endDate: '2023-12',
          highlights: [],
        };
      });

    if (isEdit && editResume) {
      updateResume(editResume.id, {
        name: form.name.trim(),
        version: form.version.trim(),
        targetPosition: form.targetPosition.trim(),
        targetIndustry: form.targetIndustry.trim() || undefined,
        summary: form.summary.trim(),
        skills,
        education,
        experience,
        projects,
      });
    } else {
      addResume({
        name: form.name.trim(),
        version: form.version.trim(),
        targetPosition: form.targetPosition.trim(),
        targetIndustry: form.targetIndustry.trim() || undefined,
        summary: form.summary.trim(),
        skills,
        education,
        experience,
        projects,
        applicationCount: 0,
        interviewCount: 0,
      });
    }

    onClose();
  };

  const updateField = (field: keyof ResumeFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '编辑简历' : '添加简历'}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            取消
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!form.name.trim() || !form.version.trim() || !form.targetPosition.trim() || !form.summary.trim()}
          >
            {isEdit ? '保存修改' : '添加'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">
              简历名称 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="如：张三-前端开发"
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">
              版本 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.version}
              onChange={(e) => updateField('version', e.target.value)}
              placeholder="如：v1.0"
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">
              目标职位 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.targetPosition}
              onChange={(e) => updateField('targetPosition', e.target.value)}
              placeholder="如：高级前端工程师"
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">目标行业</label>
            <input
              type="text"
              value={form.targetIndustry}
              onChange={(e) => updateField('targetIndustry', e.target.value)}
              placeholder="如：互联网/金融"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="label-text">
            个人简介 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={form.summary}
            onChange={(e) => updateField('summary', e.target.value)}
            placeholder="简要描述你的专业背景和职业目标"
            rows={3}
            className="textarea-field"
          />
        </div>

        <div>
          <label className="label-text">技能 <span className="text-brand-400/60">(格式：名称:熟练度:分类，用逗号分隔)</span></label>
          <textarea
            value={form.skillsText}
            onChange={(e) => updateField('skillsText', e.target.value)}
            placeholder="如：React:90:前端框架, TypeScript:85:编程语言"
            rows={3}
            className="textarea-field"
          />
        </div>

        <div>
          <label className="label-text">教育经历 <span className="text-brand-400/60">(每行一条，格式：学校|专业|学位)</span></label>
          <textarea
            value={form.educationText}
            onChange={(e) => updateField('educationText', e.target.value)}
            placeholder={"如：清华大学|计算机科学|本科"}
            rows={3}
            className="textarea-field"
          />
        </div>

        <div>
          <label className="label-text">工作经历 <span className="text-brand-400/60">(每行一条，格式：公司|职位)</span></label>
          <textarea
            value={form.experienceText}
            onChange={(e) => updateField('experienceText', e.target.value)}
            placeholder={"如：字节跳动|高级前端工程师"}
            rows={3}
            className="textarea-field"
          />
        </div>

        <div>
          <label className="label-text">项目经历 <span className="text-brand-400/60">(每行一条，格式：名称|角色|技术栈用/分隔)</span></label>
          <textarea
            value={form.projectsText}
            onChange={(e) => updateField('projectsText', e.target.value)}
            placeholder={"如：电商平台|前端负责人|React/TypeScript/Node.js"}
            rows={3}
            className="textarea-field"
          />
        </div>
      </div>
    </Modal>
  );
}

function useDynamicCounts() {
  const companies = useAppStore((s) => s.companies);
  const interviews = useAppStore((s) => s.interviews);

  return useMemo(() => {
    const counts: Record<ID, { applicationCount: number; interviewCount: number }> = {};
    for (const company of companies) {
      if (company.resumeId) {
        if (!counts[company.resumeId]) {
          counts[company.resumeId] = { applicationCount: 0, interviewCount: 0 };
        }
        counts[company.resumeId].applicationCount += 1;
      }
    }
    for (const interview of interviews) {
      const company = companies.find((c) => c.id === interview.companyId);
      if (company?.resumeId) {
        if (!counts[company.resumeId]) {
          counts[company.resumeId] = { applicationCount: 0, interviewCount: 0 };
        }
        counts[company.resumeId].interviewCount += 1;
      }
    }
    return counts;
  }, [companies, interviews]);
}

function ResumeCard({
  resume,
  index,
  applicationCount,
  interviewCount,
  onEdit,
}: {
  resume: Resume;
  index: number;
  applicationCount: number;
  interviewCount: number;
  onEdit: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const deleteResume = useAppStore((s) => s.deleteResume);
  const groupedSkills = useMemo(() => groupSkillsByCategory(resume.skills), [resume.skills]);
  const conversionRate =
    applicationCount > 0
      ? ((interviewCount / applicationCount) * 100).toFixed(0)
      : '0';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定要删除简历「${resume.name} - ${resume.version}」吗？`)) {
      deleteResume(resume.id);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const resumeData = {
      name: resume.name,
      version: resume.version,
      targetPosition: resume.targetPosition,
      targetIndustry: resume.targetIndustry,
      summary: resume.summary,
      skills: resume.skills,
      experience: resume.experience,
      projects: resume.projects,
      education: resume.education,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    };
    const jsonStr = JSON.stringify(resumeData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.name}_${resume.version}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
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
            <p className="font-mono text-xl font-bold text-white glow-text">{applicationCount}</p>
          </div>
          <div className="text-center border-x border-white/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Briefcase className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-brand-300/70">面试次数</span>
            </div>
            <p className="font-mono text-xl font-bold text-white glow-text">{interviewCount}</p>
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
  const dynamicCounts = useDynamicCounts();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [filterPosition, setFilterPosition] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');

  const uniquePositions = useMemo(
    () => [...new Set(resumes.map((r) => r.targetPosition).filter(Boolean))],
    [resumes]
  );
  const uniqueIndustries = useMemo(
    () => [...new Set(resumes.map((r) => r.targetIndustry).filter(Boolean))] as string[],
    [resumes]
  );

  const filteredResumes = useMemo(() => {
    return resumes.filter((r) => {
      if (filterPosition && r.targetPosition !== filterPosition) return false;
      if (filterIndustry && r.targetIndustry !== filterIndustry) return false;
      return true;
    });
  }, [resumes, filterPosition, filterIndustry]);

  const stats = useMemo(() => {
    const total = resumes.length;
    let totalApplications = 0;
    let totalInterviews = 0;
    for (const r of resumes) {
      const counts = dynamicCounts[r.id] || { applicationCount: 0, interviewCount: 0 };
      totalApplications += counts.applicationCount;
      totalInterviews += counts.interviewCount;
    }
    const avgConversion =
      totalApplications > 0
        ? ((totalInterviews / totalApplications) * 100).toFixed(1)
        : '0';
    return { total, totalApplications, totalInterviews, avgConversion };
  }, [resumes, dynamicCounts]);

  const openAddModal = () => {
    setEditingResume(null);
    setModalOpen(true);
  };

  const openEditModal = (resume: Resume) => {
    setEditingResume(resume);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingResume(null);
  };

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
            <button className="btn-primary inline-flex items-center gap-2 animate-fade-in" onClick={openAddModal}>
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

        {(uniquePositions.length > 1 || uniqueIndustries.length > 1) && (
          <div className="glass-card p-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-brand-300/70">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">筛选</span>
            </div>
            {uniquePositions.length > 1 && (
              <div className="flex items-center gap-2">
                <label className="label-text !mb-0">目标职位</label>
                <select
                  className="select-field"
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                >
                  <option value="">全部</option>
                  {uniquePositions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}
            {uniqueIndustries.length > 1 && (
              <div className="flex items-center gap-2">
                <label className="label-text !mb-0">目标行业</label>
                <select
                  className="select-field"
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                >
                  <option value="">全部</option>
                  {uniqueIndustries.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {filteredResumes.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {filteredResumes.map((resume, index) => {
              const counts = dynamicCounts[resume.id] || { applicationCount: 0, interviewCount: 0 };
              return (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  index={index}
                  applicationCount={counts.applicationCount}
                  interviewCount={counts.interviewCount}
                  onEdit={() => openEditModal(resume)}
                />
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-16 text-center animate-fade-in-up">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 flex items-center justify-center">
              <FileText className="w-10 h-10 text-brand-400" />
            </div>
            <h3 className="text-xl font-bold text-white font-serif mb-2">
              {resumes.length === 0 ? '暂无简历' : '没有匹配的简历'}
            </h3>
            <p className="text-brand-300/70 mb-5">
              {resumes.length === 0
                ? '点击上方「添加简历」按钮，开始管理你的求职素材'
                : '尝试调整筛选条件查看更多简历'}
            </p>
            {resumes.length === 0 && (
              <button className="btn-primary inline-flex items-center gap-2" onClick={openAddModal}>
                <Plus className="w-4 h-4" />
                创建第一份简历
              </button>
            )}
          </div>
        )}
      </div>

      <ResumeFormModal
        open={modalOpen}
        onClose={closeModal}
        editResume={editingResume}
      />
    </div>
  );
}
