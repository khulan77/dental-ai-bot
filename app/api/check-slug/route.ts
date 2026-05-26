import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/db/supabase';

const RESERVED_SLUGS = ['admin', 'api', 'dashboard', 'login', 'signup', 'test', 'c', 'auth', 'settings'];

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ available: false, error: 'Slug шаардлагатай' });
    }

    // Slug-ийг шалгах
    const cleanSlug = slug.toLowerCase().trim();

    // Урт шалгах
    if (cleanSlug.length < 3) {
      return NextResponse.json({ available: false, error: 'Хамгийн багадаа 3 тэмдэгт' });
    }

    if (cleanSlug.length > 30) {
      return NextResponse.json({ available: false, error: 'Хамгийн ихдээ 30 тэмдэгт' });
    }

    // Format шалгах (зөвхөн a-z, 0-9, -)
    if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
      return NextResponse.json({
        available: false,
        error: 'Зөвхөн англи жижиг үсэг, тоо, зураас (-) ашиглана',
      });
    }

    // Эхэнд эсвэл төгсгөлд зураас
    if (cleanSlug.startsWith('-') || cleanSlug.endsWith('-')) {
      return NextResponse.json({
        available: false,
        error: 'Зураас эхэнд эсвэл төгсгөлд байж болохгүй',
      });
    }

    // Хориглосон slug
    if (RESERVED_SLUGS.includes(cleanSlug)) {
      return NextResponse.json({ available: false, error: 'Энэ нэр ашиглах боломжгүй' });
    }

    // Database-аас давхцал шалгах
    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from('clinics')
      .select('id')
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ available: false, error: 'Энэ URL аль хэдийн ашиглагдсан байна' });
    }

    return NextResponse.json({ available: true, slug: cleanSlug });
  } catch (error) {
    return NextResponse.json(
      {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}