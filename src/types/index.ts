export type ID = string;

export enum CompanyStatus {
  TARGET = 'target',
  APPLIED = 'applied',
  SCREENING = 'screening',
  INTERVIEW = 'interview',
  ONSITE = 'onsite',
  OFFER = 'offer',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  [CompanyStatus.TARGET]: '目标公司',
  [CompanyStatus.APPLIED]: '已投递',
  [CompanyStatus.SCREENING]: '简历筛选',
  [CompanyStatus.INTERVIEW]: '面试中',
  [CompanyStatus.ONSITE]: '终面/现场',
  [CompanyStatus.OFFER]: '已录用',
  [CompanyStatus.ACCEPTED]: '已接受',
  [CompanyStatus.REJECTED]: '已拒绝',
  [CompanyStatus.ARCHIVED]: '已归档'
};

export enum QuestionCategory {
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  ALGORITHM = 'algorithm',
  PROJECT = 'project'
}

export const QUESTION_CATEGORY_LABELS: Record<QuestionCategory, string> = {
  [QuestionCategory.TECHNICAL]: '技术问题',
  [QuestionCategory.BEHAVIORAL]: '行为问题',
  [QuestionCategory.ALGORITHM]: '算法问题',
  [QuestionCategory.PROJECT]: '项目问题'
};

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.EASY]: '简单',
  [DifficultyLevel.MEDIUM]: '中等',
  [DifficultyLevel.HARD]: '困难'
};

export enum QuestionStatus {
  UNREAD = 'unread',
  READING = 'reading',
  MASTERED = 'mastered'
}

export const QUESTION_STATUS_LABELS: Record<QuestionStatus, string> = {
  [QuestionStatus.UNREAD]: '未学习',
  [QuestionStatus.READING]: '学习中',
  [QuestionStatus.MASTERED]: '已掌握'
};

export enum JobDirection {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  ALGORITHM = 'algorithm',
  PRODUCT = 'product'
}

export const JOB_DIRECTION_LABELS: Record<JobDirection, string> = {
  [JobDirection.FRONTEND]: '前端',
  [JobDirection.BACKEND]: '后端',
  [JobDirection.ALGORITHM]: '算法',
  [JobDirection.PRODUCT]: '产品'
};

export enum InterviewType {
  PHONE = 'phone',
  VIDEO = 'video',
  ONSITE = 'onsite',
  CODE = 'code',
  HR = 'hr'
}

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  [InterviewType.PHONE]: '电话面试',
  [InterviewType.VIDEO]: '视频面试',
  [InterviewType.ONSITE]: '现场面试',
  [InterviewType.CODE]: '编程面试',
  [InterviewType.HR]: 'HR面试'
};

export enum InterviewResult {
  PENDING = 'pending',
  PASS = 'pass',
  FAIL = 'fail'
}

export const INTERVIEW_RESULT_LABELS: Record<InterviewResult, string> = {
  [InterviewResult.PENDING]: '待评估',
  [InterviewResult.PASS]: '通过',
  [InterviewResult.FAIL]: '未通过'
};

export enum TimelineType {
  APPLICATION = 'application',
  SCREENING = 'screening',
  INTERVIEW = 'interview',
  OFFER = 'offer',
  REJECTION = 'rejection',
  NOTE = 'note',
  FOLLOWUP = 'followup'
}

export const TIMELINE_TYPE_LABELS: Record<TimelineType, string> = {
  [TimelineType.APPLICATION]: '投递申请',
  [TimelineType.SCREENING]: '简历筛选',
  [TimelineType.INTERVIEW]: '面试安排',
  [TimelineType.OFFER]: '录用通知',
  [TimelineType.REJECTION]: '拒绝通知',
  [TimelineType.NOTE]: '备注记录',
  [TimelineType.FOLLOWUP]: '跟进沟通'
};

export interface Resume {
  id: ID;
  name: string;
  version: string;
  targetPosition: string;
  targetIndustry?: string;
  filePath?: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  applicationCount: number;
  interviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: ID;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string[];
}

export interface Experience {
  id: ID;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string[];
  achievements?: string[];
}

export interface Project {
  id: ID;
  name: string;
  description: string;
  role: string;
  techStack: string[];
  startDate: string;
  endDate: string;
  highlights: string[];
  link?: string;
}

export interface Skill {
  id: ID;
  name: string;
  level: number;
  category: string;
}

export interface Company {
  id: ID;
  name: string;
  logo?: string;
  website?: string;
  industry: string;
  size: string;
  location: string;
  status: CompanyStatus;
  position: string;
  salary?: string;
  jobUrl?: string;
  appliedDate?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  rating?: number;
  priority: number;
  tags: string[];
  resumeId?: ID;
  createdAt: string;
  updatedAt: string;
}

export enum InterviewForm {
  PHONE = 'phone',
  VIDEO = 'video',
  ONSITE = 'onsite'
}

export const INTERVIEW_FORM_LABELS: Record<InterviewForm, string> = {
  [InterviewForm.PHONE]: '电话',
  [InterviewForm.VIDEO]: '视频',
  [InterviewForm.ONSITE]: '现场'
};

export interface InterviewQuestion {
  id: ID;
  category: QuestionCategory;
  question: string;
  myAnswer?: string;
  selfRating?: number;
  interviewerFeedback?: string;
}

export interface Interview {
  id: ID;
  companyId: ID;
  round: number;
  type: InterviewType;
  form: InterviewForm;
  title: string;
  date: string;
  time?: string;
  duration: number;
  interviewer?: string;
  interviewerTitle?: string;
  location?: string;
  meetingLink?: string;
  result: InterviewResult;
  questions: InterviewQuestion[];
  feedback?: string;
  selfRating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionLog {
  id: ID;
  questionId: ID;
  interviewId?: ID;
  companyId?: ID;
  answer?: string;
  rating?: number;
  notes?: string;
  practicedAt: string;
  createdAt: string;
}

export interface QuestionBank {
  id: ID;
  question: string;
  direction: JobDirection;
  category: QuestionCategory;
  difficulty: DifficultyLevel;
  status: QuestionStatus;
  answer: string;
  keywords?: string[];
  tags: string[];
  frequency: number;
  timesPracticed: number;
  lastPracticedAt?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryBreakdown {
  baseSalary: number;
  performanceBonus?: number;
  yearEndBonus?: number;
  stockOptions?: number;
  signingBonus?: number;
  housingAllowance?: number;
  transportationAllowance?: number;
  mealAllowance?: number;
  other?: number;
}

export interface Benefits {
  socialInsuranceBase?: number;
  housingFundBase?: number;
  housingFundRatio?: number;
  annualLeaveDays?: number;
  sickLeaveDays?: number;
  supplementaryMedical?: boolean;
  dentalInsurance?: boolean;
  lifeInsurance?: boolean;
  gymMembership?: boolean;
  freeMeals?: boolean;
  flexibleWorking?: boolean;
  remoteWork?: boolean;
  stockPurchasePlan?: boolean;
  educationBudget?: number;
  otherBenefits?: string;
}

export interface Offer {
  id: ID;
  companyId: ID;
  position: string;
  salary: SalaryBreakdown;
  benefits?: Benefits;
  monthsPaid: number;
  location: string;
  startDate?: string;
  deadline: string;
  accepted: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineNode {
  id: ID;
  companyId?: ID;
  interviewId?: ID;
  offerId?: ID;
  type: TimelineType;
  title: string;
  description?: string;
  date: string;
  tags?: string[];
  createdAt: string;
}

export interface AppStore {
  resumes: Resume[];
  companies: Company[];
  interviews: Interview[];
  questionBank: QuestionBank[];
  questionLogs: QuestionLog[];
  offers: Offer[];
  timelineNodes: TimelineNode[];

  addResume: (resume: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateResume: (id: ID, updates: Partial<Resume>) => void;
  deleteResume: (id: ID) => void;
  getResume: (id: ID) => Resume | undefined;

  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCompany: (id: ID, updates: Partial<Company>) => void;
  deleteCompany: (id: ID) => void;
  getCompany: (id: ID) => Company | undefined;
  updateCompanyStatus: (id: ID, status: CompanyStatus) => void;

  addInterview: (interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInterview: (id: ID, updates: Partial<Interview>) => void;
  deleteInterview: (id: ID) => void;
  getInterview: (id: ID) => Interview | undefined;
  getInterviewsByCompany: (companyId: ID) => Interview[];

  addQuestion: (question: Omit<QuestionBank, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateQuestion: (id: ID, updates: Partial<QuestionBank>) => void;
  deleteQuestion: (id: ID) => void;
  getQuestion: (id: ID) => QuestionBank | undefined;
  updateQuestionStatus: (id: ID, status: QuestionStatus) => void;
  incrementQuestionPractice: (id: ID) => void;

  addQuestionLog: (log: Omit<QuestionLog, 'id' | 'createdAt'>) => void;
  updateQuestionLog: (id: ID, updates: Partial<QuestionLog>) => void;
  deleteQuestionLog: (id: ID) => void;

  addOffer: (offer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOffer: (id: ID, updates: Partial<Offer>) => void;
  deleteOffer: (id: ID) => void;
  getOffer: (id: ID) => Offer | undefined;

  addTimelineNode: (node: Omit<TimelineNode, 'id' | 'createdAt'>) => void;
  updateTimelineNode: (id: ID, updates: Partial<TimelineNode>) => void;
  deleteTimelineNode: (id: ID) => void;
  getTimelineByCompany: (companyId: ID) => TimelineNode[];
}
