import { NextResponse } from 'next/server';
import { getDoctorDaySchedule } from '@/lib/booking/slots';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clinicId = searchParams.get('clinicId');
  const doctorId = searchParams.get('doctorId');
  const dateStr = searchParams.get('date');

  if (!clinicId || !doctorId || !dateStr) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const date = new Date(dateStr + 'T00:00:00');
  const schedule = await getDoctorDaySchedule(clinicId, doctorId, date);

  return NextResponse.json({
    date: schedule.date,
    dayName: schedule.dayName,
    isOpen: schedule.isOpen,
    slots: schedule.slots.filter(s => s.available).map(s => s.start),
  });
}
