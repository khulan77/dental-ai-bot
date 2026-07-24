import { NextResponse, after } from 'next/server';
import { createAdminClient } from '@/lib/db/supabase';
import { notifyNewBooking } from '@/lib/notifications/booking-email';
import { bookSchema, firstZodError } from '@/lib/validation';
import { isSlotAvailable } from '@/lib/booking/slots';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limit: нэг IP-аас минутанд 10 захиалга (спам захиалгаас хамгаална)
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`book:${ip}`, 10, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Хэт олон хүсэлт илгээлээ. Түр хүлээгээд дахин оролдоно уу.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = bookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
    }
    const { clinicId, doctorId, branchId, customerName, customerPhone, service, scheduledAt } =
      parsed.data;

    // Давхар захиалгаас сэргийлэх — цаг сул эсэхийг шалгах.
    // Эмч нэг зэрэг нэг л газар байх тул салбараас үл хамааран эмчээр шалгана.
    const available = await isSlotAvailable(clinicId, doctorId ?? null, scheduledAt);
    if (!available) {
      return NextResponse.json(
        { error: 'Энэ цаг аль хэдийн захиалагдсан байна. Өөр цаг сонгоно уу.' },
        { status: 409 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('appointments').insert({
      clinic_id: clinicId,
      doctor_id: doctorId || null,
      branch_id: branchId || null,
      customer_name: customerName,
      customer_phone: customerPhone,
      service,
      scheduled_at: scheduledAt,
      status: 'confirmed',
    });

    if (error) {
      console.error('Book insert error:', error);
      return NextResponse.json({ error: 'Захиалга үүсгэж чадсангүй' }, { status: 500 });
    }

    // Хариу буцаасны дараа эмнэлэг рүү мэдэгдэнэ — захиалгыг удаашруулахгүй
    after(() =>
      notifyNewBooking({
        clinicId,
        doctorId: doctorId ?? null,
        customerName,
        customerPhone,
        service,
        scheduledAt,
        source: 'web',
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Book error:', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
