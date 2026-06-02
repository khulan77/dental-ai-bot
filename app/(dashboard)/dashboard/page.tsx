import {
  getDashboardStats,
  getWeeklyTrend,
  getTopCustomers,
  getCacheStats,
  getRecentActivity,
  getDoctorStats,
} from "@/lib/dashboard/stats";
import { getOnboardingProgress } from "@/lib/dashboard/onboarding";
import WeeklyChart from "./weekly-chart";
import TopCustomersList from "./top-customers";
import CacheStatsCard from "./cache-stats";
import ActivityFeed from "./activity-feed";
import DoctorStats from "./doctor-stats";
import OnboardingChecklist from "./onboarding-checklist";
import { getCurrentClinic, getCurrentUser } from "@/lib/db/supabase-server";

export const dynamic = "force-dynamic";

async function getClinic() {
  return await getCurrentClinic();
}

export default async function DashboardPage() {
  const clinic = await getClinic();
  const user = await getCurrentUser();
  if (!clinic || !user) return <div>Клиник олдсонгүй</div>;

  const onboarding = await getOnboardingProgress(clinic.id);

  if (onboarding.isComplete) {
  }

  if (!onboarding.isComplete) {
    return (
      <OnboardingChecklist
        steps={onboarding.steps}
        progress={onboarding.progress}
        completedCount={onboarding.completedCount}
        totalCount={onboarding.totalCount}
        userEmail={user.email ?? ""}
        clinicName={clinic.name}
      />
    );
  }

  // Бүгд дууссан бол жинхэнэ dashboard харуулна
  const [stats, weeklyTrend, topCustomers, cacheStats, activity, doctorStats] =
    await Promise.all([
      getDashboardStats(clinic.id),
      getWeeklyTrend(clinic.id),
      getTopCustomers(clinic.id, 5),
      getCacheStats(clinic.id),
      getRecentActivity(clinic.id, 8),
      getDoctorStats(clinic.id),
    ]);

  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const todayChange = stats.todayCount - stats.yesterdayCount;
  const weekChange = stats.weekCount - stats.lastWeekCount;

  return (
    <div className="max-w-7xl space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            {greeting} 👋
          </h1>
          <p className="text-slate-500 mt-2">
            Танай AI ассистент өнөөдөр хичээнгүйлэн ажиллаж байна
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Өнөөдөр</p>
          <p className="text-lg font-semibold text-slate-700">
            {now.toLocaleDateString("mn-MN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="📅"
          label="Өнөөдрийн цаг"
          value={stats.todayCount.toString()}
          change={todayChange}
          changeLabel="өчигдрөөс"
          iconBg="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon="💰"
          label="Өнөөдрийн орлого"
          value={`₮${stats.todayRevenue.toLocaleString()}`}
          subtitle="Захиалсан үйлчилгээ"
          iconBg="from-emerald-500 to-teal-500"
        />
        <StatCard
          icon="📈"
          label="7 хоногийн орлого"
          value={`₮${stats.weekRevenue.toLocaleString()}`}
          change={weekChange}
          changeLabel="өмнөх 7 хоногоос"
          iconBg="from-purple-500 to-pink-500"
        />
        <StatCard
          icon="💬"
          label="Идэвхтэй яриа"
          value={stats.activeChats.toString()}
          subtitle={`Нийт ${stats.totalChats}`}
          iconBg="from-orange-500 to-amber-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <WeeklyChart data={weeklyTrend} />
        </div>
        <div>
          <CacheStatsCard stats={cacheStats} />
        </div>
      </div>

      <DoctorStats doctors={doctorStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopCustomersList customers={topCustomers} />
        <ActivityFeed items={activity} />
      </div>
    </div>
  );
}

function getGreeting(hour: number): string {
  if (hour < 12) return "Өглөөний мэнд!";
  if (hour < 18) return "Өдрийн мэнд!";
  return "Оройн мэнд!";
}

function StatCard({
  icon,
  label,
  value,
  change,
  changeLabel,
  subtitle,
  iconBg,
}: {
  icon: string;
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  subtitle?: string;
  iconBg: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center text-lg sm:text-xl shadow-sm`}
        >
          {icon}
        </div>
        {change !== undefined && change !== 0 && (
          <div
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              change > 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {change > 0 ? "↑" : "↓"} {Math.abs(change)}
          </div>
        )}
      </div>
      <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
        {value}
      </div>
      <div className="text-xs text-slate-500 mt-1 font-medium leading-snug">
        {label}
      </div>
      {subtitle && (
        <div className="text-[10px] text-slate-400 mt-0.5">{subtitle}</div>
      )}
      {changeLabel && change !== undefined && change !== 0 && (
        <div className="text-[10px] text-slate-400 mt-0.5">{changeLabel}</div>
      )}
    </div>
  );
}
