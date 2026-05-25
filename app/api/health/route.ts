import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/db/supabase';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { count, error } = await supabase
      .from('clinics')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      clinics_count: count ?? 0,
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
