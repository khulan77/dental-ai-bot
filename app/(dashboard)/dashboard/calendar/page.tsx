import { createAdminClient } from '@/lib/db/supabase';
import { getWeekSchedule } from '@/lib/booking/slots';
import CalendarView from './calendar-view';

export const dynamic = 'force-dynamic';

async function getClinic() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('clinics')
    .select('*')
    .eq('slug', 'sain-shud')
    .single();
  return data;
}

export default async function CalendarPage() {
  const clinic = await getClinic();

  if (!clinic) {
    return <div>Клиник олдсонгүй</div>;
  }

  // 7 хоногийн schedule авах
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const schedule = await getWeekSchedule(clinic.id, today, 7);

  return (
    <div className="max-w-7xl space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Хуанли</h1>
        <p className="text-slate-500 mt-1">
          Дараагийн 7 хоногийн сул цагууд
        </p>
      </div>

      <CalendarView schedule={schedule} />
    </div>
  );
}