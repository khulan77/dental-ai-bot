import { createAdminClient } from '@/lib/db/supabase';
import { getCurrentClinic } from '@/lib/db/supabase-server';
import { getDoctorBranchMap } from '@/lib/booking/branches';
import { clinicDateISO, clinicDayBounds, clinicInstantFrom } from '@/lib/booking/timezone';
import type { BusinessHoursData } from '@/lib/db/clinic-actions';
import { effectivePrice, type DiscountableService } from '@/lib/booking/pricing';
import Scheduler from './scheduler';
import type { CalAppointment, CalColumn, CalService } from './types';

export const dynamic = 'force-dynamic';

type ServiceRow = DiscountableService & { id: string; name: string; duration_minutes: number };

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

/**
 * Өдрийн хуваарь — Fresha маягийн: салбар сонгоход тэнд ажилладаг эмч
 * бүр нэг багана болно. Хоосон нүдэн дээр дарж захиалга бүртгэнэ.
 *
 * ?date=YYYY-MM-DD (эмнэлгийн бүсийн өдөр), ?branch=<id>, ?new=1 (маягт нээх)
 */
export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; branch?: string; new?: string }>;
}) {
  const clinic = await getCurrentClinic();
  if (!clinic) return <div>Клиник олдсонгүй</div>;

  const params = await searchParams;
  const today = clinicDateISO(new Date());
  const date = /^\d{4}-\d{2}-\d{2}$/.test(params.date ?? '') ? params.date! : today;

  const supabase = createAdminClient();
  const [{ data: doctorRows }, { data: branchRows }] = await Promise.all([
    supabase
      .from('doctors')
      .select('id, name, specialty, avatar_url, custom_hours, service_ids')
      .eq('clinic_id', clinic.id)
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('branches')
      .select('id, name, business_hours')
      .eq('clinic_id', clinic.id)
      .eq('is_active', true)
      .order('display_order'),
  ]);

  const doctors = doctorRows ?? [];
  const branches = branchRows ?? [];
  const branchMap = await getDoctorBranchMap(doctors.map(d => d.id));

  // Салбартай бол нэг салбарыг заавал сонгосон байна (анх — эхнийх)
  const branch = branches.length
    ? branches.find(b => b.id === params.branch) ?? branches[0]
    : null;

  // Энэ өдрийн ажлын цаг: эмчийн хувийн → салбарын → эмнэлгийн (slots.ts-тэй ижил эрэмбэ)
  const dayKey = DAY_KEYS[new Date(`${date}T00:00:00Z`).getUTCDay()];
  const clinicHours = clinic.business_hours as BusinessHoursData | null;
  const branchHours = branch?.business_hours as BusinessHoursData | null | undefined;

  const columns: CalColumn[] = doctors
    .filter(d => !branch || (branchMap[d.id] ?? []).includes(branch.id))
    .map(d => {
      const hours = ((d.custom_hours as BusinessHoursData | null) ?? branchHours ?? clinicHours)?.[dayKey];
      return {
        doctor: {
          id: d.id,
          name: d.name,
          specialty: d.specialty,
          avatar_url: d.avatar_url,
          service_ids: (d.service_ids ?? []) as string[],
        },
        hours: hours ?? null,
      };
    });

  const { start, end } = clinicDayBounds(clinicInstantFrom(date, '12:00'));
  const { data: aptRows } = await supabase
    .from('appointments')
    .select(
      'id, doctor_id, branch_id, customer_name, customer_phone, service, scheduled_at, duration_minutes, status, booking_code, notes'
    )
    .eq('clinic_id', clinic.id)
    .gte('scheduled_at', start.toISOString())
    .lt('scheduled_at', end.toISOString())
    // Цуцалсан захиалга цаг эзлэхгүй тул хуанлид харуулахгүй
    .neq('status', 'cancelled')
    .order('scheduled_at');

  const services: CalService[] = ((clinic.services ?? []) as ServiceRow[]).map(s => ({
    id: s.id,
    name: s.name,
    price: effectivePrice(s),
    duration_minutes: s.duration_minutes,
  }));

  // Захиалгад үйлчилгээ нэрээрээ хадгалагддаг тул нэрээр нь үнэ хайна
  // ("Цаг захиалга" хуудастай ижил арга)
  const prices = new Map(services.map(s => [s.name, s.price]));
  const appointments: CalAppointment[] = (aptRows ?? []).map(a => ({
    ...(a as Omit<CalAppointment, 'price'>),
    price: a.service ? prices.get(a.service) ?? null : null,
  }));

  return (
    // animate-in (transform) хэрэглэхгүй — дотор нь fixed самбар, toast байгаа
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Хуанли</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">
          Хоосон нүдэн дээр дарж захиалга бүртгэнэ · захиалга дээр дарж төлөвийг нь өөрчилнө
        </p>
      </div>

      <Scheduler
        // Өдөр/салбар солиход hover, нээлттэй самбар зэрэг түр төлөв цэвэрлэгдэнэ
        key={`${date}|${branch?.id ?? ''}`}
        date={date}
        today={today}
        branches={branches.map(b => ({ id: b.id, name: b.name }))}
        branchId={branch?.id ?? null}
        columns={columns}
        appointments={appointments}
        services={services}
        openNew={params.new === '1'}
      />
    </div>
  );
}
