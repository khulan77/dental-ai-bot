import { createAdminClient } from '@/lib/db/supabase';
import type { BusinessHoursData } from '@/lib/db/clinic-actions';

export type TimeSlot = {
  start: string;
  end: string;
  available: boolean;
  appointmentId?: string;
  customerName?: string;
};

export type DaySchedule = {
  date: string;
  dayName: string;
  isOpen: boolean;
  slots: TimeSlot[];
};

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const DAY_NAMES_MN = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
const SLOT_DURATION_MINUTES = 30;

/**
 * Тодорхой өдрийн сул цагуудыг буцаана
 */
export async function getDaySchedule(
  clinicId: string,
  date: Date
): Promise<DaySchedule> {
  const supabase = createAdminClient();

  const { data: clinic } = await supabase
    .from('clinics')
    .select('business_hours')
    .eq('id', clinicId)
    .single();

  const businessHours = clinic?.business_hours as BusinessHoursData;
  const dayKey = DAY_KEYS[date.getDay()];
  const dayName = DAY_NAMES_MN[date.getDay()];
  const dayHours = businessHours[dayKey];

  const dateISO = date.toISOString().split('T')[0];

  if (!dayHours) {
    return {
      date: dateISO,
      dayName,
      isOpen: false,
      slots: [],
    };
  }

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, scheduled_at, duration_minutes, customer_name, status')
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', dayStart.toISOString())
    .lte('scheduled_at', dayEnd.toISOString())
    .in('status', ['confirmed', 'reminded']);

  const slots = generateSlots(date, dayHours.open, dayHours.close);

  const bookedSlots = new Map<string, { id: string; name: string; durationMinutes: number }>();

  (appointments ?? []).forEach(apt => {
    const aptDate = new Date(apt.scheduled_at);
    const aptTime = `${aptDate.getHours().toString().padStart(2, '0')}:${aptDate.getMinutes().toString().padStart(2, '0')}`;

    const duration = apt.duration_minutes ?? SLOT_DURATION_MINUTES;
    const slotCount = Math.ceil(duration / SLOT_DURATION_MINUTES);

    const startIdx = slots.findIndex(s => s.start === aptTime);
    if (startIdx !== -1) {
      for (let i = 0; i < slotCount && startIdx + i < slots.length; i++) {
        bookedSlots.set(slots[startIdx + i].start, {
          id: apt.id,
          name: apt.customer_name,
          durationMinutes: duration,
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
  };
}

/**
 * Хэдэн өдрийн schedule авах
 */
export async function getWeekSchedule(
  clinicId: string,
  startDate: Date,
  days: number = 7
): Promise<DaySchedule[]> {
  const schedules: DaySchedule[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    schedules.push(await getDaySchedule(clinicId, date));
  }

  return schedules;
}

/**
 * Slot list үүсгэх
 */
function generateSlots(
  date: Date,
  openTime: string,
  closeTime: string
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);

  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let mins = openMinutes; mins < closeMinutes; mins += SLOT_DURATION_MINUTES) {
    const start = formatTime(mins);
    const end = formatTime(mins + SLOT_DURATION_MINUTES);

    if (isToday && mins < currentMinutes) {
      continue;
    }

    slots.push({
      start,
      end,
      available: true,
    });
  }

  return slots;
}

function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Bot-д зориулсан хялбар хувилбар — текст хэлбэрээр буцаана
 */
export async function getAvailableSlotsForBot(
  clinicId: string,
  date: Date
): Promise<string> {
  const schedule = await getDaySchedule(clinicId, date);

  if (!schedule.isOpen) {
    return `${schedule.date} (${schedule.dayName}): Амарна`;
  }

  const availableSlots = schedule.slots.filter(s => s.available);

  if (availableSlots.length === 0) {
    return `${schedule.date} (${schedule.dayName}): Сул цаг алга`;
  }

  const timesList = availableSlots.map(s => s.start).join(', ');
  return `${schedule.date} (${schedule.dayName}): ${timesList}`;
}