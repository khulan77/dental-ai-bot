import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/db/supabase';
import { generateReply } from '@/lib/ai/conversation';
import type { Clinic, Message } from '@/types/database';

export async function POST(request: Request) {
  // Зөвхөн хөгжүүлэлтэд ашиглах debug endpoint — production дээр хаана
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { message, history = [] } = body as {
      message: string;
      history: Message[];
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: clinic, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('slug', 'sain-shud')
      .single();

    if (error || !clinic) {
      return NextResponse.json(
        { error: 'Test clinic not found.' },
        { status: 404 }
      );
    }

    const startTime = Date.now();
    const { reply, booking, source, similarity } = await generateReply(
      clinic as Clinic,
      history,
      message
    );
    const duration = Date.now() - startTime;

    if (booking) {
      // doctor_id-г олох (Bot нэрээр өгсөн бол)
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

      await supabase.from('appointments').insert({
       clinic_id: clinic.id,
doctor_id: doctorId,
customer_name: (booking as any).customer_name,   // <-- as any нэмэв
customer_phone: (booking as any).customer_phone, // <-- as any нэмэв
service: (booking as any).service,               // <-- as any нэмэв
scheduled_at: (booking as any).scheduled_at,
        status: 'confirmed',
      });
    }

    return NextResponse.json({
      reply,
      booking,
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