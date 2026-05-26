import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/db/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, clinicName, slug, ownerEmail } = body;

    if (!userId || !clinicName || !slug) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Default үйлчилгээтэй шинэ клиник үүсгэх
    const { error } = await supabase.from('clinics').insert({
      owner_id: userId,
      name: clinicName,
      slug,
      owner_email: ownerEmail,
      bot_personality: 'Эелдэг, тусархаг, товч хариултай. Монгол хэлээр ярина.',
      services: [
        { id: crypto.randomUUID(), name: 'Үзлэг', price_mnt: 30000, duration_minutes: 30 },
        { id: crypto.randomUUID(), name: 'Эмчилгээ', price_mnt: 150000, duration_minutes: 60 },
      ],
      business_hours: {
        mon: { open: '09:00', close: '18:00' },
        tue: { open: '09:00', close: '18:00' },
        wed: { open: '09:00', close: '18:00' },
        thu: { open: '09:00', close: '18:00' },
        fri: { open: '09:00', close: '18:00' },
        sat: { open: '10:00', close: '16:00' },
        sun: null,
      },
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Setup clinic error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}