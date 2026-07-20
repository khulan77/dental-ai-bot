import { NextResponse, after } from 'next/server';
import { createAdminClient } from '@/lib/db/supabase';
import { notifyNewBooking } from '@/lib/notifications/booking-email';
import { generateReply } from '@/lib/ai/conversation';
import { chatSchema, firstZodError } from '@/lib/validation';
import { isSlotAvailable } from '@/lib/booking/slots';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import type { Clinic } from '@/types/database';

export async function POST(request: Request) {
  try {
    // Rate limit: нэг IP-аас минутанд 15 хүсэлт (OpenAI зардлаас хамгаална)
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`chat:${ip}`, 15, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Хэт олон хүсэлт илгээлээ. Түр хүлээгээд дахин оролдоно уу.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
    }
    const { slug, message, history } = parsed.data;

    const supabase = createAdminClient();
    const { data: clinic, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    const startTime = Date.now();
    const { reply: aiReply, booking, source, similarity } = await generateReply(
      clinic as Clinic,
      history,
      message
    );
    const duration = Date.now() - startTime;

    let reply = aiReply;
    let confirmedBooking = booking;

    if (booking) {
      let doctorId: string | null = null;
      if (booking.doctor_name) {
        const { data: doctor } = await supabase
          .from('doctors')
          .select('id')
          .eq('clinic_id', clinic.id)
          .ilike('name', `%${booking.doctor_name}%`)
          .single();
        doctorId = doctor?.id ?? null;
      }

      // Давхар захиалгаас сэргийлэх — цаг сул бол л insert хийнэ
      const available = await isSlotAvailable(clinic.id, doctorId, booking.scheduled_at);
      if (available) {
        await supabase.from('appointments').insert({
          clinic_id: clinic.id,
          doctor_id: doctorId,
          customer_name: booking.customer_name,
          customer_phone: booking.customer_phone,
          service: booking.service,
          scheduled_at: booking.scheduled_at,
          status: 'confirmed',
        });

        after(() =>
          notifyNewBooking({
            clinicId: clinic.id,
            doctorId,
            customerName: booking.customer_name,
            customerPhone: booking.customer_phone,
            service: booking.service,
            scheduledAt: booking.scheduled_at,
            source: 'chat',
          })
        );
      } else {
        reply =
          'Уучлаарай, энэ цаг аль хэдийн захиалагдсан байна. Өөр цаг сонгоно уу.';
        confirmedBooking = undefined;
      }
    }

    return NextResponse.json({
      reply,
      booking: confirmedBooking,
      source,
      similarity,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}