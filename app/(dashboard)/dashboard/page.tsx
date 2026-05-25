import { createAdminClient } from '@/lib/db/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getStats() {
  const supabase = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    appointmentsToday,
    activeConversations,
    totalAppointments,
    upcomingAppointments,
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('scheduled_at', today.toISOString())
      .lt('scheduled_at', tomorrow.toISOString()),
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('appointments')
      .select('*')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(5),
  ]);

  return {
    todayCount: appointmentsToday.count ?? 0,
    activeChats: activeConversations.count ?? 0,
    totalCount: totalAppointments.count ?? 0,
    upcoming: upcomingAppointments.data ?? [],
  };
}

export default async function DashboardPage() {
  const stats = await getStats();
  const now = new Date();
  const greeting = getGreeting(now.getHours());

  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            {greeting} 👋
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Танай AI ассистент өнөөдөр хичээнгүйлэн ажиллаж байна
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Өнөөдөр</p>
          <p className="text-lg font-semibold text-slate-700">
            {now.toLocaleDateString('mn-MN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          icon="📅"
          label="Өнөөдрийн цаг"
          value={stats.todayCount}
          accent="from-blue-500/10 to-cyan-500/10"
          iconBg="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon="💬"
          label="Идэвхтэй яриа"
          value={stats.activeChats}
          accent="from-purple-500/10 to-pink-500/10"
          iconBg="from-purple-500 to-pink-500"
        />
        <StatCard
          icon="✨"
          label="Нийт цаг захиалга"
          value={stats.totalCount}
          accent="from-emerald-500/10 to-teal-500/10"
          iconBg="from-emerald-500 to-teal-500"
        />
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Удахгүй болох цаг
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Дараагийн 5 захиалга
            </p>
          </div>
          <Link
            href="/dashboard/appointments"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Бүгдийг харах →
          </Link>
        </div>

        {stats.upcoming.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-slate-600 font-medium">
              Удахгүй болох цаг алга
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Bot шинэ захиалга авах хүртэл хүлээгээрэй
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.upcoming.map(apt => (
              <AppointmentRow key={apt.id} appointment={apt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting(hour: number): string {
  if (hour < 12) return 'Өглөөний мэнд!';
  if (hour < 18) return 'Өдрийн мэнд!';
  return 'Оройн мэнд!';
}

function StatCard({
  icon,
  label,
  value,
  accent,
  iconBg,
}: {
  icon: string;
  label: string;
  value: number;
  accent: string;
  iconBg: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${accent} bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition`}>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center text-2xl mb-4 shadow-sm`}>
        {icon}
      </div>
      <div className="text-4xl font-bold text-slate-900 tracking-tight">
        {value}
      </div>
      <div className="text-sm text-slate-600 mt-1 font-medium">{label}</div>
    </div>
  );
}

function AppointmentRow({ appointment }: { appointment: any }) {
  const date = new Date(appointment.scheduled_at);
  const dateStr = date.toLocaleDateString('mn-MN', {
    month: 'short',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('mn-MN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center font-semibold text-blue-700">
          {appointment.customer_name?.charAt(0) ?? '?'}
        </div>
        <div>
          <p className="font-medium text-slate-900">{appointment.customer_name}</p>
          <p className="text-sm text-slate-500">
            {appointment.service ?? 'Үйлчилгээ тодорхойгүй'}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-700">{dateStr}</p>
        <p className="text-sm text-slate-500">{timeStr}</p>
      </div>
    </div>
  );
}