import { createAdminClient } from '@/lib/db/supabase';
import { getCurrentClinic } from '@/lib/db/supabase-server';
import { getWeekSchedule, getDoctorWeekSchedule } from '@/lib/booking/slots';
import CalendarView from './calendar-view';

export const dynamic = 'force-dynamic';

async function getData(searchParams: { doctor?: string }) {
  const clinic = await getCurrentClinic();
  if (!clinic) return null;

  const supabase = createAdminClient();
  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, name, specialty, custom_hours, service_ids')
    .eq('clinic_id', clinic.id)
    .eq('is_active', true)
    .order('display_order');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDoctorId = searchParams.doctor ?? 'all';

  let schedule;
  if (selectedDoctorId === 'all') {
    schedule = await getWeekSchedule(clinic.id, today, 7);
  } else {
    schedule = await getDoctorWeekSchedule(clinic.id, selectedDoctorId, today, 7);
  }

  return {
    clinic,
    doctors: doctors ?? [],
    schedule,
    selectedDoctorId,
  };
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ doctor?: string }>;
}) {
  const params = await searchParams;
  const data = await getData(params);

  if (!data) {
    return <div>Клиник олдсонгүй</div>;
  }

  return (
    <div className="max-w-7xl space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Хуанли</h1>
        <p className="text-slate-500 mt-1">Эмч тус бүрийн сул цаг</p>
      </div>

      <CalendarView
        schedule={data.schedule}
        doctors={data.doctors}
        selectedDoctorId={data.selectedDoctorId}
      />
    </div>
  );
}