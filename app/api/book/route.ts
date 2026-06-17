import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/db/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clinicId, doctorId, customerName, customerPhone, service, scheduledAt } = body as {
      clinicId: string;
      doctorId: string;
      customerName: string;
      customerPhone: string;
      service: string;
      scheduledAt: string;
    };

    if (!clinicId || !customerName || !customerPhone || !service || !scheduledAt) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('appointments').insert({
      clinic_id: clinicId,
      doctor_id: doctorId || null,
      customer_name: customerName,
      customer_phone: customerPhone,
      service,
      scheduled_at: scheduledAt,
      status: 'confirmed',
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
