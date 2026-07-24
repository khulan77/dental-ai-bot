import { NextResponse } from 'next/server';
import { getDoctorDaySchedule } from '@/lib/booking/slots';
import { clinicInstantFrom } from '@/lib/booking/timezone';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clinicId = searchParams.get('clinicId');
  const doctorId = searchParams.get('doctorId');
  const dateStr = searchParams.get('date');
  const branchId = searchParams.get('branchId'); // сонголт — салбартай эмнэлэгт

  if (!clinicId || !doctorId || !dateStr) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  // 'YYYY-MM-DD'-ийг эмнэлгийн бүсийн өдөр гэж үзнэ.
  // new Date(str + 'T00:00:00') нь серверийн бүсээр задалдаг тул
  // Vercel (UTC) дээр өдөр гулсах эрсдэлтэй байсан.
  const date = clinicInstantFrom(dateStr, '12:00');
  const schedule = await getDoctorDaySchedule(clinicId, doctorId, date, branchId);

  return NextResponse.json({
    date: schedule.date,
    dayName: schedule.dayName,
    isOpen: schedule.isOpen,
    slots: schedule.slots.filter(s => s.available).map(s => s.start),
  });
}
