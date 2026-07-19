import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/db/supabase';
import { validateSlug } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ available: false, error: 'Slug шаардлагатай' });
    }

    const result = validateSlug(slug);
    if (!result.ok) {
      return NextResponse.json({ available: false, error: result.error });
    }
    const cleanSlug = result.slug;

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