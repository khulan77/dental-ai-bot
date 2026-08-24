import { createAdminClient } from '@/lib/db/supabase';

/**
 * Хоёр давхаргат rate limiter.
 *
 * 1. Postgres (check_rate_limit RPC) — ЖИНХЭНЭ хамгаалалт. Бүх instance
 *    нэг тоолуур хуваалцдаг тул Vercel дээр ч найдвартай.
 * 2. Санах ой — DB боломжгүй үеийн НӨӨЦ. Serverless дээр instance тус бүрт
 *    тусдаа, хүйтэн эхлэлд цэвэрлэгддэг тул 1-ийг ОРЛОХГҮЙ. Довтолгоог
 *    бүрэн зогсоохгүй ч огт хамгаалалтгүй үлдэхээс дээр.
 *
 * supabase/rate-limit.sql-ыг ажиллуулаагүй бол 1 байхгүй — /api/health
 * үүнийг "backend": "memory" гэж мэдээлнэ.
 */

type Bucket = { count: number; windowStart: number };
const memory = new Map<string, Bucket>();

// Map хязгааргүй өсөхөөс сэргийлнэ — идэвхгүй түлхүүрийг хааяа цэвэрлэнэ
const MEMORY_MAX_KEYS = 10_000;

function checkMemory(key: string, max: number, windowSeconds: number): boolean {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  if (memory.size > MEMORY_MAX_KEYS) {
    for (const [k, b] of memory) {
      if (now - b.windowStart > windowMs) memory.delete(k);
    }
    // Цонх нь дуусаагүй хэт олон түлхүүр байвал бүхэлд нь хаяна
    if (memory.size > MEMORY_MAX_KEYS) memory.clear();
  }

  const bucket = memory.get(key);
  if (!bucket || now - bucket.windowStart > windowMs) {
    memory.set(key, { count: 1, windowStart: now });
    return true;
  }

  bucket.count += 1;
  return bucket.count <= max;
}

/**
 * key тухайн цонхонд хязгаараас доош эсэхийг шалгана.
 * → true бол зөвшөөрнө, false бол хэтэрсэн.
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
    });

    if (error) throw error;
    return data === true;
  } catch (e) {
    // Өмнө нь энд fail-open байсан — DB унавал хязгаарлалт огт үйлчлэхгүй
    // болно гэсэн үг. Одоо ядаж санах ойн тоолуур ажиллана.
    console.error('Rate limit DB боломжгүй, санах ой руу шилжив:', e);
    return checkMemory(key, max, windowSeconds);
  }
}

/**
 * Аль давхарга ажиллаж байгааг шалгана — /api/health-д харуулна.
 * Тоолуурыг хөндөхгүйн тулд хэтэрхий өндөр max-аар дуудна.
 */
export async function rateLimiterHealth(): Promise<{
  backend: 'database' | 'memory';
  error?: string;
  hint?: string;
}> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.rpc('check_rate_limit', {
      p_key: 'health:probe',
      p_max: 1_000_000,
      p_window_seconds: 60,
    });
    if (error) throw error;
    return { backend: 'database' };
  } catch (e) {
    return {
      backend: 'memory',
      error: describeError(e),
      hint: 'supabase/rate-limit.sql-ыг Supabase → SQL Editor дээр ажиллуулна уу',
    };
  }
}

/** Supabase-ийн алдаа Error биш энгийн объект ирдэг — "[object Object]" болгохгүй */
function describeError(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === 'object' && 'message' in e) {
    return String((e as { message: unknown }).message);
  }
  return String(e);
}

/**
 * Хүсэлтээс клиентийн IP хаягийг гаргах (Vercel/proxy-ийн ард).
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}
