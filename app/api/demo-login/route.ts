import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/db/supabase-server';
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/demo';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * Нүүр хуудасны "Хяналтын самбар үзэх" товч энд ирнэ.
 *
 * Зочныг демо бүртгэлээр нэвтрүүлээд /dashboard руу оруулна — админ тал
 * ямар байдгийг бодит өгөгдөл дээр үзнэ. Тохиргоо өөрчлөх оролдлогыг
 * requireOwnedClinicId() зогсооно.
 *
 * POST — нэвтрэх нь cookie өөрчилдөг тул GET биш (линк prefetch-д
 * санамсаргүй нэвтрэхээс сэргийлнэ).
 */
export async function POST(request: Request) {
  // Энэ ч бас нэвтрэлтийн цэг — сесс үйлдвэрлэх дуудлагыг хязгааргүй
  // орхихгүй. Нэг IP-аас цагт 20 удаа демо руу орох нь хангалттай.
  const ip = getClientIp(request);
  const allowed = await checkRateLimit(`demo-login:${ip}`, 20, 3600);
  if (!allowed) {
    return NextResponse.redirect(new URL('/login?demo=throttled', request.url), 303);
  }

  const supabase = await createServerSupabase();

  // Өөр бүртгэлээр нэвтэрсэн байсан ч демог үзүүлнэ — товч дээр "демо" гэж
  // бичсэн байхад өөрийнх нь самбар гарч ирвэл ойлгомжгүй.
  //
  // scope: 'local' — зөвхөн энэ браузерын cookie цэвэрлэнэ. Default scope нь
  // refresh token-ыг серверээс хүчингүй болгож, бусад төхөөрөмж дээрх сессийг
  // нь бас таслах байсан.
  await supabase.auth.signOut({ scope: 'local' });

  const { error } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });

  if (error) {
    console.error('Демо нэвтрэлт амжилтгүй:', error.message);
    return NextResponse.redirect(new URL('/login?demo=unavailable', request.url), 303);
  }

  return NextResponse.redirect(new URL('/dashboard', request.url), 303);
}
