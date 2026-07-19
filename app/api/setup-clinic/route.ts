import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/db/supabase';
import { getCurrentUser } from '@/lib/db/supabase-server';
import { setupClinicSchema, validateSlug, firstZodError } from '@/lib/validation';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limit: нэг IP-аас цагт 5 бүртгэл (олноор клиник үүсгэхээс сэргийлнэ)
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`setup-clinic:${ip}`, 5, 3600);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Хэт олон удаа оролдлоо. Түр хүлээгээд дахин оролдоно уу.' },
        { status: 429 }
      );
    }

    // userId-г сесс-ээс авна — оролтод итгэхгүй
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Нэвтрээгүй байна' }, { status: 401 });
    }

    const parsed = setupClinicSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
    }
    const { clinicName } = parsed.data;

    const slugResult = validateSlug(parsed.data.slug);
    if (!slugResult.ok) {
      return NextResponse.json({ error: slugResult.error }, { status: 400 });
    }
    const slug = slugResult.slug;

    const supabase = createAdminClient();

    // Нэг хэрэглэгч нэг клиник — давхар үүсгэхээс сэргийлнэ
    const { data: existingClinic } = await supabase
      .from('clinics')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (existingClinic) {
      return NextResponse.json(
        { error: 'Танд аль хэдийн эмнэлэг бүртгэлтэй байна' },
        { status: 409 }
      );
    }

    // Default үйлчилгээтэй шинэ клиник үүсгэх
    const { error } = await supabase.from('clinics').insert({
      owner_id: user.id,
      name: clinicName,
      slug,
      owner_email: user.email,
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

    if (error) {
      // slug давхцвал Postgres unique constraint алдаа шиднэ — check-slug
      // болон энэ хоёрын хооронд өөр хүн авчихсан тохиолдол
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Энэ URL аль хэдийн ашиглагдсан байна' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Дотоод алдааны мессежийг клиент рүү задруулахгүй
    console.error('Setup clinic error:', error);
    return NextResponse.json({ error: 'Клиник үүсгэхэд алдаа гарлаа' }, { status: 500 });
  }
}
