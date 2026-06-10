import { useMemo } from 'react';
import { Send, MessageSquare, Trophy, GitMerge, Target, Award, Clock } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { CompanyStatus } from '@/types';
import StatCard from '@/components/common/StatCard';

export default function StatsOverview() {
  const companies = useAppStore((s) => s.companies);
  const interviews = useAppStore((s) => s.interviews);
  const offers = useAppStore((s) => s.offers);
  const timelineNodes = useAppStore((s) => s.timelineNodes);

  const stats = useMemo(() => {
    const appliedCompanies = companies.filter(
      (c) => c.status !== CompanyStatus.TARGET && c.status !== CompanyStatus.ARCHIVED
    );
    const totalApplications = appliedCompanies.length;
    const totalInterviews = interviews.length;
    const totalOffers = offers.length;

    const appToInterviewRate =
      totalApplications > 0 ? (totalInterviews / totalApplications) * 100 : 0;
    const interviewToOfferRate =
      totalInterviews > 0 ? (totalOffers / totalInterviews) * 100 : 0;
    const offerRate =
      totalApplications > 0 ? (totalOffers / totalApplications) * 100 : 0;

    let totalCycleDays = 0;
    let cycleCount = 0;
    let currentMonthCycleTotal = 0;
    let currentMonthCycleCount = 0;
    let prevMonthCycleTotal = 0;
    let prevMonthCycleCount = 0;

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const concludedCompanies = appliedCompanies.filter(
      (c) =>
        c.status === CompanyStatus.OFFER ||
        c.status === CompanyStatus.ACCEPTED ||
        c.status === CompanyStatus.REJECTED
    );

    concludedCompanies.forEach((company) => {
      if (!company.appliedDate) return;
      const appliedDate = new Date(company.appliedDate);
      let resultDate: Date | null = null;
      const offer = offers.find((o) => o.companyId === company.id);
      if (offer) {
        resultDate = new Date(offer.createdAt);
      } else {
        const rejectionNodes = timelineNodes.filter(
          (t) => t.companyId === company.id && t.type === 'rejection'
        );
        if (rejectionNodes.length > 0) {
          const sortedRejections = rejectionNodes.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          resultDate = new Date(sortedRejections[0].date);
        }
      }

      if (resultDate && !isNaN(resultDate.getTime())) {
        const diff = Math.max(
          0,
          Math.round(
            (resultDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24)
          )
        );
        if (diff > 0) {
          totalCycleDays += diff;
          cycleCount++;
          if (resultDate >= currentMonthStart) {
            currentMonthCycleTotal += diff;
            currentMonthCycleCount++;
          } else if (resultDate >= prevMonthStart) {
            prevMonthCycleTotal += diff;
            prevMonthCycleCount++;
          }
        }
      }
    });

    const avgCycle = cycleCount > 0 ? Math.round(totalCycleDays / cycleCount) : 0;

    const currentMonthApps = appliedCompanies.filter((c) => {
      if (!c.appliedDate) return false;
      const d = new Date(c.appliedDate);
      return d >= currentMonthStart;
    }).length;

    const prevMonthApps = appliedCompanies.filter((c) => {
      if (!c.appliedDate) return false;
      const d = new Date(c.appliedDate);
      return d >= prevMonthStart && d < currentMonthStart;
    }).length;

    const currentMonthInterviews = interviews.filter((i) => {
      if (!i.date) return false;
      const d = new Date(i.date);
      return d >= currentMonthStart;
    }).length;

    const prevMonthInterviews = interviews.filter((i) => {
      if (!i.date) return false;
      const d = new Date(i.date);
      return d >= prevMonthStart && d < currentMonthStart;
    }).length;

    const currentMonthOffers = offers.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= currentMonthStart;
    }).length;

    const prevMonthOffers = offers.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= prevMonthStart && d < currentMonthStart;
    }).length;

    const computePercentChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const currentAppToInterview =
      currentMonthApps > 0 ? (currentMonthInterviews / currentMonthApps) * 100 : 0;
    const prevAppToInterview =
      prevMonthApps > 0 ? (prevMonthInterviews / prevMonthApps) * 100 : 0;
    const currentInterviewToOffer =
      currentMonthInterviews > 0
        ? (currentMonthOffers / currentMonthInterviews) * 100
        : 0;
    const prevInterviewToOffer =
      prevMonthInterviews > 0
        ? (prevMonthOffers / prevMonthInterviews) * 100
        : 0;
    const currentOfferRate =
      currentMonthApps > 0 ? (currentMonthOffers / currentMonthApps) * 100 : 0;
    const prevOfferRate =
      prevMonthApps > 0 ? (prevMonthOffers / prevMonthApps) * 100 : 0;

    const currentAvgCycle =
      currentMonthCycleCount > 0
        ? Math.round(currentMonthCycleTotal / currentMonthCycleCount)
        : avgCycle;
    const prevAvgCycle =
      prevMonthCycleCount > 0
        ? Math.round(prevMonthCycleTotal / prevMonthCycleCount)
        : avgCycle;

    const cycleTrend =
      prevAvgCycle > 0
        ? -((currentAvgCycle - prevAvgCycle) / prevAvgCycle) * 100
        : 0;

    return {
      totalApplications,
      totalInterviews,
      totalOffers,
      appToInterviewRate,
      interviewToOfferRate,
      offerRate,
      avgCycle,
      trend: {
        applications: computePercentChange(currentMonthApps, prevMonthApps),
        interviews: computePercentChange(currentMonthInterviews, prevMonthInterviews),
        offers: computePercentChange(currentMonthOffers, prevMonthOffers),
        appToInterview: currentAppToInterview - prevAppToInterview,
        interviewToOffer: currentInterviewToOffer - prevInterviewToOffer,
        offerRate: currentOfferRate - prevOfferRate,
        cycle: cycleTrend,
      },
    };
  }, [companies, interviews, offers, timelineNodes]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="投递总数"
        value={stats.totalApplications}
        icon={<Send className="w-6 h-6" />}
        iconBg="bg-blue-500/15"
        iconColor="text-blue-400"
        suffix=" 次"
        trend={stats.trend.applications}
        trendLabel="较上月"
      />
      <StatCard
        title="面试总数"
        value={stats.totalInterviews}
        icon={<MessageSquare className="w-6 h-6" />}
        iconBg="bg-violet-500/15"
        iconColor="text-violet-400"
        suffix=" 场"
        trend={stats.trend.interviews}
        trendLabel="较上月"
      />
      <StatCard
        title="Offer数"
        value={stats.totalOffers}
        icon={<Trophy className="w-6 h-6" />}
        iconBg="bg-amber-500/15"
        iconColor="text-amber-400"
        suffix=" 个"
        trend={stats.trend.offers}
        trendLabel="较上月"
      />
      <StatCard
        title="投递→面试转化率"
        value={stats.appToInterviewRate}
        icon={<GitMerge className="w-6 h-6" />}
        iconBg="bg-cyan-500/15"
        iconColor="text-cyan-400"
        suffix="%"
        decimals={1}
        trend={stats.trend.appToInterview}
        trendLabel="较上月"
      />
      <StatCard
        title="面试→Offer转化率"
        value={stats.interviewToOfferRate}
        icon={<Target className="w-6 h-6" />}
        iconBg="bg-rose-500/15"
        iconColor="text-rose-400"
        suffix="%"
        decimals={1}
        trend={stats.trend.interviewToOffer}
        trendLabel="较上月"
      />
      <StatCard
        title="Offer率"
        value={stats.offerRate}
        icon={<Award className="w-6 h-6" />}
        iconBg="bg-emerald-500/15"
        iconColor="text-emerald-400"
        suffix="%"
        decimals={1}
        trend={stats.trend.offerRate}
        trendLabel="较上月"
      />
      <StatCard
        title="平均面试周期"
        value={stats.avgCycle}
        icon={<Clock className="w-6 h-6" />}
        iconBg="bg-pink-500/15"
        iconColor="text-pink-400"
        suffix=" 天"
        trend={stats.trend.cycle}
        trendLabel="较上月"
      />
    </div>
  );
}
