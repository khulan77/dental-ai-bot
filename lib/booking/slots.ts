import { createAdminClient } from '@/lib/db/supabase';
import type { BusinessHoursData } from '@/lib/db/clinic-actions';
import {
  addClinicDays,
  clinicDateISO,
  clinicDayBounds,
  clinicDayIndex,
  clinicHHMM,
  clinicMinutesOfDay,
} from './timezone';

export type TimeSlot = {
  start: string;
  end: string;
  available: boolean;
  appointmentId?: string;
  customerName?: string;
};

export type DoctorInfo = {
  id: string;
  name: string;
  specialty: string | null;
  service_ids: string[];
};

export type DaySchedule = {
  date: string;
  dayName: string;
  isOpen: boolean;
  slots: TimeSlot[];
  doctorId?: string;
  doctorName?: string;
};

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const DAY_NAMES_MN = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
const SLOT_DURATION_MINUTES = 30;

/**
 * Хүссэн цаг сул эсэхийг шалгах — insert хийхээс өмнө давхар захиалгаас сэргийлнэ.
 * doctorId өгсөн бол зөвхөн тухайн эмчийн, эс бөгөөс клиникийн бүх захиалгыг шалгана.
 */
export async function isSlotAvailable(
  clinicId: string,
  doctorId: string | null,
  scheduledAt: string,
  durationMinutes: number = SLOT_DURATION_MINUTES
): Promise<boolean> {
  const supabase = createAdminClient();

  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMinutes * 60_000);

  // Тухайн өдрийн боломжит давхцах захиалгуудыг татах.
  // Өдрийн хилийг эмнэлгийн бүсээр тооцно — серверийн бүсээр биш.
  const { start: dayStart, end: dayEnd } = clinicDayBounds(start);

  let query = supabase
    .from('appointments')
    .select('scheduled_at, duration_minutes')
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', dayStart.toISOString())
    .lt('scheduled_at', dayEnd.toISOString())
    .in('status', ['confirmed', 'reminded']);

  if (doctorId) {
    query = query.eq('doctor_id', doctorId);
  }

  const { data: appointments } = await query;

  // Хугацааны давхцал шалгах: (start < aptEnd) && (end > aptStart)
  return !(appointments ?? []).some((apt) => {
    const aptStart = new Date(apt.scheduled_at);
    const aptEnd = new Date(
      aptStart.getTime() + (apt.duration_minutes ?? SLOT_DURATION_MINUTES) * 60_000
    );
    return start < aptEnd && end > aptStart;
  });
}

/**
 * Тодорхой эмчийн нэг өдрийн сул цаг
 */
export async function getDoctorDaySchedule(
  clinicId: string,
  doctorId: string,
  date: Date
): Promise<DaySchedule> {
  const supabase = createAdminClient();

  // Доктор болон клиникийн мэдээлэл
  const [{ data: doctor }, { data: clinic }] = await Promise.all([
    supabase.from('doctors').select('*').eq('id', doctorId).single(),
    supabase.from('clinics').select('business_hours').eq('id', clinicId).single(),
  ]);

  const dayIndex = clinicDayIndex(date);
  const dayKey = DAY_KEYS[dayIndex];
  const dayName = DAY_NAMES_MN[dayIndex];
  const dateISO = clinicDateISO(date);

  if (!doctor) {
    return { date: dateISO, dayName, isOpen: false, slots: [] };
  }

  // Эмчийн хуваарь — custom_hours байвал тэр, эс бөгөөс клиникийн default
  const hoursToUse = (doctor.custom_hours ?? clinic?.business_hours) as BusinessHoursData;
  const dayHours = hoursToUse?.[dayKey];

  if (!dayHours) {
    return {
      date: dateISO,
      dayName,
      isOpen: false,
      slots: [],
      doctorId: doctor.id,
      doctorName: doctor.name,
    };
  }

  // Тухайн өдрийн booking-уудыг доктороор
  const { start: dayStart, end: dayEnd } = clinicDayBounds(date);

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, scheduled_at, duration_minutes, customer_name, status, doctor_id')
    .eq('clinic_id', clinicId)
    .eq('doctor_id', doctorId)
    .gte('scheduled_at', dayStart.toISOString())
    .lt('scheduled_at', dayEnd.toISOString())
    .in('status', ['confirmed', 'reminded']);

  const slots = generateSlots(dateISO, dayHours.open, dayHours.close);

  const bookedSlots = new Map<string, { id: string; name: string }>();

  (appointments ?? []).forEach(apt => {
    // Захиалгын цагийг эмнэлгийн бүсээр — эс бөгөөс slot түлхүүр таарахгүй
    const aptTime = clinicHHMM(new Date(apt.scheduled_at));

    const duration = apt.duration_minutes ?? SLOT_DURATION_MINUTES;
    const slotCount = Math.ceil(duration / SLOT_DURATION_MINUTES);

    const startIdx = slots.findIndex(s => s.start === aptTime);
    if (startIdx !== -1) {
      for (let i = 0; i < slotCount && startIdx + i < slots.length; i++) {
        bookedSlots.set(slots[startIdx + i].start, {
          id: apt.id,
          name: apt.customer_name,
        });
      }
    }
  });

  const finalSlots: TimeSlot[] = slots.map(slot => {
    const booked = bookedSlots.get(slot.start);
    return {
      ...slot,
      available: !booked,
      appointmentId: booked?.id,
      customerName: booked?.name,
    };
  });

  return {
    date: dateISO,
    dayName,
    isOpen: true,
    slots: finalSlots,
    doctorId: doctor.id,
    doctorName: doctor.name,
  };
}

/**
 * Эмчийн 7 хоногийн хуваарь
 */
export async function getDoctorWeekSchedule(
  clinicId: string,
  doctorId: string,
  startDate: Date,
  days: number = 7
): Promise<DaySchedule[]> {
  const schedules: DaySchedule[] = [];

  for (let i = 0; i < days; i++) {
    schedules.push(
      await getDoctorDaySchedule(clinicId, doctorId, addClinicDays(startDate, i))
    );
  }

  return schedules;
}

/**
 * Тодорхой үйлчилгээ хийдэг эмчүүдийг хайх
 */
export async function getDoctorsForService(
  clinicId: string,
  serviceId: string | null
): Promise<DoctorInfo[]> {
  const supabase = createAdminClient();

  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, name, specialty, service_ids')
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (!doctors) return [];

  // Үйлчилгээ заагаагүй бол бүх эмчийг буцаах
  if (!serviceId) {
    return doctors as DoctorInfo[];
  }

  // Үйлчилгээ заасан бол:
  // - service_ids хоосон → бүх үйлчилгээ хийнэ → орно
  // - service_ids дотор тухайн үйлчилгээ → орно
  return doctors.filter(d => {
    const serviceIds = (d.service_ids ?? []) as string[];
    return serviceIds.length === 0 || serviceIds.includes(serviceId);
  }) as DoctorInfo[];
}

/**
 * Bot-д зориулсан: тухайн өдөр аль эмч сул байна?
 * Хэрэв serviceId өгсөн бол тэр үйлчилгээ хийдэг эмчүүдийн дунд хайна.
 */
export async function getAvailableDoctorsForDate(
  clinicId: string,
  date: Date,
  serviceId: string | null = null
): Promise<Array<{ doctor: DoctorInfo; schedule: DaySchedule; freeCount: number }>> {
  const doctors = await getDoctorsForService(clinicId, serviceId);

  const results = await Promise.all(
    doctors.map(async doctor => {
      const schedule = await getDoctorDaySchedule(clinicId, doctor.id, date);
      const freeCount = schedule.slots.filter(s => s.available).length;
      return { doctor, schedule, freeCount };
    })
  );

  // Хамгийн их сул цагтай эмчийг эхэнд
  return results
    .filter(r => r.schedule.isOpen && r.freeCount > 0)
    .sort((a, b) => b.freeCount - a.freeCount);
}

/**
 * Bot-д зориулсан текст хариу — олон эмчийг харьцуулдаг
 */
export async function getAvailableSlotsForBot(
  clinicId: string,
  date: Date,
  serviceId: string | null = null
): Promise<string> {
  const dayName = DAY_NAMES_MN[clinicDayIndex(date)];
  const dateISO = clinicDateISO(date);

  const availableDoctors = await getAvailableDoctorsForDate(clinicId, date, serviceId);

  if (availableDoctors.length === 0) {
    return `${dateISO} (${dayName}): Сул цаг алга`;
  }

  // Эмч тус бүрийн сул цаг
  const lines: string[] = [`${dateISO} (${dayName}):`];

  availableDoctors.forEach(({ doctor, schedule }) => {
    const freeSlots = schedule.slots
      .filter(s => s.available)
      .slice(0, 10) // Хамгийн ихдээ 10 цаг
      .map(s => s.start)
      .join(', ');

    const specialty = doctor.specialty ? ` (${doctor.specialty})` : '';
    lines.push(`  • ${doctor.name}${specialty}: ${freeSlots}`);
  });

  return lines.join('\n');
}

/**
 * Slot list үүсгэх
 */
function generateSlots(dateISO: string, openTime: string, closeTime: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);

  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  // "Өнөөдөр мөн үү" болон "одоо хэдэн цаг вэ" хоёрыг эмнэлгийн бүсээр
  const now = new Date();
  const isToday = clinicDateISO(now) === dateISO;
  const currentMinutes = clinicMinutesOfDay(now);

  for (let mins = openMinutes; mins < closeMinutes; mins += SLOT_DURATION_MINUTES) {
    const start = formatTime(mins);
    const end = formatTime(mins + SLOT_DURATION_MINUTES);

    if (isToday && mins < currentMinutes) continue;

    slots.push({ start, end, available: true });
  }

  return slots;
}

function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Backward compatibility — хуучин кодоо ажиллуулахын тулд
 * (Calendar болон хуучин газруудад хэрэглэгдэнэ)
 */
export async function getDaySchedule(clinicId: string, date: Date): Promise<DaySchedule> {
  const supabase = createAdminClient();

  const { data: clinic } = await supabase
    .from('clinics')
    .select('business_hours')
    .eq('id', clinicId)
    .single();

  const businessHours = clinic?.business_hours as BusinessHoursData;
  const dayIndex = clinicDayIndex(date);
  const dayKey = DAY_KEYS[dayIndex];
  const dayName = DAY_NAMES_MN[dayIndex];
  const dayHours = businessHours?.[dayKey];

  const dateISO = clinicDateISO(date);

  if (!dayHours) {
    return { date: dateISO, dayName, isOpen: false, slots: [] };
  }

  const { start: dayStart, end: dayEnd } = clinicDayBounds(date);

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, scheduled_at, duration_minutes, customer_name, status')
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', dayStart.toISOString())
    .lt('scheduled_at', dayEnd.toISOString())
    .in('status', ['confirmed', 'reminded']);

  const slots = generateSlots(dateISO, dayHours.open, dayHours.close);

  const bookedSlots = new Map<string, { id: string; name: string }>();
  (appointments ?? []).forEach(apt => {
    // Захиалгын цагийг эмнэлгийн бүсээр — эс бөгөөс slot түлхүүр таарахгүй
    const aptTime = clinicHHMM(new Date(apt.scheduled_at));
    const duration = apt.duration_minutes ?? SLOT_DURATION_MINUTES;
    const slotCount = Math.ceil(duration / SLOT_DURATION_MINUTES);
    const startIdx = slots.findIndex(s => s.start === aptTime);
    if (startIdx !== -1) {
      for (let i = 0; i < slotCount && startIdx + i < slots.length; i++) {
        bookedSlots.set(slots[startIdx + i].start, {
          id: apt.id,
          name: apt.customer_name,
        });
      }
    }
  });

  const finalSlots: TimeSlot[] = slots.map(slot => {
    const booked = bookedSlots.get(slot.start);
    return {
      ...slot,
      available: !booked,
      appointmentId: booked?.id,
      customerName: booked?.name,
    };
  });

  return { date: dateISO, dayName, isOpen: true, slots: finalSlots };
}

export async function getWeekSchedule(
  clinicId: string,
  startDate: Date,
  days: number = 7
): Promise<DaySchedule[]> {
  const schedules: DaySchedule[] = [];
  for (let i = 0; i < days; i++) {
    schedules.push(await getDaySchedule(clinicId, addClinicDays(startDate, i)));
  }
  return schedules;
}