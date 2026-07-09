import { createAdminClient } from '@/lib/db/supabase';

/**
 * Postgres дээр суурилсан rate limiter.
 * check_rate_limit RPC-г дуудаж, key тухайн цонхонд хязгаараас доош эсэхийг шалгана.
 * DB алдаа гарвал fail-open (зөвшөөрнө) — бот ажиллахаа болихоос сэргийлнэ.
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

    if (error) {
      console.error('Rate limit check failed:', error);
      return true; // fail-open
    }

    return data === true;
  } catch (e) {
    console.error('Rate limit error:', e);
    return true; // fail-open
  }
}

/**
 * Хүсэлтээс клиентийн IP хаягийг гаргах (Vercel/proxy-ийн ард).
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}
