import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/db/supabase';
import { rateLimiterHealth } from '@/lib/rate-limit';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { count, error } = await supabase
      .from('clinics')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    // Хамгаалалтын давхарга бүрэн эсэх — rate limiter унтарсныг чимээгүй
    // өнгөрөөвөл нэвтрэлт хамгаалалтгүй үлдэнэ
    const rateLimiter = await rateLimiterHealth();

    // Дэлгэрэнгүйг зөвхөн серверийн log-д — энэ эндпойнт нээлттэй тул
    // дотоод бүтцийн мэдээллийг гадагш гаргахгүй
    if (rateLimiter.backend !== 'database') {
      console.error(
        `Rate limiter degraded: ${rateLimiter.error} — ${rateLimiter.hint}`
      );
    }

    return NextResponse.json({
      status: rateLimiter.backend === 'database' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: 'connected',
      clinics_count: count ?? 0,
      rate_limiter: rateLimiter.backend,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
