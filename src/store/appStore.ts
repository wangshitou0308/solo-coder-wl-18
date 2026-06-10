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
  QuestionStatus,
  COMPANY_STATUS_LABELS,
  TimelineType,
} from '@/types';
import {
  mockResumes,
  mockCompanies,
  mockInterviews,
  mockQuestionBank,
  mockQuestionLogs,
  mockOffers,
  mockTimelineNodes,
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
  timelineNodes: mockTimelineNodes,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addResume: (resume) => set((state) => ({
        resumes: [...state.resumes, {
          ...resume,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        }],
      })),
      updateResume: (id, updates) => set((state) => ({
        resumes: state.resumes.map((r) =>
          r.id === id ? { ...r, ...updates, updatedAt: now() } : r
        ),
      })),
      deleteResume: (id) => set((state) => ({
        resumes: state.resumes.filter((r) => r.id !== id),
      })),
      getResume: (id) => get().resumes.find((r) => r.id === id),

      addCompany: (company) => {
        const newId = generateId();
        const ts = now();
        set((state) => ({
          companies: [...state.companies, {
            ...company,
            id: newId,
            createdAt: ts,
            updatedAt: ts,
          }],
          timelineNodes: company.status !== CompanyStatus.TARGET
            ? [...state.timelineNodes, {
                id: generateId(),
                companyId: newId,
                type: company.status === CompanyStatus.APPLIED ? TimelineType.APPLICATION : TimelineType.NOTE,
                title: company.status === CompanyStatus.APPLIED ? '投递申请' : `状态变更为${COMPANY_STATUS_LABELS[company.status]}`,
                description: `投递了${company.position}岗位`,
                date: company.appliedDate || ts,
                tags: ['自动记录'],
                createdAt: ts,
              }]
            : state.timelineNodes,
        }));
      },
      updateCompany: (id, updates) => set((state) => ({
        companies: state.companies.map((c) =>
          c.id === id ? { ...c, ...updates, updatedAt: now() } : c
        ),
      })),
      deleteCompany: (id) => set((state) => ({
        companies: state.companies.filter((c) => c.id !== id),
        interviews: state.interviews.filter((i) => i.companyId !== id),
        offers: state.offers.filter((o) => o.companyId !== id),
        timelineNodes: state.timelineNodes.filter((t) => t.companyId !== id),
      })),
      getCompany: (id) => get().companies.find((c) => c.id === id),
      updateCompanyStatus: (id, status) => {
        const state = get();
        const company = state.companies.find((c) => c.id === id);
        if (!company || company.status === status) return;

        set((s) => ({
          companies: s.companies.map((c) =>
            c.id === id ? { ...c, status, updatedAt: now() } : c
          ),
          timelineNodes: [...s.timelineNodes, {
            id: generateId(),
            companyId: id,
            type: status === CompanyStatus.OFFER || status === CompanyStatus.ACCEPTED
              ? TimelineType.OFFER
              : status === CompanyStatus.REJECTED
                ? TimelineType.REJECTION
                : status === CompanyStatus.INTERVIEW
                  ? TimelineType.INTERVIEW
                  : status === CompanyStatus.SCREENING
                    ? TimelineType.SCREENING
                    : TimelineType.NOTE,
            title: `状态变更为${COMPANY_STATUS_LABELS[status]}`,
            description: `${company.name} 状态从 ${COMPANY_STATUS_LABELS[company.status]} 变更为 ${COMPANY_STATUS_LABELS[status]}`,
            date: now(),
            tags: ['自动记录'],
            createdAt: now(),
          }],
        }));
      },

      addInterview: (interview) => {
        const newId = generateId();
        const ts = now();
        set((state) => {
          const company = state.companies.find((c) => c.id === interview.companyId);
          const shouldUpdateStatus = company &&
            company.status !== CompanyStatus.INTERVIEW &&
            company.status !== CompanyStatus.ONSITE &&
            company.status !== CompanyStatus.OFFER &&
            company.status !== CompanyStatus.ACCEPTED;

          return {
            interviews: [...state.interviews, {
              ...interview,
              id: newId,
              createdAt: ts,
              updatedAt: ts,
            }],
            companies: shouldUpdateStatus
              ? state.companies.map((c) =>
                  c.id === interview.companyId
                    ? { ...c, status: CompanyStatus.INTERVIEW, updatedAt: ts }
                    : c
                )
              : state.companies,
            timelineNodes: [...state.timelineNodes, {
              id: generateId(),
              companyId: interview.companyId,
              interviewId: newId,
              type: TimelineType.INTERVIEW,
              title: `面试安排：${interview.title}`,
              description: `${company?.name || ''} 第${interview.round}轮面试`,
              date: interview.date,
              tags: ['自动记录', '面试'],
              createdAt: ts,
            }],
          };
        });
      },
      updateInterview: (id, updates) => set((state) => ({
        interviews: state.interviews.map((i) =>
          i.id === id ? { ...i, ...updates, updatedAt: now() } : i
        ),
      })),
      deleteInterview: (id) => set((state) => ({
        interviews: state.interviews.filter((i) => i.id !== id),
        timelineNodes: state.timelineNodes.filter((t) => t.interviewId !== id),
        questionLogs: state.questionLogs.map((q) =>
          q.interviewId === id ? { ...q, interviewId: undefined } : q
        ),
      })),
      getInterview: (id) => get().interviews.find((i) => i.id === id),
      getInterviewsByCompany: (companyId) =>
        get().interviews
          .filter((i) => i.companyId === companyId)
          .sort((a, b) => a.round - b.round),

      addQuestion: (question) => set((state) => ({
        questionBank: [...state.questionBank, {
          ...question,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        }],
      })),
      updateQuestion: (id, updates) => set((state) => ({
        questionBank: state.questionBank.map((q) =>
          q.id === id ? { ...q, ...updates, updatedAt: now() } : q
        ),
      })),
      deleteQuestion: (id) => set((state) => ({
        questionBank: state.questionBank.filter((q) => q.id !== id),
        questionLogs: state.questionLogs.filter((ql) => ql.questionId !== id),
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
        ),
      })),

      addQuestionLog: (log) => set((state) => ({
        questionLogs: [...state.questionLogs, {
          ...log,
          id: generateId(),
          createdAt: now(),
        }],
      })),
      updateQuestionLog: (id, updates) => set((state) => ({
        questionLogs: state.questionLogs.map((ql) =>
          ql.id === id ? { ...ql, ...updates } : ql
        ),
      })),
      deleteQuestionLog: (id) => set((state) => ({
        questionLogs: state.questionLogs.filter((ql) => ql.id !== id),
      })),

      addOffer: (offer) => {
        const newId = generateId();
        const ts = now();
        set((state) => {
          const company = state.companies.find((c) => c.id === offer.companyId);
          return {
            offers: [...state.offers, {
              ...offer,
              id: newId,
              createdAt: ts,
              updatedAt: ts,
            }],
            companies: company && company.status !== CompanyStatus.ACCEPTED
              ? state.companies.map((c) =>
                  c.id === offer.companyId
                    ? { ...c, status: CompanyStatus.OFFER, updatedAt: ts }
                    : c
                )
              : state.companies,
            timelineNodes: [...state.timelineNodes, {
              id: generateId(),
              companyId: offer.companyId,
              offerId: newId,
              type: TimelineType.OFFER,
              title: `收到Offer：${offer.position}`,
              description: `${company?.name || ''} 发出录用通知`,
              date: ts,
              tags: ['自动记录', 'Offer'],
              createdAt: ts,
            }],
          };
        });
      },
      updateOffer: (id, updates) => set((state) => ({
        offers: state.offers.map((o) =>
          o.id === id ? { ...o, ...updates, updatedAt: now() } : o
        ),
      })),
      deleteOffer: (id) => set((state) => ({
        offers: state.offers.filter((o) => o.id !== id),
        timelineNodes: state.timelineNodes.filter((t) => t.offerId !== id),
      })),
      getOffer: (id) => get().offers.find((o) => o.id === id),

      addTimelineNode: (node) => set((state) => ({
        timelineNodes: [...state.timelineNodes, {
          ...node,
          id: generateId(),
          createdAt: now(),
        }],
      })),
      updateTimelineNode: (id, updates) => set((state) => ({
        timelineNodes: state.timelineNodes.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      })),
      deleteTimelineNode: (id) => set((state) => ({
        timelineNodes: state.timelineNodes.filter((t) => t.id !== id),
      })),
      getTimelineByCompany: (companyId) =>
        get().timelineNodes
          .filter((t) => t.companyId === companyId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),

      exportAllData: () => {
        const state = get();
        const data = {
          resumes: state.resumes,
          companies: state.companies,
          interviews: state.interviews,
          questionBank: state.questionBank,
          questionLogs: state.questionLogs,
          offers: state.offers,
          timelineNodes: state.timelineNodes,
        };
        return JSON.stringify(data, null, 2);
      },
      importAllData: (json) => {
        try {
          const data = JSON.parse(json);
          if (!data.resumes || !data.companies || !data.interviews || !data.questionBank || !data.offers || !data.timelineNodes) {
            return false;
          }
          set({
            resumes: data.resumes,
            companies: data.companies,
            interviews: data.interviews,
            questionBank: data.questionBank,
            questionLogs: data.questionLogs || [],
            offers: data.offers,
            timelineNodes: data.timelineNodes,
          });
          return true;
        } catch {
          return false;
        }
      },
      clearAllData: () => set({
        resumes: [],
        companies: [],
        interviews: [],
        questionBank: [],
        questionLogs: [],
        offers: [],
        timelineNodes: [],
      }),
      resetToMockData: () => set({
        resumes: [...mockResumes],
        companies: [...mockCompanies],
        interviews: [...mockInterviews],
        questionBank: [...mockQuestionBank],
        questionLogs: [...mockQuestionLogs],
        offers: [...mockOffers],
        timelineNodes: [...mockTimelineNodes],
      }),
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
        timelineNodes: state.timelineNodes,
      }),
    }
  )
);

export default useAppStore;
