import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  ID,
  AppStore,
  Resume,
  Company,
  Interview,
  QuestionBank,
  QuestionLog,
  Offer,
  TimelineNode,
  CompanyStatus,
  QuestionStatus
} from '@/types';
import {
  mockResumes,
  mockCompanies,
  mockInterviews,
  mockQuestionBank,
  mockQuestionLogs,
  mockOffers,
  mockTimelineNodes
} from '@/data/mockData';

const generateId = (): ID => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
const now = () => new Date().toISOString();

const initialState = {
  resumes: mockResumes,
  companies: mockCompanies,
  interviews: mockInterviews,
  questionBank: mockQuestionBank,
  questionLogs: mockQuestionLogs,
  offers: mockOffers,
  timelineNodes: mockTimelineNodes
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ==================== Resume Actions ====================
      addResume: (resume) => set((state) => ({
        resumes: [...state.resumes, {
          ...resume,
          id: generateId(),
          createdAt: now(),
          updatedAt: now()
        }]
      })),
      updateResume: (id, updates) => set((state) => ({
        resumes: state.resumes.map((r) =>
          r.id === id ? { ...r, ...updates, updatedAt: now() } : r
        )
      })),
      deleteResume: (id) => set((state) => ({
        resumes: state.resumes.filter((r) => r.id !== id)
      })),
      getResume: (id) => get().resumes.find((r) => r.id === id),

      // ==================== Company Actions ====================
      addCompany: (company) => set((state) => ({
        companies: [...state.companies, {
          ...company,
          id: generateId(),
          createdAt: now(),
          updatedAt: now()
        }]
      })),
      updateCompany: (id, updates) => set((state) => ({
        companies: state.companies.map((c) =>
          c.id === id ? { ...c, ...updates, updatedAt: now() } : c
        )
      })),
      deleteCompany: (id) => set((state) => ({
        companies: state.companies.filter((c) => c.id !== id),
        interviews: state.interviews.filter((i) => i.companyId !== id),
        offers: state.offers.filter((o) => o.companyId !== id),
        timelineNodes: state.timelineNodes.filter((t) => t.companyId !== id)
      })),
      getCompany: (id) => get().companies.find((c) => c.id === id),
      updateCompanyStatus: (id, status) => {
        const { updateCompany } = get();
        updateCompany(id, { status });
      },

      // ==================== Interview Actions ====================
      addInterview: (interview) => set((state) => ({
        interviews: [...state.interviews, {
          ...interview,
          id: generateId(),
          createdAt: now(),
          updatedAt: now()
        }]
      })),
      updateInterview: (id, updates) => set((state) => ({
        interviews: state.interviews.map((i) =>
          i.id === id ? { ...i, ...updates, updatedAt: now() } : i
        )
      })),
      deleteInterview: (id) => set((state) => ({
        interviews: state.interviews.filter((i) => i.id !== id),
        timelineNodes: state.timelineNodes.filter((t) => t.interviewId !== id),
        questionLogs: state.questionLogs.map((q) =>
          q.interviewId === id ? { ...q, interviewId: undefined } : q
        )
      })),
      getInterview: (id) => get().interviews.find((i) => i.id === id),
      getInterviewsByCompany: (companyId) =>
        get().interviews
          .filter((i) => i.companyId === companyId)
          .sort((a, b) => a.round - b.round),

      // ==================== QuestionBank Actions ====================
      addQuestion: (question) => set((state) => ({
        questionBank: [...state.questionBank, {
          ...question,
          id: generateId(),
          createdAt: now(),
          updatedAt: now()
        }]
      })),
      updateQuestion: (id, updates) => set((state) => ({
        questionBank: state.questionBank.map((q) =>
          q.id === id ? { ...q, ...updates, updatedAt: now() } : q
        )
      })),
      deleteQuestion: (id) => set((state) => ({
        questionBank: state.questionBank.filter((q) => q.id !== id),
        questionLogs: state.questionLogs.filter((ql) => ql.questionId !== id)
      })),
      getQuestion: (id) => get().questionBank.find((q) => q.id === id),
      updateQuestionStatus: (id, status) => {
        const { updateQuestion } = get();
        updateQuestion(id, { status });
      },
      incrementQuestionPractice: (id) => set((state) => ({
        questionBank: state.questionBank.map((q) =>
          q.id === id
            ? { ...q, timesPracticed: q.timesPracticed + 1, lastPracticedAt: now(), updatedAt: now() }
            : q
        )
      })),

      // ==================== QuestionLog Actions ====================
      addQuestionLog: (log) => set((state) => ({
        questionLogs: [...state.questionLogs, {
          ...log,
          id: generateId(),
          createdAt: now()
        }]
      })),
      updateQuestionLog: (id, updates) => set((state) => ({
        questionLogs: state.questionLogs.map((ql) =>
          ql.id === id ? { ...ql, ...updates } : ql
        )
      })),
      deleteQuestionLog: (id) => set((state) => ({
        questionLogs: state.questionLogs.filter((ql) => ql.id !== id)
      })),

      // ==================== Offer Actions ====================
      addOffer: (offer) => set((state) => ({
        offers: [...state.offers, {
          ...offer,
          id: generateId(),
          createdAt: now(),
          updatedAt: now()
        }]
      })),
      updateOffer: (id, updates) => set((state) => ({
        offers: state.offers.map((o) =>
          o.id === id ? { ...o, ...updates, updatedAt: now() } : o
        )
      })),
      deleteOffer: (id) => set((state) => ({
        offers: state.offers.filter((o) => o.id !== id),
        timelineNodes: state.timelineNodes.filter((t) => t.offerId !== id)
      })),
      getOffer: (id) => get().offers.find((o) => o.id === id),

      // ==================== TimelineNode Actions ====================
      addTimelineNode: (node) => set((state) => ({
        timelineNodes: [...state.timelineNodes, {
          ...node,
          id: generateId(),
          createdAt: now()
        }]
      })),
      updateTimelineNode: (id, updates) => set((state) => ({
        timelineNodes: state.timelineNodes.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        )
      })),
      deleteTimelineNode: (id) => set((state) => ({
        timelineNodes: state.timelineNodes.filter((t) => t.id !== id)
      })),
      getTimelineByCompany: (companyId) =>
        get().timelineNodes
          .filter((t) => t.companyId === companyId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }),
    {
      name: 'job-tracker-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        resumes: state.resumes,
        companies: state.companies,
        interviews: state.interviews,
        questionBank: state.questionBank,
        questionLogs: state.questionLogs,
        offers: state.offers,
        timelineNodes: state.timelineNodes
      })
    }
  )
);

export default useAppStore;
