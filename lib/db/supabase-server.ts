import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isDemoClinic } from '@/lib/demo';

/**
 * Server-side Supabase client (cookie-аас user session уншина).
 * Server components, API routes-д хэрэглэнэ.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component-ээс cookie бичих оролдсон тохиолдол — алгасна
          }
        },
      },
    }
  );
}

/**
 * Одоогийн нэвтэрсэн user-ийг авах. Үгүй бол null.
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Одоогийн user-ийн clinic-ийг авах.
 */
export async function getCurrentClinic() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('clinics')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  return data;
}

/**
 * Нэвтэрсэн хэрэглэгчийн эзэмшдэг clinic-ийн id-г буцаана.
 *
 * Server action бүр өөрчлөлт хийхийн өмнө үүнийг дуудна. clinicId-г
 * клиентээс авалгүй сесс-ээс тодорхойлдог тул өөр клиникийн id дамжуулж
 * хуурах боломжгүй. Эрхгүй бол алдаа шиднэ — дуудагч талын try/catch
 * үүнийг { success: false, error } болгож хөрвүүлнэ.
 *
 * ДЕМО: нүүр хуудасны демо эмнэлгийг зочин бүр нэг л дансаар үздэг тул
 * тохиргоог нь хамгаална — үгүй бол хэн нэгэн эмч устгах, slug солиход
 * олон нийтэд харагддаг /c/demo хуудас эвдэрнэ. Өдөр тутам хийгддэг
 * үйлдэл (захиалга баталгаажуулах) л { allowDemo: true }-ээр зөвшөөрөгдөнө.
 */
export async function requireOwnedClinicId(
  options: { allowDemo?: boolean } = {}
): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Нэвтрээгүй байна');

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('clinics')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!data) throw new Error('Танд эмнэлэг бүртгэлгүй байна');

  if (!options.allowDemo && isDemoClinic(data.id as string)) {
    throw new Error(
      'Демо горимд тохиргоо өөрчлөгдөхгүй. Өөрийн эмнэлгээ бүртгүүлбэл бүрэн эрхтэй ажиллана.'
    );
  }

  return data.id as string;
}