import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/db/supabase-server';
import { loginSchema, firstZodError } from '@/lib/validation';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * Нэвтрэлт — сервер талаар.
 *
 * Яагаад браузераас шууд Supabase рүү биш вэ: браузераас дуудахад бидний
 * зүгээс ямар ч хязгаарлалт тавих боломжгүй — нууц үг таах скрипт хязгааргүй
 * оролдоно. Энд IP болон бүртгэл тус бүрээр хаалт тавьж, алдааны мессежийг
 * ерөнхий байлгана.
 */

// Нэг IP-аас 15 минутанд 10 оролдлого — нэг хүн андуурч бичихэд хүрэлцэнэ,
// харин таах скриптэд хэтэрхий бага.
const IP_MAX = 10;
const IP_WINDOW = 15 * 60;

// Нэг бүртгэл рүү 15 минутанд 5 оролдлого — олон IP-аас нэг данс тонохоос
// хамгаална (IP хязгаар үүнийг барихгүй).
const EMAIL_MAX = 5;
const EMAIL_WINDOW = 15 * 60;

const TOO_MANY = 'Хэт олон удаа буруу оролдлоо. 15 минутын дараа дахин оролдоно уу.';

// Имэйл байгаа эсэхийг задруулахгүй — буруу нууц үг ба байхгүй бүртгэл хоёр
// ижил хариу авна. Үгүй бол ямар имэйл бүртгэлтэйг таах боломжтой болно.
const BAD_CREDENTIALS = 'Имэйл эсвэл нууц үг буруу байна';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    const ipAllowed = await checkRateLimit(`login:ip:${ip}`, IP_MAX, IP_WINDOW);
    if (!ipAllowed) {
      return NextResponse.json({ error: TOO_MANY }, { status: 429 });
    }

    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const emailAllowed = await checkRateLimit(
      `login:email:${email}`,
      EMAIL_MAX,
      EMAIL_WINDOW
    );
    if (!emailAllowed) {
      return NextResponse.json({ error: TOO_MANY }, { status: 429 });
    }

    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Жинхэнэ шалтгааныг зөвхөн серверийн log-д
      console.warn(`Нэвтрэлт амжилтгүй (${email}): ${error.message}`);
      return NextResponse.json({ error: BAD_CREDENTIALS }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
