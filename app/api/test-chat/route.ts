import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/db/supabase';
import { generateReply } from '@/lib/ai/conversation';
import type { Clinic, Message } from '@/types/database';

export async function POST(request: Request) {
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
      const scheduledAt = new Date(`${booking.date}T${booking.time}:00+08:00`);
      await supabase.from('appointments').insert({
        clinic_id: clinic.id,
        customer_name: booking.name,
        customer_phone: booking.phone,
        service: booking.service,
        scheduled_at: scheduledAt.toISOString(),
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