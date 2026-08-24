import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createAdminClient } from '@/lib/db/supabase';
import { requireOwnedClinicId } from '@/lib/db/supabase-server';

/**
 * Зураг байршуулах — одоогоор үйлчилгээний зурагт.
 *
 * clinicId-г сесс-ээс тодорхойлно (requireOwnedClinicId) тул өөр эмнэлгийн
 * хавтас руу бичих боломжгүй. Демо эмнэлэг ч энд орж чадахгүй — тэр функц
 * демог зогсоодог.
 */

export const BUCKET = 'clinic-images';

const MAX_BYTES = 3 * 1024 * 1024; // 3MB
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function POST(request: Request) {
  try {
    const clinicId = await requireOwnedClinicId();

    const form = await request.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Файл ирээгүй байна' }, { status: 400 });
    }

    const ext = EXTENSIONS[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: 'Зөвхөн JPG, PNG, WEBP зураг оруулна уу' },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'Зураг 3MB-аас хэтрэхгүй байх ёстой' },
        { status: 400 }
      );
    }

    const path = `${clinicId}/${randomUUID()}.${ext}`;
    const supabase = createAdminClient();

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, await file.arrayBuffer(), {
        contentType: file.type,
        cacheControl: '31536000',
      });

    if (error) {
      console.error('Зураг байршуулахад алдаа:', error);
      return NextResponse.json({ error: 'Зураг хадгалж чадсангүй' }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    // requireOwnedClinicId шидсэн алдаа (нэвтрээгүй / демо) энд ирнэ
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Серверийн алдаа' },
      { status: 400 }
    );
  }
}
